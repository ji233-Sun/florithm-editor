import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, SessionData } from "./session";

export async function getCurrentUserId(): Promise<string | null> {
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions
  );
  return session.userId ?? null;
}
