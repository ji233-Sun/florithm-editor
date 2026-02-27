"use client";

import { useEditorStore } from "@/stores/editor-store";
import { useEffect, useState } from "react";
import { loadStages } from "@/lib/pvz/config-loader";
import type { StageEntry } from "@/lib/pvz/config-loader";
import type { LevelDefinitionData } from "@/lib/pvz/types";
import { FileText } from "lucide-react";

export function LevelMetadataForm() {
  const parsed = useEditorStore((s) => s.parsed);
  const updateLevelDef = useEditorStore((s) => s.updateLevelDef);
  const [stages, setStages] = useState<StageEntry[]>([]);

  useEffect(() => {
    loadStages().then(setStages);
  }, []);

  if (!parsed?.levelDef) return null;

  const ld = parsed.levelDef.objdata as unknown as LevelDefinitionData;

  // Group stages by type for optgroup
  const stageGroups = [
    { type: "main", label: "主线世界" },
    { type: "extra", label: "特别活动" },
    { type: "seasons", label: "四季庭院" },
    { type: "special", label: "特殊地图" },
  ] as const;

  return (
    <div className="rounded-xl border border-base-300 bg-base-100 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-base-300 px-5 py-3">
        <FileText className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">关卡元数据</h3>
      </div>

      <div className="space-y-5 p-5">
        {/* Name */}
        <div className="form-control">
          <label className="mb-1.5 text-xs font-medium text-base-content/60">
            关卡名称
          </label>
          <input
            className="input input-bordered input-sm w-full"
            placeholder="输入关卡名称"
            value={ld.Name || ""}
            onChange={(e) => updateLevelDef({ Name: e.target.value })}
          />
        </div>

        {/* StageModule */}
        <div className="form-control">
          <label className="mb-1.5 text-xs font-medium text-base-content/60">
            场景地图
          </label>
          <select
            className="select select-bordered select-sm w-full"
            value={ld.StageModule || ""}
            onChange={(e) => updateLevelDef({ StageModule: e.target.value })}
          >
            <option value="" disabled>
              选择场景地图...
            </option>
            {stageGroups.map((group) => {
              const items = stages.filter((s) => s.type === group.type);
              if (items.length === 0) return null;
              return (
                <optgroup key={group.type} label={group.label}>
                  {items.map((s) => (
                    <option key={s.id} value={s.rtid}>
                      {s.name}
                    </option>
                  ))}
                </optgroup>
              );
            })}
          </select>
        </div>

        {/* Two-column row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="form-control">
            <label className="mb-1.5 text-xs font-medium text-base-content/60">
              初始阳光
            </label>
            <input
              type="number"
              className="input input-bordered input-sm w-full"
              value={ld.StartingSun ?? ""}
              placeholder="默认"
              onChange={(e) => {
                const v = e.target.value;
                updateLevelDef({
                  StartingSun: v === "" ? null : parseInt(v, 10),
                });
              }}
            />
          </div>

          <div className="form-control">
            <label className="mb-1.5 text-xs font-medium text-base-content/60">
              关卡编号
            </label>
            <input
              type="number"
              className="input input-bordered input-sm w-full"
              value={ld.LevelNumber ?? ""}
              placeholder="默认"
              onChange={(e) => {
                const v = e.target.value;
                updateLevelDef({
                  LevelNumber: v === "" ? null : parseInt(v, 10),
                });
              }}
            />
          </div>
        </div>

        {/* Two-column row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="form-control">
            <label className="mb-1.5 text-xs font-medium text-base-content/60">
              战利品 (Loot)
            </label>
            <select
              className="select select-bordered select-sm w-full"
              value={ld.Loot || ""}
              onChange={(e) => updateLevelDef({ Loot: e.target.value })}
            >
              <option value="RTID(DefaultLoot@LevelModules)">默认掉落 (DefaultLoot)</option>
              <option value="RTID(NoLoot@LevelModules)">无掉落 (NoLoot)</option>
            </select>
          </div>

          <div className="form-control">
            <label className="mb-1.5 text-xs font-medium text-base-content/60">
              音乐类型
            </label>
            <select
              className="select select-bordered select-sm w-full"
              value={ld.MusicType || ""}
              onChange={(e) => updateLevelDef({ MusicType: e.target.value })}
            >
              <option value="">默认</option>
              <option value="MiniGame_A">小游戏 A (MiniGame_A)</option>
              <option value="MiniGame_B">小游戏 B (MiniGame_B)</option>
            </select>
          </div>
        </div>

        {/* Boolean flags */}
        <div>
          <label className="mb-2 block text-xs font-medium text-base-content/60">
            关卡标记
          </label>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
            {[
              { key: "IsBossFight", label: "Boss 战" },
              { key: "IsVasebreaker", label: "砸罐子模式" },
              { key: "DisablePeavine", label: "禁用豌豆藤" },
              { key: "IsArtifactDisabled", label: "禁用神器" },
            ].map(({ key, label }) => (
              <label
                key={key}
                className="flex cursor-pointer items-center gap-2.5"
              >
                <input
                  type="checkbox"
                  className="toggle toggle-xs toggle-primary"
                  checked={
                    (ld[key as keyof LevelDefinitionData] as boolean) ?? false
                  }
                  onChange={(e) =>
                    updateLevelDef({
                      [key]: e.target.checked || null,
                    } as Partial<LevelDefinitionData>)
                  }
                />
                <span className="text-sm">{label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
