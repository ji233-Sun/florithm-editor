"use client";

import { ModuleEditPanel } from "../shared/ModuleEditPanel";
import { useEditorStore } from "@/stores/editor-store";
import { Swords } from "lucide-react";

export function ZombossBattleTab() {
  const parsed = useEditorStore((s) => s.parsed);
  const module = parsed?.modules.find(
    (m) => m.objclass === "ZombossBattleModuleProperties"
  );
  if (!module) return null;

  const alias = module.aliases?.[0];
  if (!alias) return null;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-xl border border-base-300 bg-base-100 shadow-sm">
        <div className="flex items-center gap-2 border-b border-base-300 px-5 py-3">
          <Swords className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">僵王战设置</h2>
          <span className="font-mono text-xs text-base-content/30">{alias}</span>
        </div>
        <div className="p-5">
          <ModuleEditPanel objclass={module.objclass} alias={alias} />
        </div>
      </div>
    </div>
  );
}
