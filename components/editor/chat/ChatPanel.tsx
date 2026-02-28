"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, isToolUIPart } from "ai";
import { useRef, useEffect, useState, useMemo } from "react";
import { X, Send, Loader2, Bot } from "lucide-react";
import { useEditorStore } from "@/stores/editor-store";
import { buildLevelSnapshot } from "@/lib/ai/snapshot";
import { executeAction } from "@/lib/ai/action-executor";
import { ChatMessage } from "./ChatMessage";
import type { ActionDescriptor } from "@/lib/ai/types";

interface ChatPanelProps {
  onClose: () => void;
}

export function ChatPanel({ onClose }: ChatPanelProps) {
  const { levelId, levelName, parsed, conflicts } = useEditorStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState("");

  const levelSnapshot = useMemo(
    () =>
      parsed && levelName
        ? buildLevelSnapshot(levelName, parsed, conflicts)
        : null,
    [levelName, parsed, conflicts]
  );

  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat" }),
    []
  );

  const { messages, sendMessage, status } = useChat({
    transport,
  });

  // Execute actions in real-time as tool results stream in
  const executedRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    const lastMsg = messages.at(-1);
    if (!lastMsg || lastMsg.role !== "assistant") return;

    for (const part of lastMsg.parts) {
      if (!isToolUIPart(part)) continue;
      if (part.state !== "output-available") continue;
      if (executedRef.current.has(part.toolCallId)) continue;

      executedRef.current.add(part.toolCallId);
      const output = part.output as
        | { action?: ActionDescriptor }
        | undefined;
      if (output?.action) {
        const store = useEditorStore.getState();
        executeAction(output.action, store);
      }
    }
  }, [messages]);

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    sendMessage(
      { text },
      { body: { levelId, levelSnapshot } }
    );
    setInput("");
  }

  return (
    <div className="flex h-full w-80 flex-col border-l border-base-300 bg-base-100 lg:w-96">
      {/* Header */}
      <div className="flex h-12 items-center justify-between border-b border-base-300 px-3">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">AI 助手</span>
        </div>
        <button
          className="btn btn-ghost btn-sm btn-square"
          onClick={onClose}
          title="关闭"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-base-content/40">
            <Bot className="h-8 w-8" />
            <p className="text-sm">有什么可以帮你的？</p>
            <p className="text-xs">试试「当前有哪些模块」</p>
          </div>
        )}
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-base-300 p-3"
      >
        <input
          ref={inputRef}
          className="input input-sm input-bordered flex-1"
          placeholder="输入指令..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
        />
        <button
          type="submit"
          className="btn btn-primary btn-sm btn-square"
          disabled={isLoading || !input.trim()}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </form>
    </div>
  );
}
