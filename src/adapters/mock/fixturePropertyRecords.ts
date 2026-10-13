import type { PropertyRecordsProvider } from "@/domain/ports";
import type { PropertyRecord } from "@/domain/types";
import parcels from "./fixtures/franklin-parcels.json";
import { streetKey } from "./streetKey";

const records = parcels as PropertyRecord[];

/** Stands in for the Franklin County Auditor parcel data (bulk CSV or API). */
export class FixturePropertyRecords implements PropertyRecordsProvider {
  async findByAddress(address: string): Promise<PropertyRecord | null> {
    const key = streetKey(address);
    return records.find((r) => streetKey(r.siteAddress) === key) ?? null;
  }
}
