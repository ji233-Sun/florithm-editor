// =============================================================================
// PvZ2 Core Types — translated from Z-Editor PvzDataModels.kt
// =============================================================================

// === File Root Structure ===

export interface PvzLevelFile {
  objects: PvzObject[];
  version: number;
}

export interface PvzObject {
  aliases?: string[];
  objclass: string;
  objdata: Record<string, unknown>;
}

// =============================================================================
// 1. Level Header & Global Properties
// =============================================================================

/** LevelDefinition — the root entry of every level file */
export interface LevelDefinitionData {
  Name: string;
  LevelNumber?: number | null;
  Description: string;
  StageModule: string;
  Loot: string;
  StartingSun?: number | null;
  VictoryModule: string;
  MusicType: string;
  DisablePeavine?: boolean | null;
  IsArtifactDisabled?: boolean | null;
  IsBossFight?: boolean | null;
  IsVasebreaker?: boolean | null;
  Modules: string[];
}

/** WaveManagerModuleProperties — wave manager module config */
export interface WaveManagerModuleData {
  DynamicZombies?: DynamicZombieGroup[] | null;
  WaveManagerProps?: string | null;
  ManualStartup?: boolean | null;
}

export interface DynamicZombieGroup {
  PointIncrementPerWave: number;
  StartingPoints: number;
  StartingWave: number;
  ZombiePool: string[];
  ZombieLevel: number[];
}

/** WaveManagerProperties — wave list with 2D RTID references */
export interface WaveManagerData {
  WaveCount: number;
  FlagWaveInterval: number;
  SuppressFlagZombie?: boolean | null;
  LevelJam?: string | null;
  ZombieCountDownFirstWaveSecs?: number | null;
  ZombieCountDownFirstWaveConveyorSecs?: number | null;
  ZombieCountDownHugeWaveDelay?: number | null;
  MaxNextWaveHealthPercentage: number;
  MinNextWaveHealthPercentage: number;
  Waves: string[][];
}

/** LastStandMinigameProperties */
export interface LastStandMinigamePropertiesData {
  StartingSun: number;
  StartingPlantfood: number;
}

/** SunDropperProperties */
export interface SunDropperProperties {
  InitialSunDropDelay: number;
  SunCountdownBase: number;
  SunCountdownMax: number;
  SunCountdownIncreasePerSun: number;
  SunCountdownRange: number;
}

/** SeedBankProperties */
export interface SeedBankProperties {
  PresetPlantList: string[];
  PlantWhiteList: string[];
  PlantBlackList: string[];
  SelectionMethod: string;
  GlobalLevel?: number | null;
  OverrideSeedSlotsCount?: number | null;
  ZombieMode?: boolean | null;
  SeedPacketType?: string | null;
}

/** ConveyorSeedBankProperties */
export interface ConveyorBeltProperties {
  InitialPlantList: InitialPlantListData[];
  DropDelayConditions: DropDelayConditionData[];
  SpeedConditions: SpeedConditionData[];
}

export interface DropDelayConditionData {
  Delay: number;
  MaxPackets: number;
}

export interface SpeedConditionData {
  Speed: number;
  MaxPackets: number;
}

export interface InitialPlantListData {
  PlantType: string;
  iLevel?: number | null;
  Weight: number;
  MaxCount: number;
  MaxWeightFactor: number;
  MinCount: number;
  MinWeightFactor: number;
}

// =============================================================================
// 2. Initial Placement Modules (Scene)
// =============================================================================

/** InitialPlantEntryProperties — new-style initial plants */
export interface InitialPlantEntryData {
  Plants: InitialPlantData[];
}

export interface InitialPlantData {
  GridX: number;
  GridY: number;
  Level: number;
  Avatar: boolean;
  PlantTypes: string[];
}

/** InitialZombieProperties */
export interface InitialZombieEntryData {
  InitialZombiePlacements: InitialZombieData[];
}

export interface InitialZombieData {
  GridX: number;
  GridY: number;
  TypeName: string;
  Condition: string;
}

/** InitialGridItemProperties */
export interface InitialGridItemEntryData {
  InitialGridItemPlacements: InitialGridItemData[];
}

export interface InitialGridItemData {
  GridX: number;
  GridY: number;
  TypeName: string;
}

/** InitialPlantProperties — old-style initial plants */
export interface InitialPlantPropertiesData {
  InitialPlantPlacements: InitialPlantPlacementData[];
  IsInitialIntensiveCarrotPlacements?: boolean | null;
}

export interface InitialPlantPlacementData {
  GridX: number;
  GridY: number;
  TypeName: string;
  Level: number;
  Condition?: string | null;
}

// =============================================================================
// 3. Challenge / Protection Modules
// =============================================================================

/** ProtectTheGridItemChallengeProperties */
export interface ProtectTheGridItemChallengePropertiesData {
  Description: string;
  MustProtectCount: number;
  GridItems: ProtectGridItemData[];
}

export interface ProtectGridItemData {
  GridX: number;
  GridY: number;
  GridItemType: string;
}

/** ProtectThePlantChallengeProperties */
export interface ProtectThePlantChallengePropertiesData {
  MustProtectCount: number;
  Plants: ProtectPlantData[];
}

export interface ProtectPlantData {
  GridX: number;
  GridY: number;
  PlantType: string;
}

/** SunBombChallengeProperties */
export interface SunBombChallengeData {
  PlantBombExplosionRadius: number;
  ZombieBombExplosionRadius: number;
  PlantDamage: number;
  ZombieDamage: number;
}

// =============================================================================
// 4. Star Challenge Module & 16 Sub-Types
// =============================================================================

/** StarChallengeModuleProperties */
export interface StarChallengeModuleData {
  ChallengesAlwaysAvailable: boolean;
  Challenges: string[][];
}

/** StarChallengeBeatTheLevelProps */
export interface StarChallengeBeatTheLevelData {
  Description: string;
  DescriptiveName: string;
}

/** StarChallengeSaveMowersProps — no fields */
export type StarChallengeSaveMowerData = Record<string, never>;

/** StarChallengePlantFoodNonuseProps — no fields */
export type StarChallengePlantFoodNonuseData = Record<string, never>;

/** StarChallengePlantsSurviveProps */
export interface StarChallengePlantSurviveData {
  Count: number;
}

/** StarChallengeZombieDistanceProps */
export interface StarChallengeZombieDistanceData {
  TargetDistance: number;
}

/** StarChallengeSunProducedProps */
export interface StarChallengeSunProducedData {
  TargetSun: number;
}

/** StarChallengeSunUsedProps */
export interface StarChallengeSunUsedData {
  MaximumSun: number;
}

/** StarChallengeSpendSunHoldoutProps */
export interface StarChallengeSpendSunHoldoutData {
  HoldoutSeconds: number;
}

/** StarChallengeKillZombiesInTimeProps */
export interface StarChallengeKillZombiesInTimeData {
  ZombiesToKill: number;
  Time: number;
}

/** StarChallengeZombieSpeedProps */
export interface StarChallengeZombieSpeedData {
  SpeedModifier: number;
}

/** StarChallengeSunReducedProps */
export interface StarChallengeSunReducedData {
  sunModifier: number;
}

/** StarChallengePlantsLostProps */
export interface StarChallengePlantsLostData {
  MaximumPlantsLost: number;
}

/** StarChallengeSimultaneousPlantsProps */
export interface StarChallengeSimultaneousPlantsData {
  MaximumPlants: number;
}

/** StarChallengeUnfreezePlantsProps */
export interface StarChallengeUnfreezePlantsData {
  Count: number;
}

/** StarChallengeBlowZombieProps */
export interface StarChallengeBlowZombieData {
  Count: number;
}

/** StarChallengeTargetScoreProps */
export interface StarChallengeTargetScoreData {
  Description: string;
  DescriptionFailure: string;
  DescriptiveName: string;
  TargetScore: number;
}

// =============================================================================
// 5. Scene Modules
// =============================================================================

/** PiratePlankProperties */
export interface PiratePlankPropertiesData {
  PlankRows: number[];
}

/** TideProperties */
export interface TidePropertiesData {
  StartingWaveLocation: number;
}

/** RailcartProperties */
export interface RailcartPropertiesData {
  RailcartType: string;
  Railcarts: RailcartData[];
  Rails: RailData[];
}

export interface RailcartData {
  Column: number;
  Row: number;
}

export interface RailData {
  Column: number;
  RowStart: number;
  RowEnd: number;
}

/** PowerTileProperties */
export interface PowerTilePropertiesData {
  LinkedTiles: LinkedTileData[];
}

export interface LinkedTileData {
  Group: string;
  PropagationDelay: number;
  Location: TileLocationData;
}

export interface TileLocationData {
  mX: number;
  mY: number;
}

/** WarMistProperties */
export interface WarMistPropertiesData {
  m_iInitMistPosX: number;
  m_iNormValX: number;
  m_iBloverEffectInterval: number;
}

/** ZombiePotionModuleProperties */
export interface ZombiePotionModulePropertiesData {
  InitialPotionCount: number;
  MaxPotionCount: number;
  PotionSpawnTimer: PotionSpawnTimerData;
  PotionTypes: string[];
}

export interface PotionSpawnTimerData {
  Min: number;
  Max: number;
}

/** IncreasedCostModuleProperties */
export interface IncreasedCostModulePropertiesData {
  BaseCostIncreased: number;
  MaxIncreasedCount: number;
}

/** DeathHoleModuleProperties */
export interface DeathHoleModuleData {
  LifeTime: number;
}

/** ZombieMoveFastModuleProperties */
export interface ZombieMoveFastModulePropertiesData {
  StopColumn: number;
  SpeedUp: number;
}

/** ZombieRushModuleProperties */
export interface ZombieRushModuleData {
  TimeCountDown: number;
  PlantBlackList: number[];
}

/** TunnelDefendModuleProperties */
export interface TunnelDefendModuleData {
  Roads: TunnelRoadData[];
}

export interface TunnelRoadData {
  GridX: number;
  GridY: number;
  Img: string;
}

/** LevelMutatorMaxSunProps */
export interface LevelMutatorMaxSunPropsData {
  MaxSunOverride: number;
  DifficultyProps: string;
  IconImage: string;
  IconText: string;
}

/** LevelMutatorStartingPlantfoodProps */
export interface LevelMutatorStartingPlantfoodPropsData {
  StartingPlantfoodOverride: number;
  DifficultyProps: string;
  IconImage: string;
  IconText: string;
}

/** BowlingMinigameProperties */
export interface BowlingMinigamePropertiesData {
  BowlingFoulLine: number;
}

/** NewBowlingMinigameProperties — no fields */
export type NewBowlingMinigamePropertiesData = Record<string, never>;

/** PVZ1OverwhelmModuleProperties — no fields */
export type PVZ1OverwhelmModulePropertiesData = Record<string, never>;

/** RoofProperties */
export interface RoofPropertiesData {
  FlowerPotStartColumn: number;
  FlowerPotEndColumn: number;
}

/** LevelScoringModuleProperties */
export interface LevelScoringData {
  PlantBonusMultiplier: number;
  PlantBonuses: string[];
  ScoringRulesType: string;
  StartingPlantfood: number;
}

/** ManholePipelineModuleProperties */
export interface ManholePipelineModuleData {
  OperationTimePerGrid: number;
  DamagePerSecond: number;
  PipelineList: PipelineData[];
}

export interface PipelineData {
  StartX: number;
  StartY: number;
  EndX: number;
  EndY: number;
}

/** PennyClassroomModuleProperties */
export interface PennyClassroomModuleData {
  PlantMap: Record<string, number>;
}

/** SeedRainProperties */
export interface SeedRainPropertiesData {
  RainInterval: number;
  SeedRains: SeedRainItem[];
}

export interface SeedRainItem {
  SeedRainType: number;
  PlantTypeName?: string | null;
  ZombieTypeName?: string | null;
  MaxCount: number;
  Weight: number;
}

// =============================================================================
// 6. Special Mode Modules
// =============================================================================

/** VaseBreakerPresetProperties */
export interface VaseBreakerPresetData {
  MinColumnIndex: number;
  MaxColumnIndex: number;
  NumColoredPlantVases: number;
  NumColoredZombieVases: number;
  GridSquareBlacklist: LocationData[];
  Vases: VaseDefinition[];
}

export interface VaseDefinition {
  ZombieTypeName?: string | null;
  PlantTypeName?: string | null;
  CollectableTypeName?: string | null;
  Count: number;
}

/** VaseBreakerArcadeModuleProperties — no fields */
export type VaseBreakerArcadeModuleData = Record<string, never>;

/** VaseBreakerFlowModuleProperties — no fields */
export type VaseBreakerFlowModuleData = Record<string, never>;

/** EvilDaveProperties */
export interface EvilDavePropertiesData {
  PlantDistance: number;
}

/** ZombossBattleModuleProperties */
export interface ZombossBattleModuleData {
  ReservedColumnCount: number;
  ZombossMechType: string;
  ZombossStageCount: number;
  ZombossDeathRow: number;
  ZombossDeathColumn: number;
  ZombossSpawnGridPosition?: LocationData | null;
}

/** ZombossBattleIntroProperties */
export interface ZombossBattleIntroData {
  PanStartOffset: number;
  PanEndOffset: number;
  PanRightDuration: number;
  PanLeftDuration: number;
  ZombossPhaseCount: number;
  SkipShowingStreetBossBattle: boolean;
}

// =============================================================================
// 7. Event Data Types (Wave Actions)
// =============================================================================

/** Common zombie spawn entry used in multiple events */
export interface ZombieSpawnData {
  Type: string;
  Level?: number | null;
  Row?: number | null;
}

export interface LocationData {
  mX: number;
  mY: number;
}

export interface Point2D {
  x: number;
  y: number;
}

/** SpawnZombiesJitteredWaveActionProps — standard zombie spawn */
export interface WaveActionData {
  NotificationEvents?: string[] | null;
  AdditionalPlantfood?: number | null;
  SpawnPlantName?: string[] | null;
  Zombies: ZombieSpawnData[];
}

/** SpawnZombiesFromGroundSpawnerProps — ground spawn */
export interface SpawnZombiesFromGroundData {
  ColumnStart: number;
  ColumnEnd: number;
  AdditionalPlantfood?: number | null;
  SpawnPlantName?: string[] | null;
  Zombies: ZombieSpawnData[];
}

/** SpawnModernPortalsWaveActionProps — portal event */
export interface PortalEventData {
  PortalType: string;
  PortalColumn: number;
  PortalRow: number;
  SpawnEffect: string;
  SpawnSoundID: string;
  IgnoreGraveStone: boolean;
}

/** StormZombieSpawnerProps — storm event */
export interface StormZombieSpawnerPropsData {
  ColumnStart: number;
  ColumnEnd: number;
  GroupSize: number;
  TimeBetweenGroups: number;
  Type: string;
  Zombies: StormZombieData[];
}

export interface StormZombieData {
  Type: string;
}

/** RaidingPartyZombieSpawnerProps — pirate raid */
export interface RaidingPartyEventData {
  GroupSize: number;
  SwashbucklerCount: number;
  TimeBetweenGroups: number;
}

/** ParachuteRainZombieSpawnerProps / SpiderRainZombieSpawnerProps / BassRainZombieSpawnerProps */
export interface ParachuteRainEventData {
  ColumnStart: number;
  ColumnEnd: number;
  GroupSize: number;
  SpiderCount: number;
  SpiderZombieName: string;
  TimeBeforeFullSpawn: number;
  TimeBetweenGroups: number;
  ZombieFallTime: number;
  WaveStartMessage: string;
}

/** ModifyConveyorWaveActionProps */
export interface ModifyConveyorWaveActionData {
  Add: ModifyConveyorPlantData[];
  Remove: ModifyConveyorRemoveData[];
}

export interface ModifyConveyorPlantData {
  Type: string;
  iLevel?: number | null;
  Weight: number;
  MaxCount: number;
  MaxWeightFactor: number;
  MinCount: number;
  MinWeightFactor: number;
}

export interface ModifyConveyorRemoveData {
  Type: string;
}

/** TidalChangeWaveActionProps */
export interface TidalChangeWaveActionData {
  TidalChange: TidalChangeInternalData;
}

export interface TidalChangeInternalData {
  ChangeAmount: number;
  ChangeType: string;
}

/** BeachStageEventZombieSpawnerProps */
export interface BeachStageEventData {
  ColumnStart: number;
  ColumnEnd: number;
  GroupSize: number;
  ZombieCount: number;
  ZombieName: string;
  TimeBeforeFullSpawn: number;
  TimeBetweenGroups: number;
  WaveStartMessage: string;
}

/** BlackHoleWaveActionProps */
export interface BlackHoleEventData {
  ColNumPlantIsDragged: number;
}

/** FrostWindWaveActionProps */
export interface FrostWindWaveActionPropsData {
  Winds: FrostWindData[];
}

export interface FrostWindData {
  Direction: string;
  Row: number;
}

/** DinoWaveActionProps */
export interface DinoWaveActionPropsData {
  DinoRow: number;
  DinoType: string;
  DinoWaveDuration: number;
}

/** SpawnGravestonesWaveActionProps */
export interface SpawnGraveStonesData {
  GravestonePool: GravestonePoolItem[];
  SpawnPositionsPool: LocationData[];
}

export interface GravestonePoolItem {
  Count: number;
  Type: string;
}

/** SpawnZombiesFromGridItemSpawnerProps */
export interface SpawnZombiesFromGridItemData {
  WaveStartMessage?: string | null;
  ZombieSpawnWaitTime: number;
  GridTypes: string[];
  Zombies: ZombieSpawnData[];
}

/** ZombiePotionActionProps */
export interface ZombiePotionActionPropsData {
  Potions: ZombiePotionData[];
}

export interface ZombiePotionData {
  Location: LocationData;
  Type: string;
}

/** WaveActionMagicMirrorTeleportationArrayProps2 */
export interface MagicMirrorWaveActionData {
  MagicMirrorTeleportationArrays: MagicMirrorArrayData[];
}

export interface MagicMirrorArrayData {
  Mirror1GridX: number;
  Mirror1GridY: number;
  Mirror2GridX: number;
  Mirror2GridY: number;
  TypeIndex: number;
  MirrorExistDuration: number;
}

/** FairyTaleFogWaveActionProps */
export interface FairyTaleFogWaveActionData {
  MovingTime: number;
  FogType: string;
  Range: FogRangeData;
}

export interface FogRangeData {
  mX: number;
  mY: number;
  mWidth: number;
  mHeight: number;
}

/** FairyTaleWindWaveActionProps */
export interface FairyTaleWindWaveActionData {
  Duration: number;
  VelocityScale: number;
}

// =============================================================================
// 8. Zombie Property Types
// =============================================================================

export interface ZombieTypeData {
  TypeName: string;
  Properties: string;
  Resistences?: number[] | null;
}

export interface ZombiePropertySheetData {
  Hitpoints: number;
  Speed: number;
  SpeedVariance?: number | null;
  EatDPS: number;
  Weight: number;
  WavePointCost: number;
  SizeType?: string | null;
  HitRect?: RectData | null;
  AttackRect?: RectData | null;
  ArtCenter?: Point2D | null;
  ShadowOffset?: Point3DDouble | null;
  GroundTrackName: string;
  CanSpawnPlantFood: boolean;
  CanSurrender?: boolean | null;
  EnableShowHealthBarByDamage?: boolean | null;
  CanBePlantTossedweak?: boolean | null;
  CanBePlantTossedStrong?: boolean | null;
  CanBeLaunchedByPlants?: boolean | null;
  DrawHealthBarTime?: number | null;
  EnableEliteImmunities?: boolean | null;
  EnableEliteScale?: boolean | null;
  CanTriggerZombieWin?: boolean | null;
  ChillInsteadOfFreeze?: boolean | null;
  EliteScale?: number | null;
  ArmDropFraction?: number | null;
  HeadDropFraction?: number | null;
}

export interface RectData {
  mX: number;
  mY: number;
  mWidth: number;
  mHeight: number;
}

export interface Point3DDouble {
  x: number;
  y: number;
  z: number;
}

// =============================================================================
// 9. Config System Types (for editor module/event/challenge configs)
// =============================================================================

export type FieldType =
  | "string"
  | "number"
  | "boolean"
  | "select"
  | "rtid"
  | "zombie-rtid"
  | "plant-rtid"
  | "zombie-ref"
  | "plant-ref"
  | "plant-select"
  | "zombie-select"
  | "griditem-select"
  | "grid-position"
  | "array"
  | "object"
  | "paired-array"
  | "textarea"
  | "color";

export interface FieldDefinition {
  key: string;
  type: FieldType;
  label: string;
  description?: string;
  default?: unknown;
  nullable?: boolean;
  // Number constraints
  numberType?: "int" | "float";
  min?: number;
  max?: number;
  step?: number;
  // String/Textarea constraints
  maxLength?: number;
  // Select options — plain strings/numbers auto-normalized to { value, label }
  options?: (string | number | { value: string | number; label: string })[];
  // RTID source filter
  rtidSource?: string;
  // Array item schema
  itemType?: FieldType;
  itemFields?: FieldDefinition[];
  // Object sub-fields
  fields?: FieldDefinition[];
  // Paired-array: multiple sibling keys whose arrays are index-aligned
  pairedKeys?: {
    key: string;
    field: FieldDefinition;
  }[];
}

export interface ModuleConfig {
  $schema: string;
  objclass: string;
  metadata: {
    title: string;
    description: string;
    icon: string;
    category: "base" | "mode" | "scene";
    isCore: boolean;
    allowMultiple: boolean;
    defaultAlias: string;
    defaultSource: "LevelModules" | "CurrentLevel";
  };
  initialData: Record<string, unknown>;
  fields: FieldDefinition[];
}

export interface EventConfig {
  $schema: string;
  objclass: string;
  metadata: {
    title: string;
    description: string;
    icon: string;
    color: string;
    darkColor: string;
    defaultAlias: string;
    category?: string;
    unique?: boolean;
  };
  initialData: Record<string, unknown>;
  fields: FieldDefinition[];
}

export interface ChallengeConfig {
  $schema: string;
  objclass: string;
  metadata: {
    title: string;
    description: string;
  };
  initialData: Record<string, unknown>;
  fields: FieldDefinition[];
}

// =============================================================================
// 10. Parsed Level Data (for editor use)
// =============================================================================

export interface ParsedLevelData {
  /** The LevelDefinition PvzObject (objclass === "LevelDefinition") */
  levelDef: PvzObject | null;
  /** The WaveManagerProperties PvzObject */
  waveManager: PvzObject | null;
  /** The WaveManagerModuleProperties PvzObject */
  waveManagerModule: PvzObject | null;
  /** Module PvzObjects referenced in LevelDefinition.Modules */
  modules: PvzObject[];
  /** Wave event PvzObjects referenced in WaveManagerProperties.Waves */
  waves: PvzObject[];
  /** All event PvzObjects (wave actions) */
  events: PvzObject[];
  /** Map from alias name to PvzObject for quick lookup */
  objectMap: Map<string, PvzObject>;
  /** All objects in the file */
  allObjects: PvzObject[];
}
