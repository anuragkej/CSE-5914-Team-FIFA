import { describe, expect, it } from "vitest";
import { evaluateRules } from "@/domain/rules";
import type { ExtractedTerms, MarketComparison, OwnershipCheck } from "@/domain/types";
import { sampleDocuments } from "./sampleDocuments";
import { RuleBasedExtractor } from "./ruleBasedExtractor";

const extractor = new RuleBasedExtractor();

async function read(text: string) {
  return extractor.extract({ text });
}

const market: MarketComparison = {
  fmr: null,
  fmrDeltaPct: null,
  compMedian: null,
  compDeltaPct: null,
  comps: [],
  verdict: "unknown",
};

const ownership: OwnershipCheck = {
  status: "not_checked",
  claimedLandlord: null,
  record: null,
  detail: "",
};

describe("RuleBasedExtractor", () => {
  it("reads rent, bedrooms, and clauses from the sample documents", async () => {
    const standard = await read(sampleDocuments[0].text);
    expect(standard.monthlyRent).toBe(145000);
    expect(standard.bedrooms).toBe(2);
    expect(standard.clauses.map((c) => c.topic)).toContain("late_fee");

    const suspicious = await read(sampleDocuments[1].text);
    expect(suspicious.monthlyRent).toBe(65000);
    expect(suspicious.clauses.map((c) => c.topic)).toEqual(
      expect.arrayContaining(["attorney_fees", "landlord_liability_waiver", "payment_method", "late_fee", "auto_renewal"]),
    );

    const listing = await read(sampleDocuments[2].text);
    expect(listing.monthlyRent).toBe(139500);
    expect(listing.bedrooms).toBe(1);
  });

  it("reads a studio or efficiency as 0 bedrooms, and prefers an explicit count", async () => {
    expect((await read("Sunny studio near campus.")).bedrooms).toBe(0);
    expect((await read("An efficiency apartment on High Street.")).bedrooms).toBe(0);
    expect((await read("2 bedroom, not a studio.")).bedrooms).toBe(2);
  });

  it("reads rent when the dollar sign is missing or not next to the word", async () => {
    expect((await read("The unit is $1,200 a month.")).monthlyRent).toBe(120000);
    expect((await read("Monthly rent is 1450 per month.")).monthlyRent).toBe(145000);
    expect((await read("$980 due as rent for the year.")).monthlyRent).toBe(98000);
    expect((await read("Rent: 2 bedroom apartment at $1,500 per month.")).monthlyRent).toBe(150000);
  });

  it("does not treat a utility fee as the rent", async () => {
    const terms = await read("Utility fee of $45 per month. The place is $1,100 a month.");
    expect(terms.monthlyRent).toBe(110000);
  });

  it("finds a confession of judgment, including cognovit and an extra article", async () => {
    const phrases = [
      "This lease contains a confession of judgment.",
      "Tenant grants a warrant of attorney to confess a judgment.",
      "The agreement includes a cognovit clause.",
    ];
    for (const phrase of phrases) {
      const terms = await read(phrase);
      expect(terms.clauses.map((c) => c.topic)).toContain("confession_of_judgment");
    }
  });

  it("finds a percentage late fee and the rule flags it at 10% or more", async () => {
    const terms = await read("Monthly rent is $1,200. A late fee of 12% of monthly rent applies after the 5th.");
    expect(terms.clauses.map((c) => c.topic)).toContain("late_fee");
    expect(terms.monthlyRent).toBe(120000);

    const flags = evaluateRules({
      terms: { ...terms, monthlyRent: 120000 } satisfies ExtractedTerms,
      cost: null,
      market,
      ownership,
    });
    expect(flags.map((f) => f.code)).toContain("HIGH_LATE_FEE");

    const worded = await read("Late charge of 10 percent of the rent.");
    expect(worded.clauses.map((c) => c.topic)).toContain("late_fee");
  });
});
