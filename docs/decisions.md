# Decisions

## Stack: Next.js 16 + React 19 + TypeScript + shadcn/ui

Anurag confirmed the team knows React, TypeScript and Next.js, and the slides name Next.js + TypeScript with Supabase. The prototype is a single Next.js app: server actions call the domain layer, which calls adapters. There is no separate Python FastAPI service even though the slides list one. The talk never mentioned it, every job it was assigned (parse documents, score deals, run a rule engine) is done here in TypeScript in under 600 lines, and a second language doubles the deploy surface for a five-person team with no ops budget. If pgvector RAG over lease clauses becomes real, Supabase's `pgvector` is reachable from TypeScript too. Vitest for tests because it reads the same `tsconfig` paths and needs no Babel or Jest config. No ORM, no state manager.

UI is shadcn/ui (nova preset, Base UI primitives, Tailwind v4). Components are copied into `src/components/ui/` as source, so there is no runtime component dependency to upgrade and the team can edit any of them. shadcn ships one status color (destructive); the report needs three severities and four verdict tones, so `globals.css` adds `warning`, `info`, and `success` tokens and `Alert` and `Badge` get matching variants. Every mapping from a domain union to a variant, label, or icon is a `Record` table in the component that uses it.

## Report layout: verdict first, single column

Three layouts were sketched as throwaway HTML and screenshotted before the shadcn build: a stat-card dashboard, a split pane with the input pinned left and tabs on the right, and a single column that leads with a verdict. The dashboard reads as a generic admin page. The split pane hides fees, market, and ownership behind tabs, which is wrong for a report a student screenshots and sends to a friend. The single column won: verdict, then true cost, then flags, then details in an accordion. It is also the only one that needs no layout change at 390px.

## Domain model first, ports around it

`src/domain/types.ts` names the shapes. Owned: `ExtractedTerms`, `Fee`, `Clause`, `CostBreakdown`, `Flag`, `Analysis`. External: `FairMarketRent` (HUD), `Comparable` (listing provider), `PropertyRecord` (county). Three ports in `src/domain/ports.ts`: `TermsExtractor`, `MarketDataProvider`, `PropertyRecordsProvider`. `src/adapters/index.ts` is the only place that knows which implementation is wired. Swapping the mock extractor for Gemini touches one file and zero tests in `domain/`.

Money is integer cents everywhere. Missing data is `null`, never `0`.

## Rule engine is real code, not a mock

The slides call for "JSON rules plus Ohio landlord-tenant facts, not only an LLM." The rules in `src/domain/rules.ts` are plain functions over a typed context, each returning a `Flag` with a legal or data basis. They are the product, so they are tested with literal expected outputs. They were kept as TypeScript rather than JSON because a rule needs arithmetic and access to market data; a JSON DSL would be a second language to maintain.

## Extraction fork: deterministic rules vs LLM

Two viable designs for `TermsExtractor`: regex/keyword rules, or an LLM with a JSON schema. I built the deterministic one because it runs offline, is testable to the cent, and the slides want it as a layer anyway. It fails in predictable ways: a fee described across two sentences, or a rent stated as words, will be missed. The LLM adapter should be the next thing built, with the rule-based one kept as the fallback and as a cross-check (if the two disagree on rent, show both).

## Comps drive the market verdict, FMR is the floor

HUD FMR is a 40th-percentile figure for the whole metro, updated yearly. A campus-area 2BR at exactly FMR is cheap for the neighborhood. So the verdict uses the median of comparable listings when any exist and only falls back to FMR when none do. Both numbers are shown.

## Deposits are move-in cash, not monthly cost

A refundable deposit is not a cost if the landlord follows ORC 5321.16. It is counted in "cash due at move-in" only. Anything labeled "non-refundable deposit" is reclassified as a one-time fee and flagged, because the label hides cost.

## Ownership mismatch is phrased as "ask for proof," not "scam"

Management companies, LLCs and legitimate subletters all fail a naive owner-name match. The flag is severity `danger` because it is the single most useful check for the Jose persona, but the copy tells the user what to ask for.

## Not built on purpose

Chatbot, preference filters, recommendations, applicant quizzes, profile validation, PDF upload, persistence, auth. Each is in `open-questions.md`. The instructor said "choose your battles"; the top three features end to end were the battle.
