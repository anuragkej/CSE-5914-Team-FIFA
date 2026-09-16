import { describe, expect, it } from "vitest";
import { checkOwnership, namesOverlap } from "./ownership";
import type { PropertyRecord } from "./types";

const record: PropertyRecord = {
  parcelId: "010-041233-00",
  siteAddress: "2115 Summit St, Columbus, OH 43201",
  ownerName: "BUCKEYE CAMPUS PROPERTIES LLC",
  ownerMailingAddress: "PO Box 8213, Columbus, OH 43201",
  lastTransferDate: "2019-06-14",
  source: "test",
};

describe("namesOverlap", () => {
  it("ignores entity suffixes and case", () => {
    expect(namesOverlap("Buckeye Campus Properties LLC", "BUCKEYE CAMPUS PROPERTIES LLC")).toBe(true);
    expect(namesOverlap("Buckeye Campus", "BUCKEYE HOLDINGS LLC")).toBe(true);
  });
  it("does not match on suffix-only overlap", () => {
    expect(namesOverlap("Marcus Bell", "TWELFTH AVENUE HOLDINGS LLC")).toBe(false);
    expect(namesOverlap("Lane Properties LLC", "Summit Properties LLC")).toBe(false);
  });
});

describe("checkOwnership", () => {
  it("matches, mismatches, and reports missing records", () => {
    expect(checkOwnership("Buckeye Campus Properties LLC", record).status).toBe("match");
    expect(checkOwnership("Marcus Bell", record).status).toBe("mismatch");
    expect(checkOwnership("Marcus Bell", null).status).toBe("no_record");
    expect(checkOwnership(null, record).status).toBe("not_checked");
  });
});
