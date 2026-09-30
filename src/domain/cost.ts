import type { Cadence, Cents, CostBreakdown, ExtractedTerms } from "./types";

const DEFAULT_TERM_MONTHS = 12;

function monthlyEquivalent(amount: Cents, cadence: Cadence, termMonths: number): Cents {
  switch (cadence) {
    case "monthly":
      return amount;
    case "annual":
      return Math.round(amount / 12);
    case "one_time":
      return Math.round(amount / termMonths);
    default: {
      const exhaustive: never = cadence;
      return exhaustive;
    }
  }
}

/**
 * Deposits are excluded from monthly cost because they are (supposed to be)
 * refundable; they only count toward move-in cash. Non-refundable "deposits"
 * are treated as one-time fees.
 */
export function computeCost(terms: ExtractedTerms): CostBreakdown | null {
  if (terms.monthlyRent === null) return null;

  const termMonths = terms.leaseTermMonths ?? DEFAULT_TERM_MONTHS;
  const rent = terms.monthlyRent;

  let recurringFees = 0;
  let amortizedOneTimeFees = 0;
  let oneTimeCash = 0;

  for (const fee of terms.fees) {
    if (fee.category === "deposit" && fee.refundable) {
      oneTimeCash += fee.amount;
      continue;
    }
    const monthly = monthlyEquivalent(fee.amount, fee.cadence, termMonths);
    if (fee.cadence === "one_time") {
      amortizedOneTimeFees += monthly;
      oneTimeCash += fee.amount;
    } else {
      recurringFees += monthly;
    }
  }

  const trueMonthlyCost = rent + recurringFees + amortizedOneTimeFees;
  const moveInCash = rent + (terms.securityDeposit ?? 0) + oneTimeCash;

  return {
    rent,
    recurringFees,
    amortizedOneTimeFees,
    trueMonthlyCost,
    moveInCash,
    hiddenCostRatio: (trueMonthlyCost - rent) / rent,
    termMonths,
  };
}
