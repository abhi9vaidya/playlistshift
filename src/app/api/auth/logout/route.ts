import { NextResponse } from "next/server";
import { clearSession, getSession } from "@/lib/auth/session";
import { revokeGoogleToken } from "@/lib/auth/google-oauth";

export async function POST() {
  const session = await getSession();
  if (session?.accessToken) {
    await revokeGoogleToken(session.accessToken);
  }

  await clearSession();
  return NextResponse.json({ success: true, message: "Logged out successfully" });
}
