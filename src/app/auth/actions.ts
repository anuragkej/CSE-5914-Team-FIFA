"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { requestAuth } from "@/adapters/supabase";
import type { SignInOutcome, SignUpOutcome } from "@/domain/auth";

export type AuthFormState = Exclude<SignUpOutcome | SignInOutcome, { kind: "signed_in" }> | null;

export async function signUpAction(_prev: AuthFormState, form: FormData): Promise<AuthFormState> {
  const auth = await requestAuth();
  const outcome = await auth.signUp(form, await confirmUrl());
  if (outcome.kind === "signed_in") redirect("/");
  if (outcome.kind === "unavailable") console.error("[auth] sign up unavailable:", outcome.cause);
  return outcome;
}

export async function signInAction(_prev: AuthFormState, form: FormData): Promise<AuthFormState> {
  const auth = await requestAuth();
  const outcome = await auth.signIn(form);
  if (outcome.kind === "signed_in") redirect("/");
  if (outcome.kind === "unavailable") console.error("[auth] sign in unavailable:", outcome.cause);
  return outcome;
}

export async function signOutAction(): Promise<void> {
  await (await requestAuth()).signOut();
  redirect("/");
}

async function confirmUrl(): Promise<URL> {
  const h = await headers();
  const origin = h.get("origin") ?? `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;
  return new URL("/login", origin);
}
