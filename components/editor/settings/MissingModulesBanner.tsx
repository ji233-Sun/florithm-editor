"use client";

import { useEditorStore } from "@/stores/editor-store";
import { useMemo } from "react";
import { Info } from "lucide-react";
import { checkMissingModules } from "@/lib/pvz/missing-modules";

export function MissingModulesBanner() {
  const parsed = useEditorStore((s) => s.parsed);

  const missing = useMemo(() => {
    if (!parsed) return [];
    const objclasses = parsed.modules.map((m) => m.objclass);
    return checkMissingModules(objclasses);
  }, [parsed]);

  if (missing.length === 0) return null;

  return (
    <div className="rounded-xl border border-info/30 bg-info/5 p-4">
      <div className="flex gap-3">
        <Info className="h-5 w-5 shrink-0 text-info" />
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-info">
            缺少 {missing.length} 个庭院关卡必要的模块，可能导致关卡闪退
          </h4>
          <ul className="mt-2 space-y-1">
            {missing.map((m) => (
              <li key={m.objclass} className="text-sm text-base-content/70">
                <span className="font-mono text-xs text-info/80">
                  {m.label}
                </span>
                <span className="ml-1.5 text-xs text-base-content/40">
                  ({m.objclass})
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
