import type { PropertyRecordsProvider } from "@/domain/ports";
import type { PropertyRecord } from "@/domain/types";
import parcels from "./fixtures/franklin-parcels.json";

const records = parcels as PropertyRecord[];

function streetKey(address: string): string {
  return address
    .toLowerCase()
    .replace(/\b(apt|unit|#)\s*[\w-]+/g, "")
    .replace(/[.,]/g, "")
    .replace(/\bstreet\b/g, "st")
    .replace(/\bavenue\b/g, "ave")
    .replace(/\s+/g, " ")
    .split(" columbus")[0]
    .trim();
}

/** Stands in for the Franklin County Auditor parcel data (bulk CSV or API). */
export class FixturePropertyRecords implements PropertyRecordsProvider {
  async findByAddress(address: string): Promise<PropertyRecord | null> {
    const key = streetKey(address);
    return records.find((r) => streetKey(r.siteAddress) === key) ?? null;
  }
}
