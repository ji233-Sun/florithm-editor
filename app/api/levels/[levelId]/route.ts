import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUserId } from "@/lib/auth/helpers";

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  levelData: z.any().optional(),
  isPublic: z.boolean().optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ levelId: string }> }
) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { levelId } = await params;
  const level = await prisma.level.findUnique({
    where: { id: levelId },
    select: {
      id: true,
      name: true,
      description: true,
      levelData: true,
      isPublic: true,
      createdAt: true,
      updatedAt: true,
      authorId: true,
    },
  });

  if (!level) {
    return NextResponse.json({ error: "关卡不存在" }, { status: 404 });
  }

  if (level.authorId !== userId && !level.isPublic) {
    return NextResponse.json({ error: "无权访问" }, { status: 403 });
  }

  return NextResponse.json({ level });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ levelId: string }> }
) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { levelId } = await params;
  const existing = await prisma.level.findUnique({
    where: { id: levelId },
    select: { authorId: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "关卡不存在" }, { status: 404 });
  }
  if (existing.authorId !== userId) {
    return NextResponse.json({ error: "无权操作" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const data = updateSchema.parse(body);

    const level = await prisma.level.update({
      where: { id: levelId },
      data,
      select: {
        id: true,
        name: true,
        description: true,
        levelData: true,
        isPublic: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ level });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Update level error:", error);
    return NextResponse.json(
      { error: "更新失败" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ levelId: string }> }
) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { levelId } = await params;
  const existing = await prisma.level.findUnique({
    where: { id: levelId },
    select: { authorId: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "关卡不存在" }, { status: 404 });
  }
  if (existing.authorId !== userId) {
    return NextResponse.json({ error: "无权操作" }, { status: 403 });
  }

  await prisma.level.delete({ where: { id: levelId } });
  return NextResponse.json({ message: "已删除" });
}
