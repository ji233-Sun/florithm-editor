"use client";

import { useEditorStore } from "@/stores/editor-store";
import { Copy, Check, Code2, FileJson } from "lucide-react";
import { useState, useMemo } from "react";

export function JsonViewTab() {
  const getSerializedJson = useEditorStore((s) => s.getSerializedJson);
  const [copied, setCopied] = useState(false);

  const json = getSerializedJson();

  const stats = useMemo(() => {
    try {
      const parsed = JSON.parse(json);
      return {
        objects: parsed.objects?.length ?? 0,
        size: new Blob([json]).size,
      };
    } catch {
      return { objects: 0, size: 0 };
    }
  }, [json]);

  async function handleCopy() {
    await navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const sizeLabel =
    stats.size > 1024
      ? `${(stats.size / 1024).toFixed(1)} KB`
      : `${stats.size} B`;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="overflow-hidden rounded-xl border border-base-300 bg-base-100 shadow-sm">
        {/* Header bar */}
        <div className="flex items-center gap-2 border-b border-base-300 bg-base-200/50 px-4 py-2">
          <FileJson className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium text-base-content/60">
            关卡 JSON
          </span>
          <span className="text-xs text-base-content/30">
            {stats.objects} 对象 · {sizeLabel}
          </span>

          <div className="ml-auto">
            <button
              className={`btn btn-xs gap-1.5 ${copied ? "btn-success" : "btn-ghost"}`}
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3" />
                  已复制
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  复制
                </>
              )}
            </button>
          </div>
        </div>

        {/* Code area */}
        <pre className="json-view max-h-[calc(100vh-260px)] overflow-auto p-4 font-mono text-xs leading-relaxed text-base-content/80">
          {json}
        </pre>
      </div>
    </div>
  );
}
