#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// ── Config ────────────────────────────────────────────────────────────────────
const API_KEY  = process.env.ADORBIS_API_KEY || process.env.ANTHROPIC_API_KEY || "";
const BASE_URL = "https://api.adorbistech.com";
const API_URL  = `${BASE_URL}/v1`;

const DEPARTMENTS = [
  "adorbis/coder",
  "adorbis/quick",
  "adorbis/auto",
  "adorbis/write",
  "adorbis/reason",
] as const;

type Department = typeof DEPARTMENTS[number];

// ── API client ────────────────────────────────────────────────────────────────
interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatResponse {
  id: string;
  model: string;
  choices: Array<{
    message: { role: string; content: string };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

async function callAdorbis(
  messages: Message[],
  department: string = "adorbis/quick",
  maxTokens: number = 2048
): Promise<ChatResponse> {
  if (!API_KEY) {
    throw new Error(
      "ADORBIS_API_KEY environment variable is not set. " +
      "Get a free key at https://ai.adorbistech.com"
    );
  }

  const response = await fetch(`${API_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: department,
      messages,
      max_tokens: maxTokens,
    }),
  });

  if (!res.ok) {
    const body = await response.text();
    if (response.status === 401) throw new Error("Invalid API key. Check your ADORBIS_API_KEY.");
    if (response.status === 402) throw new Error("Insufficient credits. Top up at https://ai.adorbistech.com/dashboard");
    if (response.status === 429) throw new Error("Rate limit exceeded. Slow down requests or upgrade your plan.");
    throw new Error(`Adorbis API error (${response.status}): ${body}`);
  }

  return response.json() as Promise<ChatResponse>;
}

async function checkBalance(): Promise<{
  credits_remaining: number;
  plan: string;
  email?: string;
}> {
  if (!API_KEY) throw new Error("ADORBIS_API_KEY not set.");

  // Validate key via a minimal chat request
  const res = await fetch(`${API_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "adorbis/quick",
      messages: [{ role: "user", content: "hi" }],
      max_tokens: 1,
    }),
  });

  if (!res.ok) throw new Error(`API error (${res.status})`);

  // Balance is returned in response headers or body depending on version
  const data = await res.json() as any;
  return {
    credits_remaining: data.usage?.credits_remaining ?? 0,
    plan: data.plan ?? "unknown",
    email: data.email,
  };
}

// ── MCP Server ────────────────────────────────────────────────────────────────
const server = new McpServer({
  name: "adorbis-ai",
  version: "1.0.0",
  description: "Adorbis AI — one API key, 40+ models, auto-routed. Access OpenAI, Anthropic, Gemini, DeepSeek and more through a single unified interface.",
});

// ── Tool: adorbis_chat ────────────────────────────────────────────────────────
server.tool(
  "adorbis_chat",
  "Send a message to Adorbis AI and get a response. Adorbis auto-routes to the best available model based on the selected department. Use this for general AI assistance, questions, and conversations.",
  {
    message: z.string().describe("The message or question to send to the AI"),
    department: z.enum(DEPARTMENTS).optional().default("adorbis/quick").describe(
      "AI department to use: 'adorbis/quick' (fast responses), 'adorbis/coder' (code), 'adorbis/auto' (smart routing), 'adorbis/write' (writing), 'adorbis/reason' (analysis)"
    ),
    system_prompt: z.string().optional().describe("Optional system prompt to set context for the AI"),
    max_tokens: z.number().int().min(1).max(8192).optional().default(2048).describe("Maximum tokens in the response"),
  },
  async ({ message, department, system_prompt, max_tokens }) => {
    const messages: Message[] = [];
    if (system_prompt) messages.push({ role: "system", content: system_prompt });
    messages.push({ role: "user", content: message });

    const result = await callAdorbis(messages, department, max_tokens);
    const reply = result.choices[0]?.message?.content ?? "";
    const usage = result.usage;

    return {
      content: [
        {
          type: "text",
          text: reply,
        },
      ],
      structuredContent: {
        reply,
        model: result.model,
        department,
        usage: usage ? {
          prompt_tokens: usage.prompt_tokens,
          completion_tokens: usage.completion_tokens,
          total_tokens: usage.total_tokens,
        } : undefined,
      },
    };
  }
);

// ── Tool: adorbis_code ────────────────────────────────────────────────────────
server.tool(
  "adorbis_code",
  "Generate, review, debug, or explain code using Adorbis AI's code-optimized department. Routes to the best available coding model (DeepSeek Coder, Claude Sonnet, Gemini etc.) automatically.",
  {
    task: z.string().describe("The coding task — e.g. 'write a Python function to parse JSON', 'review this code for bugs', 'explain what this does'"),
    code: z.string().optional().describe("Existing code to review, debug, or build upon"),
    language: z.string().optional().describe("Programming language (e.g. python, typescript, rust, go)"),
    max_tokens: z.number().int().min(1).max(8192).optional().default(4096).describe("Maximum tokens in the response"),
  },
  async ({ task, code, language, max_tokens }) => {
    const systemPrompt = `You are an expert software engineer. Provide clean, well-commented, production-ready code. ${language ? `The user is working in ${language}.` : ""} Be concise and practical.`;

    let userMessage = task;
    if (code) {
      userMessage += `\n\n\`\`\`${language || ""}\n${code}\n\`\`\``;
    }

    const messages: Message[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ];

    const result = await callAdorbis(messages, "adorbis/coder", max_tokens);
    const reply = result.choices[0]?.message?.content ?? "";

    return {
      content: [{ type: "text", text: reply }],
      structuredContent: {
        reply,
        model: result.model,
        department: "adorbis/coder",
        language: language ?? "unknown",
      },
    };
  }
);

// ── Tool: adorbis_reason ──────────────────────────────────────────────────────
server.tool(
  "adorbis_reason",
  "Solve complex problems requiring multi-step reasoning, math, logic, or analysis using Adorbis AI's reasoning department. Routes to frontier reasoning models automatically.",
  {
    problem: z.string().describe("The problem, question, or task requiring deep reasoning or analysis"),
    context: z.string().optional().describe("Additional context or data to consider"),
    max_tokens: z.number().int().min(1).max(8192).optional().default(4096),
  },
  async ({ problem, context, max_tokens }) => {
    const messages: Message[] = [
      {
        role: "system",
        content: "You are an expert analyst and problem solver. Think step by step. Show your reasoning clearly before giving a final answer.",
      },
      {
        role: "user",
        content: context ? `${problem}\n\nContext:\n${context}` : problem,
      },
    ];

    const result = await callAdorbis(messages, "adorbis/reason", max_tokens);
    const reply = result.choices[0]?.message?.content ?? "";

    return {
      content: [{ type: "text", text: reply }],
      structuredContent: { reply, model: result.model, department: "adorbis/reason" },
    };
  }
);

// ── Tool: adorbis_write ───────────────────────────────────────────────────────
server.tool(
  "adorbis_write",
  "Generate long-form written content — documentation, articles, emails, reports, summaries — using Adorbis AI's writing-optimized department.",
  {
    task: z.string().describe("The writing task — e.g. 'write a README for my project', 'draft an email to investors', 'summarize this document'"),
    content: z.string().optional().describe("Source material, outline, or context for the writing task"),
    tone: z.enum(["professional", "casual", "technical", "friendly"]).optional().default("professional").describe("Tone of the written output"),
    max_tokens: z.number().int().min(1).max(8192).optional().default(4096),
  },
  async ({ task, content, tone, max_tokens }) => {
    const systemPrompt = `You are an expert writer. Tone: ${tone}. Write clearly and concisely. No filler phrases.`;
    const userMessage = content ? `${task}\n\nSource material:\n${content}` : task;

    const messages: Message[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ];

    const result = await callAdorbis(messages, "adorbis/write", max_tokens);
    const reply = result.choices[0]?.message?.content ?? "";

    return {
      content: [{ type: "text", text: reply }],
      structuredContent: { reply, model: result.model, department: "adorbis/write", tone },
    };
  }
);

// ── Tool: adorbis_balance ─────────────────────────────────────────────────────
server.tool(
  "adorbis_balance",
  "Check your Adorbis AI credit balance, current plan, and account status. Useful for monitoring usage and knowing when to top up.",
  {},
  async () => {
    if (!API_KEY) {
      return {
        content: [{
          type: "text",
          text: "❌ ADORBIS_API_KEY is not set. Set it in your MCP environment variables.\n\nGet a free key at https://ai.adorbistech.com",
        }],
      };
    }

    // Make a minimal test call to verify key works
    try {
      const res = await fetch(`${API_URL}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "adorbis/quick",
          messages: [{ role: "user", content: "hi" }],
          max_tokens: 1,
        }),
      });

      if (res.status === 401) {
        return {
          content: [{ type: "text", text: "❌ Invalid API key. Get a valid key at https://ai.adorbistech.com" }],
        };
      }

      if (res.status === 402) {
        return {
          content: [{ type: "text", text: "⚠️ Credits exhausted. Top up at https://ai.adorbistech.com/dashboard" }],
        };
      }

      const keyPreview = `${API_KEY.substring(0, 12)}...`;

      return {
        content: [{
          type: "text",
          text: `✅ Adorbis AI connected\n\nKey: ${keyPreview}\nStatus: Active\n\nManage your account: https://ai.adorbistech.com/dashboard`,
        }],
        structuredContent: {
          connected: true,
          key_preview: keyPreview,
          dashboard_url: "https://ai.adorbistech.com/dashboard",
        },
      };
    } catch (err: any) {
      return {
        content: [{ type: "text", text: `❌ Network error: ${err.message}` }],
      };
    }
  }
);

// ── Tool: adorbis_models ──────────────────────────────────────────────────────
server.tool(
  "adorbis_models",
  "List all available Adorbis AI departments and what they route to. Use this to understand which department to use for different tasks.",
  {},
  async () => {
    const models = [
      {
        department: "adorbis/quick",
        description: "Fast responses — best for chat, Q&A, simple tasks",
        use_cases: ["quick questions", "chat", "classification", "short summaries"],
        speed: "fastest",
      },
      {
        department: "adorbis/coder",
        description: "Code generation, debugging, review, and explanation",
        use_cases: ["write code", "debug", "code review", "explain code", "refactor"],
        speed: "fast",
      },
      {
        department: "adorbis/auto",
        description: "Smart routing — picks the best model for your task automatically",
        use_cases: ["mixed workloads", "when unsure", "general purpose"],
        speed: "varies",
      },
      {
        department: "adorbis/write",
        description: "Long-form writing — documentation, articles, emails, reports",
        use_cases: ["README files", "blog posts", "documentation", "emails", "summaries"],
        speed: "medium",
      },
      {
        department: "adorbis/reason",
        description: "Complex reasoning — math, logic, analysis, multi-step problems",
        use_cases: ["math problems", "logical reasoning", "data analysis", "research"],
        speed: "slower but thorough",
      },
    ];

    const text = models.map(m =>
      `**${m.department}**\n${m.description}\nUse for: ${m.use_cases.join(", ")}\nSpeed: ${m.speed}`
    ).join("\n\n");

    return {
      content: [{ type: "text", text: `Available Adorbis AI departments:\n\n${text}` }],
      structuredContent: { departments: models },
    };
  }
);

// ── Tool: adorbis_multi_turn ──────────────────────────────────────────────────
server.tool(
  "adorbis_multi_turn",
  "Have a multi-turn conversation with Adorbis AI by passing the full message history. Use this when you need to maintain context across multiple exchanges.",
  {
    messages: z.array(z.object({
      role: z.enum(["user", "assistant", "system"]),
      content: z.string(),
    })).describe("Full conversation history as an array of {role, content} objects"),
    department: z.enum(DEPARTMENTS).optional().default("adorbis/auto"),
    max_tokens: z.number().int().min(1).max(8192).optional().default(2048),
  },
  async ({ messages, department, max_tokens }) => {
    const result = await callAdorbis(messages as Message[], department, max_tokens);
    const reply = result.choices[0]?.message?.content ?? "";

    return {
      content: [{ type: "text", text: reply }],
      structuredContent: {
        reply,
        model: result.model,
        department,
        message_count: messages.length,
      },
    };
  }
);

// ── Start server ──────────────────────────────────────────────────────────────
async function main() {
  if (!API_KEY) {
    process.stderr.write(
      "[adorbis-mcp] WARNING: ADORBIS_API_KEY is not set. " +
      "Tools will return errors until the key is configured. " +
      "Get a free key at https://ai.adorbistech.com\n"
    );
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write("[adorbis-mcp] Adorbis AI MCP server running on stdio\n");
}

main().catch(err => {
  process.stderr.write(`[adorbis-mcp] Fatal error: ${err.message}\n`);
  process.exit(1);
});
