import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { sessionOptions, SessionData } from "@/lib/auth/session";

export async function GET() {
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions
  );

  if (!session.userId) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, nickname: true },
  });

  if (!user) {
    session.destroy();
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({ user });
}
