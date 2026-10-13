import { describe, expect, it } from "vitest";
import { FixtureMarketData } from "./fixtureMarketData";

const market = new FixtureMarketData();

describe("FixtureMarketData comparables", () => {
  it("drops the subject and prefers its neighborhood when enough comps remain", async () => {
    const comps = await market.comparables({
      bedrooms: 2,
      address: "2115 Summit St, Apt 2, Columbus, OH 43201",
      limit: 6,
    });
    expect(comps.map((c) => c.id)).toEqual(["L002", "L003", "L004", "L006"]);
  });

  it("falls back to every same-size comp when the neighborhood set is thin", async () => {
    const comps = await market.comparables({
      bedrooms: 1,
      address: "99 W Lane Ave, Columbus, OH 43201",
      limit: 6,
    });
    expect(comps.map((c) => c.id)).toEqual(["L008", "L009", "L010", "L011"]);
  });

  it("still honors an explicit neighborhood", async () => {
    const comps = await market.comparables({
      bedrooms: 2,
      neighborhood: "Weinland Park",
      address: "2115 Summit St, Columbus, OH 43201",
      limit: 6,
    });
    expect(comps.map((c) => c.id)).toEqual(["L005"]);
  });

  it("keeps every same-size listing when the address is not in the fixture", async () => {
    const comps = await market.comparables({
      bedrooms: 2,
      address: "83 E 12th Ave, Columbus, OH 43201",
      limit: 6,
    });
    expect(comps.map((c) => c.id)).toEqual(["L001", "L002", "L003", "L004", "L005", "L006"]);
  });
});
