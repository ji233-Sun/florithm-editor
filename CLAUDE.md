# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Florithm webapp — a web-based visual level editor for PvZ2 (Plants vs. Zombies 2 Chinese Edition). The goal is to port the functionality of the Android app [Z-Editor](ref/Z-Editor/) to the web. The reference project's analysis report (`ref/Z-Editor/Z-Editor-Analysis-Report.md`) contains the complete domain knowledge: PvZ2 level JSON structure, 37 module types, 19 event types, 66 scene maps, 9 level templates, and the RTID reference mechanism.

## Tech Stack

- **Framework:** Next.js 16 (App Router) with React 19
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4 + daisyUI 5
- **Fonts:** Geist / Geist Mono via `next/font/google`
- **ORM:** Prisma 7 with MySQL (via `@prisma/adapter-mariadb`)
- **Package manager:** npm

## Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint (next/core-web-vitals + typescript)
```

### Prisma Commands

```bash
npx prisma generate          # Generate Prisma Client (output: generated/prisma/)
npx prisma migrate dev       # Create and apply migrations in dev
npx prisma migrate deploy    # Apply migrations in production
npx prisma studio            # Open Prisma Studio GUI
```

## Architecture

- `app/` — Next.js App Router. `layout.tsx` is the root layout, `page.tsx` is the home page.
- `prisma/schema.prisma` — Prisma schema (MySQL datasource). Client output goes to `generated/prisma/`.
- `prisma.config.ts` — Prisma 7 config using `defineConfig()`. Database URL from `DATABASE_URL` env var.
- `public/` — Static assets.
- `ref/Z-Editor/` — Reference Android project (git untracked). Do not modify.
- Path alias: `@/*` maps to project root (e.g., `@/app/page`).

## Key Conventions

- Tailwind CSS v4 syntax: use `@import "tailwindcss"` and `@plugin "daisyui"` (not v3 `@tailwind` directives).
- ESLint 9 flat config format (`eslint.config.mjs`).
- Prisma 7 uses the new `defineConfig` API in `prisma.config.ts` (not the legacy `prisma/schema.prisma` datasource url).
- Prisma Client is generated to `generated/prisma/` (gitignored). Always run `npx prisma generate` after schema changes.
- Environment variables (`.env*`) are gitignored. `DATABASE_URL` is required for Prisma.
- No test framework configured yet.

## Domain Knowledge

The PvZ2 level JSON structure is the core domain. Key concepts:

- **Level file** = `{ objects: PvzObject[], version: 1 }`
- **PvzObject** = `{ aliases?, objclass, objdata }` — a polymorphic wrapper; `objclass` determines the shape of `objdata`
- **RTID references** = `RTID(Alias@Source)` — objects reference each other by alias; `Source` is `CurrentLevel` (local) or `LevelModules` (built-in)
- **Module types** (37): SeedBank, WaveManager, ZombieSpawner, GridItem, etc. — each has its own `objclass` and `objdata` schema
- **Event types** (19): SpawnZombie, StormEvent, Parachute, etc. — nested inside wave definitions

See `ref/Z-Editor/Z-Editor-Analysis-Report.md` for the complete reference.
