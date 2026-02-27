// =============================================================================
// Module Conflict Rules — translated from Z-Editor ConflictRegistry
//
// 10 conflict rules that define mutually exclusive module combinations.
// =============================================================================

export interface ConflictRule {
  /** The pair of objclass values that conflict with each other */
  modules: [string, string];
  /** Human-readable description of why these modules conflict */
  message: string;
}

/**
 * All 10 module conflict rules from Z-Editor's ConflictRegistry.
 */
export const CONFLICT_RULES: ConflictRule[] = [
  {
    modules: ["SeedBankProperties", "ConveyorSeedBankProperties"],
    message:
      "种子库与传送带模块的UI会相互遮挡，而且有可能闪退，需要确保种子库处于预选模式。",
  },
  {
    modules: [
      "VaseBreakerPresetProperties",
      "StandardLevelIntroProperties",
    ],
    message: "砸罐子模式下不需要添加开局转场动画。",
  },
  {
    modules: [
      "LastStandMinigameProperties",
      "StandardLevelIntroProperties",
    ],
    message: "坚不可摧模式下不需要添加开局转场动画。",
  },
  {
    modules: ["EvilDaveProperties", "ZombiesDeadWinConProperties"],
    message: "我是僵尸模式下不能添加僵尸掉落模块。",
  },
  {
    modules: ["EvilDaveProperties", "ZombiesAteYourBrainsProperties"],
    message: "我是僵尸模式下不能添加僵尸胜利判定。",
  },
  {
    modules: [
      "ZombossBattleModuleProperties",
      "ZombiesDeadWinConProperties",
    ],
    message: "僵王战模式下使用死亡掉落会导致无法正常结算。",
  },
  {
    modules: [
      "ZombossBattleIntroProperties",
      "StandardLevelIntroProperties",
    ],
    message: "两种关卡开局转场不能同时出现，否则僵王血量无法正常显示。",
  },
  {
    modules: ["InitialPlantEntryProperties", "RoofProperties"],
    message: "在屋顶无法进行预置植物，会引发闪退。",
  },
  {
    modules: [
      "ProtectThePlantChallengeProperties",
      "RoofProperties",
    ],
    message: "在屋顶无法进行预置植物，会引发闪退。",
  },
  {
    modules: ["CustomLevelModuleProperties", "LawnMowerProperties"],
    message: "庭院模块下使用小推车无效。",
  },
];

/**
 * Check a list of objclass values for module conflicts.
 * Returns all conflict rules that are violated (i.e. both modules in the
 * rule are present in the given list).
 *
 * @param objclasses - Array of objclass strings currently in the level
 * @returns Array of violated ConflictRule objects (empty if no conflicts)
 *
 * @example
 * checkConflicts(["SeedBankProperties", "ConveyorSeedBankProperties", "SunDropperProperties"])
 * // => [{ modules: ["SeedBankProperties", "ConveyorSeedBankProperties"], message: "..." }]
 */
export function checkConflicts(objclasses: string[]): ConflictRule[] {
  const classSet = new Set(objclasses);
  return CONFLICT_RULES.filter(
    (rule) => classSet.has(rule.modules[0]) && classSet.has(rule.modules[1])
  );
}

/**
 * Check whether adding a specific module would create a conflict with
 * the existing set of modules.
 *
 * @param existingObjclasses - objclass values already in the level
 * @param newObjclass - the objclass being considered for addition
 * @returns Array of conflict rules that would be violated
 */
export function checkAddConflicts(
  existingObjclasses: string[],
  newObjclass: string
): ConflictRule[] {
  return CONFLICT_RULES.filter((rule) => {
    if (rule.modules[0] === newObjclass) {
      return existingObjclasses.includes(rule.modules[1]);
    }
    if (rule.modules[1] === newObjclass) {
      return existingObjclasses.includes(rule.modules[0]);
    }
    return false;
  });
}
