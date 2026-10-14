import { MAX_BEDROOMS, MIN_BEDROOMS } from "@/domain/bedrooms";
import type { AnalysisInput } from "@/domain/types";

export const MIN_TEXT_LENGTH = 40;
export const MAX_TEXT_LENGTH = 50_000;

export function readAnalyzeForm(formData: FormData): { input: AnalysisInput } | { error: string } {
  const text = String(formData.get("text") ?? "").trim();
  if (text.length < MIN_TEXT_LENGTH) {
    return { error: "Paste at least a few sentences of the lease or listing." };
  }
  if (text.length > MAX_TEXT_LENGTH) {
    return { error: `Paste at most ${MAX_TEXT_LENGTH.toLocaleString("en-US")} characters.` };
  }

  const bedrooms = readBedrooms(formData.get("bedrooms"));
  if (bedrooms === "invalid") {
    return { error: `Bedrooms must be a whole number from ${MIN_BEDROOMS} to ${MAX_BEDROOMS}.` };
  }

  return {
    input: {
      text,
      address: String(formData.get("address") ?? ""),
      bedrooms,
      landlordName: String(formData.get("landlordName") ?? ""),
    },
  };
}

function readBedrooms(raw: FormDataEntryValue | null): number | undefined | "invalid" {
  const text = String(raw ?? "").trim();
  if (text.length === 0) return undefined;
  if (!/^\d+$/.test(text)) return "invalid";
  const value = Number(text);
  if (value < MIN_BEDROOMS || value > MAX_BEDROOMS) return "invalid";
  return value;
}
