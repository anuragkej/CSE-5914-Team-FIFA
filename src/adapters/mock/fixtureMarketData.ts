import type { ComparablesQuery, MarketDataProvider } from "@/domain/ports";
import type { Comparable, FairMarketRent } from "@/domain/types";
import listings from "./fixtures/columbus-listings.json";
import fmr from "./fixtures/fmr-columbus-fy2026.json";

const comparables = listings as Comparable[];

/** Stands in for HUD FMR API + a listings provider (RentCast, Apify aggregator). */
export class FixtureMarketData implements MarketDataProvider {
  async fairMarketRent(): Promise<FairMarketRent | null> {
    return {
      ...fmr,
      byBedrooms: Object.fromEntries(Object.entries(fmr.byBedrooms).map(([k, v]) => [Number(k), v])),
    };
  }

  async comparables(query: ComparablesQuery): Promise<Comparable[]> {
    return comparables
      .filter((c) => c.bedrooms === query.bedrooms)
      .filter((c) => !query.neighborhood || c.neighborhood === query.neighborhood)
      .slice(0, query.limit);
  }
}
