"use server";

import { createPorts } from "@/adapters";
import { analyze } from "@/domain/analyze";
import type { Analysis } from "@/domain/types";

export type AnalyzeState = { analysis: Analysis; error?: undefined } | { analysis?: undefined; error: string } | null;

const MIN_TEXT_LENGTH = 40;

export async function analyzeAction(_prev: AnalyzeState, formData: FormData): Promise<AnalyzeState> {
  const text = String(formData.get("text") ?? "").trim();
  if (text.length < MIN_TEXT_LENGTH) {
    return { error: "Paste at least a few sentences of the lease or listing." };
  }
  const bedroomsRaw = String(formData.get("bedrooms") ?? "").trim();
  const analysis = await analyze(
    {
      text,
      address: String(formData.get("address") ?? ""),
      bedrooms: bedroomsRaw ? Number(bedroomsRaw) : undefined,
      landlordName: String(formData.get("landlordName") ?? ""),
    },
    createPorts(),
  );
  return { analysis };
}
