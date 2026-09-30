/** All money is integer cents to avoid float drift in cost math. */
export type Cents = number;

export type Cadence = "monthly" | "annual" | "one_time";

export type FeeCategory =
  | "utility"
  | "parking"
  | "pet"
  | "admin"
  | "deposit"
  | "insurance"
  | "amenity"
  | "other";

export interface Fee {
  label: string;
  amount: Cents;
  cadence: Cadence;
  category: FeeCategory;
  refundable: boolean;
  excerpt: string;
}

export type ClauseTopic =
  | "attorney_fees"
  | "confession_of_judgment"
  | "landlord_liability_waiver"
  | "auto_renewal"
  | "payment_method"
  | "late_fee";

export interface Clause {
  topic: ClauseTopic;
  excerpt: string;
}

/** What we can read out of a lease or listing. Every field may be missing. */
export interface ExtractedTerms {
  address: string | null;
  bedrooms: number | null;
  landlordName: string | null;
  monthlyRent: Cents | null;
  securityDeposit: Cents | null;
  leaseTermMonths: number | null;
  fees: Fee[];
  clauses: Clause[];
  paymentMethods: string[];
}

export interface CostBreakdown {
  rent: Cents;
  recurringFees: Cents;
  amortizedOneTimeFees: Cents;
  trueMonthlyCost: Cents;
  moveInCash: Cents;
  /** (trueMonthlyCost - rent) / rent */
  hiddenCostRatio: number;
  termMonths: number;
}

export type Severity = "info" | "warning" | "danger";

export interface Flag {
  code: string;
  severity: Severity;
  title: string;
  detail: string;
  /** Legal or data basis, e.g. "ORC 5321.13(C)". */
  basis?: string;
  excerpt?: string;
}

export interface FairMarketRent {
  areaName: string;
  fiscalYear: number;
  byBedrooms: Record<number, Cents>;
  source: string;
}

export interface Comparable {
  id: string;
  address: string;
  neighborhood: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number | null;
  rent: Cents;
  source: string;
}

export type MarketVerdict =
  | "below_market"
  | "at_market"
  | "above_market"
  | "unknown";

export interface MarketComparison {
  fmr: Cents | null;
  fmrDeltaPct: number | null;
  compMedian: Cents | null;
  compDeltaPct: number | null;
  comps: Comparable[];
  verdict: MarketVerdict;
}

export interface PropertyRecord {
  parcelId: string;
  siteAddress: string;
  ownerName: string;
  ownerMailingAddress: string;
  lastTransferDate: string;
  source: string;
}

export type OwnershipStatus = "match" | "mismatch" | "no_record" | "not_checked";

export interface OwnershipCheck {
  status: OwnershipStatus;
  claimedLandlord: string | null;
  record: PropertyRecord | null;
  detail: string;
}

export interface AnalysisInput {
  text: string;
  address?: string;
  bedrooms?: number;
  landlordName?: string;
}

export type VerdictTone = "stop" | "caution" | "clear" | "incomplete";

/** One-line answer to "should I sign this?", derived from the flags. */
export interface Verdict {
  tone: VerdictTone;
  headline: string;
  summary: string;
}

export interface Analysis {
  terms: ExtractedTerms;
  cost: CostBreakdown | null;
  market: MarketComparison;
  ownership: OwnershipCheck;
  flags: Flag[];
  verdict: Verdict;
}
