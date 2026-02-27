// =============================================================================
// Object Order Registry — translated from Z-Editor ObjectOrderRegistry.kt
//
// Defines the canonical ordering of PvzObject types when serializing a level
// file. Objects whose objclass appears earlier in ORDER_LIST are placed first
// in the output `objects` array.
// =============================================================================

/**
 * Canonical ordering of objclass values.
 * Exactly mirrors the 73-entry list from Z-Editor's ObjectOrderRegistry.kt.
 * Objects not in this list sort after all listed types.
 */
const ORDER_LIST: string[] = [
  // 0 — Level definition (always first)
  "LevelDefinition",

  // 1–2 — Seed bank variants
  "SeedBankProperties",
  "ConveyorSeedBankProperties",

  // 3 — Penny classroom
  "PennyClassroomModuleProperties",

  // 4–8 — Sun / economy / minigame mode modules
  "SunDropperProperties",
  "SunBombChallengeProperties",
  "LastStandMinigameProperties",
  "BowlingMinigameProperties",
  "NewBowlingMinigameProperties",
  "SeedRainProperties",

  // 10–16 — Scene modules (planks, tides, roof, rails, etc.)
  "PiratePlankProperties",
  "TideProperties",
  "RoofProperties",
  "RailcartProperties",
  "PowerTileProperties",
  "TunnelDefendModuleProperties",
  "ZombiePotionModuleProperties",
  "WarMistProperties",

  // 18–23 — Zombie modifier & scoring modules
  "ZombieMoveFastModuleProperties",
  "ZombieRushModuleProperties",
  "IncreasedCostModuleProperties",
  "DeathHoleModuleProperties",
  "LevelScoringModuleProperties",
  "LevelMutatorStartingPlantfoodProps",
  "LevelMutatorMaxSunProps",

  // 25–30 — Initial placement & protection modules
  "InitialPlantProperties",
  "InitialPlantEntryProperties",
  "InitialZombieProperties",
  "InitialGridItemProperties",
  "ProtectThePlantChallengeProperties",
  "ProtectTheGridItemChallengeProperties",

  // 31–34 — Special mode modules (boss, vasebreaker, evil dave)
  "ZombossBattleIntroProperties",
  "ZombossBattleModuleProperties",
  "VaseBreakerPresetProperties",
  "EvilDaveProperties",

  // 35 — Star challenge container
  "StarChallengeModuleProperties",

  // 36–51 — 16 star challenge sub-types
  "StarChallengeBeatTheLevelProps",
  "StarChallengeSaveMowersProps",
  "StarChallengePlantFoodNonuseProps",
  "StarChallengePlantsSurviveProps",
  "StarChallengeZombieDistanceProps",
  "StarChallengeSunProducedProps",
  "StarChallengeSunUsedProps",
  "StarChallengeSpendSunHoldoutProps",
  "StarChallengeKillZombiesInTimeProps",
  "StarChallengeZombieSpeedProps",
  "StarChallengeSunReducedProps",
  "StarChallengePlantsLostProps",
  "StarChallengeSimultaneousPlantsProps",
  "StarChallengeUnfreezePlantsProps",
  "StarChallengeBlowZombieProps",
  "StarChallengeTargetScoreProps",

  // 52–53 — Wave manager
  "WaveManagerModuleProperties",
  "WaveManagerProperties",

  // 54–57 — Standard spawn events
  "SpawnZombiesJitteredWaveActionProps",
  "SpawnZombiesFromGroundSpawnerProps",
  "SpawnZombiesFromGridItemSpawnerProps",
  "BeachStageEventZombieSpawnerProps",

  // 58–59 — Storm & raiding party
  "StormZombieSpawnerProps",
  "RaidingPartyZombieSpawnerProps",

  // 60–62 — Rain variants (spider, parachute, bass)
  "SpiderRainZombieSpawnerProps",
  "ParachuteRainZombieSpawnerProps",
  "BassRainZombieSpawnerProps",

  // 63–65 — Portal, frost wind, dino
  "SpawnModernPortalsWaveActionProps",
  "FrostWindWaveActionProps",
  "DinoWaveActionProps",

  // 66–67 — Tidal change, black hole
  "TidalChangeWaveActionProps",
  "BlackHoleWaveActionProps",

  // 68–69 — Potion, gravestone
  "ZombiePotionActionProps",
  "SpawnGravestonesWaveActionProps",

  // 70 — Conveyor modification
  "ModifyConveyorWaveActionProps",

  // 71–72 — Custom zombie types (always last)
  "ZombieType",
  "ZombiePropertySheet",
];

/**
 * Pre-built lookup map from objclass to index for O(1) priority retrieval.
 */
const ORDER_MAP: Map<string, number> = new Map(
  ORDER_LIST.map((name, index) => [name, index])
);

/**
 * Get the sort priority for a given objclass.
 * Lower numbers sort first. Objects not in the registry get
 * `Number.MAX_SAFE_INTEGER` (sorted to the end).
 */
export function getObjectPriority(objclass: string): number {
  return ORDER_MAP.get(objclass) ?? Number.MAX_SAFE_INTEGER;
}

/**
 * Check whether an objclass is a known wave-event type
 * (i.e. appears in the event section of the order list).
 */
export function isEventObjclass(objclass: string): boolean {
  return EVENT_OBJCLASSES.has(objclass);
}

/**
 * Set of all known event (wave action) objclass values.
 */
const EVENT_OBJCLASSES: ReadonlySet<string> = new Set([
  "SpawnZombiesJitteredWaveActionProps",
  "SpawnZombiesFromGroundSpawnerProps",
  "SpawnZombiesFromGridItemSpawnerProps",
  "BeachStageEventZombieSpawnerProps",
  "StormZombieSpawnerProps",
  "RaidingPartyZombieSpawnerProps",
  "SpiderRainZombieSpawnerProps",
  "ParachuteRainZombieSpawnerProps",
  "BassRainZombieSpawnerProps",
  "SpawnModernPortalsWaveActionProps",
  "FrostWindWaveActionProps",
  "DinoWaveActionProps",
  "TidalChangeWaveActionProps",
  "BlackHoleWaveActionProps",
  "ZombiePotionActionProps",
  "SpawnGravestonesWaveActionProps",
  "ModifyConveyorWaveActionProps",
  "WaveActionMagicMirrorTeleportationArrayProps2",
  "FairyTaleFogWaveActionProps",
  "FairyTaleWindWaveActionProps",
]);

/**
 * The complete ordered list, exported for inspection / testing.
 */
export const ORDER_LIST_EXPORT: readonly string[] = ORDER_LIST;
