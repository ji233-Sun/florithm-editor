"use client";

import { useEditorStore } from "@/stores/editor-store";
import type { WaveManagerData } from "@/lib/pvz/types";
import { WaveRow } from "./WaveRow";
import { Plus, Waves } from "lucide-react";

export function WaveTimeline() {
  const parsed = useEditorStore((s) => s.parsed);
  const addWave = useEditorStore((s) => s.addWave);
  const removeWave = useEditorStore((s) => s.removeWave);

  if (!parsed?.waveManager) return null;

  const wmData = parsed.waveManager.objdata as unknown as WaveManagerData;
  const waves = wmData.Waves || [];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Waves className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">
            波次列表
            <span className="ml-1.5 text-base-content/40">
              ({waves.length} 波)
            </span>
          </h3>
        </div>
        <button className="btn btn-primary btn-sm gap-1.5" onClick={addWave}>
          <Plus className="h-3.5 w-3.5" />
          添加波次
        </button>
      </div>

      {waves.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-base-300 py-10 text-center">
          <Waves className="h-8 w-8 text-base-content/20" />
          <p className="text-sm text-base-content/40">暂无波次</p>
          <button
            className="btn btn-ghost btn-xs text-primary"
            onClick={addWave}
          >
            添加第一波
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-base-300 bg-base-100">
          {waves.map((waveRtids, idx) => {
            const isFlagWave =
              wmData.FlagWaveInterval > 0 &&
              (idx + 1) % wmData.FlagWaveInterval === 0;

            return (
              <WaveRow
                key={idx}
                waveIndex={idx}
                rtids={waveRtids}
                isFlagWave={isFlagWave}
                isLastWave={idx === waves.length - 1}
                onRemove={() => {
                  if (
                    confirm(
                      `确定删除第 ${idx + 1} 波？其中的所有事件也会被删除。`
                    )
                  ) {
                    removeWave(idx);
                  }
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
