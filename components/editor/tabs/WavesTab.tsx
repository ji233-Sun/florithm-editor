"use client";

import { useEditorStore } from "@/stores/editor-store";
import { WaveManagerForm } from "../waves/WaveManagerForm";
import { WaveTimeline } from "../waves/WaveTimeline";
import { Waves, Plus } from "lucide-react";

export function WavesTab() {
  const parsed = useEditorStore((s) => s.parsed);
  const addWaveManager = useEditorStore((s) => s.addWaveManager);
  const addWaveContainer = useEditorStore((s) => s.addWaveContainer);
  const hasWaveManagerModule = Boolean(
    parsed?.modules.some((m) => m.objclass === "WaveManagerModuleProperties")
  );

  if (!hasWaveManagerModule) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-base-300 py-14 text-center">
          <Waves className="h-10 w-10 text-base-content/20" />
          <p className="text-sm font-medium text-base-content/50">
            此关卡尚未添加波次管理器模块
          </p>
          <p className="max-w-xs text-xs text-base-content/30">
            波次界面需要“波次管理器模块 + 波次容器”作为前置条件
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

  if (!parsed.waveManager) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-base-300 py-14 text-center">
          <Waves className="h-10 w-10 text-base-content/20" />
          <p className="text-sm font-medium text-base-content/50">
            此关卡尚未添加波次容器
          </p>
          <p className="max-w-xs text-xs text-base-content/30">
            已检测到波次管理器模块，请先创建一个波次容器后再编辑波次与事件
          </p>
          <button
            className="btn btn-primary btn-sm mt-2 gap-1.5"
            onClick={addWaveContainer}
          >
            <Plus className="h-3.5 w-3.5" />
            创建波次容器
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
