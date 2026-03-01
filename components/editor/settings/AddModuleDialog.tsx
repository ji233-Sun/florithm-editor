"use client";

import { useEffect, useState } from "react";
import { useEditorStore } from "@/stores/editor-store";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  loadModuleIndex,
  loadModuleConfig,
} from "@/lib/pvz/config-loader";
import type { ModuleIndexEntry } from "@/lib/pvz/config-loader";
import { checkAddConflicts } from "@/lib/pvz/conflicts";
import { X, Loader2, AlertTriangle, Check, Search } from "lucide-react";

interface AddModuleDialogProps {
  onClose: () => void;
}

interface ModuleDisplayEntry extends ModuleIndexEntry {
  title: string;
  description: string;
  isCore: boolean;
  allowMultiple: boolean;
}

export function AddModuleDialog({ onClose }: AddModuleDialogProps) {
  const parsed = useEditorStore((s) => s.parsed);
  const addModule = useEditorStore((s) => s.addModule);

  const [entries, setEntries] = useState<ModuleDisplayEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pendingConflict, setPendingConflict] = useState<{
    entry: ModuleDisplayEntry;
    messages: string;
  } | null>(null);

  useEffect(() => {
    async function load() {
      const index = await loadModuleIndex();
      const results = await Promise.all(
        index.map(async (entry) => {
          const config = await loadModuleConfig(entry.objclass);
          return {
            ...entry,
            title: config?.metadata.title || entry.id,
            description: config?.metadata.description || "",
            isCore: config?.metadata.isCore || false,
            allowMultiple: config?.metadata.allowMultiple || false,
          };
        })
      );
      setEntries(results);
      setLoading(false);
    }
    load();
  }, []);

  const existingObjclasses = parsed?.modules.map((m) => m.objclass) || [];

  async function applySelection(entry: ModuleDisplayEntry) {
    const config = await loadModuleConfig(entry.objclass);
    if (config) addModule(config);
    onClose();
  }

  async function handleSelect(entry: ModuleDisplayEntry) {
    if (!entry.allowMultiple && existingObjclasses.includes(entry.objclass)) {
      return;
    }

    const conflicts = checkAddConflicts(existingObjclasses, entry.objclass);
    if (conflicts.length > 0) {
      const messages = conflicts.map((c) => c.message).join("\n");
      setPendingConflict({ entry, messages });
      return;
    }

    await applySelection(entry);
  }

  const filtered = search
    ? entries.filter(
        (e) =>
          e.title.toLowerCase().includes(search.toLowerCase()) ||
          e.objclass.toLowerCase().includes(search.toLowerCase())
      )
    : entries;

  const categories = [
    { key: "base", label: "基础模块", color: "text-info" },
    { key: "mode", label: "模式模块", color: "text-secondary" },
    { key: "scene", label: "场景模块", color: "text-success" },
  ] as const;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-4xl p-0">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-base-300 px-5 py-3">
          <h3 className="text-base font-bold">添加模块</h3>
          <button
            className="btn btn-ghost btn-sm btn-square rounded-lg"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search */}
        <div className="border-b border-base-300 px-5 py-3">
          <label className="input input-bordered input-sm flex w-full items-center gap-2">
            <Search className="h-4 w-4 text-base-content/40" />
            <input
              className="grow"
              placeholder="搜索模块..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </label>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid max-h-[60vh] grid-cols-1 gap-0 overflow-y-auto md:grid-cols-3">
            {categories.map(({ key, label, color }) => {
              const items = filtered.filter((e) => e.category === key);
              return (
                <div
                  key={key}
                  className="border-r border-base-200 last:border-r-0"
                >
                  <div className="sticky top-0 z-10 border-b border-base-200 bg-base-200/80 px-4 py-2 backdrop-blur-sm">
                    <h4 className={`text-xs font-bold uppercase ${color}`}>
                      {label}
                      <span className="ml-1 text-base-content/30">
                        ({items.length})
                      </span>
                    </h4>
                  </div>
                  <div className="p-2">
                    {items.length === 0 ? (
                      <p className="py-4 text-center text-xs text-base-content/30">
                        无匹配
                      </p>
                    ) : (
                      items.map((entry) => {
                        const exists =
                          !entry.allowMultiple &&
                          existingObjclasses.includes(entry.objclass);
                        const hasConflict =
                          !exists &&
                          checkAddConflicts(existingObjclasses, entry.objclass)
                            .length > 0;

                        return (
                          <button
                            key={entry.id}
                            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                              exists
                                ? "cursor-default opacity-40"
                                : hasConflict
                                  ? "hover:bg-warning/10"
                                  : "hover:bg-base-200"
                            }`}
                            disabled={exists}
                            onClick={() => handleSelect(entry)}
                            title={entry.description}
                          >
                            <span className="flex-1 truncate">
                              {entry.title}
                            </span>
                            {exists && (
                              <Check className="h-3.5 w-3.5 shrink-0 text-success" />
                            )}
                            {hasConflict && (
                              <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-warning" />
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="modal-backdrop" onClick={onClose} />

      <ConfirmDialog
        open={pendingConflict !== null}
        title="模块冲突确认"
        message={
          pendingConflict
            ? `添加此模块会产生冲突：\n\n${pendingConflict.messages}\n\n是否继续？`
            : ""
        }
        confirmText="继续添加"
        cancelText="取消"
        danger
        onCancel={() => setPendingConflict(null)}
        onConfirm={async () => {
          if (pendingConflict) {
            await applySelection(pendingConflict.entry);
          }
          setPendingConflict(null);
        }}
      />
    </div>
  );
}
