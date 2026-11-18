# Supabase: auth and listing discussions

## Auth
Email + password auth uses Supabase Auth through `@supabase/ssr` (`src/adapters/supabase.ts`).
`src/proxy.ts` refreshes the session cookie on every request; server components and actions read it
with `requestAuth()`. Pages: `/signup`, `/login`, `/verify`, `/reset-password`; log out is in the header.

Dashboard settings the team needs (Authentication → URL Configuration):
- Site URL: the production Vercel URL.
- Redirect URLs: `http://localhost:3000/**` and `https://<vercel-domain>/**` (confirmation links go to `/login`, reset links to `/reset-password`).
- Email confirmation is on by default; the built-in mailer is heavily rate limited, so add custom SMTP for real use or turn confirmation off for class demos.

## Listing discussions
`/listings` lists rows from `public.listings`; `/listings/<listing_id>` shows threads and replies
(`src/adapters/supabaseThreads.ts`, `src/domain/threads.ts`). This uses the live schema as is, with no migration:

| table | anon | authenticated |
| --- | --- | --- |
| listings | select where `not is_demo` | same |
| threads | select | select; insert `listing_id, text` (author_id defaults to `auth.uid()`); delete own |
| replies | select | select; insert `thread_id, text`; delete own |

Text is capped at 1000 characters by a check constraint. `listings` is empty today, so the page shows an empty state until rows are loaded (with `is_demo = false`, otherwise RLS hides them).

## saved_analyses vs reports
The repo's only migration (`20261113045000_saved_analyses.sql`) creates `saved_analyses`, which does not exist in the live project; the live project has `reports` and `report_*` tables instead, and `authenticated` has no insert grant on `reports`. The saved-analysis code already falls back to in-memory storage when the table is missing, so it keeps working. This change leaves both alone. The team should pick one: apply the existing `saved_analyses` migration (additive, does not touch `reports`), or port saving to `reports` and add an insert grant + policy for it.
