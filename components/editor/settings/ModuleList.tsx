"use client";

import { useEditorStore } from "@/stores/editor-store";
import { ModuleCard } from "./ModuleCard";
import { AddModuleDialog } from "./AddModuleDialog";
import { Plus, Package } from "lucide-react";
import { useState } from "react";

export function ModuleList() {
  const parsed = useEditorStore((s) => s.parsed);
  const [showAddDialog, setShowAddDialog] = useState(false);

  if (!parsed) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">
            模块列表
            <span className="ml-1.5 text-base-content/40">
              ({parsed.modules.length})
            </span>
          </h3>
        </div>
        <button
          className="btn btn-primary btn-sm gap-1.5"
          onClick={() => setShowAddDialog(true)}
        >
          <Plus className="h-3.5 w-3.5" />
          添加模块
        </button>
      </div>

      {parsed.modules.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-base-300 py-10 text-center">
          <Package className="h-8 w-8 text-base-content/20" />
          <p className="text-sm text-base-content/40">暂无模块</p>
          <button
            className="btn btn-ghost btn-xs text-primary"
            onClick={() => setShowAddDialog(true)}
          >
            添加第一个模块
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {parsed.modules.map((mod) => {
            const alias = mod.aliases?.[0];
            if (!alias) return null;
            return (
              <ModuleCard key={alias} alias={alias} objclass={mod.objclass} />
            );
          })}
        </div>
      )}

      {showAddDialog && (
        <AddModuleDialog onClose={() => setShowAddDialog(false)} />
      )}
    </div>
  );
}
