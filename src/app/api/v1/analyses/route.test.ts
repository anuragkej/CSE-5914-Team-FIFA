import { afterEach, describe, expect, it, vi } from "vitest";
import { createPorts } from "@/adapters";
import { sampleDocuments } from "@/adapters/mock/sampleDocuments";
import * as domain from "@/domain/analyze";
import { POST } from "./route";

function request(body: unknown) {
  return new Request("http://localhost/api/v1/analyses", {
    method: "POST", headers: { "Content-Type": "application/json; charset=utf-8" }, body: JSON.stringify(body),
  });
}

afterEach(() => vi.restoreAllMocks());

describe("POST /api/v1/analyses", () => {
  it.each(sampleDocuments)("returns the shared analysis for $id", async ({ text }) => {
    const response = await POST(request({ text }));
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({ analysis: await domain.analyze({ text }, createPorts()) });
  });

  it("applies overrides and returns money in cents", async () => {
    const response = await POST(request({ text: sampleDocuments[0].text, bedrooms: 0, landlordName: " Another owner " }));
    const { analysis } = await response.json();
    expect(analysis.terms.bedrooms).toBe(0);
    expect(analysis.terms.landlordName).toBe("Another owner");
    expect(analysis.terms.monthlyRent).toBe(145000);
    expect(analysis.cost.trueMonthlyCost).toBe(155750);
  });

  it("names invalid fields before running analysis", async () => {
    const spy = vi.spyOn(domain, "analyze");
    const response = await POST(request({ text: "short", bedrooms: 1.5 }));
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: { code: "INVALID_INPUT", issues: [{ field: "text" }, { field: "bedrooms" }] } });
    expect(spy).not.toHaveBeenCalled();
  });

  it("rejects malformed JSON", async () => {
    const response = await POST(new Request("http://localhost/api/v1/analyses", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: "{",
    }));
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: { code: "INVALID_JSON" } });
  });

  it("rejects non-JSON requests", async () => {
    const response = await POST(new Request("http://localhost/api/v1/analyses", { method: "POST", body: "text" }));
    expect(response.status).toBe(415);
    expect(await response.json()).toMatchObject({ error: { code: "UNSUPPORTED_MEDIA_TYPE" } });
  });

  it("does not expose adapter failures or lease text", async () => {
    vi.spyOn(domain, "analyze").mockRejectedValueOnce(new Error("private lease text or provider credentials"));
    const response = await POST(request({ text: sampleDocuments[0].text }));
    expect(response.status).toBe(500);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({ error: { code: "ANALYSIS_FAILED", message: "Could not analyze this document. Please try again." } });
  });
});
