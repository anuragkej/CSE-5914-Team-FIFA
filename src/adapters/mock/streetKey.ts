/** Compare "2115 Summit St, Apt 2, Columbus, OH 43201" with "2115 Summit St". */
export function streetKey(address: string): string {
  return address
    .toLowerCase()
    .replace(/\b(apt|unit|#)\s*[\w-]+/g, "")
    .replace(/[.,]/g, "")
    .replace(/\bstreet\b/g, "st")
    .replace(/\bavenue\b/g, "ave")
    .replace(/\s+/g, " ")
    .split(" columbus")[0]
    .trim();
}
