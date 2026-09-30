import { describe, expect, it } from "vitest";
import { compareToMarket, median } from "./market";
import type { Comparable, FairMarketRent } from "./types";

const fmr: FairMarketRent = {
  areaName: "Columbus, OH HUD Metro FMR Area",
  fiscalYear: 2026,
  byBedrooms: { 1: 119400, 2: 143000 },
  source: "test",
};

function comp(id: string, rent: number): Comparable {
  return { id, address: id, neighborhood: "University District", bedrooms: 2, bathrooms: 1, sqft: null, rent, source: "test" };
}

describe("median", () => {
  it("handles odd, even and empty inputs", () => {
    expect(median([300, 100, 200])).toBe(200);
    expect(median([100, 200, 300, 400])).toBe(250);
    expect(median([])).toBeNull();
  });
});

describe("compareToMarket", () => {
  const comps = [comp("a", 139500), comp("b", 145000), comp("c", 152000), comp("d", 168000), comp("e", 132500), comp("f", 141000)];

  it("uses comp median for the verdict and reports FMR delta alongside", () => {
    const result = compareToMarket(145000, 2, fmr, comps);
    expect(result.compMedian).toBe(143000);
    expect(result.compDeltaPct).toBeCloseTo(2000 / 143000, 6);
    expect(result.fmr).toBe(143000);
    expect(result.fmrDeltaPct).toBeCloseTo(2000 / 143000, 6);
    expect(result.verdict).toBe("at_market");
  });

  it("flags far-below-market rent", () => {
    expect(compareToMarket(65000, 2, fmr, comps).verdict).toBe("below_market");
  });

  it("falls back to FMR when there are no comps", () => {
    const result = compareToMarket(165000, 2, fmr, []);
    expect(result.compMedian).toBeNull();
    expect(result.fmrDeltaPct).toBeCloseTo(22000 / 143000, 6);
    expect(result.verdict).toBe("above_market");
  });

  it("is unknown without rent or without any baseline", () => {
    expect(compareToMarket(null, 2, fmr, comps).verdict).toBe("unknown");
    expect(compareToMarket(100000, 5, fmr, []).verdict).toBe("unknown");
  });
});
