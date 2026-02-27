import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import {
  sendVerificationCode,
  generateVerificationCode,
} from "@/lib/utils/email";

const registerSchema = z.object({
  email: z.string().email("无效的邮箱格式"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = registerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "该邮箱已被注册" },
        { status: 409 }
      );
    }

    // Rate limit: check if a code was sent within the last 60 seconds
    const recentCode = await prisma.verificationCode.findFirst({
      where: {
        email,
        type: "REGISTER",
        createdAt: { gt: new Date(Date.now() - 60 * 1000) },
      },
    });
    if (recentCode) {
      return NextResponse.json(
        { error: "请等待 60 秒后再次发送验证码" },
        { status: 429 }
      );
    }

    const code = generateVerificationCode();
    await prisma.verificationCode.create({
      data: {
        email,
        code,
        type: "REGISTER",
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
    });

    await sendVerificationCode(email, code);

    return NextResponse.json({ message: "验证码已发送" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "发送验证码失败，请稍后重试" },
      { status: 500 }
    );
  }
}
