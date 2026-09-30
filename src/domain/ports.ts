import type {
  AnalysisInput,
  Comparable,
  ExtractedTerms,
  FairMarketRent,
  PropertyRecord,
} from "./types";

/** Turns raw lease or listing text into structured terms. Mock today, LLM later. */
export interface TermsExtractor {
  extract(input: AnalysisInput): Promise<ExtractedTerms>;
}

export interface ComparablesQuery {
  bedrooms: number;
  neighborhood?: string;
  limit: number;
}

/** HUD Fair Market Rent plus nearby comparable listings. */
export interface MarketDataProvider {
  fairMarketRent(): Promise<FairMarketRent | null>;
  comparables(query: ComparablesQuery): Promise<Comparable[]>;
}

/** County parcel records, used to check who actually owns the property. */
export interface PropertyRecordsProvider {
  findByAddress(address: string): Promise<PropertyRecord | null>;
}

export interface AnalysisPorts {
  extractor: TermsExtractor;
  market: MarketDataProvider;
  propertyRecords: PropertyRecordsProvider;
}
