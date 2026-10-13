import type { ComparablesQuery, MarketDataProvider } from "@/domain/ports";
import type { Comparable, FairMarketRent } from "@/domain/types";
import listings from "./fixtures/columbus-listings.json";
import fmr from "./fixtures/fmr-columbus-fy2026.json";
import { streetKey } from "./streetKey";

const comparables = listings as Comparable[];

/** Below this, a neighborhood slice is too thin and we use every same-size comp instead. */
const MIN_NEIGHBORHOOD_COMPS = 3;

/** Stands in for HUD FMR API + a listings provider (RentCast, Apify aggregator). */
export class FixtureMarketData implements MarketDataProvider {
  async fairMarketRent(): Promise<FairMarketRent | null> {
    return {
      ...fmr,
      byBedrooms: Object.fromEntries(Object.entries(fmr.byBedrooms).map(([k, v]) => [Number(k), v])),
    };
  }

  async comparables(query: ComparablesQuery): Promise<Comparable[]> {
    const subjectKey = query.address ? streetKey(query.address) : "";
    const sameBedrooms = comparables.filter((c) => c.bedrooms === query.bedrooms);
    const withoutSubject = sameBedrooms.filter((c) => subjectKey.length === 0 || streetKey(c.address) !== subjectKey);

    if (query.neighborhood) {
      return withoutSubject.filter((c) => c.neighborhood === query.neighborhood).slice(0, query.limit);
    }

    const inferred = subjectKey ? sameBedrooms.find((c) => streetKey(c.address) === subjectKey)?.neighborhood : undefined;
    const inNeighborhood = inferred ? withoutSubject.filter((c) => c.neighborhood === inferred) : [];
    const pool = inferred && inNeighborhood.length >= MIN_NEIGHBORHOOD_COMPS ? inNeighborhood : withoutSubject;
    return pool.slice(0, query.limit);
  }
}
