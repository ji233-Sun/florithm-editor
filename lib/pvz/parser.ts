// =============================================================================
// Level Parser — translates a raw PvzLevelFile JSON into structured
// ParsedLevelData for use in the editor.
//
// Translated from Z-Editor LevelParser.kt
// =============================================================================

import type {
  PvzLevelFile,
  PvzObject,
  ParsedLevelData,
  LevelDefinitionData,
  WaveManagerData,
} from "./types";
import { parseRtid } from "./rtid";
import { isEventObjclass } from "./object-order";

/**
 * Parse a PvzLevelFile into structured ParsedLevelData.
 *
 * This function:
 * 1. Builds an alias-to-object lookup map.
 * 2. Identifies the singular LevelDefinition object.
 * 3. Identifies the WaveManagerProperties and WaveManagerModuleProperties.
 * 4. Categorises remaining objects into modules, waves (events referenced
 *    by the wave manager), and standalone events.
 */
export function parseLevel(file: PvzLevelFile): ParsedLevelData {
  const allObjects = file.objects;

  // --- 1. Build alias → object map ---
  const objectMap = new Map<string, PvzObject>();
  for (const obj of allObjects) {
    if (obj.aliases) {
      for (const alias of obj.aliases) {
        objectMap.set(alias, obj);
      }
    }
  }

  // --- 2. Find core objects ---
  const levelDef =
    allObjects.find((o) => o.objclass === "LevelDefinition") ?? null;
  const waveManager =
    allObjects.find((o) => o.objclass === "WaveManagerProperties") ?? null;
  const waveManagerModule =
    allObjects.find((o) => o.objclass === "WaveManagerModuleProperties") ?? null;

  // --- 3. Collect RTID aliases referenced inside WaveManagerProperties.Waves ---
  const waveEventAliases = new Set<string>();
  if (waveManager) {
    const wmData = waveManager.objdata as unknown as WaveManagerData;
    if (wmData.Waves) {
      for (const wave of wmData.Waves) {
        for (const rtidStr of wave) {
          const info = parseRtid(rtidStr);
          if (info) {
            waveEventAliases.add(info.alias);
          }
        }
      }
    }
  }

  // --- 4. Collect RTID aliases referenced inside LevelDefinition.Modules ---
  const moduleAliases = new Set<string>();
  if (levelDef) {
    const ldData = levelDef.objdata as unknown as LevelDefinitionData;
    if (ldData.Modules) {
      for (const rtidStr of ldData.Modules) {
        const info = parseRtid(rtidStr);
        if (info) {
          moduleAliases.add(info.alias);
        }
      }
    }
  }

  // --- 5. Categorise objects ---
  const modules: PvzObject[] = [];
  const waves: PvzObject[] = [];
  const events: PvzObject[] = [];

  for (const obj of allObjects) {
    // Skip the three core singletons
    if (
      obj === levelDef ||
      obj === waveManager ||
      obj === waveManagerModule
    ) {
      continue;
    }

    const firstAlias = obj.aliases?.[0];
    const isWaveEvent = firstAlias ? waveEventAliases.has(firstAlias) : false;
    const isModule = firstAlias ? moduleAliases.has(firstAlias) : false;

    if (isWaveEvent || isEventObjclass(obj.objclass)) {
      // This object is a wave event (referenced by WaveManager.Waves)
      waves.push(obj);
      // Also add to the flat events list
      events.push(obj);
    } else if (isModule) {
      // This object is a module referenced by LevelDefinition.Modules
      modules.push(obj);
    } else if (isEventObjclass(obj.objclass)) {
      // Event object not referenced by waves (orphan event)
      events.push(obj);
    }
    // Otherwise it's an auxiliary object (star challenges, zombie types, etc.)
    // — they remain accessible via objectMap and allObjects.
  }

  return {
    levelDef,
    waveManager,
    waveManagerModule,
    modules,
    waves,
    events,
    objectMap,
    allObjects,
  };
}

/**
 * Look up a PvzObject by its alias in the parsed level data.
 */
export function getObjectByAlias(
  parsed: ParsedLevelData,
  alias: string
): PvzObject | undefined {
  return parsed.objectMap.get(alias);
}

/**
 * Find all objects of a given objclass in the parsed level data.
 */
export function getObjectsByClass(
  parsed: ParsedLevelData,
  objclass: string
): PvzObject[] {
  return parsed.allObjects.filter((o) => o.objclass === objclass);
}

/**
 * Get the typed objdata from a PvzObject, cast to the specified type.
 * This is a convenience wrapper that mirrors Kotlin's
 * `gson.fromJson(objData, T::class.java)`.
 */
export function getObjdata<T>(obj: PvzObject): T {
  return obj.objdata as unknown as T;
}
