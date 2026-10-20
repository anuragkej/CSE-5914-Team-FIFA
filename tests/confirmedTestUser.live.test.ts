import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import { authTestFetch, confirmedTestUserAttributes } from "./confirmedTestUser";

const PASSWORD = "Correct-horse-battery-staple-1!";

function jwtPayload(token: string): { ref?: string; role?: string } | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    return JSON.parse(Buffer.from(parts[1], "base64url").toString()) as { ref?: string; role?: string };
  } catch {
    return null;
  }
}

function liveEnv(): { url: string; anonKey: string; serviceKey: string } | null {
  if (process.env.LEASELENS_AUTH_LIVE !== "1") return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";
  if (!url || !anonKey || !serviceKey) return null;
  let ref = "";
  try {
    ref = new URL(url).hostname.split(".")[0] ?? "";
  } catch {
    return null;
  }
  const service = jwtPayload(serviceKey);
  if (!service || service.role !== "service_role" || service.ref !== ref) return null;
  const anon = jwtPayload(anonKey);
  if (anon && anon.ref !== ref) return null;
  return { url, anonKey, serviceKey };
}

const env = liveEnv();

describe.skipIf(!env)("confirmed test user against Supabase", () => {
  it("creates the user with the admin API, signs in, and deletes the user", async () => {
    if (!env) throw new Error("live env missing");
    const email = `leaselens-live-${Date.now()}@example.com`;
    const admin = createClient(env.url, env.serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: authTestFetch },
    });
    const anon = createClient(env.url, env.anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: authTestFetch },
    });
    const created = await admin.auth.admin.createUser(confirmedTestUserAttributes(email, PASSWORD));
    const userId = created.data.user?.id;
    try {
      expect(created.error).toBeNull();
      expect(created.data.user?.email_confirmed_at).toEqual(expect.any(String));
      expect(created.data.user?.confirmation_sent_at ?? null).toBeNull();
      const signedIn = await anon.auth.signInWithPassword({ email, password: PASSWORD });
      expect(signedIn.error).toBeNull();
      expect(signedIn.data.session?.access_token).toEqual(expect.any(String));
    } finally {
      if (userId) {
        const removed = await admin.auth.admin.deleteUser(userId);
        if (removed.error) throw removed.error;
      }
    }
  });
});
