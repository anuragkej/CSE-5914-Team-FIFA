# API and data source research

Verified on 2026-09-16 against official pages unless marked **unverified** (third-party summary only) or **offline**. Prices are USD. "Free" means a permanent free tier, not a trial.

Ordered by the feature each source powers. Sections 8 to 12 cover the platform-style capabilities Anurag asked about (auth, storage, maps, messaging, email, .edu verification, payments, moderation) even where the slides do not yet need them.

## 1. Lease and listing text extraction (features 1, 2, 4)

| Option | Cost | Limits | Notes |
| --- | --- | --- | --- |
| **Gemini API, Flash-Lite tier** (`gemini-2.5-flash-lite` stable, `gemini-3.5-flash-lite` current) | Free tier: $0 input and output. Paid: $0.15 to $0.30 per 1M input, $1.25 to $2.50 per 1M output. | Free-tier RPM/RPD are no longer published; shown per project in AI Studio. Third-party reports (unverified) say 15 RPM, 1,000 RPD for 2.5 Flash-Lite. Free tier data may be used to improve Google products. | Accepts PDF input natively. Structured outputs supported. No card needed. |
| OpenAI `gpt-5-mini` / `gpt-4.1-mini` | $0.25 / $2.00 and $0.40 / $1.60 per 1M in/out. No free tier; account needs a positive balance. | Tier-based rate limits. | Structured outputs. Good fallback when Gemini free tier throttles. |
| Groq (open models, e.g. `llama-3.3-70b-versatile`, `openai/gpt-oss-120b`) | Free plan, no card. Paid $0.59 / $0.79 per 1M for Llama 3.3 70B. | Free: 30 RPM, ~1,000 RPD, 6K to 8K TPM per model (official rate-limit page). | Fast. TPM cap is tight for multi-page leases; chunk the document. |

Recommendation: Gemini Flash-Lite free tier behind the `TermsExtractor` port, with the rule-based extractor in this repo as deterministic fallback and as the "not only an LLM" layer the slides describe. Fallback: OpenAI mini models on a $5 prepaid balance.

Privacy note (inferred): leases contain names, addresses and sometimes SSNs. Free-tier Gemini may train on inputs. Strip PII before sending, or use the paid tier (Tier 1 requires only a linked billing account and does not train on data).

PDF text extraction: Gemini reads PDFs directly. For a no-LLM path, `pdfjs-dist` or `unpdf` in Node is free.

## 2. Ohio landlord-tenant facts for the rule engine (feature 4)

| Source | Cost | Notes |
| --- | --- | --- |
| Ohio Revised Code Chapter 5321 (codes.ohio.gov) | Free, public | Verified: 5321.13 voids attorney's-fee clauses (C), confession of judgment (B), landlord liability waivers (D). 5321.16 requires 5% interest on deposits above one month's rent when tenancy is 6+ months, and itemized deductions within 30 days. No statutory late-fee cap or deposit cap in Ohio. |
| Columbus City Code Title 47 (Housing) | Free, public | **unverified** for specific rental provisions. |

These are encoded as rules in `src/domain/rules.ts`, not fetched at runtime. A law student or Student Legal Services review is the "API" here.

## 3. Market baseline and comparables (feature 3)

| Option | Cost | Limits | Coverage |
| --- | --- | --- | --- |
| **HUD Fair Market Rent API** (huduser.gov/hudapi/public/fmr) | Free | Token via free account. No published rate limit. | FY2026 Columbus HUD Metro FMR verified: 0BR $1,111, 1BR $1,194, 2BR $1,430, 3BR $1,715, 4BR $1,927. Also has ZIP-level Small Area FMRs where designated. Updated yearly, so it is a floor, not a comp. |
| **Census ACS 5-year API** (B25064 median gross rent) | Free | API key required for all queries (new policy). Default 500 queries/day per key (unverified exact). | Tract and ZCTA level. 2024 vintage available. Lags 2 to 3 years. |
| **RentCast API** | Developer plan $0 for 50 requests/month, then $0.20 each. Foundation $74/month for 1,000. | Per-request. | Rent estimates (AVM), comparables, active rental listings, 140M+ properties. Terms allow use without attribution. Best real comps source that is legal to call. 50/month is enough for a demo, not a class. |
| Apify "MLS API" (`tri_angle/real-estate-aggregator`) | $0.003 per run + $0.002 per listing, free Apify credits for new users (amount unverified). | Apify platform limits. | Scrapes Zillow, Realtor, Zumper, Apartments.com. **Zillow's Terms of Use prohibit automated queries and scraping.** Apify's own FAQ tells you to comply with those terms. Legal exposure sits with the team, not Apify. Not "MLS" in any real sense. |
| Zillow Bridge Interactive (official) | Free if approved | Requires MLS membership or approved partnership. Rent Zestimates not exposed. | Not attainable for a student team. |

Recommendation: HUD FMR (free, verified, already in the fixture) plus RentCast Developer plan for real comps, cached aggressively in Postgres so 50 calls/month covers many analyses. Fallback: hand-curated Columbus listing snapshot refreshed monthly by the team (what the fixture in this repo imitates). Do not build on Zillow scraping.

## 4. Property ownership verification (feature 4, Jose persona)

| Option | Cost | Status |
| --- | --- | --- |
| **Franklin County Auditor Parcel CSV** (auditor.franklincountyohio.gov/Auditor/FTP, maps.franklincountyauditor.com/Parcel_CSV) | Free bulk download | Verified: monthly CSV with owner name, site address, transfer data, archived to 2014. Also "Rental Contact" and "Rental Registration" files. Load into Supabase Postgres and query locally. |
| Franklin County Auditor App API (audr-api.franklincountyohio.gov) | Free | **offline**: "currently undergoing updates. A release date has not yet been determined." (checked 2026-09-16). Endpoint shape `v1/parcels/ByOwner` exists in cached docs. |
| RentCast property records (owner details) | Counts against the 50/month | Nationwide fallback, includes current owner. |

Recommendation: import the Parcel CSV into Postgres (one table, ~430K rows, guess) behind `PropertyRecordsProvider`. Address normalization is the hard part; see section 9. Fallback: RentCast owner lookup.

Caveat (inferred): a name mismatch is not proof of fraud. Owners use LLCs, management companies lease on their behalf, and subletters are not owners by definition. The rule engine phrases this as "ask for proof of authority," not "scam."

## 5. Geocoding and address normalization (features 3, 4)

| Option | Cost | Limits | Notes |
| --- | --- | --- | --- |
| **Google Geocoding API** | 10,000 free requests/month (Essentials SKU), then $5 per 1,000 | 3,000 QPM | Card required to enable billing. Named in the slides. |
| Google Address Validation API | 5,000 free/month (Pro SKU), then $17 per 1,000 | 6,000 QPM | USPS CASS certified when `enableUspsCass: true`. Only needed if you must match parcel records exactly. |
| Mapbox Temporary Geocoding | 100,000 free/month, then $0.75 per 1,000 | Results may not be stored permanently on the free tier. | Storing geocodes needs Permanent Geocoding, which has no free tier. |
| Nominatim (OSM public instance) | Free | Max 1 request/second, must send identifying User-Agent, must be able to switch providers on request. Policy explicitly forbids use as a generic geocoder in LLM-generated or low-code apps. ODbL share-alike. | Fine for a demo. Not fine as the production path. |

Recommendation: Google Geocoding on the free 10K/month tier. For parcel matching, normalize with a USPS-style abbreviation pass first (as the fixture adapter does) and only call Address Validation when that fails. Fallback: Mapbox.

## 6. Auth and database (all features)

| Option | Free tier | Notes |
| --- | --- | --- |
| **Supabase** | 50,000 MAU, 500 MB Postgres, 1 GB file storage, 5 GB egress, 500K edge function invocations, 2 active projects. Projects pause after 1 week of inactivity. Pro $25/month. | Named in slides. pgvector included. Row Level Security for per-user analyses. Storage handles lease PDFs (50 MB max file on free). |
| Clerk (auth only) | 50,000 monthly retained users, unlimited apps, 3 dashboard seats. Pro $25/month. | Team mentioned it. Better prebuilt UI than Supabase Auth. Redundant if Supabase is already the DB. |
| Neon (Postgres only) | 100 CU-hours/project/month, 0.5 GB storage, 5 GB egress, auth up to 60K MAU, scale-to-zero after 5 min. | Good if the team wants Vercel-native Postgres and Clerk for auth. No file storage on the free tier outside beta. |

Recommendation: Supabase (auth, Postgres, storage) as the slides say. The 1-week pause on free projects will bite during a semester; a $25/month Pro project for the demo period is the fix. Fallback: Neon + Clerk.

## 7. Hosting

| Option | Free tier |
| --- | --- |
| **Vercel Hobby** | $0, 100 GB data transfer/month, 1M function invocations/month, 360 GB-hours Fluid compute. Non-commercial use only per Vercel's terms (inferred from Hobby plan description). |
| Vercel Blob (photos, PDFs) | Hobby: 1 GB storage, 10K simple ops, 2K advanced ops, 10 GB transfer/month. Hard stop when exceeded. |

Recommendation: Vercel Hobby for the Next.js app. Store PDFs in Supabase Storage rather than Vercel Blob to keep one vendor for data.

## 8. Photos and file storage (only if the product becomes a listings platform)

Supabase Storage free tier (1 GB) or Vercel Blob Hobby (1 GB). Both are tight for photo listings; a 2,000-listing site at 5 photos of 300 KB each is 3 GB. Cloudflare R2 has 10 GB free (unverified this session).

## 9. Maps display (only if a map view is built)

Mapbox GL JS: 50,000 free map loads/month, then $5 per 1,000. Google Maps JavaScript API Dynamic Maps: 10,000 free loads/month, then $7 per 1,000. Leaflet + OpenStreetMap raster tiles: free but the OSM tile usage policy forbids heavy use; use a tile provider like MapTiler (unverified free tier) for anything real.

## 10. Messaging between students (only if the product becomes a platform)

| Option | Free tier | Notes |
| --- | --- | --- |
| **Supabase Realtime** | 200 concurrent connections, 2M messages/month, 100 messages/second, 256 KB payload. Broadcast fan-out counts 1 + N messages. | Already in the stack. Postgres-backed chat table plus Realtime is enough for an MVP. |
| Ably | 200 concurrent connections, 6M messages/month, 500 messages/second. Standard $29/month. | More generous than Supabase on messages, adds a vendor. |
| Stream Chat | 1,000 MAU and 100 concurrent connections free (Build). Maker plan gives $100/month credit for teams under 5 people and under $10K revenue. Start plan $399/month. | Best prebuilt chat UI. The cliff to $399/month is steep. |

Recommendation: Supabase Realtime if messaging is ever needed. Fallback: Ably.

## 11. Email and .edu verification

| Option | Cost | Notes |
| --- | --- | --- |
| **Resend** | Free: 3,000 emails/month, 100/day, 3 domains. Pro $20/month for 50K. | Magic links, verification codes. |
| Supabase Auth built-in email | Free but rate limited (unverified number; Supabase docs recommend custom SMTP for production). | Point it at Resend SMTP. |
| .edu domain check | Free | Regex on `@osu.edu` (or `@buckeyemail.osu.edu`) plus a verification email. Proves inbox access, not enrollment; alumni keep addresses. Good enough for an MVP. |
| SheerID | First 500 verifications free, then $375/month for 300 (landing-page pricing, unverified for API access). | Enterprise-grade enrollment verification. Overkill. |
| Studid (`api.studid.io`) | Free, no account | Verifies affiliation via the university's own SAML SSO through eduGAIN. Two REST calls. Only works if OSU's IdP is in eduGAIN and releases attributes (unverified for OSU). Worth a 30-minute test. |

Recommendation: `@osu.edu` email verification through Supabase Auth with Resend as SMTP. Fallback: Studid if OSU SSO works.

## 12. Payments

Slides mention freemium/premium only as a future business model. No payment flow is in scope. If a premium tier is built: Stripe standard pricing is 2.9% + $0.30 per successful US card transaction, no monthly fee. Stripe Connect (marketplace payouts) is only relevant if the app ever moves money between students, which is a regulatory and fraud burden the team should not take on.

## 13. Moderation and scam detection (feature 4, and any user-generated content)

| Option | Cost | Notes |
| --- | --- | --- |
| **Rule engine in this repo** | Free | P2P payment requests, far-below-market rent, owner mismatch, unenforceable clauses. Deterministic and explainable. |
| OpenAI Moderation API (`omni-moderation-latest`) | Free, but the account needs a positive balance. Free tier 250 RPM, 5,000 RPD. | Harassment, sexual, violence categories. Not a scam detector. Only relevant for user-posted listings or chat. |
| FTC rental scam patterns | Free, public | Source for the heuristics: pay before seeing, wire or app payments, landlord "out of the country," price far below market, pressure to act today. |

Recommendation: rule engine first, LLM classification second (ask Gemini "does this listing show scam patterns, cite the sentence"), moderation API only if user-generated content exists.

## 14. University and campus data

College Scorecard API (`api.data.gov/ed/collegescorecard/v1/schools`): free api.data.gov key, 1,000 requests/hour, returns `location.lat` and `location.lon` per institution. Only needed if the app expands beyond OSU. For OSU alone, hardcode the campus centroid (guess: 40.0067, -83.0305) and neighborhood polygons.

## Summary table

| Feature | Recommendation | Fallback | Monthly cost at MVP scale |
| --- | --- | --- | --- |
| Extraction | Gemini Flash-Lite free tier + rule-based extractor | OpenAI mini on $5 prepaid | $0 to $5 |
| Ohio rules | ORC 5321 encoded in code | Legal review | $0 |
| Comps | HUD FMR API + RentCast Developer (50/month, cached) | Curated Columbus snapshot | $0 |
| Ownership | Franklin County Parcel CSV in Postgres | RentCast owner lookup | $0 |
| Geocoding | Google Geocoding 10K free | Mapbox 100K free | $0 |
| Auth + DB + files | Supabase Free, Pro for demo month | Neon + Clerk | $0 to $25 |
| Hosting | Vercel Hobby | Netlify (unverified) | $0 |
| Email | Resend Free via Supabase SMTP | Supabase default | $0 |
| Messaging (if needed) | Supabase Realtime | Ably | $0 |
| Payments | None in scope | Stripe | $0 |
