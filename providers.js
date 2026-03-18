'use strict';

const Anthropic = require('@anthropic-ai/sdk');
const OpenAI = require('openai');

class AnthropicProvider {
  constructor(apiKey, model) {
    this.client = new Anthropic.default({ apiKey });
    this.model = model || 'claude-opus-4-5';
  }

  formatTools(tools) {
    return tools.map(t => ({
      name: t.name,
      description: t.description,
      input_schema: t.parameters,
    }));
  }

  async *streamChat(messages, tools, signal) {
    const systemMsg = messages.find(m => m.role === 'system');
    const anthropicMessages = convertToAnthropicMessages(messages.filter(m => m.role !== 'system'));

    const stream = this.client.messages.stream({
      model: this.model,
      max_tokens: 8192,
      system: systemMsg ? systemMsg.content : undefined,
      messages: anthropicMessages,
      tools: this.formatTools(tools),
    });

    let currentToolCall = null;
    let currentToolInputStr = '';

    for await (const event of stream) {
      if (signal?.aborted) break;

      if (event.type === 'content_block_start') {
        if (event.content_block.type === 'tool_use') {
          currentToolCall = { id: event.content_block.id, name: event.content_block.name };
          currentToolInputStr = '';
        }
      } else if (event.type === 'content_block_delta') {
        if (event.delta.type === 'text_delta') {
          yield { type: 'text_delta', text: event.delta.text };
        } else if (event.delta.type === 'input_json_delta') {
          currentToolInputStr += event.delta.partial_json;
        }
      } else if (event.type === 'content_block_stop') {
        if (currentToolCall) {
          let input = {};
          try { input = JSON.parse(currentToolInputStr); } catch {}
          yield { type: 'tool_call', name: currentToolCall.name, input, callId: currentToolCall.id };
          currentToolCall = null;
          currentToolInputStr = '';
        }
      } else if (event.type === 'message_stop') {
        yield { type: 'done' };
      }
    }
  }
}

class OpenAIProvider {
  constructor(apiKey, model, baseURL) {
    this.client = new OpenAI.default({ apiKey, ...(baseURL ? { baseURL } : {}) });
    this.model = model || 'gpt-4o';
  }

  formatTools(tools) {
    return tools.map(t => ({
      type: 'function',
      function: { name: t.name, description: t.description, parameters: t.parameters },
    }));
  }

  async *streamChat(messages, tools, signal) {
    const openaiMessages = convertToOpenAIMessages(messages);

    const stream = await this.client.chat.completions.create({
      model: this.model,
      messages: openaiMessages,
      tools: this.formatTools(tools),
      stream: true,
    });

    const toolCallAccumulator = {};
    let sentDone = false;

    for await (const chunk of stream) {
      if (signal?.aborted) break;

      const delta = chunk.choices[0]?.delta;
      if (!delta) continue;

      if (delta.content) {
        yield { type: 'text_delta', text: delta.content };
      }

      if (delta.tool_calls) {
        for (const tc of delta.tool_calls) {
          if (!toolCallAccumulator[tc.index]) {
            toolCallAccumulator[tc.index] = { id: '', name: '', arguments: '' };
          }
          if (tc.id) toolCallAccumulator[tc.index].id = tc.id;
          if (tc.function?.name) toolCallAccumulator[tc.index].name += tc.function.name;
          if (tc.function?.arguments) toolCallAccumulator[tc.index].arguments += tc.function.arguments;
        }
      }

      const finishReason = chunk.choices[0]?.finish_reason;
      if (finishReason === 'tool_calls' || finishReason === 'stop') {
        for (const tc of Object.values(toolCallAccumulator)) {
          let input = {};
          try { input = JSON.parse(tc.arguments); } catch {}
          yield { type: 'tool_call', name: tc.name, input, callId: tc.id };
        }
        yield { type: 'done' };
        sentDone = true;
      }
    }

    if (!sentDone) yield { type: 'done' };
  }
}

class GeminiProvider extends OpenAIProvider {
  constructor(apiKey, model) {
    super(apiKey, model || 'gemini-2.0-flash', 'https://generativelanguage.googleapis.com/v1beta/openai/');
  }
}

class OllamaProvider extends OpenAIProvider {
  constructor(model) {
    super('ollama', model || 'llama3.2', 'http://localhost:11434/v1');
  }
}

function convertToAnthropicMessages(messages) {
  const result = [];
  for (const msg of messages) {
    if (msg.role === 'tool_result') {
      result.push({
        role: 'user',
        content: msg.results.map(r => ({
          type: 'tool_result',
          tool_use_id: r.callId,
          content: typeof r.result === 'string' ? r.result : JSON.stringify(r.result),
        })),
      });
    } else if (msg.role === 'assistant' && msg.toolCalls?.length) {
      const content = [];
      if (msg.content) content.push({ type: 'text', text: msg.content });
      for (const tc of msg.toolCalls) {
        content.push({ type: 'tool_use', id: tc.callId, name: tc.name, input: tc.input });
      }
      result.push({ role: 'assistant', content });
    } else if (msg.role === 'user' || msg.role === 'assistant') {
      result.push({ role: msg.role, content: msg.content || '' });
    }
  }
  return result;
}

function convertToOpenAIMessages(messages) {
  const result = [];
  for (const msg of messages) {
    if (msg.role === 'system') {
      result.push({ role: 'system', content: msg.content });
    } else if (msg.role === 'tool_result') {
      for (const r of msg.results) {
        result.push({
          role: 'tool',
          tool_call_id: r.callId,
          content: typeof r.result === 'string' ? r.result : JSON.stringify(r.result),
        });
      }
    } else if (msg.role === 'assistant' && msg.toolCalls?.length) {
      result.push({
        role: 'assistant',
        content: msg.content || null,
        tool_calls: msg.toolCalls.map(tc => ({
          id: tc.callId,
          type: 'function',
          function: { name: tc.name, arguments: JSON.stringify(tc.input) },
        })),
      });
    } else if (msg.role === 'user' || msg.role === 'assistant') {
      result.push({ role: msg.role, content: msg.content || '' });
    }
  }
  return result;
}

function createProvider(config) {
  switch (config.provider) {
    case 'anthropic': return new AnthropicProvider(config.apiKey, config.model);
    case 'openai':    return new OpenAIProvider(config.apiKey, config.model);
    case 'gemini':    return new GeminiProvider(config.apiKey, config.model);
    case 'ollama':    return new OllamaProvider(config.model);
    default: throw new Error(`Unknown provider: ${config.provider}`);
  }
}

module.exports = { createProvider };
