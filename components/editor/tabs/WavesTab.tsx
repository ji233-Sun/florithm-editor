"use client";

import { useEditorStore } from "@/stores/editor-store";
import { WaveManagerForm } from "../waves/WaveManagerForm";
import { WaveTimeline } from "../waves/WaveTimeline";
import { Waves, Plus } from "lucide-react";

export function WavesTab() {
  const parsed = useEditorStore((s) => s.parsed);
  const addWaveManager = useEditorStore((s) => s.addWaveManager);

  // 前置条件：需要波次管理器模块
  if (!parsed?.waveManagerModule || !parsed?.waveManager) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-base-300 py-14 text-center">
          <Waves className="h-10 w-10 text-base-content/20" />
          <p className="text-sm font-medium text-base-content/50">
            此关卡尚未添加波次管理器模块
          </p>
          <p className="max-w-xs text-xs text-base-content/30">
            波次管理器是管理出怪波次的核心模块，添加后即可编辑波次和事件
          </p>
          <button
            className="btn btn-primary btn-sm mt-2 gap-1.5"
            onClick={addWaveManager}
          >
            <Plus className="h-3.5 w-3.5" />
            添加波次管理器
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <WaveManagerForm />
      <WaveTimeline />
    </div>
  );
}
