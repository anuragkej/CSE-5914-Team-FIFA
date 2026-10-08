import { describe, expect, it } from "vitest";
import { authTestFetch, authTestRequestPath, confirmedTestUserAttributes, refusesAuthEmail } from "./confirmedTestUser";

describe("confirmed test user", () => {
  it("asks the admin API to create an already confirmed user", () => {
    expect(confirmedTestUserAttributes("student@example.com", "correct-horse-battery-staple")).toEqual({
      email: "student@example.com",
      password: "correct-horse-battery-staple",
      email_confirm: true,
    });
  });

  it("refuses the endpoints that send mail", () => {
    expect(refusesAuthEmail("/auth/v1/signup")).toBe(true);
    expect(refusesAuthEmail("/auth/v1/invite")).toBe(true);
    expect(refusesAuthEmail("/auth/v1/otp")).toBe(true);
    expect(refusesAuthEmail("/auth/v1/magiclink")).toBe(true);
    expect(refusesAuthEmail("/auth/v1/recover")).toBe(true);
    expect(refusesAuthEmail("/auth/v1/admin/users")).toBe(false);
    expect(refusesAuthEmail("/auth/v1/token")).toBe(false);
  });

  it("rejects a sign-up request before fetch runs", async () => {
    await expect(authTestFetch("https://example.supabase.co/auth/v1/signup", { method: "POST" })).rejects.toThrow(
      "auth test refused /auth/v1/signup",
    );
    expect(authTestRequestPath("https://example.supabase.co/auth/v1/admin/users")).toBe("/auth/v1/admin/users");
  });
});
