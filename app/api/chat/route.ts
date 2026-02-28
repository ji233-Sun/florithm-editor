import { streamText, convertToModelMessages, stepCountIs } from "ai";
import type { UIMessage } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth/helpers";
import { buildSystemPrompt } from "@/lib/ai/system-prompt";
import { createReadTools } from "@/lib/ai/tools/read-tools";
import { createWriteTools } from "@/lib/ai/tools/write-tools";
import type { LevelSnapshot } from "@/lib/ai/types";

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI 服务未配置" },
      { status: 503 }
    );
  }

  const body = await request.json();
  const { messages, levelSnapshot } = body as {
    messages: UIMessage[];
    levelSnapshot: LevelSnapshot;
  };

  const modelId = process.env.OPENAI_MODEL || "gpt-4o";
  const system = buildSystemPrompt(levelSnapshot);
  const readTools = createReadTools(levelSnapshot);
  const writeTools = createWriteTools(levelSnapshot);

  const provider = createOpenAI({
    apiKey,
    baseURL: process.env.OPENAI_BASE_URL || undefined,
  });

  const result = streamText({
    model: provider.chat(modelId),
    system,
    messages: await convertToModelMessages(messages),
    tools: { ...readTools, ...writeTools },
    stopWhen: stepCountIs(8),
  });

  return result.toUIMessageStreamResponse();
}
