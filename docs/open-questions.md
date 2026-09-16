# Open questions and pushback

Ranked by how much the answer changes the build. Labels: (measured) from slides or transcript, (inferred) my reading, (guess) unverified.

## 1. Is this an analysis tool or a housing platform?

(measured) The slides describe a tool: paste or upload, get a report. (measured) Anurag's note says "housing / sublease platform for students," and the instructor pushed toward marketplace features: combo deals with landlords, applicant quizzes, matching. A platform needs accounts, listing creation, photos, search, messaging, moderation and trust and safety. A tool needs none of that. These are different products with maybe 20% code overlap. The prototype builds the tool. Which is it?

Pushback: a listings marketplace competes head-on with Zillow, Apartments.com, Facebook Marketplace and OSU's own off-campus housing site, all of which already have the supply. The tool has no direct competitor and needs no supply.

## 2. Where do comparable listings come from, legally?

(measured) The slides name Apify's "MLS API," which scrapes Zillow and Apartments.com. (measured) Zillow's Terms of Use prohibit automated queries. (inferred) The instructor's claim that MLS is the federal source of truth that Zillow pulls from is not correct for rentals; most campus rentals are never on an MLS. Options: RentCast's free 50 requests/month with heavy caching, HUD FMR only, or a hand-curated Columbus snapshot the team refreshes. Which trade-off is acceptable: fewer comps, stale comps, or paying $74/month?

## 3. Franklin County's property API is offline. Is a monthly CSV import acceptable?

(measured) `audr-api.franklincountyohio.gov` says it is "undergoing updates" with no release date. (measured) The Auditor publishes a monthly Parcel CSV with owner names. Importing it into Supabase means the ownership check runs on data up to a month old and the team owns an import job. Alternative is RentCast owner lookup against the same 50/month budget. Is a month of staleness fine for "is this landlord real"?

## 4. PDF upload or paste-only for the MVP?

(measured) Maya's use case is "upload multi-page PDF lease." The prototype is paste-only. PDF adds file storage, a parser or a Gemini file upload, and PII handling. Paste covers listings and lets a user copy a lease out of a PDF viewer. Is paste-only acceptable for the first demo?

## 5. Who reviews the Ohio law rules?

(measured) The slides promise "Ohio landlord-tenant facts." The rule engine encodes ORC 5321.13 and 5321.16 as I read them. Nobody on the team is a lawyer and neither am I. OSU Student Legal Services exists and reviews leases for students for free. Will the team ask them to review the rule list, and is the app allowed to say "unenforceable" or only "ask a lawyer about this"?

Pushback: an app that tells a 19-year-old a clause is void, and is wrong, does harm. The copy needs a disclaimer and the rules need a citation on every flag (already done in the flag model).

## 6. Can lease text go to a free-tier LLM?

(measured) Gemini's free tier may use inputs to improve Google products. Leases contain full names, addresses, sometimes SSNs and bank details. Options: strip PII before the call, pay for Tier 1 (no training on data, no minimum spend beyond linking a card), or keep extraction rule-based. Which one?

## 7. What is the scope of "scam verification" for a subletter who is not the owner?

(measured) Jose's persona is subleasing, so the person listing is a tenant, not the owner, and the county record will never match. The current check tells him to ask for sublease consent. Is that the intended behavior, or does the team want a different signal for subleases (e.g., verify the original lease, verify the poster's OSU identity)?

## 8. Chatbot: in or out?

(measured) The roadmap allocates work in timeboxes 2 and 3 to conversation flows, chatbot accuracy and jailbreak testing. (measured) The instructor said "choose your battles." A chatbot over a single lease is cheap once extraction exists (the context is the document plus the flags), but evaluating it is not. Recommend: out of the MVP, in as a "ask about this lease" box after the report exists.

## 9. Preference filters, recommendations, applicant quizzes, profile validation

(measured) All four came up under questioning and none are on the idea slide. Each is a small product on its own and each pulls toward the platform answer in question 1. Recommend dropping all four until question 1 is answered.

## 10. Monetization is undecided. Does it need to be?

(measured) Freemium, ads, landlord commissions and B2B group deals were all floated. For a class project none of these need to exist. If a business model must appear in the final presentation, the one that does not conflict with the user's interest is a paid tier for unlimited analyses. Landlord commissions create an incentive to soften flags on paying landlords' leases.

## 11. Is the target user OSU only?

(measured) Both personas are OSU students and the geography is Columbus. Everything gets simpler if that is explicit: one county's records, one HUD area, one `.edu` domain, one campus centroid. Confirm.

## 12. Smaller items

- Course number: slides say CSE 5914, brief says CSE 5901.
- The slides list Python FastAPI. The prototype does not use it. Objection?
- Should analyses be saved per user (needs auth) or is the MVP stateless?
- Is "LeaseLens" an acceptable working name, or does the team have one?
