import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUserId } from "@/lib/auth/helpers";
import { readFile } from "fs/promises";
import { join } from "path";

const createSchema = z.object({
  name: z.string().min(1, "关卡名称不能为空").max(100),
  description: z.string().max(500).optional(),
  templateId: z.string().optional(),
});

const DEFAULT_LEVEL_DATA = {
  objects: [
    {
      objclass: "LevelDefinition",
      objdata: {
        Description: "",
        LevelNumber: 1,
        Loot: "RTID(DefaultLoot@LevelModules)",
        Modules: [],
        Name: "",
        StageModule: "RTID(TutorialStage@LevelModules)",
        VictoryModule: "RTID(VictoryOutro@LevelModules)",
      },
    },
  ],
  version: 1,
};

export async function GET(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize")) || 20));

  const [levels, total] = await Promise.all([
    prisma.level.findMany({
      where: { authorId: userId },
      select: {
        id: true,
        name: true,
        description: true,
        isPublic: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.level.count({ where: { authorId: userId } }),
  ]);

  return NextResponse.json({ levels, total, page, pageSize });
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, description, templateId } = createSchema.parse(body);

    let levelData = DEFAULT_LEVEL_DATA;

    if (templateId) {
      try {
        const templatePath = join(
          process.cwd(),
          "public/data/configs/templates",
          `${templateId}.json`
        );
        const templateContent = await readFile(templatePath, "utf-8");
        levelData = JSON.parse(templateContent);
      } catch {
        // fallback to default if template not found
      }
    }

    const level = await prisma.level.create({
      data: {
        name,
        description: description || null,
        levelData,
        authorId: userId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ level }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Create level error:", error);
    return NextResponse.json(
      { error: "创建关卡失败" },
      { status: 500 }
    );
  }
}
