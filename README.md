# @adorbistech/mcp-server

<div align="center">

**Adorbis AI MCP Server**

One API key. 40+ models. Auto-routed.
Use Adorbis AI from Claude Code, Cursor, Cline, and any MCP-compatible tool.

[![npm version](https://img.shields.io/npm/v/@adorbistech/mcp-server?color=1e9ad6&label=npm)](https://www.npmjs.com/package/@adorbistech/mcp-server)
[![license](https://img.shields.io/npm/l/@adorbistech/mcp-server?color=d2bbff)](LICENSE)

[Get a free API key](https://ai.adorbistech.com) · [Documentation](https://ai.adorbistech.com/docs) · [Dashboard](https://ai.adorbistech.com/dashboard)

</div>

---

## Quick Install

### Claude Code

```bash
claude mcp add adorbis -- npx -y @adorbistech/mcp-server
```

Then set your API key:
```bash
claude mcp add adorbis -e ADORBIS_API_KEY=your_key_here -- npx -y @adorbistech/mcp-server
```

Or add to `~/.claude/settings.json`:
```json
{
  "mcpServers": {
    "adorbis": {
      "command": "npx",
      "args": ["-y", "@adorbistech/mcp-server"],
      "env": {
        "ADORBIS_API_KEY": "your_key_here"
      }
    }
  }
}
```

---

### Cursor

Add to Cursor MCP settings (`~/.cursor/mcp.json`):
```json
{
  "mcpServers": {
    "adorbis": {
      "command": "npx",
      "args": ["-y", "@adorbistech/mcp-server"],
      "env": {
        "ADORBIS_API_KEY": "your_key_here"
      }
    }
  }
}
```

---

### Cline (VS Code)

Add to `.vscode/settings.json` or Cline MCP settings:
```json
{
  "cline.mcpServers": {
    "adorbis": {
      "command": "npx",
      "args": ["-y", "@adorbistech/mcp-server"],
      "env": {
        "ADORBIS_API_KEY": "your_key_here"
      }
    }
  }
}
```

---

### Auto-configure with CLI

Use `adorbis-init` to configure everything automatically:
```bash
npx adorbis-init --mcps
```

---

## Available Tools

Once connected, your AI assistant has access to these tools:

### `adorbis_chat`
General-purpose AI chat. Auto-routes to the best model for your task.

```
Ask Adorbis: What is the difference between TCP and UDP?
```

### `adorbis_code`
Code generation, debugging, review, and explanation. Routes to the best coding model automatically.

```
Use adorbis_code to write a TypeScript function that debounces API calls
```

### `adorbis_reason`
Complex reasoning — math, logic, multi-step analysis. Routes to frontier reasoning models.

```
Use adorbis_reason to analyze the time complexity of this algorithm
```

### `adorbis_write`
Long-form writing — documentation, articles, emails, reports.

```
Use adorbis_write to create a README for my project
```

### `adorbis_balance`
Check your Adorbis AI credit balance and account status.

```
Check my Adorbis balance
```

### `adorbis_models`
List all available departments and what they're best for.

```
What Adorbis departments are available?
```

### `adorbis_multi_turn`
Multi-turn conversations with full message history.

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
```

Adorbis monitors model health, latency, and cost in real time. When you send a request, it routes to the best available model for that department — automatically. No manual model switching.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ADORBIS_API_KEY` | Yes | Your Adorbis API key |

Get a free key (1,000 credits/month) at **https://ai.adorbistech.com**

---

## Plans

| Plan | Price | Credits |
|---|---|---|
| Free | $0/mo | 1,000 AC |
| Starter | $10/mo | 15,000 AC |
| Pro | $30/mo | 50,000 AC |
| Business | $100/mo | 200,000 AC |

1 AC = $0.001 of compute. [Upgrade →](https://ai.adorbistech.com/dashboard)

---

## Also available

- **VS Code Extension** — `ext install adorbis.adorbis-ai`
- **CLI setup wizard** — `npx adorbis-init`
- **Docs** — [ai.adorbistech.com/docs](https://ai.adorbistech.com/docs)

---

## License

MIT © [Adorbis Technologies LLC](https://ai.adorbistech.com)
