import { describe, expect, it } from "vitest";
import { createPorts } from "@/adapters";
import { sampleDocuments } from "@/adapters/mock/sampleDocuments";
import { analyze } from "./analyze";
import { questionsFor, type QuestionContext } from "./questions";

const ports = createPorts();
const doc = (id: string) => sampleDocuments.find((d) => d.id === id)!.text;

const UTILITIES = "Which utilities are not included in the rent, and what do they usually cost each month?";

const empty: QuestionContext = {
  terms: {
    address: null,
    bedrooms: null,
    landlordName: null,
    monthlyRent: null,
    securityDeposit: null,
    leaseTermMonths: null,
    fees: [],
    clauses: [],
    paymentMethods: [],
  },
  cost: null,
  market: { fmr: null, fmrDeltaPct: null, compMedian: null, compDeltaPct: null, comps: [], verdict: "unknown" },
  ownership: { status: "not_checked", claimedLandlord: null, record: null, detail: "" },
  flags: [],
};

describe("questionsFor", () => {
  it("asks only the universal utilities question when nothing is known", () => {
    expect(questionsFor(empty)).toEqual([UTILITIES]);
  });

  it("skips the market question when there is no comp median", () => {
    const ctx = { ...empty, flags: [{ code: "RENT_ABOVE_MARKET", severity: "warning" as const, title: "", detail: "" }] };
    expect(questionsFor(ctx)).toEqual([UTILITIES]);
  });

  it("ignores flag codes it has no question for", () => {
    const ctx = { ...empty, flags: [{ code: "SOMETHING_NEW", severity: "info" as const, title: "", detail: "" }] };
    expect(questionsFor(ctx)).toEqual([UTILITIES]);
  });
});

describe("questionsFor via analyze", () => {
  it("gives a clean lease only the move-in and utilities questions", async () => {
    const result = await analyze({ text: doc("standard-lease") }, ports);
    expect(result.questions).toEqual([
      "Can you confirm $3,050 is everything due at move-in, including first month's rent, the deposit, and one-time fees?",
      UTILITIES,
    ]);
  });

  it("turns the sublease red flags into questions, most severe first, without repeats", async () => {
    const result = await analyze({ text: doc("suspicious-sublease") }, ports);
    expect(result.questions).toEqual([
      "Will you remove the clause that makes me pay your attorney's fees? Ohio does not enforce it in a residential lease (ORC 5321.13(C)).",
      "Will you remove the clause that waives your liability for the condition of the unit? Ohio voids it (ORC 5321.13(D)).",
      "Can I tour the unit in person before I pay anything?",
      "Can I pay by check or through a property management portal instead of Zelle or Cash App?",
      "County records list TWELFTH AVENUE HOLDINGS LLC as the owner. Can you show a management agreement or the owner's written consent to sublease?",
      "Can the security deposit be lowered to one month's rent?",
      "Will the part of the deposit above one month's rent earn the 5% yearly interest Ohio requires (ORC 5321.16(A)), and when is it paid?",
      "What does the non-refundable cleaning deposit pay for, and can it be refunded or removed?",
      "Can the late fee be lowered, or the grace period made longer?",
      "What is the last day I can give notice so the lease does not renew, and does it have to be in writing?",
      "Can you confirm $3,045 is everything due at move-in, including first month's rent, the deposit, and one-time fees?",
      UTILITIES,
    ]);
  });

  it("asks about fees and rent for an expensive listing", async () => {
    const result = await analyze({ text: doc("pasted-listing") }, ports);
    expect(result.questions).toContain("Which of these fees are optional, and can any of them be waived?");
    expect(result.questions.some((q) => q.startsWith("Similar units nearby rent for about $"))).toBe(true);
    expect(result.questions).toContain("What is the exact street address and unit number, as the county auditor lists it?");
  });
});
