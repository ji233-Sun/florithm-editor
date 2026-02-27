import { NextResponse } from "next/server";
import { z } from "zod";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { sessionOptions, SessionData } from "@/lib/auth/session";
import { hashPassword } from "@/lib/utils/crypto";

const verifySchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  password: z.string().min(6, "密码至少 6 位"),
  nickname: z.string().min(1, "昵称不能为空").max(20, "昵称最多 20 个字符"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, code, password, nickname } = verifySchema.parse(body);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "该邮箱已被注册" },
        { status: 409 }
      );
    }

    const verification = await prisma.verificationCode.findFirst({
      where: {
        email,
        code,
        type: "REGISTER",
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!verification) {
      return NextResponse.json(
        { error: "验证码无效或已过期" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          passwordHash,
          nickname,
          emailVerified: true,
        },
      });

      await tx.verificationCode.update({
        where: { id: verification.id },
        data: { usedAt: new Date(), userId: newUser.id },
      });

      return newUser;
    });

    const session = await getIronSession<SessionData>(
      await cookies(),
      sessionOptions
    );
    session.userId = user.id;
    await session.save();

    return NextResponse.json({
      user: { id: user.id, email: user.email, nickname: user.nickname },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Verify error:", error);
    return NextResponse.json(
      { error: "验证失败，请稍后重试" },
      { status: 500 }
    );
  }
}
