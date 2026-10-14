import { createPorts } from "@/adapters";
import { analyze } from "@/domain/analyze";
import { validateAnalysisInput } from "@/domain/analysisInput";

// Lease text and reports should not be cached by clients or intermediaries.
const headers = { "Cache-Control": "no-store" };

export async function POST(request: Request): Promise<Response> {
  const contentType = request.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
  if (contentType !== "application/json") {
    return Response.json(
      { error: { code: "UNSUPPORTED_MEDIA_TYPE", message: "Send application/json.", issues: [{ field: "body", message: "Expected application/json." }] } },
      { status: 415, headers },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: { code: "INVALID_JSON", message: "Request body is not valid JSON.", issues: [{ field: "body", message: "Expected valid JSON." }] } },
      { status: 400, headers },
    );
  }

  const result = validateAnalysisInput(body);
  if (!result.ok) {
    return Response.json(
      { error: { code: "INVALID_INPUT", message: "Check the indicated fields.", issues: result.issues } },
      { status: 400, headers },
    );
  }

  try {
    const analysis = await analyze(result.input, createPorts());
    return Response.json({ analysis }, { status: 200, headers });
  } catch {
    return Response.json(
      { error: { code: "ANALYSIS_FAILED", message: "Could not analyze this document. Please try again." } },
      { status: 500, headers },
    );
  }
}
