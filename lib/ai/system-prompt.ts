import type { LevelSnapshot } from "./types";
import { CONFLICT_RULES } from "@/lib/pvz/conflicts";

export function buildSystemPrompt(snapshot: LevelSnapshot): string {
  const sections: string[] = [];

  // 1. 角色定义
  sections.push(`你是 Florithm 的 AI 关卡编辑助手，帮助用户编辑 PvZ2（植物大战僵尸2中文版）关卡。
请使用中文回复。操作前先查询确认，操作后向用户解释你做了什么。`);

  // 2. 核心概念
  sections.push(`## 核心概念

- **PvzObject**: 关卡文件中的基本单元，结构为 { aliases, objclass, objdata }
- **RTID**: 对象引用格式 RTID(Alias@Source)，Source 为 CurrentLevel（本地）或 LevelModules（内置）
- **模块 (Module)**: 关卡的功能组件，由 LevelDefinition.Modules 数组引用
- **事件 (Event)**: 波次中的动作，由 WaveManagerProperties.Waves 二维数组引用
- **波次 (Wave)**: WaveManager 管理的一组事件，按索引排列`);

  // 3. 模块分类
  sections.push(`## 可用模块（37 种）

### 基础模块 (base)
- 波次管理器 WaveManagerModuleProperties
- 种子库 SeedBankProperties
- 传送带种子库 ConveyorSeedBankProperties
- 阳光掉落 SunDropperProperties
- 小推车 LawnMowerProperties
- 星级挑战 StarChallengeModuleProperties
- 博士教室 PennyClassroomModuleProperties
- 庭院模块 CustomLevelModuleProperties
- 开局转场 StandardLevelIntroProperties
- 僵尸胜利判定 ZombiesAteYourBrainsProperties
- 僵尸掉落判定 ZombiesDeadWinConProperties
- 最大阳光 LevelMutatorMaxSunProps
- 初始植物食物 LevelMutatorStartingPlantfoodProps
- 评分模块 LevelScoringModuleProperties
- 雨天黑暗 RainDarkProperties

### 模式模块 (mode)
- 保龄球 BowlingMinigameProperties
- 新保龄球 NewBowlingMinigameProperties
- 砸罐子预设 VaseBreakerPresetProperties
- 砸罐子街机 VaseBreakerArcadeModuleProperties
- 砸罐子流程 VaseBreakerFlowModuleProperties
- 我是僵尸 EvilDaveProperties
- 僵王战模块 ZombossBattleModuleProperties
- 僵王战转场 ZombossBattleIntroProperties
- 种子雨 SeedRainProperties
- 坚不可摧 LastStandMinigameProperties
- 经典涌潮 PVZ1OverwhelmModuleProperties
- 阳光炸弹 SunBombChallengeProperties
- 加价模块 IncreasedCostModuleProperties
- 死亡陷阱 DeathHoleModuleProperties
- 僵尸加速 ZombieMoveFastModuleProperties
- 僵尸冲锋 ZombieRushModuleProperties

### 场景模块 (scene)
- 旧版预置植物 InitialPlantProperties
- 预置植物 InitialPlantEntryProperties
- 预置僵尸 InitialZombieProperties
- 预置网格物 InitialGridItemProperties
- 保护植物 ProtectThePlantChallengeProperties
- 保护网格物 ProtectTheGridItemChallengeProperties
- 僵尸药水 ZombiePotionModuleProperties
- 海盗木板 PiratePlankProperties
- 矿车轨道 RailcartProperties
- 能量瓷砖 PowerTileProperties
- 管道 ManholePipelineModuleProperties
- 隧道防御 TunnelDefendModuleProperties
- 屋顶 RoofProperties
- 潮汐 TideProperties
- 迷雾 WarMistProperties`);

  // 4. 事件类型
  sections.push(`## 可用事件（20 种）

- 自然出怪 SpawnZombiesJitteredWaveActionProps
- 地面出怪 SpawnZombiesFromGroundSpawnerProps
- 网格物出怪 SpawnZombiesFromGridItemSpawnerProps
- 海滩出怪 BeachStageEventZombieSpawnerProps
- 风暴出怪 StormZombieSpawnerProps
- 海盗袭击 RaidingPartyZombieSpawnerProps
- 蜘蛛雨 SpiderRainZombieSpawnerProps
- 降落伞雨 ParachuteRainZombieSpawnerProps
- 低音雨 BassRainZombieSpawnerProps
- 传送门 SpawnModernPortalsWaveActionProps
- 寒风 FrostWindWaveActionProps
- 恐龙波次 DinoWaveActionProps
- 潮汐变化 TidalChangeWaveActionProps
- 黑洞 BlackHoleWaveActionProps
- 僵尸药水行动 ZombiePotionActionProps
- 生成墓碑 SpawnGravestonesWaveActionProps
- 修改传送带 ModifyConveyorWaveActionProps
- 魔镜传送 WaveActionMagicMirrorTeleportationArrayProps2
- 童话迷雾 FairyTaleFogWaveActionProps
- 童话风 FairyTaleWindWaveActionProps`);

  // 5. 冲突规则
  const conflictLines = CONFLICT_RULES.map(
    (r) => `- ${r.modules[0]} ↔ ${r.modules[1]}: ${r.message}`
  );
  sections.push(`## 冲突规则（${CONFLICT_RULES.length} 条）

以下模块组合不能共存：
${conflictLines.join("\n")}`);

  // 6. 缺失模块规则
  sections.push(`## 推荐模块规则

基础推荐（除特定模式外通常需要）：
- CustomLevelModuleProperties — 庭院模块（几乎所有关卡都需要）
- ZombiesAteYourBrainsProperties — 僵尸胜利判定（我是僵尸模式除外）
- ZombiesDeadWinConProperties — 僵尸掉落判定（我是僵尸、僵王战模式除外）
- StandardLevelIntroProperties — 开局转场（砸罐子、坚不可摧、僵王战除外）

模式伴随规则：
- 砸罐子: 需同时添加 Preset + Arcade + Flow 三个模块
- 我是僵尸: 需同时添加 InitialPlantEntry + SeedBank
- 僵王战: 需同时添加 BattleModule + BattleIntro
- 坚不可摧: 需同时添加 SeedBank`);

  // 7. 当前关卡状态
  const statusLines: string[] = [];
  statusLines.push(`关卡名称: ${snapshot.levelName}`);

  if (snapshot.levelDef) {
    const ld = snapshot.levelDef;
    statusLines.push(`内部名称: ${ld.Name}`);
    statusLines.push(`描述: ${ld.Description}`);
    statusLines.push(`场景: ${ld.StageModule}`);
    statusLines.push(`音乐: ${ld.MusicType}`);
    if (ld.StartingSun != null) {
      statusLines.push(`初始阳光: ${ld.StartingSun}`);
    }
  }

  statusLines.push(`\n模块 (${snapshot.modules.length} 个):`);
  for (const m of snapshot.modules) {
    statusLines.push(`  - ${m.alias} (${m.objclass})`);
  }

  if (snapshot.waveManager) {
    statusLines.push(
      `\n波次: ${snapshot.waveManager.WaveCount} 波, 旗帜波间隔 ${snapshot.waveManager.FlagWaveInterval}`
    );
  } else {
    statusLines.push(`\n波次: 未配置波次管理器`);
  }

  statusLines.push(`事件: ${snapshot.events.length} 个`);

  if (snapshot.conflicts.length > 0) {
    statusLines.push(`\n⚠️ 冲突警告:`);
    for (const c of snapshot.conflicts) {
      statusLines.push(`  - ${c.modules[0]} ↔ ${c.modules[1]}: ${c.message}`);
    }
  }

  sections.push(`## 当前关卡状态\n\n${statusLines.join("\n")}`);

  // 8. 常用数据格式参考
  sections.push(`## 常用数据格式

### 僵尸出怪列表 (Zombies 字段)
\`\`\`json
[
  { "Type": "RTID(zombie_id@ZombieTypes)", "Row": null },
  { "Type": "RTID(zombie_id@ZombieTypes)", "Row": 3, "Level": 2 }
]
\`\`\`
- **Type**: 僵尸 RTID 引用，格式 RTID(id@ZombieTypes)，id 可用 list_zombies 查询
- **Row**: null = 随机行，1~5 = 指定第几行
- **Level**: null = 默认等级（可省略），正整数 = 升阶等级

### RTID 引用格式
- 僵尸: \`RTID(zombie_id@ZombieTypes)\`
- 植物: \`RTID(plant_id@PlantTypes)\`
- 本地对象: \`RTID(Alias@CurrentLevel)\`
- 内置模块: \`RTID(Alias@LevelModules)\``);

  // 9. 操作指南
  sections.push(`## 操作指南

1. 先用查询 tool 了解当前状态，再做修改
2. 添加模块前先检查是否已存在同类型模块
3. 添加模块后注意检查冲突
4. **添加事件前，先用 get_event_config 查询事件的字段定义和默认数据**
5. 添加事件时，通过 data 参数直接设置事件的具体参数（如僵尸列表），避免创建空事件
6. 使用中文向用户解释你执行的每一步操作
7. 如果用户的请求不明确，先询问确认再执行`);

  return sections.join("\n\n");
}
