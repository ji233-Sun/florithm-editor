"use client";

import { useEffect, useState } from "react";
import { useEditorStore } from "@/stores/editor-store";
import { loadEventIndex, loadEventConfig } from "@/lib/pvz/config-loader";
import type { EventIndexEntry } from "@/lib/pvz/config-loader";
import { parseRtid } from "@/lib/pvz/rtid";
import { X, Loader2 } from "lucide-react";

interface AddEventDialogProps {
  waveIndex: number;
  onClose: () => void;
}

interface EventDisplay extends EventIndexEntry {
  title: string;
  description: string;
  color: string;
  unique?: boolean;
}

export function AddEventDialog({ waveIndex, onClose }: AddEventDialogProps) {
  const addEventToWave = useEditorStore((s) => s.addEventToWave);
  const parsed = useEditorStore((s) => s.parsed);
  const [events, setEvents] = useState<EventDisplay[]>([]);
  const [loading, setLoading] = useState(true);

  // Compute objclasses already present in this wave for unique check
  const existingObjclasses = new Set<string>();
  if (parsed?.waveManager) {
    const wmData = parsed.waveManager.objdata as Record<string, unknown>;
    const waves = (wmData.Waves as string[][]) || [];
    const waveRtids = waves[waveIndex] || [];
    for (const rtidStr of waveRtids) {
      const info = parseRtid(rtidStr);
      if (!info) continue;
      const obj = parsed.objectMap.get(info.alias);
      if (obj) existingObjclasses.add(obj.objclass);
    }
  }

  useEffect(() => {
    async function load() {
      const index = await loadEventIndex();
      const results = await Promise.all(
        index.map(async (entry) => {
          const config = await loadEventConfig(entry.objclass);
          return {
            ...entry,
            title: config?.metadata.title || entry.id,
            description: config?.metadata.description || "",
            color: config?.metadata.color || "#6b7280",
            unique: config?.metadata.unique,
          };
        })
      );
      setEvents(results);
      setLoading(false);
    }
    load();
  }, []);

  async function handleSelect(entry: EventDisplay) {
    const config = await loadEventConfig(entry.objclass);
    if (config) addEventToWave(waveIndex, config);
    onClose();
  }

  return (
    <div className="modal modal-open" onClick={(e) => e.stopPropagation()}>
      <div className="modal-box max-w-lg p-0">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-base-300 px-5 py-3">
          <h3 className="text-base font-bold">
            添加事件
            <span className="ml-2 text-sm font-normal text-base-content/40">
              第 {waveIndex + 1} 波
            </span>
          </h3>
          <button
            className="btn btn-ghost btn-sm btn-square rounded-lg"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid max-h-[50vh] grid-cols-2 gap-1.5 overflow-y-auto p-3">
            {events.map((event) => {
              const isDisabled =
                event.unique && existingObjclasses.has(event.objclass);
              return (
                <button
                  key={event.id}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                    isDisabled
                      ? "cursor-not-allowed opacity-40"
                      : "hover:bg-base-200"
                  }`}
                  onClick={() => !isDisabled && handleSelect(event)}
                  title={
                    isDisabled
                      ? "该波次已包含此事件（唯一）"
                      : event.description
                  }
                  disabled={isDisabled}
                >
                  <span
                    className="h-3 w-3 shrink-0 rounded-full shadow-sm"
                    style={{ backgroundColor: event.color }}
                  />
                  <div className="min-w-0">
                    <div className="truncate font-medium">{event.title}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
}
