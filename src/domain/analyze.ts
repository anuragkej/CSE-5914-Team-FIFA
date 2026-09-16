import { computeCost } from "./cost";
import { compareToMarket } from "./market";
import { checkOwnership } from "./ownership";
import type { AnalysisPorts } from "./ports";
import { evaluateRules } from "./rules";
import type { Analysis, AnalysisInput } from "./types";
import { deriveVerdict } from "./verdict";

const COMPS_LIMIT = 6;

export async function analyze(input: AnalysisInput, ports: AnalysisPorts): Promise<Analysis> {
  const extracted = await ports.extractor.extract(input);
  const terms = {
    ...extracted,
    address: input.address?.trim() || extracted.address,
    bedrooms: input.bedrooms ?? extracted.bedrooms,
    landlordName: input.landlordName?.trim() || extracted.landlordName,
  };

  const [fmr, comps, record] = await Promise.all([
    ports.market.fairMarketRent(),
    terms.bedrooms === null
      ? Promise.resolve([])
      : ports.market.comparables({ bedrooms: terms.bedrooms, limit: COMPS_LIMIT }),
    terms.address === null ? Promise.resolve(null) : ports.propertyRecords.findByAddress(terms.address),
  ]);

  const cost = computeCost(terms);
  const market = compareToMarket(terms.monthlyRent, terms.bedrooms, fmr, comps);
  const ownership =
    terms.address === null
      ? { status: "not_checked" as const, claimedLandlord: terms.landlordName, record: null, detail: "No address found, so ownership was not checked." }
      : checkOwnership(terms.landlordName, record);

  const flags = evaluateRules({ terms, cost, market, ownership });
  return { terms, cost, market, ownership, flags, verdict: deriveVerdict(flags, cost) };
}
