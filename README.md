<div align="center">

```
███████╗███╗   ██╗ ██████╗ ██████╗  █████╗ ███╗   ███╗
██╔════╝████╗  ██║██╔════╝ ██╔══██╗██╔══██╗████╗ ████║
█████╗  ██╔██╗ ██║██║  ███╗██████╔╝███████║██╔████╔██║
██╔══╝  ██║╚██╗██║██║   ██║██╔══██╗██╔══██║██║╚██╔╝██║
███████╗██║ ╚████║╚██████╔╝██║  ██║██║  ██║██║ ╚═╝ ██║
╚══════╝╚═╝  ╚═══╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝
```

**The AI's Persistent Memory Trace**

*Give your AI a memory it doesn't deserve.*

[![npm version](https://img.shields.io/npm/v/engram-mcp.svg?style=flat-square&color=7c3aed)](https://www.npmjs.com/package/engram-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)
[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-blue?style=flat-square)](https://modelcontextprotocol.io)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey?style=flat-square)](https://nodejs.org)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen?style=flat-square)](https://nodejs.org)

[GitHub](https://github.com/aslam-devloper/ENGRAM-MCP) · [npm](https://www.npmjs.com/package/engram-mcp) · [Report a Bug](https://github.com/aslam-devloper/ENGRAM-MCP/issues)

</div>

---

## What is ENGRAM?

> **en·gram** /ˈenɡram/ *noun* — A memory trace. The physical change in the brain that represents a stored memory.

ENGRAM is a zero-dependency MCP server that gives any AI tool a **persistent second brain**. It stores checkpoints, notes, rules, and skills as plain files — surviving across sessions, context resets, and tool switches.

**The problem:** You're 3 hours into a coding session. The AI knows everything about your project. Then the context window fills up — and it forgets everything. You start from zero. Again.

**ENGRAM fixes this.**

---

## Why You Need This

**Without ENGRAM (New Session):**
> **You:** "Hey, I need to add a new route to my API."
> **AI:** "Sure! What framework are you using? Where are your routes located? Are you using JWT for auth?"
> **You:** *(Sighs, pastes 5 files and explains the architecture again)*

**With ENGRAM (New Session):**
> **You:** "Call `wake_up()`. Then add a new route to my API."
> **AI:** "Memory loaded. I see we're using Express with the `zod` validation middleware from yesterday. I'll place the route in `src/routes/` and protect it with your JWT guard. Here's the code."
> **You:** 🤯

---

## Works With Every AI Tool

| Tool | Status |
|------|--------|
| Claude Desktop | ✅ |
| Claude Code (CLI) | ✅ |
| Cursor | ✅ |
| Windsurf | ✅ |
| Antigravity | ✅ |
| Zed | ✅ |
| Any MCP-compatible client | ✅ |

---

## Quick Start

**Requires:** [Node.js v18+](https://nodejs.org/en/download) — Windows 10/11, macOS 12+, Linux

```bash
# Run instantly without installing
npx engram-mcp

# Or install globally for faster startup
npm install -g engram-mcp
engram-mcp
```

---

## Setup by Tool

### Claude Desktop

Edit your Claude Desktop config file:

- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux:** `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "engram": {
      "command": "npx",
      "args": ["engram-mcp"]
    }
  }
}
```

Restart Claude Desktop → look for the 🔌 icon → ENGRAM is live.

**First time only:** Say to Claude — *"Call init_session with our conversation history."*

---

### Windows (if npx doesn't work)

```json
{
  "mcpServers": {
    "engram": {
      "command": "cmd",
      "args": ["/c", "npx", "engram-mcp"]
    }
  }
}
```

After `npm install -g engram-mcp`:
```json
{
  "mcpServers": {
    "engram": {
      "command": "engram-mcp"
    }
  }
}
```

---

### Cursor / Windsurf / Zed

Open MCP settings and add:

```json
{
  "engram": {
    "command": "npx",
    "args": ["engram-mcp"]
  }
}
```

---

### Antigravity

1. Find Antigravity's MCP config (usually in app settings under "MCP Servers")
2. Add a new server entry:

```json
{
  "engram": {
    "command": "npx",
    "args": ["engram-mcp"]
  }
}
```

3. Restart Antigravity
4. At the start of your session, tell Antigravity: **"Call wake_up() to load ENGRAM memory"**

> **Team tip:** Set `ENGRAM_HOME` to a shared folder so the whole team shares the same project brain.

---

### Claude Code (CLI)

```bash
claude --mcp-config '{"engram": {"command": "npx", "args": ["engram-mcp"]}}'
```

Or save permanently at `~/.claude/mcp.json`:

```json
{
  "mcpServers": {
    "engram": {
      "command": "npx",
      "args": ["engram-mcp"]
    }
  }
}
```

---

## The 10 Tools

### Session Tools

| Tool | When | What |
|------|------|------|
| `wake_up` | **Start of EVERY session** | Loads checkpoint + brain + skills instantly |
| `init_session` | First time only | Scans conversation history, builds project brain |
| `save_checkpoint` | Context ~70% full / milestone | Saves state with auto-generated funny name |
| `check_pulse` | Every ~20 messages | Context health check + 4th-wall-breaking warnings |
| `debrief` | End of session | Permanently extracts dos, don'ts, rules to brain |

### Memory Tools

| Tool | What |
|------|------|
| `jot` | Write a note, rule, warning, or discovery |
| `brain_dump` | Get everything ENGRAM knows in one shot |

### Skills Tools

| Tool | What |
|------|------|
| `make_skill` | Create an instruction skill or template skill |
| `get_skill` | Load a skill (fills template variables) |
| `list_skills` | Discover all available skills |

---

## How It Works

```
SESSION START
    │
    ▼
wake_up("my-project")
    └─ Returns: last checkpoint + brain (rules, dos, don'ts) + all skills
    │
    ▼
[Working...]
    │
    ├── Every ~20 messages
    │   └─ check_pulse() → "🎬 Context is sweating. Save a checkpoint or I become a movie with no ending."
    │
    ├── Found something important
    │   └─ jot("Never mutate state directly", "rule")
    │
    ├── Context getting full (~70%)
    │   └─ save_checkpoint(what, status, next_steps)
    │       └─ Saved as: "legendary-before-everything-broke" 😄
    │
    ▼
SESSION END
    │
    ▼
debrief("built JWT auth", dos=[...], donts=[...])
    └─ Brain permanently updated. Next session starts smarter.
```

---

## Checkpoint Names

ENGRAM auto-generates dramatically funny checkpoint names. You'll see these in your file system:

```
✓ legendary-before-everything-broke
✓ calm-dont-touch-it-it-works
✓ heroic-pre-yolo-deploy
✓ accidental-rubber-duck-session
✓ glorious-when-it-finally-worked
✓ doomed-npm-install-succeeded
✓ peaceful-works-on-my-machine
```

*These will end up in your git history. You're welcome.*

---

## Skills System

Two types of skills — user decides which:

### Instruction Skills
AI reads and follows step-by-step instructions (like a mini system prompt).

**User:** *"Make a skill for debugging TypeScript"*
**AI calls:**
```
make_skill("Debug TypeScript", "instruction",
  instructions="1. Check tsconfig.json first. 2. Look for missing type annotations...")
```

### Template Skills
Reusable prompts with `{{variable}}` placeholders.

**User:** *"Make a skill for writing unit tests"*
**AI calls:**
```
make_skill("Write Tests", "template",
  template="Write tests for {{component}} using {{framework}}. Focus on: {{focus_areas}}",
  variables=["component", "framework", "focus_areas"])
```

**Load anytime:**
```
get_skill("Write Tests", variables={"component": "AuthForm", "framework": "Vitest", "focus_areas": "edge cases"})
```

---

## Storage

All data lives as plain files — no database, no API key, no internet required.

```
~/.engram/                                  ← default (override with $ENGRAM_HOME)
└── projects/
    └── my-project/
        ├── brain.json                      ← machine-readable project intelligence
        ├── brain.md                        ← human-readable (looks great on GitHub)
        ├── pulse.json                      ← session context health tracking
        ├── checkpoints/
        │   ├── legendary-before-everything-broke.json
        │   └── legendary-before-everything-broke.md
        └── skills/
            ├── debug-typescript.json
            └── debug-typescript.md
```

**Team setup:** Point everyone to a shared folder:
```bash
export ENGRAM_HOME="/shared/team/.engram"
# or inside a monorepo:
export ENGRAM_HOME="$(pwd)/.engram"
```

---

## System Prompt (Copy-Paste This)

Add to your AI tool's system prompt for automatic ENGRAM usage:

```
You have access to ENGRAM (engram-mcp), your persistent memory system.

RULES — ALWAYS FOLLOW:
1. Call wake_up() at the START of every session, before anything else.
2. If wake_up() returns "no_memory_yet" → call init_session() with conversation history.
3. Call save_checkpoint() when context reaches ~70% capacity.
4. Call jot() the moment you discover something important.
5. Call check_pulse() every ~20 messages.
6. Call debrief() at the end of every session.
7. Skills: list_skills() to discover, get_skill(name) to load, make_skill() to create.
```

---

## Build From Source

```bash
git clone https://github.com/aslam-devloper/ENGRAM-MCP.git
cd ENGRAM-MCP
npm install
npm run build
node dist/index.js
```

**Development (hot reload):**
```bash
npm run dev
```

---

## Troubleshooting

**`npx engram-mcp` not found**
→ Check Node.js version: `node --version` (needs ≥ 18)

**Tools not showing in Claude Desktop**
→ Restart Claude Desktop after editing config. Check the 🔌 toolbar icon.

**Permission error on Windows**
→ Use `cmd /c npx engram-mcp` in your config, or install globally first.

**Where is my data?**
→ `~/.engram/` on all platforms, or wherever `$ENGRAM_HOME` points.

**Reset everything:**
```bash
# Remove a project's memory
rm -rf ~/.engram/projects/my-project

# Nuclear option — wipe all ENGRAM data
rm -rf ~/.engram
```

---

## Why ENGRAM?

An **engram** is the biological memory trace stored in your neurons. Every experience physically changes your brain — that changed state IS the memory.

ENGRAM does the same for AI: every session physically writes to files. The changed state IS the memory. The AI reads it next time and picks up exactly where it left off.

Also the name wasn't taken. That matters.

---

## Contributing

PRs welcome. Keep it:
- **Simple** — no new runtime dependencies
- **Funny** — the checkpoint names must stay dramatic
- **Fast** — startup under 200ms

1. Fork → Branch → Code → `npm run build` → PR
2. Add new tools in `src/tools/`, register in `src/server.ts`
3. Update this README for any new tools

---

## License

[MIT](LICENSE) — use it, fork it, build on it, star it ⭐

---

<div align="center">

**[⭐ Star on GitHub](https://github.com/aslam-devloper/ENGRAM-MCP)** · **[Report Bug](https://github.com/aslam-devloper/ENGRAM-MCP/issues)** · **[npm](https://www.npmjs.com/package/engram-mcp)**

*"The AI remembered. For once."*

Made with 🧠 and genuine frustration with context windows.

</div>
