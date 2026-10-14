export const MIN_BEDROOMS = 0;
export const MAX_BEDROOMS = 6;

/**
 * A caller-supplied bedroom count may replace the extracted one only when it is
 * a whole number in range. NaN and 2.5 both fail Number.isInteger, so they
 * cannot wipe out the count read from the lease.
 */
export function bedroomOverride(value: number | undefined): number | undefined {
  if (typeof value !== "number" || !Number.isInteger(value)) return undefined;
  if (value < MIN_BEDROOMS || value > MAX_BEDROOMS) return undefined;
  return value;
}
