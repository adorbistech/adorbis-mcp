# @adorbistech/mcp-server

<div align="center">

**Adorbis AI MCP Server**

One API key. 40+ models. Auto-routed.
Use Adorbis AI from Claude Code, Cursor, Cline, and any MCP-compatible tool.

[![npm version](https://img.shields.io/npm/v/@adorbistech/mcp-server?color=1e9ad6&label=npm)](https://www.npmjs.com/package/@adorbistech/mcp-server)
[![license](https://img.shields.io/npm/l/@adorbistech/mcp-server?color=d2bbff)](LICENSE)
[![node](https://img.shields.io/node/v/@adorbistech/mcp-server?color=4be257)](https://nodejs.org)

[Get a free API key](https://ai.adorbistech.com) · [Documentation](https://ai.adorbistech.com/docs) · [Dashboard](https://ai.adorbistech.com/dashboard)

</div>

---

## Install

### Option 1 — Clone and run locally (recommended, works on all platforms)

```bash
git clone https://github.com/adorbistech/adorbis-mcp
cd adorbis-mcp
npm install
npm run build
```

Then point your tool to `node /path/to/adorbis-mcp/dist/index.js`.

---

### Claude Code

Add to `~/.claude.json`:

```json
{
  "mcpServers": {
    "adorbis": {
      "command": "node",
      "args": ["/path/to/adorbis-mcp/dist/index.js"],
      "env": {
        "ADORBIS_API_KEY": "your_key_here"
      }
    }
  }
}
```

**Windows path example:**
```json
"args": ["D:\\Ai-Adorbis\\MCP\\dist\\index.js"]
```

**Mac/Linux path example:**
```json
"args": ["/home/user/adorbis-mcp/dist/index.js"]
```

---

### Cursor

Add to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "adorbis": {
      "command": "node",
      "args": ["/path/to/adorbis-mcp/dist/index.js"],
      "env": {
        "ADORBIS_API_KEY": "your_key_here"
      }
    }
  }
}
```

---

### Cline (VS Code)

Add to Cline MCP settings:

```json
{
  "adorbis": {
    "command": "node",
    "args": ["/path/to/adorbis-mcp/dist/index.js"],
    "env": {
      "ADORBIS_API_KEY": "your_key_here"
    }
  }
}
```

---

### Option 2 — npx (Mac/Linux only)

```bash
# Mac/Linux
ADORBIS_API_KEY=your_key npx @adorbistech/mcp-server
```

> **Note:** `npx` install is not recommended on Windows due to path resolution issues. Use the clone method above.

---

### Auto-configure with CLI

```bash
npx adorbis-init --mcps
```

Automatically writes the correct MCP config for every tool you have configured.

---

## Available Tools

Once connected, your AI assistant has access to 7 tools:

| Tool | Description |
|---|---|
| `adorbis_chat` | General AI chat — auto-routes to best model |
| `adorbis_code` | Code generation, debugging, review |
| `adorbis_reason` | Math, logic, multi-step analysis |
| `adorbis_write` | Documentation, articles, emails |
| `adorbis_balance` | Check connection and credit status |
| `adorbis_models` | List all available departments |
| `adorbis_multi_turn` | Multi-turn conversation with history |

### Usage examples

```
Check my Adorbis balance
```
```
Use adorbis_code to write a TypeScript debounce function
```
```
What Adorbis departments are available?
```
```
Use adorbis_reason to analyze the time complexity of merge sort
```

---

## Departments

| Department | Best for | Speed |
|---|---|---|
| `adorbis/quick` | Chat, Q&A, simple tasks | Fastest |
| `adorbis/coder` | Code generation, debugging, review | Fast |
| `adorbis/auto` | Mixed workloads, smart routing | Varies |
| `adorbis/write` | Documentation, articles, emails | Medium |
| `adorbis/reason` | Math, logic, complex analysis | Thorough |

---

## How Adorbis AI works

```
Your tool (Claude Code / Cursor / Cline)
              │
              ▼ MCP call
  @adorbistech/mcp-server
              │
              ▼ HTTPS
   api.adorbistech.com  ←── your single API key
              │
      ┌───────┴────────┐
      │   Department   │
      │    routing     │
      └───────┬────────┘
              │
    ┌─────────┼──────────┐
    ▼         ▼          ▼
 Gemini   DeepSeek   Claude
 Flash      V3       Sonnet
              │
              ▼
         Best model
         for your task
```

Adorbis monitors model health, latency, and cost in real time. When you send a request, it routes to the best available model automatically. No manual model switching. No vendor lock-in.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ADORBIS_API_KEY` | Yes | Your Adorbis API key |

Get a free key (1,000 credits/month, no credit card) at **https://ai.adorbistech.com**

---

## Plans

| Plan | Price | Credits |
|---|---|---|
| Free | $0/mo | 1,000 AC |
| Starter | $10/mo | 15,000 AC |
| Pro | $30/mo | 50,000 AC |
| Business | $100/mo | 200,000 AC |

1 AC = $0.001 of underlying compute. [Upgrade →](https://ai.adorbistech.com/dashboard)

---

## Also available

- **VS Code Extension** — `ext install adorbis.adorbis-ai`
- **CLI setup wizard** — `npx adorbis-init`
- **Full docs** — [ai.adorbistech.com/docs](https://ai.adorbistech.com/docs)

---

## Requirements

- Node.js >= 18
- An Adorbis API key — [get one free](https://ai.adorbistech.com)

---

## Contributing

Issues and PRs welcome at [github.com/adorbistech/adorbis-mcp](https://github.com/adorbistech/adorbis-mcp)

---

## License

MIT © [Adorbis Technologies LLC](https://ai.adorbistech.com)
