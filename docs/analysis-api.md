# Analysis API (Timebox 2)

`POST /api/v1/analyses` exposes the existing analysis pipeline for future comparison, chatbot, and evaluation clients. The web form and API share input validation and call the same `analyze` orchestrator through `createPorts()`. No second backend or new dependency is required.

This is a stateless prototype: it uses the existing regex extractor and fixture market/property adapters. It does not save a document, create an analysis ID, authenticate users, or call an AI model. Persistence and live adapters can follow without changing the domain pipeline.

## Request

Send `Content-Type: application/json` and a JSON object:

| Field | Type | Validation |
| --- | --- | --- |
| `text` | string, required | 40–100,000 characters after trimming |
| `address` | string, optional | Trimmed; blank falls back to extraction |
| `bedrooms` | number, optional | Integer 0–6; 0 means studio |
| `landlordName` | string, optional | Trimmed; blank falls back to extraction |

Overrides take precedence over extracted values. Omit optional values rather than sending `null`. JSON numbers are not coerced from strings. Unrecognized fields are ignored.

```bash
curl -i http://localhost:3000/api/v1/analyses \
  -H 'Content-Type: application/json' \
  --data '{"text":"A 2 bedroom apartment. Monthly rent of $1,200. Lease term is 12 months.","bedrooms":2}'
```

## Response

Success is `200 OK` with `{ "analysis": Analysis }`. `Analysis` is defined in `src/domain/types.ts` and includes `terms`, `cost`, `market`, `ownership`, `flags`, and `verdict`. All monetary values are integer cents; unavailable data remains `null`. For example, $1,200 rent is `120000`. A successful response can contain an incomplete verdict if extraction cannot find rent.

Responses include `Cache-Control: no-store`. Analyses are computed, not persisted, so success uses 200 rather than 201.

## Errors

| Status | Code | Meaning |
| --- | --- | --- |
| 400 | `INVALID_JSON` | Body cannot be parsed as JSON |
| 400 | `INVALID_INPUT` | Body or one or more fields are invalid |
| 415 | `UNSUPPORTED_MEDIA_TYPE` | Content type is not `application/json` |
| 500 | `ANALYSIS_FAILED` | Analysis pipeline failed; no internal details returned |

Input errors identify each invalid field, for example:

```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "Check the indicated fields.",
    "issues": [
      {
        "field": "bedrooms",
        "message": "Bedrooms must be a whole number from 0 to 6 (0 means studio)."
      }
    ]
  }
}
```

Body/content-type errors use `field: "body"`. Internal failures return only a generic code and message. This endpoint does not log lease text. The text length limit applies after JSON parsing; it is not a transport body-size limit. Authentication, rate limits, and deployment request-size limits remain future deployment work.

## Demo and verification

Run `npm run dev`, then send the request above. Change `bedrooms` to `1.5` to demonstrate a field-specific 400 response. The existing form still works and now rejects invalid overrides using the same validation.

`npm test` covers all three sample documents through the endpoint, override behavior, cents, invalid inputs, malformed JSON, media types, and adapter failures. Existing domain tests continue to verify costs, flags, market comparison, and ownership.
