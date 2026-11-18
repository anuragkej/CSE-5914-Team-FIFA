import { requestDataClient } from "@/adapters/supabase";
import { decodeListing, decodeListings, decodeThreads, type ListingSummary, type Thread } from "@/domain/threads";

export type Loaded<T> = { kind: "ok"; value: T } | { kind: "not_configured" } | { kind: "unavailable"; cause: string };
export type Written = { kind: "ok" } | { kind: "not_configured" } | { kind: "unavailable"; cause: string };

const LISTING_COLUMNS =
  "listing_id, address, city, state_code, neighborhood, rent, bedrooms, bathrooms, distance_miles, fraud_status, available_from, description, landlord_name, source_url";

const THREAD_COLUMNS =
  "thread_id, listing_id, author_id, text, created_at, replies(reply_id, thread_id, author_id, text, created_at)";

export async function loadListings(limit = 50): Promise<Loaded<ListingSummary[]>> {
  const client = await requestDataClient();
  if (!client) return { kind: "not_configured" };
  const { data, error } = await client
    .from("listings")
    .select(LISTING_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return { kind: "unavailable", cause: error.code ?? error.message };
  return { kind: "ok", value: decodeListings(data) };
}

export async function loadListing(listingId: string): Promise<Loaded<ListingSummary | null>> {
  const client = await requestDataClient();
  if (!client) return { kind: "not_configured" };
  const { data, error } = await client.from("listings").select(LISTING_COLUMNS).eq("listing_id", listingId).maybeSingle();
  if (error) return { kind: "unavailable", cause: error.code ?? error.message };
  return { kind: "ok", value: data ? decodeListing(data) : null };
}

export async function loadThreads(listingId: string): Promise<Loaded<Thread[]>> {
  const client = await requestDataClient();
  if (!client) return { kind: "not_configured" };
  const { data, error } = await client
    .from("threads")
    .select(THREAD_COLUMNS)
    .eq("listing_id", listingId)
    .order("created_at", { ascending: false });
  if (error) return { kind: "unavailable", cause: error.code ?? error.message };
  return { kind: "ok", value: decodeThreads(data) };
}

/** author_id is left to its auth.uid() default; authenticated may only insert listing_id and text. */
export async function insertThread(listingId: string, text: string): Promise<Written> {
  const client = await requestDataClient();
  if (!client) return { kind: "not_configured" };
  const { error } = await client.from("threads").insert({ listing_id: listingId, text });
  if (error) return { kind: "unavailable", cause: error.code ?? error.message };
  return { kind: "ok" };
}

/** author_id is left to its auth.uid() default; authenticated may only insert thread_id and text. */
export async function insertReply(threadId: string, text: string): Promise<Written> {
  const client = await requestDataClient();
  if (!client) return { kind: "not_configured" };
  const { error } = await client.from("replies").insert({ thread_id: threadId, text });
  if (error) return { kind: "unavailable", cause: error.code ?? error.message };
  return { kind: "ok" };
}
