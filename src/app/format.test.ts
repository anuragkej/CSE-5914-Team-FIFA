import { describe, expect, it } from "vitest";
import { MISSING, money } from "./format";

describe("money", () => {
  it("keeps whole dollars bare and shows cents otherwise", () => {
    expect(money(null)).toBe(MISSING);
    expect(money(145000)).toBe("$1,450");
    expect(money(0)).toBe("$0");
    expect(money(4550)).toBe("$45.50");
    expect(money(50)).toBe("$0.50");
  });
});
