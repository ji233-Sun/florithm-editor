# Florithm Editor

![Florithm Logo](./public/logo.png)

一个基于 Next.js 的 PvZ2（植物大战僵尸 2 中文版）可视化关卡编辑器。

本项目采用完全模块的思路，通过JSON文件定义模块、关卡事件，并拥有AI驱动。

## 项目简介

Florithm Editor 是一个功能丰富的 PvZ2 关卡编辑工具，支持：

- 可拓展的可视化表单解析引擎
- 自动保存功能
- 冲突检测

## 技术栈

- **框架:** Next.js 16 (App Router) + React 19
- **语言:** TypeScript (strict mode)
- **样式:** Tailwind CSS v4 + daisyUI 5
- **数据库:** MySQL (via Prisma 7 + @prisma/adapter-mariadb)
- **包管理器:** npm

## 快速开始

### 环境要求

- Node.js 20+
- MySQL / MariaDB 数据库

### 安装

```bash
# 克隆项目
git clone https://github.com/ji233-Sun/florithm-editor.git
cd florithm-editor

# 安装依赖
npm install

# 配置环境变量（复制 .env.example 为 .env 并填写配置）
cp .env.example .env

# 生成 Prisma 客户端
npx prisma generate

# 运行数据库迁移
npx prisma migrate deploy
```

### 开发

```bash
npm run dev
```

启动后访问 [http://localhost:3000](http://localhost:3000)

### 生产构建

```bash
npm run build
npm run start
```

## 项目结构

```
florithm-editor/
├── app/                    # Next.js App Router
├── components/editor/      # 编辑器组件
│   ├── EditorShell.tsx     # 主编辑器容器
│   ├── EditorToolbar.tsx   # 工具栏
│   ├── tabs/               # 各功能标签页
│   ├── settings/           # 设置相关组件
│   ├── waves/              # 波次编辑组件
│   └── shared/             # 共享组件
├── lib/pvz/                # PvZ2 核心逻辑
│   ├── parser.ts           # JSON 解析器
│   ├── serializer.ts       # JSON 序列化器
│   ├── rtid.ts             # RTID 处理
│   └── conflicts.ts        # 冲突检测
├── stores/                 # Zustand 状态管理
├── prisma/                 # 数据库 Schema 和迁移
└── ref/Z-Editor/           # 参考项目（只读）
```

## 许可证

本项目采用 [MIT 许可证](LICENSE) 开源。

## 贡献

欢迎提交 Issue 和 Pull Request！

## 致谢

- [Z-Editor](https://github.com/yhzxcv/Z-Editor) - 原 Android 版编辑器项目
- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [daisyUI](https://daisyui.com/)
