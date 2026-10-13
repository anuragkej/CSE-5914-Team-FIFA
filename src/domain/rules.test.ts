import { describe, expect, it } from "vitest";
import { evaluateRules } from "./rules";
import type { ExtractedTerms, MarketComparison, OwnershipCheck } from "./types";

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

function codes(excerpt: string, rent: number): string[] {
  const terms: ExtractedTerms = {
    address: null,
    bedrooms: 1,
    landlordName: null,
    monthlyRent: rent,
    securityDeposit: null,
    leaseTermMonths: 12,
    fees: [],
    clauses: [{ topic: "late_fee", excerpt }],
    paymentMethods: [],
  };
  return evaluateRules({ terms, cost: null, market, ownership }).map((flag) => flag.code);
}

describe("late fee share", () => {
  it("flags a percent of rent at or above 10%", () => {
    expect(codes("Late fee of 10% of monthly rent.", 120000)).toContain("HIGH_LATE_FEE");
    expect(codes("A late charge of 12 percent of the rent.", 120000)).toContain("HIGH_LATE_FEE");
  });

  it("does not flag a late fee under 10%", () => {
    expect(codes("Late fee of 5% of monthly rent.", 120000)).not.toContain("HIGH_LATE_FEE");
    expect(codes("Late fee of $50.", 145000)).not.toContain("HIGH_LATE_FEE");
  });

  it("still flags a dollar late fee that is at least 10% of rent", () => {
    expect(codes("Late fee of $150 applies after the 3rd.", 65000)).toContain("HIGH_LATE_FEE");
  });
});
