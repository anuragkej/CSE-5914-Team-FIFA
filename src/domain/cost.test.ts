import { describe, expect, it } from "vitest";
import { computeCost } from "./cost";
import type { ExtractedTerms } from "./types";

const base: ExtractedTerms = {
  address: null,
  bedrooms: 2,
  landlordName: null,
  monthlyRent: 145000,
  securityDeposit: 145000,
  leaseTermMonths: 12,
  fees: [],
  clauses: [],
  paymentMethods: [],
};

describe("computeCost", () => {
  it("adds recurring fees and amortizes one-time fees over the term", () => {
    const cost = computeCost({
      ...base,
      fees: [
        { label: "utility fee", amount: 4500, cadence: "monthly", category: "utility", refundable: false, excerpt: "" },
        { label: "parking fee", amount: 5000, cadence: "monthly", category: "parking", refundable: false, excerpt: "" },
        { label: "administrative fee", amount: 15000, cadence: "one_time", category: "admin", refundable: false, excerpt: "" },
      ],
    });
    expect(cost).toEqual({
      rent: 145000,
      recurringFees: 9500,
      amortizedOneTimeFees: 1250,
      trueMonthlyCost: 155750,
      moveInCash: 305000,
      hiddenCostRatio: 10750 / 145000,
      termMonths: 12,
    });
  });

  it("treats annual fees as amount / 12 and refundable deposits as move-in cash only", () => {
    const cost = computeCost({
      ...base,
      securityDeposit: null,
      fees: [
        { label: "pet deposit", amount: 30000, cadence: "one_time", category: "deposit", refundable: true, excerpt: "" },
        { label: "renters insurance", amount: 12000, cadence: "annual", category: "insurance", refundable: false, excerpt: "" },
      ],
    });
    expect(cost?.recurringFees).toBe(1000);
    expect(cost?.amortizedOneTimeFees).toBe(0);
    expect(cost?.trueMonthlyCost).toBe(146000);
    expect(cost?.moveInCash).toBe(175000);
  });

  it("counts non-refundable deposits as one-time fees", () => {
    const cost = computeCost({
      ...base,
      securityDeposit: null,
      fees: [{ label: "cleaning deposit", amount: 30000, cadence: "one_time", category: "deposit", refundable: false, excerpt: "" }],
    });
    expect(cost?.amortizedOneTimeFees).toBe(2500);
    expect(cost?.moveInCash).toBe(175000);
  });

  it("defaults to a 12 month term and returns null without rent", () => {
    expect(computeCost({ ...base, leaseTermMonths: null })?.termMonths).toBe(12);
    expect(computeCost({ ...base, monthlyRent: null })).toBeNull();
  });
});
