import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

export interface SessionPayload {
  user: {
    id: string;
    name: string;
    email: string;
    picture?: string;
  };
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

const COOKIE_NAME = "ps_session";

function getSecretKey(): Uint8Array {
  const secret =
    process.env.SESSION_SECRET || "fallback_playlistshift_secret_must_be_32_chars_or_more_123456789";
  return new TextEncoder().encode(secret.padEnd(32, "!").slice(0, 32));
}

/**
 * Seals session data into a signed JWT.
 */
export async function sealSession(payload: SessionPayload): Promise<string> {
  const secretKey = getSecretKey();
  return await new SignJWT(payload as any)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secretKey);
}

/**
 * Unseals and verifies the session token from the signed JWT.
 */
export async function unsealSession(token: string): Promise<SessionPayload | null> {
  try {
    const secretKey = getSecretKey();
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/**
 * Gets current active session from HTTP-only cookie.
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  if (!cookie?.value) return null;

  return await unsealSession(cookie.value);
}

/**
 * Saves or updates user session in an HTTP-only secure cookie.
 */
export async function setSession(payload: SessionPayload): Promise<void> {
  const cookieStore = await cookies();
  const token = await sealSession(payload);

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

/**
 * Removes session cookie upon logout.
 */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
