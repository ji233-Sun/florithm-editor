# AI Agent 功能设计文档

> 目标：在关卡编辑器内通过 AI Agent 快速修改关卡，使用 Tool Calling 模式让 LLM 直接操作编辑器。

---

## 一、现状分析

项目已具备良好的 AI 集成基础：

- **结构化领域模型**：`lib/pvz/types.ts` 定义了完整的 PvzObject、ParsedLevelData 等类型
- **成熟的 parser/serializer**：可双向转换 JSON ↔ 结构化数据
- **Zustand store 提供清晰的 mutation API**：`addModule`、`removeModule`、`addWave`、`addEventToWave` 等
- **98 个配置文件**：丰富的元数据（模块/事件的字段定义、默认值、约束）
- **冲突检测 + 缺失模块检测**已内置

核心思路：把 store 的操作"包装"成 AI 可调用的 tool，让 LLM 通过 tool calling 操作关卡。

---

## 二、技术选型

### 方案对比

| 方案 | 优势 | 劣势 | 推荐度 |
|------|------|------|--------|
| **Vercel AI SDK** | Next.js 原生集成、流式 UI、内置 tool calling、TypeScript 优先 | 生态比 LangChain 小 | ★★★★★ |
| **LangChain.js** | 生态丰富、Chain/Agent 抽象成熟 | 过重、抽象层多、与 Next.js 集成需额外工作 | ★★★☆☆ |
| **直接用 Anthropic/OpenAI SDK** | 最轻量、完全控制 | 需自己写 tool loop、流式处理 | ★★★★☆ |

### 最终选择：Vercel AI SDK (`ai`)

理由：

1. **已是 Next.js 项目**，AI SDK 与 App Router 的 Route Handler、Server Actions 无缝集成
2. **内置 `tool()` 函数**，用 Zod schema 定义参数 — 项目已在使用 Zod
3. **原生流式 UI** — `useChat` hook + `streamText` 开箱即用
4. **多 provider 支持** — 可随时切换 OpenAI / Anthropic / DeepSeek 等
5. **轻量** — 不像 LangChain 那样引入大量抽象层

```bash
npm install ai @ai-sdk/openai  # 或 @ai-sdk/anthropic
```

---

## 三、Agent Tool 设计

### Tool 清单

```
📖 查询类 Tools（只读）
├── get_level_info        — 获取关卡基本信息（名称、地图、音乐等）
├── list_modules          — 列出当前所有模块（类型+别名）
├── list_waves            — 列出波次结构（每波有哪些事件）
├── get_module_detail     — 获取某个模块的详细配置
├── get_event_detail      — 获取某个事件的详细配置
├── list_available_modules — 列出可添加的模块类型
├── list_available_events  — 列出可添加的事件类型
└── check_conflicts       — 检查当前配置冲突

✏️ 修改类 Tools（写入）
├── update_level_settings — 修改关卡元数据（地图、音乐、胜利条件等）
├── add_module            — 添加模块
├── remove_module         — 删除模块
├── update_module         — 修改模块配置
├── add_wave              — 添加新波次
├── remove_wave           — 删除波次
├── add_event_to_wave     — 向指定波次添加事件
├── remove_event_from_wave — 从波次中移除事件
├── update_event          — 修改事件配置
└── batch_edit            — 批量修改（多个操作合并为一次提交）
```

### Tool 定义示例（Vercel AI SDK 风格）

```typescript
import { tool } from "ai";
import { z } from "zod";

export const levelTools = {
  list_modules: tool({
    description: "列出当前关卡的所有模块，返回模块类型和别名",
    parameters: z.object({}),
    execute: async (_, { levelData }) => {
      return levelData.modules.map(m => ({
        objclass: m.objclass,
        alias: m.aliases?.[0] ?? "unknown",
      }));
    },
  }),

  add_module: tool({
    description: "向关卡添加一个模块。需要指定模块类型（objclass）",
    parameters: z.object({
      objclass: z.string().describe("模块的 objclass，如 SunDropperProperties"),
    }),
    execute: async ({ objclass }, { store, configs }) => {
      const config = configs.find(c => c.objclass === objclass);
      if (!config) return { error: `未知模块类型: ${objclass}` };
      store.addModule(config);
      return { success: true, message: `已添加模块: ${config.metadata.title}` };
    },
  }),
};
```

---

## 四、架构设计

```
┌─────────────────────────────────────────────────┐
│                  前端 (React)                     │
│                                                   │
│  ┌──────────┐    ┌────────────────────────────┐  │
│  │ Editor   │    │  AI Chat Panel             │  │
│  │ (Zustand)│◄───│  (useChat hook)            │  │
│  │          │    │  - 用户自然语言输入          │  │
│  │ store    │    │  - 流式显示 AI 回复          │  │
│  │ actions  │    │  - Tool 调用结果可视化       │  │
│  └──────────┘    └────────────┬───────────────┘  │
│       ▲                       │                   │
│       │              POST /api/ai/chat            │
│       │                       ▼                   │
├───────┼───────────────────────────────────────────┤
│       │           后端 (API Route)                 │
│       │                                           │
│       │    ┌──────────────────────────────────┐   │
│       │    │  streamText({                    │   │
│       │    │    model: openai("gpt-4o"),      │   │
│       │    │    system: systemPrompt,         │   │
│       │    │    tools: levelTools,            │   │
│       └────│  })                              │   │
│            └──────────────────────────────────┘   │
│                                                   │
│  systemPrompt 包含:                               │
│  - PvZ2 领域知识摘要                               │
│  - 当前关卡的 ParsedLevelData 快照                  │
│  - 可用模块/事件列表                               │
│  - 冲突规则说明                                    │
└───────────────────────────────────────────────────┘
```

### 关键流程

1. **用户在 Chat Panel 输入**：「把第3波改成 10 个铁桶僵尸从地面出来」
2. **前端发送请求**：带上当前 `ParsedLevelData` 的快照
3. **后端 AI 推理**：LLM 理解意图 → 调用 tool
4. **Tool 返回操作指令**：前端接收 tool 调用结果
5. **前端执行**：将 tool 调用结果映射到 Zustand store 的对应 action
6. **实时预览**：编辑器即时更新，用户可以看到变化
7. **可撤销**：所有 AI 修改走正常的 store flow，支持 undo

### Tool 执行位置：前端执行（推荐）

Tool 返回"操作指令"而非直接修改数据，前端调用 store action 完成修改，这样能：
- 保持 Zustand 状态一致性
- 支持 undo/redo
- 触发自动保存和冲突检测

---

## 五、System Prompt 策略

分层构建：

```
Layer 1: 角色定义
  "你是 PvZ2 关卡编辑助手，帮助用户通过自然语言修改关卡配置"

Layer 2: 领域知识（静态，可缓存）
  - 37 个模块类型的名称 + 用途摘要
  - 19 个事件类型的名称 + 用途摘要
  - RTID 引用机制说明
  - 冲突规则列表
  - 常见关卡模式（普通关、砸罐子、我是僵尸、僵王战等）

Layer 3: 当前上下文（动态，每次请求注入）
  - 当前关卡的模块列表
  - 当前波次结构
  - 当前冲突警告
```

Layer 2 的内容从 `public/data/configs/` 配置文件自动生成，避免手动维护。

---

## 六、UI 设计

编辑器右侧添加可折叠的 AI Chat 面板：

```
┌─────────────────────────┬──────────────────┐
│                         │  🤖 AI 助手       │
│     Editor Main Area    │                  │
│     (现有编辑器)         │  用户: 加5波普通  │
│                         │  僵尸出怪         │
│                         │                  │
│                         │  AI: 已添加5个波  │
│                         │  次，每波包含...   │
│                         │  [查看变更]       │
│                         │                  │
│                         │  ┌──────────────┐│
│                         │  │ 输入消息...   ││
│                         │  └──────────────┘│
└─────────────────────────┴──────────────────┘
```

---

## 七、注意事项

1. **Token 成本**：只发送摘要信息（模块列表、波次数量等），Tool 查询详细信息时才按需返回
2. **安全性**：API Key 放服务端环境变量，不暴露给前端；对 AI 操作限频
3. **LLM 选择**：推荐 Claude Sonnet / GPT-4o（tool calling 准确率高）
4. **用户自带 Key**：可考虑支持用户提供自己的 API Key

---

## 八、实施路线

| 阶段 | 内容 | 工作量 | 状态 |
|------|------|--------|------|
| **P0** | 安装 AI SDK + 基础 chat API route + 前端 Chat Panel | 小 | ⬜ 待开始 |
| **P1** | 实现查询类 tools（get_level_info, list_modules, list_waves 等） | 中 | ⬜ 待开始 |
| **P2** | 实现修改类 tools（add_module, add_wave, add_event 等）+ 前端 store 对接 | 中 | ⬜ 待开始 |
| **P3** | 优化 system prompt + 领域知识自动注入 | 小 | ⬜ 待开始 |
| **P4** | 批量操作 + undo/redo 支持 | 大 | ⬜ 待开始 |
| **P5** | 预设 prompt 模板（"一键生成普通关"、"添加 BOSS 战"等） | 小 | ⬜ 待开始 |
