import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { isGoogleOAuthConfigured } from "@/lib/auth/google-oauth";

export async function GET() {
  const session = await getSession();
  const configured = isGoogleOAuthConfigured();

  if (!session) {
    return NextResponse.json({
      isAuthenticated: false,
      isGoogleConfigured: configured,
    });
  }

  return NextResponse.json({
    isAuthenticated: true,
    isGoogleConfigured: configured,
    user: session.user,
  });
}

