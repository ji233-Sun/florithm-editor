// =============================================================================
// Missing Module Detection — translated from Z-Editor EditorScreen.kt
//
// Checks whether recommended modules are missing from the current level,
// taking into account the active game mode.
// =============================================================================

export interface MissingModule {
  objclass: string;
  label: string;
}

const MODULE_LABELS: Record<string, string> = {
  CustomLevelModuleProperties: "庭院模块",
  ZombiesAteYourBrainsProperties: "僵尸胜利判定",
  ZombiesDeadWinConProperties: "僵尸掉落判定",
  StandardLevelIntroProperties: "开局转场动画",
  VaseBreakerPresetProperties: "砸罐子预设",
  VaseBreakerArcadeModuleProperties: "砸罐子街机环境",
  VaseBreakerFlowModuleProperties: "砸罐子流程",
  InitialPlantEntryProperties: "预置植物入口",
  SeedBankProperties: "种子库",
  ZombossBattleModuleProperties: "僵王战模块",
  ZombossBattleIntroProperties: "僵王战转场",
};

/**
 * Detect missing recommended modules based on Z-Editor's logic.
 *
 * @param existingClasses - objclass values of all modules currently in the level
 * @returns Array of missing modules with labels
 */
export function checkMissingModules(existingClasses: string[]): MissingModule[] {
  const has = (c: string) => existingClasses.includes(c);

  const isVaseBreaker =
    has("VaseBreakerPresetProperties") ||
    has("VaseBreakerArcadeModuleProperties");
  const isZombossBattle =
    has("ZombossBattleModuleProperties") ||
    has("ZombossBattleIntroProperties");
  const isLastStand = has("LastStandMinigameProperties");
  const isEvilDave = has("EvilDaveProperties");

  const missing: string[] = [];

  // --- 4 basic recommended modules ---
  if (!has("CustomLevelModuleProperties")) missing.push("CustomLevelModuleProperties");
  if (!has("ZombiesAteYourBrainsProperties")) {
    if (!isEvilDave) missing.push("ZombiesAteYourBrainsProperties");
  }
  if (!has("ZombiesDeadWinConProperties")) {
    if (!isEvilDave && !isZombossBattle) missing.push("ZombiesDeadWinConProperties");
  }
  if (!has("StandardLevelIntroProperties")) {
    if (!isVaseBreaker && !isLastStand && !isZombossBattle) missing.push("StandardLevelIntroProperties");
  }

  // --- Mode-specific companion modules ---
  if (isVaseBreaker) {
    if (!has("VaseBreakerPresetProperties")) missing.push("VaseBreakerPresetProperties");
    if (!has("VaseBreakerArcadeModuleProperties")) missing.push("VaseBreakerArcadeModuleProperties");
    if (!has("VaseBreakerFlowModuleProperties")) missing.push("VaseBreakerFlowModuleProperties");
  }
  if (isEvilDave) {
    if (!has("InitialPlantEntryProperties")) missing.push("InitialPlantEntryProperties");
    if (!has("SeedBankProperties")) missing.push("SeedBankProperties");
  }
  if (isZombossBattle) {
    if (!has("ZombossBattleModuleProperties")) missing.push("ZombossBattleModuleProperties");
    if (!has("ZombossBattleIntroProperties")) missing.push("ZombossBattleIntroProperties");
  }
  if (isLastStand) {
    if (!has("SeedBankProperties")) missing.push("SeedBankProperties");
  }

  return missing.map((objclass) => ({
    objclass,
    label: MODULE_LABELS[objclass] ?? objclass,
  }));
}
