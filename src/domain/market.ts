import type { Cents, Comparable, FairMarketRent, MarketComparison, MarketVerdict } from "./types";

const AT_MARKET_BAND = 0.1;

export function median(values: Cents[]): Cents | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? Math.round((sorted[mid - 1] + sorted[mid]) / 2) : sorted[mid];
}

function deltaPct(rent: Cents, baseline: Cents | null): number | null {
  if (baseline === null || baseline === 0) return null;
  return (rent - baseline) / baseline;
}

function verdictFor(delta: number | null): MarketVerdict {
  if (delta === null) return "unknown";
  if (delta < -AT_MARKET_BAND) return "below_market";
  if (delta > AT_MARKET_BAND) return "above_market";
  return "at_market";
}

/** Comps drive the verdict; FMR is a public fallback when no comps match. */
export function compareToMarket(
  rent: Cents | null,
  bedrooms: number | null,
  fmr: FairMarketRent | null,
  comps: Comparable[],
): MarketComparison {
  const fmrForSize = bedrooms !== null && fmr ? (fmr.byBedrooms[bedrooms] ?? null) : null;
  const compMedian = median(comps.map((c) => c.rent));

  if (rent === null) {
    return { fmr: fmrForSize, fmrDeltaPct: null, compMedian, compDeltaPct: null, comps, verdict: "unknown" };
  }

  const compDeltaPct = deltaPct(rent, compMedian);
  const fmrDeltaPct = deltaPct(rent, fmrForSize);

  return {
    fmr: fmrForSize,
    fmrDeltaPct,
    compMedian,
    compDeltaPct,
    comps,
    verdict: verdictFor(compDeltaPct ?? fmrDeltaPct),
  };
}
