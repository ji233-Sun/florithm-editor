"use client";

import { useEditorStore } from "@/stores/editor-store";
import { AlertTriangle } from "lucide-react";

export function ConflictBanner() {
  const conflicts = useEditorStore((s) => s.conflicts);

  if (conflicts.length === 0) return null;

  return (
    <div className="rounded-xl border border-warning/30 bg-warning/5 p-4">
      <div className="flex gap-3">
        <AlertTriangle className="h-5 w-5 shrink-0 text-warning" />
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-warning">
            检测到 {conflicts.length} 个模块冲突
          </h4>
          <ul className="mt-2 space-y-1.5">
            {conflicts.map((c, i) => (
              <li
                key={i}
                className="text-sm text-base-content/70"
              >
                <span className="font-mono text-xs text-warning/80">
                  {c.modules[0]}
                </span>
                {" + "}
                <span className="font-mono text-xs text-warning/80">
                  {c.modules[1]}
                </span>
                <span className="mx-1.5">—</span>
                {c.message}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
