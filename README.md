# Golden Memories — អនុស្សាវរីយ៍មាស

## 1. What this is

Golden Memories is a Khmer old music archive built for Camdodian old song enthusiast. Its homepage describes preserving songs remembered through grandparents' cassette tapes and radio listening. Visitors can browse and search music records, read their details, and see contributor credits. Contributors can create accounts, submit record information and photos, and manage their own entries; reviewers can publish submissions or return them for corrections. The archive's identity comes from [collection.config.js](collection.config.js).

## 2. Who it's for

The archive is intended for listeners, students, families, and record collectors in Cambodia who want to find and preserve older Khmer music.

- **Khmer:** original Khmer titles remain intact. A Khmer/English toggle, Kantumruy Pro font, translated labels, and bilingual review feedback support Khmer readers. The current default is English until Khmer is selected; a complete Khmer screen audit is still needed.
- **Phones:** wrapping record cards, flexible forms, and responsive navigation accommodate narrow screens. Device testing has not yet been recorded.
- **Slow connections:** the homepage streams its introduction while records load, selects named database columns, and searches loaded records without another request per keystroke. It still loads the full published collection, external fonts, and photos; no throttled-network test is recorded.
- **Attribution:** cards and detail pages show a public contributor name/avatar, or an anonymous fallback. This credits the uploader; source and photographer permissions still need documentation in section 6.

## 3. How it works

The site uses Next.js 15 App Router, React 19, JavaScript, and plain CSS/inline styles, with Vercel hosting. Supabase provides authentication, PostgreSQL data, and Storage. Browser and server clients use the visitor's session rather than a service-role key.

| Data or service | Role and evidence |
| --- | --- |
| `entries` | Music metadata, `owner`, `status`, and `review_note`. Fields include title, slug, artist, dates, genre, duration, and `vinyl_image`. Original table-creation SQL is absent. |
| `auth.users` | Supabase accounts; ownership uses the authenticated user's UUID. |
| Reviewer authorization | The app calls `is_reviewer()`. Its definition and reviewer membership schema are absent from this checkout. |
| `profiles` | Optional public display names and avatar paths. Defined in migration 004, explicitly marked **proposed only**; deployment is unverified. |
| Storage | Record uploads use the public `photos` bucket. Migration 004 proposes public `avatars` with owner-folder write rules and a 5 MB image limit. |

The three statuses are `pending` (awaiting review), `published` (public archive), and `returned` (needs corrections). New submissions omit `status`, requiring a database default. Contributor edits set `pending`; reviewer edits leave status unchanged.

The homepage queries published entries. `/my-archive` searches the signed-in owner's entries; `/my-entries` shows statuses and return notes. `/review` checks reviewer access on the server before fetching pending submissions.

**Database verification gap:** [migration 002](db/002_entries_owner_policies.sql) enables row-level security (RLS), limits inserts/updates/deletes to the owner, and prevents owners from transferring rows through those updates. However, its SELECT policy is `using (true)`, allowing every status to be read. It contains no status-change restriction. Homepage filters cannot enforce published-only API access or prevent direct publication requests. Deployed policies, defaults, triggers, and review functions must be inspected before claiming those protections. Migration 004 leaves entry policies unchanged.

[Migration 003](db/003_review_contributors.sql) defines `review_contributors()`, which checks reviewer access and returns names/emails only for pending submissions. Authenticated users can call it, but authorization is checked inside the function. No record of which SQL was actually run is included.

## 4. Security decisions

**The publication gate:** `ReviewBoard` calls `review_entry(entry_id, decision, note)` with `published` or `returned`, removing an item only when the function returns `true`. The gate belongs in PostgreSQL because users can bypass pages and call Supabase from the console. It must enforce reviewer authorization, permitted transitions, and required return notes; policies/triggers must also block unauthorized direct status writes. Its SQL is missing, so those checks remain unverified. Hiding Publish and denying `/review` access guide users but do not secure direct API requests.

- **Returned entries:** the UI requires a nonblank reason. `/my-entries` shows `review_note` only for returned entries, with a bilingual fallback if no note exists. Editing resubmits as pending and hides old feedback so it is not presented as current. Database enforcement of a required note is unverified.
- **Published-entry takedown:** the review interface offers decisions only for pending entries, keeping it focused on incoming submissions. There is no published-entry takedown action. Whether reviewers can return published entries through the RPC depends on its missing definition.
- **Personal search:** public search shows only published records, even to signed-in contributors. `/my-archive` searches their own entries across all statuses, letting owners find unfinished work without adding it to public results.
- **Identity:** public cards receive display names/avatar URLs, not emails. Reviewer identity details use the guarded function. Migration 004 proposes immutable entry ownership and owner-only profile/avatar writes; deployment remains unverified.

## 5. AI use

Git history records AI assistance but does not identify earlier models, tools, prompts, or the student's keep/rewrite decisions. These details must be completed from Cline or other session records before submission.

| Model/tool | Task and evidence | Verdict and checking |
| --- | --- | --- |
| Earlier model/tool not recorded | Contribution uploads (`9914be2`), pending submissions (`47e601f`), and review queue (`7d01749`); commit messages mark AI assistance. | Retained in the project; exact generated portions, rewrites, and live account tests are undocumented. |
| Earlier model/tool not recorded | Profile/upload fixes, Khmer translation, header, and authentication fixes; examples: `306bc71`, `7e33c17`, `7a9cfe4`. | Model names and reasons for keeping or rewriting output need the student's account. |
| Codex, GPT-6-based coding agent | Drafted this README from source, SQL, and history on 2026-11-22. | Draft awaits student review. Claims checked against repository files; missing evidence explicitly marked. |

Existing checks in `tests/email-confirmation.test.cjs` exercise login, confirmation callbacks, redirects, and middleware with mocked Supabase responses. They do not prove live RLS, publishing security, or stranger-account isolation. No test run is claimed for this documentation change.

## 6. Sources and credits

The source register is incomplete: `collection.config.js` still lists curator as "Your Name" and source as "To be gathered". The homepage's family-memory narrative does not document a named source's permission. No verified per-entry source list is included.

For every entry, record its title, source person/place/publication, link or collection reference, and permission to name the person. Use an agreed description for anyone requesting anonymity. Credit the photographer separately; an artist name or uploader credit is not a photo credit.

Credits still needed:

- `public/images/vinyl 1.png` through `vinyl 11.png`: record-image sources, photographers, and permission/license details.
- `public/images/single.png` and `header.jpg`: creators, sources, and permission/license details. The Sinn Sisamouth caption identifies the subject, not the photographer.
- `paper-texture.jpg`, `grunge-texture.jpg`, `grey-paper-texture.jpg`, and `card-texture.jpg`: texture creators and source/license details.
- Supabase-uploaded record photos and avatars: contributor-provided provenance and permission, unavailable in this checkout.

The interface loads Kantumruy Pro through Google Fonts. The count of real, credited database entries remains unverified; eleven local image files do not establish eleven credited entries.

## 7. Running it locally

Install Node.js compatible with Next.js 15 and npm, then run:

```bash
git clone https://github.com/dy-nobsokun1/khmer-old-music-collection.git
cd khmer-old-music-collection
npm ci
```

Create an untracked `.env.local` with these variable names, using your project's configuration:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

The publishable key is public by design and exposed to the browser; RLS and guarded functions must control access. No environment file is currently tracked. Git history shows `.env.local` was committed and later removed, so historical contents still need an audit before claiming no secrets in history. This README supplies no values.

Use a Supabase project with the existing schema, review functions, and Storage policies. The `db/` files are partial changes, not a complete fresh-database setup; migration 004 requires inspection before execution. Configure Supabase Auth's site URL and allowed redirects for localhost and the deployed site's `/auth/confirm` route. Set the same environment variable names in Vercel.

```bash
npm run dev
```

Open [localhost:3000](http://localhost:3000). For production, run `npm run build`, then `npm start`. Run existing mocked authentication checks with `node --test tests/email-confirmation.test.cjs` after installing dependencies.

## 8. Submission checklist

All items below are confirmed complete by the curator as of 2026-11-22. These are curator-reported results; this documentation edit did not independently repeat the checks. Missing evidence details are noted for the final submission. The repository SQL gaps described above still need to be reconciled with the deployed database configuration.

- Live URL loads logged out and shows published entries only: **yes**, [live archive](https://khmer-old-music-collection.vercel.app/).
- A stranger cannot publish their own entry through the page or the console: **yes**, tested by the curator; test date not supplied.
- Logged out, the API returns nothing pending or returned: **yes**, tested by the curator; test date not supplied.
- Contributors can edit and delete only their own entries: **yes**; see the entry detail controls and deployed ownership policies.
- No secrets anywhere in the repo history: **yes**, confirmed by the curator; audit method not supplied. Historical `.env.local` commits are noted in section 7.
- At least eight real entries, each with a credited source: **yes**; exact count and source register not supplied in this README.
- Khmer renders on every screen a user meets, including the queue: **yes**; see the Khmer language option and `/review`.
- Works at phone width: **yes**, tested by the curator; device or browser width not supplied.
- No test entries, lorem ipsum or TODO comments in shipped pages: **yes**, confirmed by the curator for the deployed site.
- No console errors on the main pages: **yes**, confirmed by the curator.
- jesseorndorff is a collaborator on this repo: **yes**; see GitHub repository collaborator settings.
- Supabase project restored and awake on: **yes**, confirmed by the curator; restoration/check date not supplied.
- Demo video link opens in a private window: **yes**, confirmed by the curator; video link not supplied.
- Reflection pasted in the Canvas submission: **yes**; see the Canvas submission.
- Posted in the Show Your Archive discussion: **yes**; see the discussion post in Canvas.
- Q&A slot booked for: **yes**, Friday, 4 December 2026, 14:40–14:45 Cambodia time (Asia/Phnom_Penh, UTC+7).
