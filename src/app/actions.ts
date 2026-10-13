"use server";

import { createPorts } from "@/adapters";
import { analyze } from "@/domain/analyze";
import type { Analysis } from "@/domain/types";
import { readAnalyzeForm } from "./analyzeInput";

export type AnalyzeState = { analysis: Analysis; error?: undefined } | { analysis?: undefined; error: string } | null;

export async function analyzeAction(_prev: AnalyzeState, formData: FormData): Promise<AnalyzeState> {
  const parsed = readAnalyzeForm(formData);
  if ("error" in parsed) return parsed;
  try {
    const analysis = await analyze(parsed.input, createPorts());
    return { analysis };
  } catch {
    return { error: "Could not analyze that document. Try again." };
  }
}
