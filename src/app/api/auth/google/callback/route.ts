import { NextRequest, NextResponse } from "next/server";
import {
  exchangeCodeForTokens,
  getGoogleOAuthRedirectUri,
  getGoogleUserProfile,
} from "@/lib/auth/google-oauth";
import { setSession } from "@/lib/auth/session";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const baseUrl = request.nextUrl.origin;

  if (error) {
    return NextResponse.redirect(
      new URL(`/?auth_error=${encodeURIComponent(error)}`, baseUrl)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/?auth_error=missing_parameters", baseUrl)
    );
  }

  const cookieStore = await cookies();
  const savedState = cookieStore.get("ps_oauth_state")?.value;
  cookieStore.delete("ps_oauth_state");

  if (!savedState || savedState !== state) {
    return NextResponse.redirect(
      new URL("/?auth_error=state_mismatch", baseUrl)
    );
  }

  try {
    const redirectUri = getGoogleOAuthRedirectUri(baseUrl);
    const tokens = await exchangeCodeForTokens(code, redirectUri);
    const user = await getGoogleUserProfile(tokens.accessToken);

    await setSession({
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: Date.now() + tokens.expiresIn * 1000,
    });

    return NextResponse.redirect(new URL("/?auth=success", baseUrl));
  } catch (err: unknown) {
    console.error("OAuth callback error:", err);
    const msg = err instanceof Error ? err.message : "auth_failed";
    return NextResponse.redirect(
      new URL(`/?auth_error=${encodeURIComponent(msg)}`, baseUrl)
    );
  }
}

