const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Settings
  getSettings:  () => ipcRenderer.invoke('settings:get'),
  saveSettings: (s) => ipcRenderer.invoke('settings:save', s),

  // Chat
  sendMessage:    (msg) => ipcRenderer.invoke('chat:send', msg),
  abortMessage:   () => ipcRenderer.send('chat:abort'),
  getChatHistory: () => ipcRenderer.invoke('chat:history'),
  clearHistory:   () => ipcRenderer.invoke('chat:clear'),

  // Chat stream events (main → renderer)
  onChatStream:     (cb) => ipcRenderer.on('chat:stream',      (_, d) => cb(d)),
  onChatToolCall:   (cb) => ipcRenderer.on('chat:tool_call',   (_, d) => cb(d)),
  onChatToolResult: (cb) => ipcRenderer.on('chat:tool_result', (_, d) => cb(d)),
  onChatDone:       (cb) => ipcRenderer.on('chat:done',        (_, d) => cb(d)),
  onChatError:      (cb) => ipcRenderer.on('chat:error',       (_, d) => cb(d)),

  // Model updates (3D viewer)
  onModelUpdate: (cb) => ipcRenderer.on('model:update', (_, data) => cb(data)),

  // Render lifecycle
  onRenderStart:    (cb) => ipcRenderer.on('render:start',    (_, d) => cb(d)),
  onRenderComplete: (cb) => ipcRenderer.on('render:complete', (_, d) => cb(d)),
  onRenderError:    (cb) => ipcRenderer.on('render:error',    (_, d) => cb(d)),
  forceRender:      () => ipcRenderer.invoke('render:force'),
  onRenderWarning:  (cb) => ipcRenderer.on('render:warning',  (_, d) => cb(d)),

  // Checkpoints
  getCheckpoints:     () => ipcRenderer.invoke('checkpoint:list'),
  selectCheckpoint:   (id) => ipcRenderer.invoke('checkpoint:select', id),
  deleteCheckpoint:   (id) => ipcRenderer.invoke('checkpoint:delete', id),
  renameCheckpoint:   (id, label) => ipcRenderer.invoke('checkpoint:rename', id, label),
  onCheckpointUpdate: (cb) => ipcRenderer.on('checkpoint:update', (_, d) => cb(d)),

  // Files
  readFile:      (filePath) => ipcRenderer.invoke('file:read', filePath),
  readModelFile: (filePath, format) => ipcRenderer.invoke('file:read-model', filePath, format),
  saveFile:      (filePath, content) => ipcRenderer.invoke('file:save', filePath, content),
  onFileContent: (cb) => ipcRenderer.on('file:content', (_, d) => cb(d)),

  // Workspace
  getWorkspace: () => ipcRenderer.invoke('workspace:get'),

  // MCP direct access
  mcpRenderPng: (scadCode, opts) => ipcRenderer.invoke('mcp:render-png', scadCode, opts),
  mcpExportStl: (scadCode, filename) => ipcRenderer.invoke('mcp:export-stl', scadCode, filename),
  mcpStatus:    () => ipcRenderer.invoke('mcp:status'),

  // App menu actions
  newProjectWindow: () => ipcRenderer.invoke('app:new-project-window'),
  openWorkspace:    () => ipcRenderer.invoke('app:open-workspace'),
  openInFiles:      () => ipcRenderer.invoke('app:open-workspace-in-files'),
  toggleDevTools:   () => ipcRenderer.invoke('app:toggle-devtools'),
  getWindowCount:   () => ipcRenderer.invoke('app:window-count'),

  // Export
  exportModel: (format) => ipcRenderer.invoke('app:export', format),

  // Path bar / recent / file browser
  listRecentPaths: () => ipcRenderer.invoke('app:list-recent'),
  browseDir:       (dirPath) => ipcRenderer.invoke('app:browse-dir', dirPath),
  openPath:        (inputPath) => ipcRenderer.invoke('app:open-path', inputPath),
});
