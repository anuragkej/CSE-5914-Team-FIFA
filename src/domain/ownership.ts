import type { OwnershipCheck, PropertyRecord } from "./types";

const NOISE = /\b(llc|l\.l\.c\.|inc|ltd|co|company|properties|property|management|mgmt|holdings|group|trust|the)\b|[.,'&]/g;

export function normalizeName(name: string): string[] {
  return name
    .toLowerCase()
    .replace(NOISE, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1);
}

/** Two names "match" when they share at least one meaningful token. Crude on purpose; an LLM or fuzzy matcher can replace it. */
export function namesOverlap(a: string, b: string): boolean {
  const tokensA = new Set(normalizeName(a));
  return normalizeName(b).some((token) => tokensA.has(token));
}

export function checkOwnership(
  claimedLandlord: string | null,
  record: PropertyRecord | null,
): OwnershipCheck {
  if (record === null) {
    return {
      status: "no_record",
      claimedLandlord,
      record: null,
      detail: "No parcel record found for this address. The address may be wrong or outside the county.",
    };
  }
  if (claimedLandlord === null) {
    return {
      status: "not_checked",
      claimedLandlord: null,
      record,
      detail: `Parcel owner on record is ${record.ownerName}. No landlord name was found in the document to compare.`,
    };
  }
  if (namesOverlap(claimedLandlord, record.ownerName)) {
    return {
      status: "match",
      claimedLandlord,
      record,
      detail: `Landlord "${claimedLandlord}" matches parcel owner "${record.ownerName}".`,
    };
  }
  return {
    status: "mismatch",
    claimedLandlord,
    record,
    detail: `Document names "${claimedLandlord}" but the county lists "${record.ownerName}" as owner. Ask for proof of authority to lease (management agreement or sublease consent).`,
  };
}
