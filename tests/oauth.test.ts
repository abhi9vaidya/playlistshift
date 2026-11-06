import { describe, it, expect, vi } from "vitest";
import { sealSession, unsealSession, SessionPayload } from "@/lib/auth/session";
import { getGoogleOAuthRedirectUri, getGoogleAuthUrl } from "@/lib/auth/google-oauth";

describe("OAuth Sessions & Cookie Security", () => {
  it("keeps sealed session JWT cookie size strictly under 1.5KB", async () => {
    const realisticPayload: SessionPayload = {
      user: {
        id: "109823471092834710928",
        name: "Jane Alexandra Doe",
        email: "jane.alexandra.doe@gmail.com",
        picture: "https://lh3.googleusercontent.com/a/ACg8ocL3-example-very-long-url-path-avatar=s96-c",
      },
      accessToken: "ya29.a0AfH6SMB_SAMPLE_ACCESS_TOKEN_STRING_WITH_STANDARD_GOOGLE_OAUTH_TOKEN_LENGTH_1234567890_ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      refreshToken: "1//04_SAMPLE_REFRESH_TOKEN_STRING_1234567890_ABCDEFGHIJKLM_NOPQRSTUVWXYZ",
      expiresAt: Date.now() + 3600 * 1000,
    };

    const sealed = await sealSession(realisticPayload);
    const byteSize = Buffer.byteLength(sealed, "utf8");

    // Standard browser cookie maximum is 4096 bytes (4KB).
    // Our sealed JWT should be ~500-800 bytes, well within safe bounds.
    expect(byteSize).toBeLessThan(1500);
    expect(byteSize).toBeGreaterThan(200);

    // Verify unsealing succeeds and recovers exact data
    const unsealed = await unsealSession(sealed);
    expect(unsealed).not.toBeNull();
    expect(unsealed?.user.email).toBe("jane.alexandra.doe@gmail.com");
    expect(unsealed?.user.id).toBe("109823471092834710928");
    expect(unsealed?.accessToken).toBe(realisticPayload.accessToken);
    expect(unsealed?.refreshToken).toBe(realisticPayload.refreshToken);
  });

  it("constructs least-privilege OAuth consent URL with youtube.force-ssl", () => {
    const state = "test_state_123456";
    const redirectUri = getGoogleOAuthRedirectUri("http://localhost:3000");
    const authUrl = getGoogleAuthUrl(state, redirectUri);

    const parsedUrl = new URL(authUrl);
    expect(parsedUrl.origin).toBe("https://accounts.google.com");
    expect(parsedUrl.pathname).toBe("/o/oauth2/v2/auth");
    expect(parsedUrl.searchParams.get("state")).toBe(state);
    expect(parsedUrl.searchParams.get("redirect_uri")).toBe("http://localhost:3000/api/auth/google/callback");
    expect(parsedUrl.searchParams.get("access_type")).toBe("offline");
    expect(parsedUrl.searchParams.get("prompt")).toBe("consent");

    const scopes = parsedUrl.searchParams.get("scope") || "";
    expect(scopes).toContain("https://www.googleapis.com/auth/youtube.force-ssl");
    expect(scopes).not.toContain("https://www.googleapis.com/auth/youtube "); // Should NOT contain broad scope
  });

  it("safely returns null when verifying invalid or tampered JWT cookie", async () => {
    const tampered = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalidpayload.invalidsignature";
    const result = await unsealSession(tampered);
    expect(result).toBeNull();
  });
});

