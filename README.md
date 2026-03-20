<p align="center">
  <img src="icon.png" alt="SmartSCAD" width="128" height="128">
</p>

<h1 align="center">SmartSCAD</h1>

<p align="center">
  <strong>AI-powered 3D CAD — API edition</strong><br>
  OpenSCAD + Anthropic &amp; OpenAI SDKs, no CLI required
</p>

---

SmartSCAD is a fork of [ClawSCAD](https://github.com/toyuvalo/ClawSCAD) that replaces the embedded Claude Code CLI with direct Anthropic and OpenAI API calls. Same Electron app, same live 3D viewport and checkpoint system — but lighter, faster, and model-agnostic.

## How it differs from ClawSCAD

| | ClawSCAD | SmartSCAD |
|---|---|---|
| AI backend | Claude Code CLI (embedded terminal) | `@anthropic-ai/sdk` + `openai` npm packages |
| Models | Claude only | Claude + GPT-4 / GPT-4o (unified interface) |
| Interaction | Full agentic loop — tool use, multi-step iteration | Request → response (single-turn or short multi-turn) |
| Setup | Requires Claude Code CLI installed globally | API key only — no CLI dependency |
| Latency | Higher (spawns subprocess, agentic overhead) | Lower (direct API call) |
| Best for | Long autonomous sessions, complex multi-step designs | Quick iterations, scripted workflows, API integration |

## Features

- All 3D viewport features from ClawSCAD (PBR rendering, orbit controls, checkpoint history, Monaco editor, STL/3MF export)
- Unified `providers.js` interface — switch between Claude and GPT models with one config change
- Supported models: `claude-opus-4-6`, `claude-sonnet-4-6`, `claude-haiku-4-5`, `gpt-4o`, `gpt-4-turbo`
- No subprocess management — AI calls go through the SDK directly
- Simpler setup — just an API key

## Install

```bash
git clone https://github.com/toyuvalo/SmartSCAD.git
cd SmartSCAD
npm install
```

Set your API key(s) in `.env`:

```env
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...        # optional
```

Then run:

```bash
npm start
```

**Prerequisites:**
- [Node.js](https://nodejs.org/) 18+
- [OpenSCAD](https://openscad.org/downloads.html) installed and in PATH

## Usage

1. Launch SmartSCAD
2. Select a model from the dropdown (Claude or GPT)
3. Describe what you want to build in the prompt panel
4. The model generates OpenSCAD code — SmartSCAD renders it immediately
5. Iterate: refine the prompt or edit the code directly in Monaco
6. Export to STL/3MF when done

## Architecture

```
SmartSCAD/
├── main.js         Electron main — window management, render queue
├── renderer.js     Three.js viewport, Monaco editor, checkpoint tree
├── providers.js    Unified AI interface (Anthropic + OpenAI)
├── preload.js      IPC bridge
└── index.html      Layout
```

## Related

- [ClawSCAD](https://github.com/toyuvalo/ClawSCAD) — the original version using Claude Code CLI for full agentic sessions

## License

MIT — see [LICENSE](LICENSE).
