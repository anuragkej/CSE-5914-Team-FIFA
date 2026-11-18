/**
 * Listing discussion threads. Rows live in the shared Supabase tables
 * public.threads and public.replies; RLS lets anyone read and lets a signed-in
 * student insert rows whose author_id defaults to auth.uid().
 */

/** Matches the threads_text_check and replies_text_check constraints. */
export const POST_TEXT_MAX = 1000;

export interface ListingSummary {
  listingId: string;
  address: string | null;
  city: string | null;
  stateCode: string | null;
  neighborhood: string | null;
  rent: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  distanceMiles: number | null;
  fraudStatus: string | null;
  availableFrom: string | null;
  description: string | null;
  landlordName: string | null;
  sourceUrl: string | null;
}

export interface Reply {
  replyId: string;
  threadId: string;
  authorId: string;
  text: string;
  createdAt: string;
}

export interface Thread {
  threadId: string;
  listingId: string;
  authorId: string;
  text: string;
  createdAt: string;
  replies: Reply[];
}

export type PostTextProblem = "missing" | "too_long";

export type ParsedPostText = { ok: true; text: string } | { ok: false; problem: PostTextProblem };

export function parsePostText(raw: unknown): ParsedPostText {
  const text = typeof raw === "string" ? raw.trim() : "";
  if (text.length === 0) return { ok: false, problem: "missing" };
  if ([...text].length > POST_TEXT_MAX) return { ok: false, problem: "too_long" };
  return { ok: true, text };
}

const UUID_SHAPE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_SHAPE.test(value);
}

/** Authors have no public profile table, so the UI names only the viewer's own posts. */
export function authorLabel(authorId: string, viewerId: string | null): string {
  if (viewerId && authorId === viewerId) return "You";
  return `Student ${authorId.slice(0, 4).toUpperCase()}`;
}

export function listingTitle(listing: Pick<ListingSummary, "address" | "city" | "stateCode">): string {
  const place = [listing.city, listing.stateCode].filter((part): part is string => Boolean(part)).join(", ");
  if (listing.address && place) return `${listing.address}, ${place}`;
  return listing.address ?? (place || "Unnamed listing");
}

interface RawReply {
  reply_id: unknown;
  thread_id: unknown;
  author_id: unknown;
  text: unknown;
  created_at: unknown;
}

interface RawThread {
  thread_id: unknown;
  listing_id: unknown;
  author_id: unknown;
  text: unknown;
  created_at: unknown;
  replies?: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function str(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function num(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value))) return Number(value);
  return null;
}

function decodeReply(raw: unknown): Reply | null {
  if (!isRecord(raw)) return null;
  const row = raw as Partial<RawReply>;
  const replyId = str(row.reply_id);
  const threadId = str(row.thread_id);
  const authorId = str(row.author_id);
  const text = str(row.text);
  const createdAt = str(row.created_at);
  if (!replyId || !threadId || !authorId || text === null || !createdAt) return null;
  return { replyId, threadId, authorId, text, createdAt };
}

/** Decodes threads with embedded replies; threads newest first, replies oldest first. */
export function decodeThreads(rows: unknown): Thread[] {
  if (!Array.isArray(rows)) return [];
  const threads = rows.flatMap((raw): Thread[] => {
    if (!isRecord(raw)) return [];
    const row = raw as Partial<RawThread>;
    const threadId = str(row.thread_id);
    const listingId = str(row.listing_id);
    const authorId = str(row.author_id);
    const text = str(row.text);
    const createdAt = str(row.created_at);
    if (!threadId || !listingId || !authorId || text === null || !createdAt) return [];
    const replies = (Array.isArray(row.replies) ? row.replies : [])
      .map(decodeReply)
      .filter((reply): reply is Reply => reply !== null)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    return [{ threadId, listingId, authorId, text, createdAt, replies }];
  });
  return threads.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function decodeListing(raw: unknown): ListingSummary | null {
  if (!isRecord(raw)) return null;
  const listingId = str(raw.listing_id);
  if (!listingId) return null;
  return {
    listingId,
    address: str(raw.address),
    city: str(raw.city),
    stateCode: str(raw.state_code),
    neighborhood: str(raw.neighborhood),
    rent: num(raw.rent),
    bedrooms: num(raw.bedrooms),
    bathrooms: num(raw.bathrooms),
    distanceMiles: num(raw.distance_miles),
    fraudStatus: str(raw.fraud_status),
    availableFrom: str(raw.available_from),
    description: str(raw.description),
    landlordName: str(raw.landlord_name),
    sourceUrl: str(raw.source_url),
  };
}

export function decodeListings(rows: unknown): ListingSummary[] {
  if (!Array.isArray(rows)) return [];
  return rows.map(decodeListing).filter((listing): listing is ListingSummary => listing !== null);
}

export type PostResult =
  | { kind: "posted" }
  | { kind: "signed_out" }
  | { kind: "invalid"; problem: PostTextProblem | "bad_target" }
  | { kind: "not_configured" }
  | { kind: "unavailable" };
