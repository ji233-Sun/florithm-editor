import type { ParsedLevelData } from "@/lib/pvz/types";
import type { ConflictRule } from "@/lib/pvz/conflicts";
import type { LevelSnapshot } from "./types";

export function buildLevelSnapshot(
  levelName: string,
  parsed: ParsedLevelData,
  conflicts: ConflictRule[]
): LevelSnapshot {
  const levelDef = parsed.levelDef
    ? (parsed.levelDef.objdata as LevelSnapshot["levelDef"])
    : null;

  const modules = parsed.modules.map((m) => ({
    alias: m.aliases?.[0] ?? "",
    objclass: m.objclass,
    objdata: m.objdata,
  }));

  const events = parsed.events.map((e) => ({
    alias: e.aliases?.[0] ?? "",
    objclass: e.objclass,
    objdata: e.objdata,
  }));

  let waveManager: LevelSnapshot["waveManager"] = null;
  if (parsed.waveManager) {
    const wd = parsed.waveManager.objdata as Record<string, unknown>;
    waveManager = {
      WaveCount: (wd.WaveCount as number) ?? 0,
      FlagWaveInterval: (wd.FlagWaveInterval as number) ?? 10,
      Waves: (wd.Waves as string[][]) ?? [],
    };
  }

  const waveManagerModule = parsed.waveManagerModule
    ? { objdata: parsed.waveManagerModule.objdata }
    : null;

  return {
    levelName,
    levelDef,
    modules,
    waveManager,
    waveManagerModule,
    events,
    conflicts: conflicts.map((c) => ({
      modules: c.modules,
      message: c.message,
    })),
  };
}
