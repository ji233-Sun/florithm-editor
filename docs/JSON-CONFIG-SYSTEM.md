# Florithm JSON 配置系统文档

本文档描述 Florithm 关卡编辑器的 JSON 配置驱动系统。所有模块和事件的编辑器 UI 由 JSON 配置文件定义，前端动态渲染表单。

## 1. 概述

Florithm 的核心创新在于**配置驱动 UI**：每个 PvZ2 模块/事件对应一个 JSON 配置文件，定义了：
- 模块的元数据（标题、描述、图标、分类）
- 默认数据（初始 objdata）
- 字段定义（表单字段的类型、校验规则、UI 行为）

前端的 `DynamicForm` 组件读取配置文件，自动渲染对应的编辑表单。

## 2. 目录结构

```
public/data/configs/
├── modules/
│   ├── _index.json              # 模块索引
│   ├── base/                    # 基础模块配置
│   ├── mode/                    # 模式模块配置
│   └── scene/                   # 场景模块配置
├── events/
│   ├── _index.json              # 事件索引
│   └── *.json                   # 各事件配置
├── challenges/
│   ├── _index.json              # 挑战索引
│   └── *.json                   # 各挑战配置
├── stages.json                  # 66 个场景地图
├── templates/
│   ├── _index.json              # 模板索引
│   └── *.json                   # 关卡模板 JSON
├── object-order.json            # 97 种对象排序
└── conflicts.json               # 10 条冲突规则
```

## 3. 模块配置文件格式

### 3.1 完整结构

```jsonc
{
  "$schema": "florithm-module-config/v1",
  "objclass": "SunDropperProperties",       // PvZ2 objclass 标识
  "metadata": {
    "title": "阳光掉落",                     // 中文标题
    "description": "控制天空掉落阳光的频率",    // 中文描述
    "icon": "sun",                           // lucide-react 图标名
    "category": "base",                      // base | mode | scene
    "isCore": true,                          // 是否核心模块
    "allowMultiple": false,                  // 是否允许多个实例
    "defaultAlias": "DefaultSunDropper",     // 默认 RTID 别名
    "defaultSource": "LevelModules"          // LevelModules | CurrentLevel
  },
  "initialData": {
    // 创建新模块时的默认 objdata
    "InitialSunDropDelay": 2.0,
    "SunCountdownBase": 4.25
  },
  "fields": [
    // 字段定义数组，详见第 5 节
  ]
}
```

### 3.2 metadata 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `title` | string | 模块在 UI 中显示的中文名称 |
| `description` | string | 模块功能的简要描述 |
| `icon` | string | lucide-react 图标名（如 "sun", "shield", "waves"） |
| `category` | enum | 模块分类：`base`(基础) / `mode`(模式) / `scene`(场景) |
| `isCore` | boolean | 核心模块在列表中优先显示 |
| `allowMultiple` | boolean | 是否允许同一关卡中存在多个该模块实例 |
| `defaultAlias` | string | 新建模块时的默认别名 |
| `defaultSource` | enum | RTID 引用来源：`LevelModules`(内置) / `CurrentLevel`(本地) |

### 3.3 defaultSource 说明

- `LevelModules`：模块数据来自游戏内置，不需要在关卡 JSON 中包含 objdata。引用格式 `RTID(Alias@LevelModules)`
- `CurrentLevel`：模块数据存在于关卡 JSON 中。引用格式 `RTID(Alias@CurrentLevel)`

## 4. 事件配置文件格式

事件配置与模块配置类似，metadata 中额外包含颜色信息：

```jsonc
{
  "$schema": "florithm-event-config/v1",
  "objclass": "SpawnZombiesJitteredWaveActionProps",
  "metadata": {
    "title": "自然出怪",
    "description": "从右侧自然生成僵尸",
    "icon": "users",
    "color": "#2196F3",              // 亮色主题颜色
    "darkColor": "#90CAF9",          // 暗色主题颜色
    "defaultAlias": "Jittered"
  },
  "initialData": { ... },
  "fields": [ ... ]
}
```

## 5. 字段类型完整参考

### 5.1 string — 文本输入

```json
{
  "key": "Name",
  "type": "string",
  "label": "名称",
  "description": "关卡名称",
  "maxLength": 100,
  "default": ""
}
```

### 5.2 number — 数值输入

```json
{
  "key": "InitialSunDropDelay",
  "type": "number",
  "label": "初始掉落延迟",
  "numberType": "float",        // "int" | "float"
  "min": 0,
  "max": 60,
  "step": 0.25,
  "default": 2.0,
  "nullable": false             // 是否可设为 null
}
```

### 5.3 boolean — 开关

```json
{
  "key": "ManualStartup",
  "type": "boolean",
  "label": "手动启动",
  "default": false,
  "nullable": true
}
```

### 5.4 select — 下拉选择

```json
{
  "key": "SelectionMethod",
  "type": "select",
  "label": "选卡方式",
  "options": [
    { "value": "chooser", "label": "自选" },
    { "value": "preset", "label": "预设" },
    { "value": "random", "label": "随机" }
  ],
  "default": "chooser"
}
```

### 5.5 rtid — RTID 引用

```json
{
  "key": "Loot",
  "type": "rtid",
  "label": "掉落",
  "rtidSource": "LevelModules",
  "default": "RTID(DefaultLoot@LevelModules)"
}
```

### 5.6 zombie-rtid — 僵尸 RTID 选择器

```json
{
  "key": "Type",
  "type": "zombie-rtid",
  "label": "僵尸类型",
  "default": "RTID(zombie_tutorial@ZombieTypes)"
}
```

带搜索功能的僵尸选择器，从 `/data/reference/Zombies.json` 加载数据并显示图标。

### 5.7 plant-rtid — 植物 RTID 选择器

```json
{
  "key": "PlantType",
  "type": "plant-rtid",
  "label": "植物类型",
  "default": ""
}
```

### 5.8 plant-select / zombie-select — ID 选择

与 `plant-rtid` / `zombie-rtid` 类似，但输出纯 ID 而非 RTID 格式。

### 5.9 griditem-select — 障碍物选择

```json
{
  "key": "GridItemType",
  "type": "griditem-select",
  "label": "障碍物类型",
  "default": ""
}
```

### 5.10 grid-position — 网格坐标

```json
{
  "key": "Location",
  "type": "grid-position",
  "label": "位置",
  "default": { "mX": 0, "mY": 0 }
}
```

渲染为列(mX)和行(mY)两个数值输入。

### 5.11 array — 动态数组

```json
{
  "key": "Zombies",
  "type": "array",
  "label": "僵尸列表",
  "itemFields": [
    { "key": "Type", "type": "zombie-rtid", "label": "类型" },
    { "key": "Row", "type": "number", "label": "行", "numberType": "int", "min": 0, "max": 5, "nullable": true }
  ]
}
```

支持动态增删项目。`itemFields` 定义每个数组元素的子字段。

### 5.12 object — 嵌套对象

```json
{
  "key": "TidalChange",
  "type": "object",
  "label": "潮水变更",
  "fields": [
    { "key": "ChangeAmount", "type": "number", "label": "变更量", "numberType": "int" },
    { "key": "ChangeType", "type": "select", "label": "类型", "options": [...] }
  ]
}
```

递归渲染嵌套字段。

### 5.13 textarea — 多行文本

```json
{
  "key": "Description",
  "type": "textarea",
  "label": "描述",
  "maxLength": 500
}
```

### 5.14 color — 颜色选择

```json
{
  "key": "Color",
  "type": "color",
  "label": "颜色",
  "default": "#000000"
}
```

## 6. initialData 与 fields 的关系

- `initialData` 定义创建新模块实例时 `objdata` 的完整默认值
- `fields` 定义哪些字段在 UI 中可编辑
- **关键原则**：`fields` 中声明的字段是 `initialData` 的子集。`objdata` 中可能包含 `fields` 未声明的字段（来自游戏原始数据），这些字段会被保留不被删除

这种设计确保：
1. 用户只看到已知的、有意义的编辑字段
2. 原始 JSON 中的未知字段不会丢失
3. 新增字段只需更新配置文件，无需修改前端代码

## 7. 浅合并策略 (Shallow Merge)

`DynamicForm.onChange` 采用浅合并策略（参考 Z-Editor 的 `JsonSyncManager`）：

```typescript
function handleFieldChange(key: string, value: unknown) {
  onChange({ ...data, [key]: value });
}
```

- 只更新 `fields` 中声明的 key
- 保留 `objdata` 中所有未在 `fields` 中出现的 key
- 这意味着即使某个模块有游戏内部使用但编辑器不展示的字段，数据也不会丢失

## 8. 冲突规则 (conflicts.json)

定义模块间的互斥关系：

```json
{
  "rules": [
    {
      "modules": ["SeedBankProperties", "ConveyorSeedBankProperties"],
      "message": "种子库与传送带不能同时使用"
    }
  ]
}
```

编辑器在添加模块时检查冲突规则，若存在冲突则显示警告。

## 9. 排序规则 (object-order.json)

定义 97 种 PvZ2 对象类型的序列化排序顺序：

```json
{
  "order": [
    "LevelDefinition",
    "WaveManagerModuleProperties",
    "WaveManagerProperties",
    ...
  ]
}
```

序列化关卡 JSON 时，objects 数组按此顺序排列，确保输出与游戏兼容。

## 10. 如何添加新的模块/事件配置

### 10.1 添加新模块

1. 在 `public/data/configs/modules/<category>/` 下创建 `<module-name>.json`
2. 定义 `$schema`、`objclass`、`metadata`、`initialData`、`fields`
3. 在 `modules/_index.json` 中添加索引条目
4. （可选）如果需要排序，在 `object-order.json` 中添加条目

### 10.2 添加新事件

1. 在 `public/data/configs/events/` 下创建 `<event-name>.json`
2. 定义配置（注意 metadata 中需要 `color` 和 `darkColor`）
3. 在 `events/_index.json` 中添加索引条目

### 10.3 字段定义注意事项

- `key` 必须与 PvZ2 objdata 中的 JSON 键完全匹配（区分大小写）
- `default` 应与 PvZ2 的默认值一致
- 对于可选字段设置 `nullable: true`
- 数值字段需指定 `numberType`（int/float）以确保正确的解析
- 嵌套结构使用 `object` 或 `array` 类型，支持任意深度递归
