"use server";

import { createPorts } from "@/adapters";
import { analyze } from "@/domain/analyze";
import { validateAnalysisInput } from "@/domain/analysisInput";
import type { Analysis } from "@/domain/types";

export type AnalyzeState = { analysis: Analysis; error?: undefined } | { analysis?: undefined; error: string } | null;

export async function analyzeAction(_prev: AnalyzeState, formData: FormData): Promise<AnalyzeState> {
  const bedroomsRaw = formData.get("bedrooms");
  const bedrooms = typeof bedroomsRaw === "string" ? bedroomsRaw.trim() : bedroomsRaw;
  const result = validateAnalysisInput({
    text: formData.get("text"),
    address: formData.get("address") ?? undefined,
    bedrooms: bedrooms === null || bedrooms === ""
      ? undefined
      : typeof bedrooms === "string" ? Number(bedrooms) : bedrooms,
    landlordName: formData.get("landlordName") ?? undefined,
  });
  if (!result.ok) {
    return { error: result.issues.map((issue) => `${issue.field}: ${issue.message}`).join(" ") };
  }
  try {
    const analysis = await analyze(result.input, createPorts());
    return { analysis };
  } catch {
    return { error: "Could not analyze this document. Please try again." };
  }
}
