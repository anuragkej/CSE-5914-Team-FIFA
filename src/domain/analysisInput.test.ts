import { describe, expect, it } from "vitest";
import { MAX_TEXT_LENGTH, validateAnalysisInput } from "./analysisInput";

const text = "A campus apartment available for a twelve month lease at $1,200 per month.";

describe("analysis input boundary", () => {
  it("trims inputs, omits blank overrides, and keeps studio bedrooms", () => {
    expect(validateAnalysisInput({ text: `  ${text}  `, address: "  ", landlordName: " Owner ", bedrooms: 0 })).toEqual({
      ok: true, input: { text, landlordName: "Owner", bedrooms: 0 },
    });
  });

  it.each([null, [], "listing", 42])("rejects a non-object body: %j", (value) => {
    expect(validateAnalysisInput(value)).toMatchObject({ ok: false, issues: [{ field: "body" }] });
  });

  it.each([undefined, 123, " ", "x".repeat(39), "x".repeat(MAX_TEXT_LENGTH + 1)])("rejects missing, invalid, short or oversized text (%#)", (value) => {
    expect(validateAnalysisInput({ text: value })).toMatchObject({ ok: false, issues: [{ field: "text" }] });
  });

  it.each([-1, 7, 1.5, NaN, Infinity, "2", null])("rejects invalid bedrooms: %j", (bedrooms) => {
    expect(validateAnalysisInput({ text, bedrooms })).toMatchObject({ ok: false, issues: [{ field: "bedrooms" }] });
  });

  it("returns all invalid fields without coercing optional values", () => {
    expect(validateAnalysisInput({ text, address: {}, landlordName: false, bedrooms: 9 })).toMatchObject({
      ok: false, issues: [{ field: "address" }, { field: "landlordName" }, { field: "bedrooms" }],
    });
  });
});
