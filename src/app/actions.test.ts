import { beforeEach, describe, expect, it, vi } from "vitest";
import { analyze } from "@/domain/analyze";
import { analyzeAction } from "./actions";
import { MAX_TEXT_LENGTH } from "./analyzeInput";

vi.mock("@/domain/analyze", () => ({
  analyze: vi.fn(),
}));

const analyzeMock = vi.mocked(analyze);

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

const text = "x".repeat(40);

describe("analyzeAction", () => {
  beforeEach(() => {
    analyzeMock.mockReset();
    analyzeMock.mockResolvedValue({} as Awaited<ReturnType<typeof analyze>>);
  });

  it("rejects a short paste and a document over the cap", async () => {
    expect(await analyzeAction(null, form({ text: "too short" }))).toEqual({
      error: "Paste at least a few sentences of the lease or listing.",
    });
    expect(await analyzeAction(null, form({ text: "y".repeat(MAX_TEXT_LENGTH + 1) }))).toEqual({
      error: "Paste at most 50,000 characters.",
    });
    expect(analyzeMock).not.toHaveBeenCalled();
  });

  it("rejects a bedroom value that is not a whole number from 0 to 6", async () => {
    for (const bedrooms of ["abc", "2.5", "NaN", "7"]) {
      const result = await analyzeAction(null, form({ text, bedrooms }));
      expect(result).toEqual({ error: "Bedrooms must be a whole number from 0 to 6." });
    }
    expect(analyzeMock).not.toHaveBeenCalled();
  });

  it("leaves bedrooms unset when the field is blank and passes 0 through", async () => {
    await analyzeAction(null, form({ text, bedrooms: "   " }));
    expect(analyzeMock.mock.calls[0][0].bedrooms).toBeUndefined();

    await analyzeAction(null, form({ text, bedrooms: "0" }));
    expect(analyzeMock.mock.calls[1][0].bedrooms).toBe(0);
  });

  it("returns an error when analysis throws", async () => {
    analyzeMock.mockRejectedValue(new Error("upstream"));
    expect(await analyzeAction(null, form({ text }))).toEqual({
      error: "Could not analyze that document. Try again.",
    });
  });
});
