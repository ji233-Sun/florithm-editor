import { z } from "zod";
import type { LevelSnapshot, ActionDescriptor } from "@/lib/ai/types";

export function createWriteTools(snapshot: LevelSnapshot) {
  return {
    update_level_settings: {
      description:
        "修改关卡全局设置，如名称、描述、场景、音乐类型、初始阳光等",
      inputSchema: z.object({
        Name: z.string().optional().describe("关卡内部名称"),
        Description: z.string().optional().describe("关卡描述"),
        StageModule: z.string().optional().describe("场景模块 RTID"),
        MusicType: z.string().optional().describe("音乐类型"),
        StartingSun: z.number().optional().describe("初始阳光数"),
        Loot: z.string().optional().describe("战利品 RTID"),
        VictoryModule: z.string().optional().describe("胜利模块 RTID"),
      }),
      execute: async (params: Record<string, unknown>) => {
        const patch: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(params)) {
          if (v !== undefined) patch[k] = v;
        }
        if (Object.keys(patch).length === 0) {
          return { error: "没有提供要修改的字段" };
        }
        const action: ActionDescriptor = {
          type: "update_level_settings",
          patch,
        };
        // Sync server-side snapshot
        if (snapshot.levelDef) {
          Object.assign(snapshot.levelDef, patch);
        }
        const fields = Object.keys(patch).join(", ");
        return { action, description: `修改关卡设置: ${fields}` };
      },
    },

    add_module: {
      description: "向关卡添加一个新模块",
      inputSchema: z.object({
        objclass: z.string().describe("模块的 objclass 类型名"),
      }),
      execute: async ({ objclass }: { objclass: string }) => {
        const exists = snapshot.modules.some((m) => m.objclass === objclass);
        if (exists) {
          return { error: `关卡中已存在类型为 "${objclass}" 的模块` };
        }
        const action: ActionDescriptor = { type: "add_module", objclass };
        // Sync server-side snapshot
        snapshot.modules.push({
          alias: `_pending_${objclass}`,
          objclass,
          objdata: {},
        });
        return { action, description: `添加模块: ${objclass}` };
      },
    },

    remove_module: {
      description: "从关卡删除一个模块",
      inputSchema: z.object({
        alias: z.string().describe("要删除的模块别名"),
      }),
      execute: async ({ alias }: { alias: string }) => {
        const idx = snapshot.modules.findIndex((mod) => mod.alias === alias);
        if (idx === -1) {
          return { error: `找不到别名为 "${alias}" 的模块` };
        }
        const m = snapshot.modules[idx];
        const action: ActionDescriptor = { type: "remove_module", alias };
        // Sync server-side snapshot
        snapshot.modules.splice(idx, 1);
        return {
          action,
          description: `删除模块: ${alias} (${m.objclass})`,
        };
      },
    },

    update_module: {
      description: "更新模块的数据字段",
      inputSchema: z.object({
        alias: z.string().describe("模块别名"),
        data: z
          .record(z.string(), z.unknown())
          .describe("要更新的字段键值对，会与现有数据合并"),
      }),
      execute: async ({
        alias,
        data,
      }: {
        alias: string;
        data: Record<string, unknown>;
      }) => {
        const m = snapshot.modules.find((mod) => mod.alias === alias);
        if (!m) {
          return { error: `找不到别名为 "${alias}" 的模块` };
        }
        const action: ActionDescriptor = {
          type: "update_module",
          alias,
          data,
        };
        // Sync server-side snapshot
        Object.assign(m.objdata, data);
        const fields = Object.keys(data).join(", ");
        return {
          action,
          description: `更新模块 ${alias} 的字段: ${fields}`,
        };
      },
    },

    add_wave: {
      description: "在波次列表末尾添加空波次，可一次添加多个",
      inputSchema: z.object({
        count: z
          .number()
          .int()
          .min(1)
          .max(50)
          .default(1)
          .describe("要添加的波次数量，默认 1"),
      }),
      execute: async ({ count = 1 }: { count?: number }) => {
        if (!snapshot.waveManager) {
          return { error: "当前关卡没有波次管理器，请先添加波次管理模块" };
        }
        const startIndex = snapshot.waveManager.WaveCount;
        const action: ActionDescriptor = { type: "add_wave", count };
        // Sync server-side snapshot
        for (let i = 0; i < count; i++) {
          snapshot.waveManager.Waves.push([]);
        }
        snapshot.waveManager.WaveCount += count;
        return {
          action,
          description:
            count === 1
              ? `添加第 ${startIndex + 1} 波（索引 ${startIndex}）`
              : `添加 ${count} 个空波次（索引 ${startIndex} ~ ${startIndex + count - 1}）`,
        };
      },
    },

    remove_wave: {
      description: "删除指定索引的波次及其所有事件",
      inputSchema: z.object({
        index: z.number().int().min(0).describe("波次索引（从 0 开始）"),
      }),
      execute: async ({ index }: { index: number }) => {
        if (!snapshot.waveManager) {
          return { error: "当前关卡没有波次管理器" };
        }
        if (index >= snapshot.waveManager.WaveCount) {
          return {
            error: `波次索引 ${index} 越界，当前共 ${snapshot.waveManager.WaveCount} 波`,
          };
        }
        const action: ActionDescriptor = { type: "remove_wave", index };
        // Sync server-side snapshot
        const removedRtids = snapshot.waveManager.Waves[index] || [];
        snapshot.waveManager.Waves.splice(index, 1);
        snapshot.waveManager.WaveCount--;
        // Remove events that belonged to this wave
        snapshot.events = snapshot.events.filter(
          (e) =>
            !removedRtids.some((rtid) => rtid.includes(`(${e.alias}@`))
        );
        return {
          action,
          description: `删除第 ${index + 1} 波（索引 ${index}）`,
        };
      },
    },

    add_event_to_wave: {
      description:
        "向指定波次添加一个事件，可同时设置事件的初始数据。" +
        "添加前请先用 get_event_config 查询事件的字段定义和默认数据。",
      inputSchema: z.object({
        waveIndex: z.number().int().min(0).describe("波次索引（从 0 开始）"),
        objclass: z.string().describe("事件的 objclass 类型名"),
        data: z
          .record(z.string(), z.unknown())
          .optional()
          .describe(
            "事件初始数据，会与默认数据合并。字段格式请先用 get_event_config 查询"
          ),
      }),
      execute: async ({
        waveIndex,
        objclass,
        data,
      }: {
        waveIndex: number;
        objclass: string;
        data?: Record<string, unknown>;
      }) => {
        if (!snapshot.waveManager) {
          return { error: "当前关卡没有波次管理器" };
        }
        if (waveIndex >= snapshot.waveManager.WaveCount) {
          return {
            error: `波次索引 ${waveIndex} 越界，当前共 ${snapshot.waveManager.WaveCount} 波`,
          };
        }
        const action: ActionDescriptor = {
          type: "add_event_to_wave",
          waveIndex,
          objclass,
          ...(data ? { data } : {}),
        };
        // Sync server-side snapshot
        const alias = `Wave${waveIndex}_${objclass}_${Date.now()}`;
        const rtid = `RTID(${alias}@CurrentLevel)`;
        snapshot.waveManager.Waves[waveIndex].push(rtid);
        snapshot.events.push({
          alias,
          objclass,
          objdata: data ?? {},
        });
        return {
          action,
          description: `在第 ${waveIndex + 1} 波添加事件: ${objclass}${data ? "（含初始数据）" : ""}`,
        };
      },
    },

    remove_event_from_wave: {
      description: "从指定波次删除一个事件",
      inputSchema: z.object({
        waveIndex: z.number().int().min(0).describe("波次索引（从 0 开始）"),
        rtid: z.string().describe("事件的 RTID 字符串"),
      }),
      execute: async ({
        waveIndex,
        rtid,
      }: {
        waveIndex: number;
        rtid: string;
      }) => {
        if (!snapshot.waveManager) {
          return { error: "当前关卡没有波次管理器" };
        }
        if (waveIndex >= snapshot.waveManager.WaveCount) {
          return {
            error: `波次索引 ${waveIndex} 越界，当前共 ${snapshot.waveManager.WaveCount} 波`,
          };
        }
        const wave = snapshot.waveManager.Waves[waveIndex];
        if (!wave.includes(rtid)) {
          return {
            error: `第 ${waveIndex + 1} 波中不存在 RTID "${rtid}"`,
          };
        }
        const action: ActionDescriptor = {
          type: "remove_event_from_wave",
          waveIndex,
          rtid,
        };
        // Sync server-side snapshot
        snapshot.waveManager.Waves[waveIndex] = wave.filter(
          (r) => r !== rtid
        );
        const aliasMatch = rtid.match(/^RTID\((.+)@/);
        if (aliasMatch) {
          snapshot.events = snapshot.events.filter(
            (e) => e.alias !== aliasMatch[1]
          );
        }
        return {
          action,
          description: `从第 ${waveIndex + 1} 波删除事件: ${rtid}`,
        };
      },
    },

    update_event: {
      description: "更新事件的数据字段",
      inputSchema: z.object({
        alias: z.string().describe("事件别名"),
        data: z
          .record(z.string(), z.unknown())
          .describe("要更新的字段键值对，会与现有数据合并"),
      }),
      execute: async ({
        alias,
        data,
      }: {
        alias: string;
        data: Record<string, unknown>;
      }) => {
        const e = snapshot.events.find((ev) => ev.alias === alias);
        if (!e) {
          return { error: `找不到别名为 "${alias}" 的事件` };
        }
        const action: ActionDescriptor = {
          type: "update_event",
          alias,
          data,
        };
        // Sync server-side snapshot
        Object.assign(e.objdata, data);
        const fields = Object.keys(data).join(", ");
        return {
          action,
          description: `更新事件 ${alias} 的字段: ${fields}`,
        };
      },
    },
  };
}
