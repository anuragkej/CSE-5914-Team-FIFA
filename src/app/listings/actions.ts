"use server";

import { revalidatePath } from "next/cache";
import { requestAuth } from "@/adapters/supabase";
import { insertReply, insertThread, type Written } from "@/adapters/supabaseThreads";
import { isUuid, parsePostText, type PostResult } from "@/domain/threads";

export type PostFormState = PostResult | null;

export async function postThreadAction(_prev: PostFormState, form: FormData): Promise<PostFormState> {
  const listingId = form.get("listingId");
  if (!isUuid(listingId)) return { kind: "invalid", problem: "bad_target" };
  return post(form, listingId, () => insertThread, listingId);
}

export async function postReplyAction(_prev: PostFormState, form: FormData): Promise<PostFormState> {
  const listingId = form.get("listingId");
  const threadId = form.get("threadId");
  if (!isUuid(listingId) || !isUuid(threadId)) return { kind: "invalid", problem: "bad_target" };
  return post(form, listingId, () => insertReply, threadId);
}

async function post(
  form: FormData,
  listingId: string,
  writer: () => (target: string, text: string) => Promise<Written>,
  target: string,
): Promise<PostResult> {
  const session = await (await requestAuth()).session();
  if (!session) return { kind: "signed_out" };
  const parsed = parsePostText(form.get("text"));
  if (!parsed.ok) return { kind: "invalid", problem: parsed.problem };
  try {
    const written = await writer()(target, parsed.text);
    switch (written.kind) {
      case "ok":
        revalidatePath(`/listings/${listingId}`);
        return { kind: "posted" };
      case "not_configured":
        return { kind: "not_configured" };
      case "unavailable":
        console.error("[threads] post failed:", written.cause);
        return { kind: "unavailable" };
      default: {
        const unreachable: never = written;
        return unreachable;
      }
    }
  } catch (error) {
    console.error("[threads] post threw:", error instanceof Error ? error.message : error);
    return { kind: "unavailable" };
  }
}
