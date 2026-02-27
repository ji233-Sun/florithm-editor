"use client";

import { create } from "zustand";
import type {
  ParsedLevelData,
  PvzObject,
  PvzLevelFile,
  LevelDefinitionData,
  WaveManagerData,
  ModuleConfig,
  EventConfig,
} from "@/lib/pvz/types";
import type { ConflictRule } from "@/lib/pvz/conflicts";
import { parseLevel } from "@/lib/pvz/parser";
import { serializeLevel } from "@/lib/pvz/serializer";
import { buildRtid, parseRtid } from "@/lib/pvz/rtid";
import { checkConflicts } from "@/lib/pvz/conflicts";

// --- Types ---

export type EditorTab =
  | "settings"
  | "waves"
  | "vasebreaker"
  | "izombie"
  | "zomboss"
  | "json";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface EditorState {
  // Core data
  levelId: string | null;
  levelName: string;
  parsed: ParsedLevelData | null;

  // UI state
  activeTab: EditorTab;
  isDirty: boolean;
  saveStatus: SaveStatus;
  loading: boolean;
  error: string | null;

  // Conflicts
  conflicts: ConflictRule[];

  // Actions
  loadLevel: (levelId: string) => Promise<void>;
  save: () => Promise<void>;
  setActiveTab: (tab: EditorTab) => void;
  setLevelName: (name: string) => void;

  // LevelDefinition mutations
  updateLevelDef: (patch: Partial<LevelDefinitionData>) => void;

  // Module mutations
  addModule: (config: ModuleConfig) => void;
  removeModule: (alias: string) => void;
  updateModuleData: (alias: string, data: Record<string, unknown>) => void;

  // WaveManager mutations (direct update on the WaveManagerProperties object)
  updateWaveManagerData: (data: Record<string, unknown>) => void;

  // Wave mutations
  addWave: () => void;
  removeWave: (index: number) => void;

  // Event mutations
  addEventToWave: (waveIdx: number, config: EventConfig) => void;
  removeEventFromWave: (waveIdx: number, rtid: string) => void;
  updateEventData: (alias: string, data: Record<string, unknown>) => void;

  // Utility
  recheckConflicts: () => void;
  getSerializedJson: () => string;
}

// --- Helpers ---

function generateUniqueAlias(
  baseAlias: string,
  objectMap: Map<string, PvzObject>
): string {
  if (!objectMap.has(baseAlias)) return baseAlias;
  let i = 2;
  while (objectMap.has(`${baseAlias}${i}`)) i++;
  return `${baseAlias}${i}`;
}

function markDirty(state: Partial<EditorState>): Partial<EditorState> {
  return { ...state, isDirty: true, saveStatus: "idle" as SaveStatus };
}

function cloneParsed(parsed: ParsedLevelData): ParsedLevelData {
  return { ...parsed };
}

function getModuleObjclasses(parsed: ParsedLevelData): string[] {
  return parsed.modules.map((m) => m.objclass);
}

// --- Store ---

export const useEditorStore = create<EditorState>((set, get) => ({
  // Initial state
  levelId: null,
  levelName: "",
  parsed: null,
  activeTab: "settings",
  isDirty: false,
  saveStatus: "idle",
  loading: false,
  error: null,
  conflicts: [],

  // --- Load level from API ---
  loadLevel: async (levelId: string) => {
    set({ loading: true, error: null, levelId });
    try {
      const res = await fetch(`/api/levels/${levelId}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "加载失败" }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const { level } = await res.json();
      const levelData = level.levelData as PvzLevelFile;
      const parsed = parseLevel(levelData);
      const conflicts = checkConflicts(getModuleObjclasses(parsed));

      set({
        levelId,
        levelName: level.name,
        parsed,
        isDirty: false,
        saveStatus: "idle",
        loading: false,
        error: null,
        conflicts,
        activeTab: "settings",
      });
    } catch (e) {
      set({
        loading: false,
        error: e instanceof Error ? e.message : "加载失败",
      });
    }
  },

  // --- Save to API ---
  save: async () => {
    const { levelId, levelName, parsed } = get();
    if (!levelId || !parsed) return;

    set({ saveStatus: "saving" });
    try {
      const levelFile = serializeLevel(parsed.allObjects);
      const res = await fetch(`/api/levels/${levelId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: levelName,
          levelData: levelFile,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "保存失败" }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      set({ isDirty: false, saveStatus: "saved" });
      // Reset "saved" indicator after 2s
      setTimeout(() => {
        if (get().saveStatus === "saved") {
          set({ saveStatus: "idle" });
        }
      }, 2000);
    } catch {
      set({ saveStatus: "error" });
    }
  },

  // --- Tab navigation ---
  setActiveTab: (tab) => set({ activeTab: tab }),

  // --- Level name ---
  setLevelName: (name) => set(markDirty({ levelName: name })),

  // --- LevelDefinition mutations ---
  updateLevelDef: (patch) => {
    const { parsed } = get();
    if (!parsed?.levelDef) return;

    const ld = parsed.levelDef;
    ld.objdata = { ...ld.objdata, ...patch };
    set(markDirty({ parsed: cloneParsed(parsed) }));
  },

  // --- Module mutations ---
  addModule: (config) => {
    const { parsed } = get();
    if (!parsed?.levelDef) return;

    const alias = generateUniqueAlias(
      config.metadata.defaultAlias,
      parsed.objectMap
    );
    const source = config.metadata.defaultSource;
    const rtid = buildRtid(alias, source);

    // Create the PvzObject
    const newObj: PvzObject = {
      aliases: [alias],
      objclass: config.objclass,
      objdata: { ...config.initialData },
    };

    // Add to allObjects and modules
    parsed.allObjects.push(newObj);
    parsed.modules.push(newObj);
    parsed.objectMap.set(alias, newObj);

    // Add RTID to LevelDefinition.Modules
    const ldData = parsed.levelDef.objdata as Record<string, unknown>;
    const modules = (ldData.Modules as string[]) || [];
    modules.push(rtid);
    ldData.Modules = modules;

    // Recheck conflicts
    const conflicts = checkConflicts(getModuleObjclasses(parsed));
    set(markDirty({ parsed: cloneParsed(parsed), conflicts }));
  },

  removeModule: (alias) => {
    const { parsed, activeTab } = get();
    if (!parsed?.levelDef) return;

    const obj = parsed.objectMap.get(alias);
    if (!obj) return;

    // Remove from allObjects
    const idx = parsed.allObjects.indexOf(obj);
    if (idx !== -1) parsed.allObjects.splice(idx, 1);

    // Remove from modules
    const mIdx = parsed.modules.indexOf(obj);
    if (mIdx !== -1) parsed.modules.splice(mIdx, 1);

    // Remove from objectMap
    if (obj.aliases) {
      for (const a of obj.aliases) parsed.objectMap.delete(a);
    }

    // Remove RTID from LevelDefinition.Modules
    const ldData = parsed.levelDef.objdata as Record<string, unknown>;
    const modules = (ldData.Modules as string[]) || [];
    ldData.Modules = modules.filter((rtid) => {
      const info = parseRtid(rtid);
      return info?.alias !== alias;
    });

    const conflicts = checkConflicts(getModuleObjclasses(parsed));

    // If current tab depends on removed module, switch to settings
    const tabModuleMap: Record<string, string> = {
      vasebreaker: "VaseBreakerPresetProperties",
      izombie: "EvilDaveProperties",
      zomboss: "ZombossBattleModuleProperties",
    };
    const requiredClass = tabModuleMap[activeTab];
    let newTab = activeTab;
    if (requiredClass && obj.objclass === requiredClass) {
      newTab = "settings";
    }

    set(
      markDirty({
        parsed: cloneParsed(parsed),
        conflicts,
        activeTab: newTab,
      })
    );
  },

  updateModuleData: (alias, data) => {
    const { parsed } = get();
    if (!parsed) return;

    const obj = parsed.objectMap.get(alias);
    if (!obj) return;

    obj.objdata = { ...obj.objdata, ...data };
    set(markDirty({ parsed: cloneParsed(parsed) }));
  },

  // --- WaveManager direct mutations ---
  updateWaveManagerData: (data) => {
    const { parsed } = get();
    if (!parsed?.waveManager) return;

    parsed.waveManager.objdata = { ...parsed.waveManager.objdata, ...data };
    set(markDirty({ parsed: cloneParsed(parsed) }));
  },

  // --- Wave mutations ---
  addWave: () => {
    const { parsed } = get();
    if (!parsed?.waveManager) return;

    const wmData = parsed.waveManager.objdata as Record<string, unknown>;
    const waves = (wmData.Waves as string[][]) || [];
    waves.push([]);
    wmData.Waves = waves;
    wmData.WaveCount = waves.length;

    set(markDirty({ parsed: cloneParsed(parsed) }));
  },

  removeWave: (index) => {
    const { parsed } = get();
    if (!parsed?.waveManager) return;

    const wmData = parsed.waveManager.objdata as Record<string, unknown>;
    const waves = (wmData.Waves as string[][]) || [];
    if (index < 0 || index >= waves.length) return;

    // Remove event objects referenced in this wave
    const waveRtids = waves[index];
    for (const rtidStr of waveRtids) {
      const info = parseRtid(rtidStr);
      if (!info) continue;
      const obj = parsed.objectMap.get(info.alias);
      if (!obj) continue;

      const aIdx = parsed.allObjects.indexOf(obj);
      if (aIdx !== -1) parsed.allObjects.splice(aIdx, 1);
      const eIdx = parsed.events.indexOf(obj);
      if (eIdx !== -1) parsed.events.splice(eIdx, 1);
      const wIdx = parsed.waves.indexOf(obj);
      if (wIdx !== -1) parsed.waves.splice(wIdx, 1);
      if (obj.aliases) {
        for (const a of obj.aliases) parsed.objectMap.delete(a);
      }
    }

    waves.splice(index, 1);
    wmData.Waves = waves;
    wmData.WaveCount = waves.length;

    set(markDirty({ parsed: cloneParsed(parsed) }));
  },

  // --- Event mutations ---
  addEventToWave: (waveIdx, config) => {
    const { parsed } = get();
    if (!parsed?.waveManager) return;

    const alias = generateUniqueAlias(
      config.metadata.defaultAlias,
      parsed.objectMap
    );
    const rtid = buildRtid(alias, "CurrentLevel");

    const newObj: PvzObject = {
      aliases: [alias],
      objclass: config.objclass,
      objdata: { ...config.initialData },
    };

    parsed.allObjects.push(newObj);
    parsed.events.push(newObj);
    parsed.waves.push(newObj);
    parsed.objectMap.set(alias, newObj);

    const wmData = parsed.waveManager.objdata as Record<string, unknown>;
    const waves = (wmData.Waves as string[][]) || [];
    if (waveIdx >= 0 && waveIdx < waves.length) {
      waves[waveIdx].push(rtid);
    }

    set(markDirty({ parsed: cloneParsed(parsed) }));
  },

  removeEventFromWave: (waveIdx, rtidStr) => {
    const { parsed } = get();
    if (!parsed?.waveManager) return;

    const info = parseRtid(rtidStr);
    if (!info) return;

    // Remove RTID from wave
    const wmData = parsed.waveManager.objdata as Record<string, unknown>;
    const waves = (wmData.Waves as string[][]) || [];
    if (waveIdx >= 0 && waveIdx < waves.length) {
      waves[waveIdx] = waves[waveIdx].filter((r) => r !== rtidStr);
    }

    // Remove the event object
    const obj = parsed.objectMap.get(info.alias);
    if (obj) {
      const aIdx = parsed.allObjects.indexOf(obj);
      if (aIdx !== -1) parsed.allObjects.splice(aIdx, 1);
      const eIdx = parsed.events.indexOf(obj);
      if (eIdx !== -1) parsed.events.splice(eIdx, 1);
      const wIdx = parsed.waves.indexOf(obj);
      if (wIdx !== -1) parsed.waves.splice(wIdx, 1);
      if (obj.aliases) {
        for (const a of obj.aliases) parsed.objectMap.delete(a);
      }
    }

    set(markDirty({ parsed: cloneParsed(parsed) }));
  },

  updateEventData: (alias, data) => {
    const { parsed } = get();
    if (!parsed) return;

    const obj = parsed.objectMap.get(alias);
    if (!obj) return;

    obj.objdata = { ...obj.objdata, ...data };
    set(markDirty({ parsed: cloneParsed(parsed) }));
  },

  // --- Utility ---
  recheckConflicts: () => {
    const { parsed } = get();
    if (!parsed) return;
    const conflicts = checkConflicts(getModuleObjclasses(parsed));
    set({ conflicts });
  },

  getSerializedJson: () => {
    const { parsed } = get();
    if (!parsed) return "{}";
    const file = serializeLevel(parsed.allObjects);
    return JSON.stringify(file, null, 2);
  },
}));
