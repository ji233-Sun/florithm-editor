import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUserId } from "@/lib/auth/helpers";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ levelId: string }> }
) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { levelId } = await params;
  const original = await prisma.level.findUnique({
    where: { id: levelId },
  });

  if (!original) {
    return NextResponse.json({ error: "关卡不存在" }, { status: 404 });
  }
  if (original.authorId !== userId) {
    return NextResponse.json({ error: "无权操作" }, { status: 403 });
  }

  const level = await prisma.level.create({
    data: {
      name: `${original.name} (副本)`,
      description: original.description,
      levelData: original.levelData as object,
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
}
