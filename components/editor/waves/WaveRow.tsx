"use client";

import { useEditorStore } from "@/stores/editor-store";
import { parseRtid } from "@/lib/pvz/rtid";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EventChip } from "./EventChip";
import { AddEventDialog } from "./AddEventDialog";
import { EventEditDialog } from "./EventEditDialog";
import { Plus, Trash2, Flag } from "lucide-react";
import { useState } from "react";

interface WaveRowProps {
  waveIndex: number;
  rtids: string[];
  isFlagWave: boolean;
  isLastWave: boolean;
  onRemove: () => void;
}

export function WaveRow({
  waveIndex,
  rtids,
  isFlagWave,
  isLastWave,
  onRemove,
}: WaveRowProps) {
  const parsed = useEditorStore((s) => s.parsed);
  const removeEventFromWave = useEditorStore((s) => s.removeEventFromWave);

  const [showAddEvent, setShowAddEvent] = useState(false);
  const [deletingEventRtid, setDeletingEventRtid] = useState<string | null>(
    null
  );
  const [editingEvent, setEditingEvent] = useState<{
    alias: string;
    objclass: string;
    rtid: string;
  } | null>(null);

  return (
    <>
      <div
        className={`group flex items-center gap-3 border-b px-4 py-2.5 transition-colors last:border-b-0 ${
          isFlagWave
            ? "border-warning/20 bg-warning/5"
            : "border-base-200 hover:bg-base-200/50"
        }`}
      >
        {/* Wave number badge */}
        <div
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-bold ${
            isFlagWave
              ? "bg-warning/20 text-warning"
              : "bg-base-200 text-base-content/50"
          }`}
        >
          {isFlagWave ? (
            <Flag className="h-3.5 w-3.5" />
          ) : (
            waveIndex + 1
          )}
        </div>

        {/* Flag wave label */}
        {isFlagWave && (
          <span className="hidden text-xs font-medium text-warning/70 sm:inline">
            {waveIndex + 1}
          </span>
        )}

        {/* Event chips */}
        <div className="flex flex-1 flex-wrap items-center gap-1.5">
          {rtids.map((rtidStr) => {
            const info = parseRtid(rtidStr);
            if (!info) return null;
            const obj = parsed?.objectMap.get(info.alias);
            if (!obj) return null;

            return (
              <EventChip
                key={rtidStr}
                objclass={obj.objclass}
                alias={info.alias}
                onClick={() =>
                  setEditingEvent({
                    alias: info.alias,
                    objclass: obj.objclass,
                    rtid: rtidStr,
                  })
                }
                onRemove={() => {
                  setDeletingEventRtid(rtidStr);
                }}
              />
            );
          })}

          {rtids.length === 0 && (
            <span className="text-xs italic text-base-content/25">
              空波次 — 点击 + 添加事件
            </span>
          )}
        </div>

        {/* Actions — visible on hover on desktop, always visible on touch devices */}
        <div className="flex shrink-0 items-center gap-0.5 opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100">
          <button
            className="rounded-md p-1.5 text-base-content/40 transition-colors hover:bg-primary/10 hover:text-primary"
            onClick={() => setShowAddEvent(true)}
            title="添加事件"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          <button
            className="rounded-md p-1.5 text-base-content/40 transition-colors hover:bg-error/10 hover:text-error"
            onClick={onRemove}
            title="删除波次"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Dialogs rendered outside the row to avoid layout issues */}
      {showAddEvent && (
        <AddEventDialog
          waveIndex={waveIndex}
          onClose={() => setShowAddEvent(false)}
        />
      )}
      {editingEvent && (
        <EventEditDialog
          alias={editingEvent.alias}
          objclass={editingEvent.objclass}
          onClose={() => setEditingEvent(null)}
        />
      )}

      <ConfirmDialog
        open={deletingEventRtid !== null}
        title="删除事件"
        message="确定删除此事件？"
        confirmText="删除"
        cancelText="取消"
        danger
        onCancel={() => setDeletingEventRtid(null)}
        onConfirm={() => {
          if (deletingEventRtid) {
            removeEventFromWave(waveIndex, deletingEventRtid);
          }
          setDeletingEventRtid(null);
        }}
      />
    </>
  );
}
