export interface LevelSnapshot {
  levelName: string;
  levelDef: {
    Name: string;
    Description: string;
    StageModule: string;
    Loot: string;
    VictoryModule: string;
    MusicType: string;
    StartingSun?: number | null;
    Modules: string[];
  } | null;
  modules: {
    alias: string;
    objclass: string;
    objdata: Record<string, unknown>;
  }[];
  waveManager: {
    WaveCount: number;
    FlagWaveInterval: number;
    Waves: string[][];
  } | null;
  waveManagerModule: {
    objdata: Record<string, unknown>;
  } | null;
  events: {
    alias: string;
    objclass: string;
    objdata: Record<string, unknown>;
  }[];
  conflicts: { modules: [string, string]; message: string }[];
}

export type ActionDescriptor =
  | { type: "update_level_settings"; patch: Record<string, unknown> }
  | { type: "add_module"; objclass: string }
  | { type: "remove_module"; alias: string }
  | { type: "update_module"; alias: string; data: Record<string, unknown> }
  | { type: "add_wave"; count: number }
  | { type: "remove_wave"; index: number }
  | { type: "add_event_to_wave"; waveIndex: number; objclass: string; data?: Record<string, unknown> }
  | {
      type: "remove_event_from_wave";
      waveIndex: number;
      rtid: string;
    }
  | { type: "update_event"; alias: string; data: Record<string, unknown> };
