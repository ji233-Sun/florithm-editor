"use client";

import { useEditorStore } from "@/stores/editor-store";
import {
  ArrowLeft,
  Save,
  Loader2,
  Check,
  AlertCircle,
  Pencil,
  Download,
  Bot,
} from "lucide-react";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";

interface EditorToolbarProps {
  chatOpen: boolean;
  onToggleChat: () => void;
}

export function EditorToolbar({ chatOpen, onToggleChat }: EditorToolbarProps) {
  const {
    levelName,
    setLevelName,
    isDirty,
    saveStatus,
    save,
    autoSaveTimer,
    getSerializedJson,
  } = useEditorStore();

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(levelName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(levelName);
  }, [levelName]);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  function commitName() {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== levelName) {
      setLevelName(trimmed);
    } else {
      setDraft(levelName);
    }
    setEditing(false);
  }

  function handleDownload() {
    const json = getSerializedJson();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    // 使用关卡名称作为文件名，移除不合法字符
    const safeName = levelName.replace(/[<>:"/\\|?*]/g, "_");
    a.download = `${safeName}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex h-12 items-center gap-2 border-b border-base-300 bg-base-100 px-3">
      {/* Back button */}
      <Link
        href="/"
        className="btn btn-ghost btn-sm btn-square rounded-lg"
        title="返回首页"
      >
        <ArrowLeft className="h-4 w-4" />
      </Link>

      {/* Divider */}
      <div className="h-5 w-px bg-base-300" />

      {/* Level name */}
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {editing ? (
          <input
            ref={inputRef}
            className="input input-sm input-bordered w-64 font-medium"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitName}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitName();
              if (e.key === "Escape") {
                setDraft(levelName);
                setEditing(false);
              }
            }}
            maxLength={100}
          />
        ) : (
          <button
            className="group flex items-center gap-1.5 rounded-lg px-2 py-1 transition-colors hover:bg-base-200"
            onClick={() => setEditing(true)}
            title="点击编辑关卡名称"
          >
            <span className="max-w-xs truncate text-sm font-semibold">
              {levelName}
            </span>
            <Pencil className="h-3 w-3 text-base-content/30 transition-colors group-hover:text-base-content/60" />
          </button>
        )}

        {/* Dirty / Auto-save indicator */}
        {isDirty && saveStatus !== "saved" && (
          <div className="flex items-center gap-1.5 rounded-full bg-warning/10 px-2 py-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-warning animate-pulse" />
            <span className="text-xs text-warning">
              {autoSaveTimer ? "自动保存中..." : "未保存"}
            </span>
          </div>
        )}
      </div>

      {/* Keyboard hint */}
      <kbd className="kbd kbd-xs hidden text-base-content/30 md:inline-flex">
        {typeof navigator !== "undefined" &&
        navigator.userAgent.includes("Mac")
          ? "⌘"
          : "Ctrl"}
        +S
      </kbd>

      {/* AI button */}
      <button
        className={`btn btn-ghost btn-sm gap-1.5 ${chatOpen ? "btn-active" : ""}`}
        onClick={onToggleChat}
        title="AI 助手"
      >
        <Bot className="h-4 w-4" />
        <span className="hidden sm:inline">AI</span>
      </button>

      {/* Download button */}
      <button
        className="btn btn-ghost btn-sm gap-1.5"
        onClick={handleDownload}
        title="下载关卡 JSON 文件"
      >
        <Download className="h-4 w-4" />
        <span className="hidden sm:inline">下载</span>
      </button>

      {/* Save button */}
      <button
        className={`btn btn-sm gap-1.5 ${
          saveStatus === "saved"
            ? "btn-success"
            : saveStatus === "error"
              ? "btn-error"
              : "btn-primary"
        }`}
        onClick={save}
        disabled={saveStatus === "saving" || !isDirty}
      >
        {saveStatus === "saving" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>保存中</span>
          </>
        ) : saveStatus === "saved" ? (
          <>
            <Check className="h-4 w-4" />
            <span>已保存</span>
          </>
        ) : saveStatus === "error" ? (
          <>
            <AlertCircle className="h-4 w-4" />
            <span>失败</span>
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            <span>保存</span>
          </>
        )}
      </button>
    </div>
  );
}
