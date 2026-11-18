import { describe, expect, it } from "vitest";
import {
  authorLabel,
  decodeListing,
  decodeListings,
  decodeThreads,
  isUuid,
  listingTitle,
  parsePostText,
  POST_TEXT_MAX,
} from "./threads";

const LISTING = "11111111-1111-4111-8111-111111111111";
const ME = "22222222-2222-4222-8222-222222222222";
const OTHER = "abcd3333-3333-4333-8333-333333333333";

describe("parsePostText", () => {
  it("trims and accepts text", () => {
    expect(parsePostText("  Is the landlord responsive?  ")).toEqual({ ok: true, text: "Is the landlord responsive?" });
  });
  it("rejects empty or non-string input", () => {
    expect(parsePostText("   ")).toEqual({ ok: false, problem: "missing" });
    expect(parsePostText(null)).toEqual({ ok: false, problem: "missing" });
  });
  it("enforces the database length limit", () => {
    expect(parsePostText("a".repeat(POST_TEXT_MAX)).ok).toBe(true);
    expect(parsePostText("a".repeat(POST_TEXT_MAX + 1))).toEqual({ ok: false, problem: "too_long" });
  });
});

describe("isUuid", () => {
  it("accepts uuids only", () => {
    expect(isUuid(LISTING)).toBe(true);
    expect(isUuid("not-a-uuid")).toBe(false);
    expect(isUuid(42)).toBe(false);
  });
});

describe("authorLabel", () => {
  it("names the viewer's own posts", () => {
    expect(authorLabel(ME, ME)).toBe("You");
    expect(authorLabel(OTHER, ME)).toBe("Student ABCD");
    expect(authorLabel(OTHER, null)).toBe("Student ABCD");
  });
});

describe("decodeThreads", () => {
  it("orders threads newest first and replies oldest first, dropping bad rows", () => {
    const threads = decodeThreads([
      {
        thread_id: "t1",
        listing_id: LISTING,
        author_id: ME,
        text: "older",
        created_at: "2026-11-01T00:00:00Z",
        replies: [
          { reply_id: "r2", thread_id: "t1", author_id: OTHER, text: "second", created_at: "2026-11-03T00:00:00Z" },
          { reply_id: "r1", thread_id: "t1", author_id: ME, text: "first", created_at: "2026-11-02T00:00:00Z" },
          { reply_id: 7 },
        ],
      },
      { thread_id: "t2", listing_id: LISTING, author_id: OTHER, text: "newer", created_at: "2026-11-05T00:00:00Z" },
      { thread_id: "broken" },
    ]);
    expect(threads.map((t) => t.threadId)).toEqual(["t2", "t1"]);
    expect(threads[1].replies.map((r) => r.text)).toEqual(["first", "second"]);
    expect(threads[0].replies).toEqual([]);
  });
  it("returns an empty list for non-arrays", () => {
    expect(decodeThreads(null)).toEqual([]);
  });
});

describe("listings", () => {
  it("decodes numeric strings from Postgres numeric columns", () => {
    const listing = decodeListing({ listing_id: LISTING, address: "1 High St", rent: "1250.00", bedrooms: 2 });
    expect(listing?.rent).toBe(1250);
    expect(listing?.bedrooms).toBe(2);
    expect(decodeListings([{ nope: true }, { listing_id: LISTING }])).toHaveLength(1);
  });
  it("builds a readable title", () => {
    expect(listingTitle({ address: "1 High St", city: "Columbus", stateCode: "OH" })).toBe("1 High St, Columbus, OH");
    expect(listingTitle({ address: null, city: null, stateCode: null })).toBe("Unnamed listing");
  });
});
