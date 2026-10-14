import type { Analysis, Cents, Flag } from "./types";

export type QuestionContext = Omit<Analysis, "questions" | "verdict">;

type Ask = (ctx: QuestionContext, flag: Flag) => string[];

const TOUR_FIRST = "Can I tour the unit in person before I pay anything?";

function dollars(cents: Cents): string {
  return `$${(cents / 100).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

/** One entry per flag code in rules.ts. A code with no entry asks nothing. */
const ASKS: Record<string, Ask> = {
  ATTORNEY_FEES_CLAUSE: () => [
    "Will you remove the clause that makes me pay your attorney's fees? Ohio does not enforce it in a residential lease (ORC 5321.13(C)).",
  ],
  CONFESSION_OF_JUDGMENT: () => [
    "Will you strike the confession of judgment clause? It is void in an Ohio rental agreement (ORC 5321.13(B)).",
  ],
  LANDLORD_LIABILITY_WAIVER: () => [
    "Will you remove the clause that waives your liability for the condition of the unit? Ohio voids it (ORC 5321.13(D)).",
  ],
  P2P_PAYMENT_REQUEST: (ctx) => [
    TOUR_FIRST,
    `Can I pay by check or through a property management portal instead of ${ctx.terms.paymentMethods.join(" or ")}?`,
  ],
  OWNERSHIP_MISMATCH: (ctx) => [
    `County records list ${ctx.ownership.record?.ownerName ?? "someone else"} as the owner. Can you show a management agreement or the owner's written consent to sublease?`,
  ],
  NO_PARCEL_RECORD: () => ["What is the exact street address and unit number, as the county auditor lists it?"],
  DEPOSIT_OVER_TWO_MONTHS: () => [
    "Can the security deposit be lowered to one month's rent?",
    "Will the part of the deposit above one month's rent earn the 5% yearly interest Ohio requires (ORC 5321.16(A)), and when is it paid?",
  ],
  DEPOSIT_OVER_ONE_MONTH: () => [
    "Will the part of the deposit above one month's rent earn the 5% yearly interest Ohio requires (ORC 5321.16(A)), and when is it paid?",
  ],
  NON_REFUNDABLE_DEPOSIT: (ctx) => {
    const fee = ctx.terms.fees.find((f) => f.category === "deposit" && !f.refundable);
    return [`What does the ${fee?.label ?? "non-refundable deposit"} pay for, and can it be refunded or removed?`];
  },
  RENT_FAR_BELOW_MARKET: () => [TOUR_FIRST],
  RENT_ABOVE_MARKET: (ctx) =>
    ctx.market.compMedian === null
      ? []
      : [`Similar units nearby rent for about ${dollars(ctx.market.compMedian)}. Is there room to lower the rent?`],
  HIGH_HIDDEN_COSTS: () => ["Which of these fees are optional, and can any of them be waived?"],
  HIGH_LATE_FEE: () => ["Can the late fee be lowered, or the grace period made longer?"],
  AUTO_RENEWAL: () => ["What is the last day I can give notice so the lease does not renew, and does it have to be in writing?"],
  RENT_NOT_FOUND: () => ["What is the monthly rent, and is it the same every month of the lease?"],
};

/**
 * Turns the report into questions a student can send the landlord before signing.
 * Follows flag order (most severe first), then adds two that apply to every lease.
 */
export function questionsFor(ctx: QuestionContext): string[] {
  const questions = ctx.flags.flatMap((flag) => ASKS[flag.code]?.(ctx, flag) ?? []);
  if (ctx.cost) {
    questions.push(
      `Can you confirm ${dollars(ctx.cost.moveInCash)} is everything due at move-in, including first month's rent, the deposit, and one-time fees?`,
    );
  }
  questions.push("Which utilities are not included in the rent, and what do they usually cost each month?");
  return [...new Set(questions)];
}
