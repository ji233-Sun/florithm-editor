"use client";

import { useState, useEffect } from "react";
import { useEditorStore } from "@/stores/editor-store";
import { loadModuleConfig } from "@/lib/pvz/config-loader";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ModuleEditPanel } from "../shared/ModuleEditPanel";
import { Trash2, X } from "lucide-react";

interface ModuleCardProps {
  alias: string;
  objclass: string;
}

export function ModuleCard({ alias, objclass }: ModuleCardProps) {
  const removeModule = useEditorStore((s) => s.removeModule);
  const [modalOpen, setModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [title, setTitle] = useState(objclass);
  const [category, setCategory] = useState<string>("");

  useEffect(() => {
    loadModuleConfig(objclass).then((config) => {
      if (config) {
        setTitle(config.metadata.title);
        setCategory(config.metadata.category);
      }
    });
  }, [objclass]);

  const categoryLabel =
    category === "base" ? "基础" : category === "mode" ? "模式" : "场景";

  const stripClass =
    category === "base"
      ? "category-strip-base"
      : category === "mode"
        ? "category-strip-mode"
        : "category-strip-scene";

  const badgeClass =
    category === "base"
      ? "bg-info/10 text-info"
      : category === "mode"
        ? "bg-secondary/10 text-secondary"
        : "bg-success/10 text-success";

  return (
    <>
      <div
        className={`overflow-hidden rounded-lg border border-base-300 bg-base-100 shadow-sm transition-shadow hover:shadow-md ${stripClass}`}
      >
        <div
          className="flex cursor-pointer items-center gap-2.5 px-4 py-2.5"
          onClick={() => setModalOpen(true)}
        >
          <span className="text-sm font-medium">{title}</span>

          {category && (
            <span
              className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${badgeClass}`}
            >
              {categoryLabel}
            </span>
          )}

          <span className="ml-auto font-mono text-[11px] text-base-content/30">
            {alias}
          </span>

          <button
            className="rounded-md p-1 text-base-content/30 transition-colors hover:bg-error/10 hover:text-error"
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteConfirm(true);
            }}
            title="删除模块"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Module Edit Modal */}
      {modalOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl p-0">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-base-300 px-5 py-3">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">{title}</h3>
                {category && (
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${badgeClass}`}
                  >
                    {categoryLabel}
                  </span>
                )}
              </div>
              <button
                className="btn btn-ghost btn-sm btn-square rounded-lg"
                onClick={() => setModalOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="max-h-[70vh] overflow-y-auto px-5 py-4">
              <ModuleEditPanel objclass={objclass} alias={alias} />
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setModalOpen(false)} />
        </div>
      )}

      <ConfirmDialog
        open={showDeleteConfirm}
        title="删除模块"
        message={`确定删除模块「${title}」？`}
        confirmText="删除"
        cancelText="取消"
        danger
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          removeModule(alias);
          setShowDeleteConfirm(false);
        }}
      />
    </>
  );
}
