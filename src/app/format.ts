import type { Cadence, Cents } from "@/domain/types";

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export const MISSING = "—";

export function money(cents: Cents | null): string {
  return cents === null ? MISSING : usd.format(cents / 100);
}

export function percent(fraction: number): string {
  return `${Math.round(fraction * 100)}%`;
}

export function signedPercent(fraction: number | null): string {
  if (fraction === null) return MISSING;
  const whole = Math.round(fraction * 100);
  return `${whole > 0 ? "+" : ""}${whole}%`;
}

export const cadenceLabel: Record<Cadence, string> = {
  monthly: "per month",
  annual: "per year",
  one_time: "one time",
};
