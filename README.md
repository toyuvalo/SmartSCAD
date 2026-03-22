# SmartSCAD

AI-powered 3D CAD — multi-provider CLI edition  
OpenSCAD + provider dropdown (Claude Code · Codex · Gemini CLI), terminal-based

**[Project page →](https://webdev.dvlce.ca/openscad)**

---

SmartSCAD is a fork of ClawSCAD that replaces the single embedded Claude Code terminal with a multi-provider CLI switcher. Same Electron app, same live 3D viewport and checkpoint system — but you can switch between Claude Code, Codex CLI, and Gemini CLI from a dropdown, and each provider gets its own isolated workspace.

![SmartSCAD screenshot](screenshot.png)

## How it differs from ClawSCAD

| | ClawSCAD | SmartSCAD |
|---|---|---|
| AI backend | Claude Code CLI only | Claude Code · Codex · Gemini CLI (switchable) |
| Terminal | Single xterm session | xterm per provider, isolated workspaces |
| Provider switch | N/A | Dropdown — no restart required |
| Workspace isolation | Single shared folder | Fresh folder per provider switch |
| MCP server | OpenSCAD MCP auto-configured | Not included |
| Setup | Claude Code CLI on PATH | Any supported CLI on PATH |

## Features

- All 3D viewport features from ClawSCAD (PBR rendering, orbit controls, checkpoint history, Monaco editor, STL/3MF export)
- providers.js unified interface — switch providers without changing anything else
- Provider dropdown: Claude Code, Codex CLI, Gemini CLI
- Each provider switch creates a fresh isolated workspace — parallel sessions with different CLIs never interfere
- Same keyboard shortcuts, split viewport as ClawSCAD

## Install

```bash
git clone https://github.com/toyuvalo/SmartSCAD.git
cd SmartSCAD
npm install
npm start
```

Prerequisites:
- Node.js 18+
- OpenSCAD installed and in PATH
- At least one of: Claude Code CLI, Codex CLI, or Gemini CLI installed and on PATH

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+N` | New viewport (split view) |
| `F5` | Force re-render |
| `1`–`7` | Camera presets |
| `R` | Reset view |
| `F` | Zoom to fit |
| `W` | Toggle wireframe |
| `E` | Toggle edges |
| `O` | Toggle ortho/perspective |

## Architecture

```
SmartSCAD/
├── main.js         Electron main — window management, render queue
├── renderer.js     Three.js viewport, xterm terminal, Monaco editor, checkpoint tree
├── providers.js    Unified provider interface (Claude Code / Codex / Gemini CLI)
├── preload.js      IPC bridge
└── index.html      Layout
```

## Related

- [ClawSCAD](https://github.com/toyuvalo/ClawSCAD) — the original version with Claude Code + MCP server for full agentic sessions
- [webdev.dvlce.ca/openscad](https://webdev.dvlce.ca/openscad) — project page

## License

MIT with [Commons Clause](https://commonsclause.com/) — free to use, modify, and share. Commercial resale not permitted.
