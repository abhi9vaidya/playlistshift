import { NextRequest, NextResponse } from "next/server";
import { getGoogleAuthUrl, getGoogleOAuthRedirectUri, isGoogleOAuthConfigured } from "@/lib/auth/google-oauth";
import { cookies } from "next/headers";
import crypto from "crypto";

export async function GET(request: NextRequest) {
  if (!isGoogleOAuthConfigured()) {
    return NextResponse.redirect(
      new URL("/?auth_error=not_configured", request.url)
    );
  }

  const origin = request.nextUrl.origin;
  const redirectUri = getGoogleOAuthRedirectUri(origin);
  const state = crypto.randomBytes(24).toString("hex");

  const authUrl = getGoogleAuthUrl(state, redirectUri);

  const cookieStore = await cookies();
  cookieStore.set("ps_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600, // 10 minutes
  });

  return NextResponse.redirect(authUrl);
}

