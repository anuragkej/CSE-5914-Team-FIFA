import type { Cadence, Cents } from "@/domain/types";

const wholeDollars = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const withCents = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const MISSING = "—";

export function money(cents: Cents | null): string {
  if (cents === null) return MISSING;
  const format = cents % 100 === 0 ? wholeDollars : withCents;
  return format.format(cents / 100);
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
