import Anthropic from "@anthropic-ai/sdk";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { getEnv } from "./config.js";
import { ContentDraft, type Client } from "./models.js";
import { logger } from "./logger.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");

let cachedSystem: string | undefined;
let cachedAnthropic: Anthropic | undefined;

function stripFrontmatter(input: string): string {
  if (!input.startsWith("---")) return input;
  const end = input.indexOf("\n---", 3);
  if (end === -1) return input;
  return input.slice(end + 4).replace(/^\s+/, "");
}

async function loadSystemPrompt(): Promise<string> {
  if (cachedSystem) return cachedSystem;
  const projectMemory = await readFile(resolve(repoRoot, "CLAUDE.md"), "utf8");
  const agentFile = await readFile(resolve(repoRoot, "agents/seo-writer.md"), "utf8");
  cachedSystem = `${projectMemory.trim()}\n\n---\n\n${stripFrontmatter(agentFile).trim()}`;
  return cachedSystem;
}

function anthropic(): Anthropic {
  if (!cachedAnthropic) {
    cachedAnthropic = new Anthropic({ apiKey: getEnv().ANTHROPIC_API_KEY });
  }
  return cachedAnthropic;
}

function buildBrief(client: Client): string {
  return JSON.stringify(
    {
      client: client.name,
      brandVoice: client.brandVoice,
      audience: client.audience,
      targetKeywords: client.targetKeywords,
      instruction:
        "Generate one blog post. Return ONLY a JSON object matching the ContentDraft schema. No prose, no fences.",
    },
    null,
    2,
  );
}

function extractJson(text: string): string {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < 0 || end <= start) {
    throw new Error(`No JSON object found in model output: ${text.slice(0, 200)}`);
  }
  return text.slice(start, end + 1);
}

export async function generatePost(client: Client): Promise<ContentDraft> {
  const env = getEnv();
  const system = await loadSystemPrompt();

  const response = await anthropic().messages.create({
    model: env.MODEL_NAME,
    max_tokens: 4096,
    system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: buildBrief(client) }],
  });

  const textBlock = response.content.find((c) => c.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Anthropic response contained no text block");
  }
  const raw = JSON.parse(extractJson(textBlock.text));
  if (!raw.generatedAt) {
    raw.generatedAt = new Date().toISOString();
  }
  const draft = ContentDraft.parse(raw);
  logger.info(
    { title: draft.title, slug: draft.slug, usage: response.usage },
    "draft generated",
  );
  return draft;
}
