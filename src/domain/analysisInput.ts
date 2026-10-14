import type { AnalysisInput } from "./types";

export const MIN_TEXT_LENGTH = 40;
export const MAX_TEXT_LENGTH = 100_000;

export interface InputIssue {
  field: keyof AnalysisInput | "body";
  message: string;
}

type InputResult =
  | { ok: true; input: AnalysisInput }
  | { ok: false; issues: InputIssue[] };

/** Shared boundary for JSON requests and form submissions; no coercion of JSON values. */
export function validateAnalysisInput(value: unknown): InputResult {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return { ok: false, issues: [{ field: "body", message: "Expected a JSON object." }] };
  }

  const data = value as Record<string, unknown>;
  const issues: InputIssue[] = [];
  const input: AnalysisInput = { text: "" };
  if (typeof data.text !== "string") {
    issues.push({ field: "text", message: "Text must be a string." });
  } else {
    input.text = data.text.trim();
    if (input.text.length < MIN_TEXT_LENGTH) {
      issues.push({ field: "text", message: "Paste at least a few sentences of the lease or listing (40 characters)." });
    } else if (input.text.length > MAX_TEXT_LENGTH) {
      issues.push({ field: "text", message: "Text must be at most 100,000 characters." });
    }
  }

  for (const field of ["address", "landlordName"] as const) {
    if (data[field] === undefined) continue;
    if (typeof data[field] !== "string") {
      issues.push({ field, message: `${field} must be a string.` });
    } else {
      const trimmed = data[field].trim();
      if (trimmed) input[field] = trimmed;
    }
  }

  if (data.bedrooms !== undefined) {
    if (typeof data.bedrooms !== "number" || !Number.isInteger(data.bedrooms) || data.bedrooms < 0 || data.bedrooms > 6) {
      issues.push({ field: "bedrooms", message: "Bedrooms must be a whole number from 0 to 6 (0 means studio)." });
    } else {
      input.bedrooms = data.bedrooms;
    }
  }

  return issues.length ? { ok: false, issues } : { ok: true, input };
}
