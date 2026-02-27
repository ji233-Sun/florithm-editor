"use client";

import { useEffect, useState } from "react";
import { useEditorStore } from "@/stores/editor-store";
import { DynamicForm } from "@/components/ui/DynamicForm";
import type { FieldDefinition } from "@/lib/pvz/types";
import { Settings2 } from "lucide-react";

const EXCLUDED_KEYS = new Set(["Waves", "WaveCount"]);

export function WaveManagerForm() {
  const parsed = useEditorStore((s) => s.parsed);
  const updateWaveManagerData = useEditorStore((s) => s.updateWaveManagerData);

  const [fields, setFields] = useState<FieldDefinition[] | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setFields(hardcodedWaveManagerFields);
  }, []);

  if (!parsed?.waveManager) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-base-300 py-10 text-center">
        <Settings2 className="h-8 w-8 text-base-content/20" />
        <p className="text-sm text-base-content/40">
          此关卡没有波次管理器
        </p>
        <p className="text-xs text-base-content/30">
          请先在设置标签页中添加波次管理器模块
        </p>
      </div>
    );
  }

  if (!fields) return null;

  const data = parsed.waveManager.objdata as Record<string, unknown>;
  const filteredFields = fields.filter((f) => !EXCLUDED_KEYS.has(f.key));

  return (
    <div className="rounded-xl border border-base-300 bg-base-100 shadow-sm">
      <button
        className="flex w-full items-center gap-2 px-5 py-3 text-left transition-colors hover:bg-base-200/50"
        onClick={() => setExpanded(!expanded)}
      >
        <Settings2 className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">波次管理器全局设置</h3>
        <span className="ml-auto text-xs text-base-content/30">
          {expanded ? "收起" : "展开"}
        </span>
      </button>

      {expanded && (
        <div className="border-t border-base-200 p-5">
          <DynamicForm
            fields={filteredFields}
            data={data}
            onChange={(newData) => updateWaveManagerData(newData)}
          />
        </div>
      )}
    </div>
  );
}

const hardcodedWaveManagerFields: FieldDefinition[] = [
  {
    key: "FlagWaveInterval",
    type: "number",
    label: "旗帜波间隔",
    description: "每隔多少波出现一次旗帜波",
    numberType: "int",
    min: 1,
    max: 100,
  },
  {
    key: "MaxNextWaveHealthPercentage",
    type: "number",
    label: "下波血量上限百分比",
    description: "前波僵尸剩余血量低于此百分比时触发下一波",
    numberType: "float",
    min: 0,
    max: 1,
    step: 0.05,
  },
  {
    key: "MinNextWaveHealthPercentage",
    type: "number",
    label: "下波血量下限百分比",
    numberType: "float",
    min: 0,
    max: 1,
    step: 0.05,
  },
  {
    key: "SuppressFlagZombie",
    type: "boolean",
    label: "隐藏旗帜僵尸",
    nullable: true,
  },
  {
    key: "ZombieCountDownFirstWaveSecs",
    type: "number",
    label: "首波倒计时（秒）",
    nullable: true,
    numberType: "float",
    min: 0,
  },
  {
    key: "ZombieCountDownFirstWaveConveyorSecs",
    type: "number",
    label: "传送带首波倒计时（秒）",
    nullable: true,
    numberType: "float",
    min: 0,
  },
  {
    key: "ZombieCountDownHugeWaveDelay",
    type: "number",
    label: "巨浪延迟（秒）",
    nullable: true,
    numberType: "float",
    min: 0,
  },
  {
    key: "LevelJam",
    type: "string",
    label: "LevelJam",
    nullable: true,
  },
];
