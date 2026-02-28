"use client";

import { useEffect, useState } from "react";
import { useEditorStore } from "@/stores/editor-store";
import { DynamicForm } from "@/components/ui/DynamicForm";
import type { FieldDefinition, ParsedLevelData } from "@/lib/pvz/types";
import { Settings2 } from "lucide-react";

const EXCLUDED_KEYS = new Set(["Waves", "WaveCount"]);

/**
 * 检查关卡是否有传送带模块
 * 遍历所有对象，查找 objclass 为 "ConveyorSeedBankProperties" 的对象
 */
function hasConveyorModule(parsed: ParsedLevelData | null): boolean {
  if (!parsed?.allObjects) return false;
  return parsed.allObjects.some((obj) => obj.objclass === "ConveyorSeedBankProperties");
}

export function WaveManagerForm() {
  const parsed = useEditorStore((s) => s.parsed);
  const updateWaveManagerData = useEditorStore((s) => s.updateWaveManagerData);

  const [fields, setFields] = useState<FieldDefinition[] | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [isConveyor, setIsConveyor] = useState(false);

  useEffect(() => {
    setIsConveyor(hasConveyorModule(parsed));
  }, [parsed]);

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

  // 根据是否有传送带，过滤出对应的倒计时字段
  const filteredFields = fields.filter((f) => {
    if (EXCLUDED_KEYS.has(f.key)) return false;
    // 根据传送带状态过滤对应的倒计时字段
    if (isConveyor) {
      return f.key !== "ZombieCountDownFirstWaveSecs"; // 传送带模式下隐藏普通模式字段
    } else {
      return f.key !== "ZombieCountDownFirstWaveConveyorSecs"; // 普通模式下隐藏传送带字段
    }
  });

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
          {/* 提示文字 */}
          <p className="mt-2 text-xs text-base-content/50">
            {isConveyor
              ? "检测到传送带模块，已应用传送带首波延迟设置（默认 5 秒）"
              : "未检测到传送带模块，已应用普通首波延迟设置（默认 12 秒）"}
          </p>
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
    default: 10,
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
    default: 0.2,
  },
  {
    key: "MinNextWaveHealthPercentage",
    type: "number",
    label: "下波血量下限百分比",
    numberType: "float",
    min: 0,
    max: 1,
    step: 0.05,
    default: 0.1,
  },
  {
    key: "SuppressFlagZombie",
    type: "boolean",
    label: "隐藏旗帜僵尸",
    nullable: true,
    default: false,
  },
  {
    key: "ZombieCountDownFirstWaveSecs",
    type: "number",
    label: "首波倒计时（秒）",
    description: "普通模式（自选卡）下第一波僵尸到来前的等待时间，默认 12 秒",
    nullable: true,
    numberType: "int",
    min: 0,
    default: 12,
  },
  {
    key: "ZombieCountDownFirstWaveConveyorSecs",
    type: "number",
    label: "传送带首波倒计时（秒）",
    description: "传送带模式下第一波僵尸到来前的等待时间，默认 5 秒",
    nullable: true,
    numberType: "int",
    min: 0,
    default: 5,
  },
  {
    key: "ZombieCountDownHugeWaveDelay",
    type: "number",
    label: "旗帜波延迟（秒）",
    description: "旗帜波（红字提示）到僵尸刷新的间隔时间，默认 5 秒",
    nullable: true,
    numberType: "int",
    min: 0,
    default: 5,
  },
  {
    key: "LevelJam",
    type: "select",
    label: "背景音乐类型",
    description: "仅在摩登世界有效，用于设定全局背景音乐为魔音僵尸提供技能",
    nullable: true,
    options: [
      { value: "", label: "默认/无 (None)" },
      { value: "jam_pop", label: "流行 (Pop)" },
      { value: "jam_rap", label: "说唱 (Rap)" },
      { value: "jam_metal", label: "重金属 (Metal)" },
      { value: "jam_punk", label: "朋克 (Punk)" },
      { value: "jam_8bit", label: "街机 (8-Bit)" },
    ],
    default: "",
  },
];
