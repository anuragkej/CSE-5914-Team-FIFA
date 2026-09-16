# LeaseLens (CSE 5914 Team FIFA)

Paste a lease or an apartment listing, get the true monthly cost, every fee, a comparison to nearby Columbus units, an ownership check against county records, and flags for anything Ohio law says should not be in there.

Prototype status: runs end to end on fixture data. No live APIs are wired yet; every external source sits behind a port so it can be swapped in without touching the UI or the rules.

Docs: [project context](docs/project-context.md), [API research](docs/api-research.md), [decisions](docs/decisions.md), [open questions](docs/open-questions.md).

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # vitest, 16 tests
npm run typecheck
npm run lint
npm run build && npm start
```

Node 20+.

## Architecture

```
src/
  domain/          owned logic, no framework imports
    types.ts       entities: ExtractedTerms, Fee, Clause, CostBreakdown, Flag, Analysis,
                   plus external shapes FairMarketRent, Comparable, PropertyRecord
    ports.ts       TermsExtractor, MarketDataProvider, PropertyRecordsProvider
    cost.ts        true monthly cost and move-in cash
    market.ts      comps median, HUD FMR delta, verdict
    ownership.ts   landlord name vs county owner
    rules.ts       flag rules with Ohio Revised Code citations
    analyze.ts     orchestrates the above through the ports
    *.test.ts      literal-value tests
  adapters/
    index.ts       composition root: which adapter fills each port
    mock/
      ruleBasedExtractor.ts   regex extraction; also the offline fallback once an LLM adapter exists
      fixtureMarketData.ts    HUD FY2026 Columbus FMR (real) + synthetic campus-area comps
      fixturePropertyRecords.ts  parcel lookup shaped like the Franklin County Auditor CSV
      sampleDocuments.ts      three sample inputs used by the UI and tests
    verdict.ts     one-line answer derived from the flags
  app/             Next.js App Router: page, server action, form, report
  components/ui/   shadcn/ui components, copied in as source (nova preset)
```

Data flow: `AnalyzerForm` (client) submits to `analyzeAction` (server action) which calls `analyze(input, createPorts())`. `analyze` extracts terms, fetches FMR, comps and the parcel record in parallel, computes cost, compares to market, checks ownership, evaluates rules, and returns one `Analysis` object the `Report` renders.

## Where adapters plug in

Implement the interface in `src/domain/ports.ts`, then change one line in `src/adapters/index.ts`.

| Port | Today | Next |
| --- | --- | --- |
| `TermsExtractor` | `RuleBasedExtractor` (regex) | `GeminiExtractor` with a JSON schema for `ExtractedTerms`; keep the regex one as fallback |
| `MarketDataProvider` | JSON fixtures | HUD FMR API + RentCast comparables, cached in Postgres |
| `PropertyRecordsProvider` | JSON fixture | Franklin County Parcel CSV imported into Supabase |

Nothing in `src/domain/` or `src/app/` changes when an adapter is swapped. The tests in `src/domain/analyze.test.ts` run against whatever `createPorts()` returns, so they double as a contract test for a new adapter (expect them to need new fixtures, not new assertions).

## What is real and what is synthetic

- Real: HUD FY2026 Fair Market Rents for the Columbus metro. Ohio Revised Code 5321.13 and 5321.16 as encoded in `rules.ts`.
- Synthetic: the 18 comparable listings, the 3 parcel records, the 3 sample documents. Addresses are real campus-area streets; rents, owners and parcel IDs are invented to be plausible.

Not legal advice.
