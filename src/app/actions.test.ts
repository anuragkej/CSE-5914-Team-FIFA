import { describe, expect, it } from "vitest";
import { sampleDocuments } from "@/adapters/mock/sampleDocuments";
import { analyzeAction } from "./actions";

function form(bedrooms: string) {
  const data = new FormData();
  data.set("text", sampleDocuments[0].text);
  data.set("bedrooms", bedrooms);
  return data;
}

describe("analysis form boundary", () => {
  it("keeps extraction when the override is blank", async () => {
    const result = await analyzeAction(null, form("  "));
    expect(result?.analysis?.terms.bedrooms).toBe(2);
  });

  it("accepts a studio override from a form string", async () => {
    const result = await analyzeAction(null, form("0"));
    expect(result?.analysis?.terms.bedrooms).toBe(0);
  });

  it.each(["1.5", "7", "oops"])("returns an error for invalid form bedrooms: %s", async (bedrooms) => {
    expect(await analyzeAction(null, form(bedrooms))).toEqual({
      error: "bedrooms: Bedrooms must be a whole number from 0 to 6 (0 means studio).",
    });
  });
});
