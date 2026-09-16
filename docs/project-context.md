# Project context

Sources read on 2026-09-16:

- Team slides "AU26 CSE 5914 Team FIFA" (Google Slides `1jOKWgIKtympbKLEcXQeosyBqEOLbWAklbtDdABM0NHs`, read via Drive API).
- Recording of the class presentation and instructor Q&A (Sonnet AI recording 87708, full transcript, ~14 min).
- Correction from Anurag (2026-09-16): "FIFA" is only the team name. Stack is React + TypeScript + Next.js. Goal is a bare MVP that works end to end, quality over speed, no course deadline pressure.

Labels: (measured) = stated in slides or transcript, (inferred) = my reading, (guess) = unverified.

## The problem

(measured) Students renting for the first time, or subleasing from unverified platforms like Facebook Marketplace, sign leases they do not understand. They do not know what normal Columbus fees look like, cannot tell if the price is fair, and cannot tell if the person listing the unit actually controls it.

(measured, slide 3) "An AI tool where users can upload a lease or paste an apartment listing to get a better understanding of what they're signing up for. It can point out hidden fees, estimate the real monthly cost, compare the price to similar apartments around Columbus, and flag anything that seems suspicious."

(measured) Differentiation: Zillow, Apartments.com and Apartment List help you find a place. This helps you decide whether a specific place is a good deal before you sign.

## Target users

(measured) Two personas, both OSU students:

1. Maya Chen, 19, sophomore, first-time renter. Goal: sign a lease she understands and can afford without rereading every line. Frustration: no baseline for what fees or terms are normal. Use case: upload multi-page PDF lease, extract hidden utility costs and clauses.
2. Jose Reyes, 21, junior, sublease seeker on unverified platforms. Goal: get a better deal but confirm the listing and landlord are real before paying a deposit. Use case: cross-reference the stated landlord against Franklin County property records, flag scam payment requests (upfront Zelle deposits).

(inferred) Geography is Columbus, specifically the OSU campus area. The team said "for us, more specifically the Columbus area."

## Feature list, in the order the team presented them

1. Hidden fee detection from a lease PDF or pasted listing. (measured, slide 3, first item)
2. True monthly cost estimate including utilities and fees. (measured)
3. Price comparison against similar Columbus apartments. (measured)
4. Suspicious-item flagging: scam signals and red-flag clauses. (measured) Sub-items: Franklin County ownership cross-check, Zelle/upfront deposit detection, Ohio landlord-tenant rule checks.
5. Chatbot for questions about fees, clauses, scams. (measured, roadmap timebox 2 and 3; not on the idea slide)
6. Filters for renter preferences and preference-based apartment recommendations. (measured, mentioned once on persona slide and once in Q&A; low emphasis)
7. Sublease checklist and dynamic screening quiz so a subletter can vet applicants. (measured, instructor suggestion during Q&A; team said "yes, the app could support" it; added to action items)
8. Renter profile validation: student email, ID, online presence. (measured, instructor pushed on this; team improvised answers)

Items 1 to 4 are the product. Items 5 to 8 were added under questioning and are not in the idea slide.

## What the team said they were "thinking"

- (measured) Monetization: "maybe have a free version, maybe a premium version"; also ad revenue, commission from landlords, LinkedIn-style limited free searches. Undecided.
- (measured) Instructor suggested B2B angle: negotiate group discounts with campus-area landlords, "combo deals" if N students sign together, auction-style sublease matching. Team agreed it was "a good idea." Not in slides.
- (measured) Data: "MLS API" via Apify that aggregates Zillow, Apartments.com, Zumper. Instructor called MLS "the source of truth when Zillow and everybody pulls." (inferred) This is wrong for rentals: MLS is a broker sales feed; most campus rentals never touch an MLS. The Apify actor is a scraper of listing sites, not MLS access.
- (measured) LLM: "Gemini or OpenAI" for extracting rent, deposits, fees, red-flag clauses.
- (measured) Auth: Supabase for authentication and authorization, "or Clerk."
- (measured) Rule engine: JSON rules plus Ohio landlord-tenant facts for hidden-fee and scam heuristics, "not only an LLM."

## Constraints

- (measured) Team of 5 fourth-year CSE students: Nikil Prabhakar, Vibhav Kaluvala, Samuel Fairchild, Anurag Kejriwal, Nihal Patil.
- (measured) Course roadmap has four timeboxes: 1 definition and research (done), 2 architecture and core design (next), 3 database, evaluation, UI, 4 testing and polish, then a final presentation. Anurag says there is no deadline pressure for this prototype.
- (measured) Stack the team knows: Next.js + TypeScript, Supabase/Postgres. Slides also list Python FastAPI and pgvector RAG.
- (measured) Instructor advice: "choose your battles, don't try to do them all."
- (inferred) Budget is zero or near zero; every service in the slides has a free tier.

## Ambiguities and contradictions

1. Course number. Slides say CSE 5914. The task brief says CSE 5901. (guess) One is a typo; does not affect the build.
2. Backend. Slides list Python FastAPI as a separate service. In the talk the team only named Next.js, TypeScript and Supabase. (inferred) FastAPI was added for the slide, not designed for. The prototype uses Next.js server actions only; see `decisions.md`.
3. "Platform" vs "tool." Anurag's correction says "housing / sublease platform for students." The slides describe an analysis tool: upload a lease, get a report. Nothing in the slides is a marketplace (no listing creation, photos, messaging, roommate matching, furniture). The instructor's suggestions (combo deals, applicant quizzes) pull toward a platform. The prototype builds the tool described in the slides. This is the top open question.
4. Data source realism. Slides name Apify's "MLS API" as the dataset. Zillow's terms of use prohibit scraping. The Franklin County Auditor's property API is currently offline ("undergoing updates, release date not determined" as of 2026-09-16). See `api-research.md`.
5. Ranking. The idea slide orders fees, cost, comps, flags. The personas lead with clause extraction and scam verification. (inferred) The team's real ranking is fees/cost first, scam check second, comps third.
6. Chatbot. Appears in the roadmap (design conversation flows, evaluate chatbot accuracy, jailbreak testing) but not on the idea slide, and the instructor warned against doing everything. (inferred) It is a stretch goal.
