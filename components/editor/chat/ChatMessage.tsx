"use client";

import type { UIMessage } from "ai";
import { isToolUIPart, getToolName } from "ai";
import { User, Bot } from "lucide-react";
import { ToolCallDisplay } from "./ToolCallDisplay";

interface ChatMessageProps {
  message: UIMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  // Extract text parts — strip MiniMax <think> reasoning tags
  const rawText = message.parts
    .filter((p): p is Extract<typeof p, { type: "text" }> => p.type === "text")
    .map((p) => p.text)
    .join("");
  const textContent = rawText.replace(/<think>[\s\S]*?<\/think>\s*/g, "");

  // Extract tool parts (static: "tool-xxx", dynamic: "dynamic-tool")
  const toolParts = message.parts
    .filter(isToolUIPart)
    .map((p) => ({
      ...p,
      type: "dynamic-tool" as const,
      toolName: getToolName(p),
    }));

  return (
    <div className={`mb-3 flex gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div
        className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${
          isUser ? "bg-primary/10" : "bg-secondary/10"
        }`}
      >
        {isUser ? (
          <User className="h-3.5 w-3.5 text-primary" />
        ) : (
          <Bot className="h-3.5 w-3.5 text-secondary" />
        )}
      </div>

      {/* Content */}
      <div
        className={`min-w-0 max-w-[85%] ${isUser ? "text-right" : "text-left"}`}
      >
        {/* Text bubble */}
        {textContent && (
          <div
            className={`inline-block rounded-xl px-3 py-2 text-sm ${
              isUser
                ? "bg-primary text-primary-content"
                : "bg-base-200 text-base-content"
            }`}
          >
            <div className="whitespace-pre-wrap break-words">
              {textContent}
            </div>
          </div>
        )}

        {/* Tool calls */}
        {toolParts.length > 0 && (
          <div className="mt-1.5 space-y-1">
            {toolParts.map((part) => (
              <ToolCallDisplay key={part.toolCallId} part={part} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
