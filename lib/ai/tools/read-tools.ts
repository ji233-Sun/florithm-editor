import { z } from "zod";
import type { LevelSnapshot } from "@/lib/ai/types";

export function createReadTools(snapshot: LevelSnapshot) {
  return {
    get_level_info: {
      description:
        "获取关卡基本信息：名称、描述、场景、音乐、初始阳光、模块数、波次数",
      inputSchema: z.object({}),
      execute: async () => {
        const ld = snapshot.levelDef;
        return {
          levelName: snapshot.levelName,
          name: ld?.Name ?? "",
          description: ld?.Description ?? "",
          stageModule: ld?.StageModule ?? "",
          musicType: ld?.MusicType ?? "",
          startingSun: ld?.StartingSun ?? null,
          loot: ld?.Loot ?? "",
          victoryModule: ld?.VictoryModule ?? "",
          moduleCount: snapshot.modules.length,
          waveCount: snapshot.waveManager?.WaveCount ?? 0,
          eventCount: snapshot.events.length,
          conflictCount: snapshot.conflicts.length,
        };
      },
    },

    list_modules: {
      description: "列出关卡中所有模块的别名、类型和数据字段名",
      inputSchema: z.object({}),
      execute: async () => {
        return {
          modules: snapshot.modules.map((m) => ({
            alias: m.alias,
            objclass: m.objclass,
            dataKeys: Object.keys(m.objdata),
          })),
        };
      },
    },

    list_waves: {
      description: "列出所有波次及每波的事件 RTID 列表",
      inputSchema: z.object({}),
      execute: async () => {
        if (!snapshot.waveManager) {
          return { error: "当前关卡没有波次管理器" };
        }
        return {
          waveCount: snapshot.waveManager.WaveCount,
          flagWaveInterval: snapshot.waveManager.FlagWaveInterval,
          waves: snapshot.waveManager.Waves.map((rtids, i) => ({
            index: i,
            events: rtids,
          })),
        };
      },
    },

    get_module_detail: {
      description: "根据别名获取单个模块的完整数据",
      inputSchema: z.object({
        alias: z.string().describe("模块的别名"),
      }),
      execute: async ({ alias }: { alias: string }) => {
        const m = snapshot.modules.find((mod) => mod.alias === alias);
        if (!m) return { error: `找不到别名为 "${alias}" 的模块` };
        return { alias: m.alias, objclass: m.objclass, objdata: m.objdata };
      },
    },

    get_event_detail: {
      description: "根据别名获取单个事件的完整数据",
      inputSchema: z.object({
        alias: z.string().describe("事件的别名"),
      }),
      execute: async ({ alias }: { alias: string }) => {
        const e = snapshot.events.find((ev) => ev.alias === alias);
        if (!e) return { error: `找不到别名为 "${alias}" 的事件` };
        return { alias: e.alias, objclass: e.objclass, objdata: e.objdata };
      },
    },

    list_available_modules: {
      description:
        "列出所有可添加的模块类型（从配置文件读取），可按分类筛选",
      inputSchema: z.object({
        category: z
          .enum(["all", "base", "mode", "scene"])
          .default("all")
          .describe("筛选分类：all=全部, base=基础, mode=模式, scene=场景"),
      }),
      execute: async ({ category }: { category: string }) => {
        const { readFile } = await import("fs/promises");
        const { join } = await import("path");
        const indexPath = join(
          process.cwd(),
          "public/data/configs/modules/_index.json"
        );
        const raw = await readFile(indexPath, "utf-8");
        const { modules } = JSON.parse(raw) as {
          modules: {
            id: string;
            objclass: string;
            category: string;
            file: string;
          }[];
        };

        const filtered =
          category === "all"
            ? modules
            : modules.filter((m) => m.category === category);

        const result = await Promise.all(
          filtered.map(async (entry) => {
            try {
              const cfgPath = join(
                process.cwd(),
                "public/data/configs/modules",
                entry.file
              );
              const cfgRaw = await readFile(cfgPath, "utf-8");
              const cfg = JSON.parse(cfgRaw);
              return {
                objclass: entry.objclass,
                category: entry.category,
                title: cfg.metadata?.title ?? entry.id,
                description: cfg.metadata?.description ?? "",
              };
            } catch {
              return {
                objclass: entry.objclass,
                category: entry.category,
                title: entry.id,
                description: "",
              };
            }
          })
        );

        return { modules: result };
      },
    },

    list_available_events: {
      description: "列出所有可添加的事件类型（从配置文件读取）",
      inputSchema: z.object({}),
      execute: async () => {
        const { readFile } = await import("fs/promises");
        const { join } = await import("path");
        const indexPath = join(
          process.cwd(),
          "public/data/configs/events/_index.json"
        );
        const raw = await readFile(indexPath, "utf-8");
        const { events } = JSON.parse(raw) as {
          events: { id: string; objclass: string; file: string }[];
        };

        const result = await Promise.all(
          events.map(async (entry) => {
            try {
              const cfgPath = join(
                process.cwd(),
                "public/data/configs/events",
                entry.file
              );
              const cfgRaw = await readFile(cfgPath, "utf-8");
              const cfg = JSON.parse(cfgRaw);
              return {
                objclass: entry.objclass,
                title: cfg.metadata?.title ?? entry.id,
                description: cfg.metadata?.description ?? "",
                unique: cfg.metadata?.unique ?? false,
              };
            } catch {
              return {
                objclass: entry.objclass,
                title: entry.id,
                description: "",
                unique: false,
              };
            }
          })
        );

        return { events: result };
      },
    },

    get_event_config: {
      description:
        "根据 objclass 获取事件的配置定义，包括字段 schema、默认数据和数据格式说明。" +
        "在用 add_event_to_wave 添加事件前，应先调用此工具了解该事件需要哪些字段以及正确的数据格式。",
      inputSchema: z.object({
        objclass: z.string().describe("事件的 objclass 类型名"),
      }),
      execute: async ({ objclass }: { objclass: string }) => {
        const { readFile } = await import("fs/promises");
        const { join } = await import("path");
        const indexPath = join(
          process.cwd(),
          "public/data/configs/events/_index.json"
        );
        const raw = await readFile(indexPath, "utf-8");
        const { events } = JSON.parse(raw) as {
          events: { id: string; objclass: string; file: string }[];
        };
        const entry = events.find((e) => e.objclass === objclass);
        if (!entry) {
          return { error: `找不到事件类型: ${objclass}` };
        }
        const cfgPath = join(
          process.cwd(),
          "public/data/configs/events",
          entry.file
        );
        const cfgRaw = await readFile(cfgPath, "utf-8");
        const cfg = JSON.parse(cfgRaw);
        return {
          objclass: cfg.objclass,
          title: cfg.metadata?.title,
          description: cfg.metadata?.description,
          unique: cfg.metadata?.unique ?? false,
          initialData: cfg.initialData,
          fields: cfg.fields,
          dataFormatNotes: [
            "zombie-spawn-list 类型的 Zombies 字段格式: [{ Type: \"RTID(zombie_id@ZombieTypes)\", Row: <number|null>, Level: <number|null> }]",
            "Row: null 表示随机行，Row: 1~5 表示指定行",
            "Level: null 表示默认等级，Level: 1~N 表示升阶等级",
            "zombie-ref 类型的值格式: \"RTID(zombie_id@ZombieTypes)\"",
            "plant-ref 类型的值格式: \"RTID(plant_id@PlantTypes)\"",
          ],
        };
      },
    },

    get_module_config: {
      description:
        "根据 objclass 获取模块的配置定义，包括字段 schema 和默认数据。" +
        "在用 add_module 或 update_module 修改模块前，可调用此工具了解该模块的字段格式。",
      inputSchema: z.object({
        objclass: z.string().describe("模块的 objclass 类型名"),
      }),
      execute: async ({ objclass }: { objclass: string }) => {
        const { readFile } = await import("fs/promises");
        const { join } = await import("path");
        const indexPath = join(
          process.cwd(),
          "public/data/configs/modules/_index.json"
        );
        const raw = await readFile(indexPath, "utf-8");
        const { modules } = JSON.parse(raw) as {
          modules: {
            id: string;
            objclass: string;
            category: string;
            file: string;
          }[];
        };
        const entry = modules.find((m) => m.objclass === objclass);
        if (!entry) {
          return { error: `找不到模块类型: ${objclass}` };
        }
        const cfgPath = join(
          process.cwd(),
          "public/data/configs/modules",
          entry.file
        );
        const cfgRaw = await readFile(cfgPath, "utf-8");
        const cfg = JSON.parse(cfgRaw);
        return {
          objclass: cfg.objclass,
          title: cfg.metadata?.title,
          description: cfg.metadata?.description,
          initialData: cfg.initialData,
          fields: cfg.fields,
        };
      },
    },

    check_conflicts: {
      description: "检查当前关卡的模块冲突和缺失模块",
      inputSchema: z.object({}),
      execute: async () => {
        const { checkConflicts } = await import("@/lib/pvz/conflicts");
        const { checkMissingModules } = await import(
          "@/lib/pvz/missing-modules"
        );

        const objclasses = snapshot.modules.map((m) => m.objclass);
        const conflicts = checkConflicts(objclasses);
        const missing = checkMissingModules(objclasses);

        return {
          conflicts: conflicts.map((c) => ({
            modules: c.modules,
            message: c.message,
          })),
          missingModules: missing.map((m) => ({
            objclass: m.objclass,
            label: m.label,
          })),
        };
      },
    },

    list_plants: {
      description:
        "搜索可用的植物列表。可按关键词搜索名称/ID，或按标签筛选。返回植物 ID 和中文名。植物 ID 用于 RTID 引用（如 RTID(peashooter@PlantTypes)）和种子库的 PlantWhiteList 等字段",
      inputSchema: z.object({
        query: z
          .string()
          .default("")
          .describe("搜索关键词，匹配植物 ID 或中文名"),
        tag: z
          .string()
          .default("")
          .describe(
            "按标签筛选。常见标签：White/Green/Blue/Orange/Purple（品质），Productor/Remote/Defence/Melee/Special（功能），Original（经典）"
          ),
      }),
      execute: async ({
        query,
        tag,
      }: {
        query: string;
        tag: string;
      }) => {
        const { readFile } = await import("fs/promises");
        const { join } = await import("path");
        const raw = await readFile(
          join(process.cwd(), "public/data/reference/Plants.json"),
          "utf-8"
        );
        const plants = JSON.parse(raw) as {
          id: string;
          name: string;
          tags: string[];
        }[];

        let filtered = plants;
        if (tag) {
          const t = tag.toLowerCase();
          filtered = filtered.filter((p) =>
            p.tags.some((pt) => pt.toLowerCase() === t)
          );
        }
        if (query) {
          const q = query.toLowerCase();
          filtered = filtered.filter(
            (p) =>
              p.id.toLowerCase().includes(q) ||
              p.name.toLowerCase().includes(q)
          );
        }

        return {
          total: filtered.length,
          plants: filtered.map((p) => ({
            id: p.id,
            name: p.name,
            tags: p.tags,
          })),
        };
      },
    },

    list_zombies: {
      description:
        "搜索可用的僵尸列表。可按关键词搜索名称/ID，或按标签筛选。返回僵尸 ID 和中文名。僵尸 ID 用于 RTID 引用（如 RTID(mummy@ZombieTypes)）和出怪事件的 Zombies 数组等字段",
      inputSchema: z.object({
        query: z
          .string()
          .default("")
          .describe("搜索关键词，匹配僵尸 ID 或中文名"),
        tag: z
          .string()
          .default("")
          .describe(
            "按标签筛选。常见标签：Egypt_Pirate/WildWest/FarFuture/DarkAges/BigWave/FrostBite/LostCity/Sky/Steam/Renaissance/Penny/Modern（地区），Basic/Gargantuar/Imp/Boss/Machine（类型）"
          ),
      }),
      execute: async ({
        query,
        tag,
      }: {
        query: string;
        tag: string;
      }) => {
        const { readFile } = await import("fs/promises");
        const { join } = await import("path");
        const raw = await readFile(
          join(process.cwd(), "public/data/reference/Zombies.json"),
          "utf-8"
        );
        const zombies = JSON.parse(raw) as {
          id: string;
          name: string;
          tags: string[];
        }[];

        let filtered = zombies;
        if (tag) {
          const t = tag.toLowerCase();
          filtered = filtered.filter((z) =>
            z.tags.some((zt) => zt.toLowerCase() === t)
          );
        }
        if (query) {
          const q = query.toLowerCase();
          filtered = filtered.filter(
            (z) =>
              z.id.toLowerCase().includes(q) ||
              z.name.toLowerCase().includes(q)
          );
        }

        return {
          total: filtered.length,
          zombies: filtered.map((z) => ({
            id: z.id,
            name: z.name,
            tags: z.tags,
          })),
        };
      },
    },
  };
}
