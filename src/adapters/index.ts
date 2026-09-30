import type { AnalysisPorts } from "@/domain/ports";
import { FixtureMarketData } from "./mock/fixtureMarketData";
import { FixturePropertyRecords } from "./mock/fixturePropertyRecords";
import { RuleBasedExtractor } from "./mock/ruleBasedExtractor";

/**
 * Composition root. Swap any adapter here (e.g. a GeminiExtractor, HudFmrClient,
 * FranklinParcelClient) and nothing in domain/ or app/ needs to change.
 */
export function createPorts(): AnalysisPorts {
  return {
    extractor: new RuleBasedExtractor(),
    market: new FixtureMarketData(),
    propertyRecords: new FixturePropertyRecords(),
  };
}
