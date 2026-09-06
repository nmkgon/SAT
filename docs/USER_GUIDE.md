# Vertex SAT Math — GitHub Pages package

## Files to upload together
- index.html — password entry, compact test launcher, shared setup
- index.js — launcher controls
- hub.js — browser entry gate and shared AI settings
- tests.js — list of tests shown on the index
- test1.html — revised copy of the supplied Vertex SAT Math v1.8 HTML
- .nojekyll — disables Jekyll processing

Password: **Sat800** (case-sensitive).

## Launch on GitHub Pages
1. Extract this ZIP. Upload its CONTENTS together into the root of your chosen GitHub repository (not the ZIP itself).
2. In repository Settings → Pages, choose Deploy from a branch, then your branch and /(root). Save.
3. Open the published GitHub Pages URL. Enter Sat800.
4. Open AI setup. Paste Gemini API 1 and, optionally, Gemini API 2. Click Save on this computer.
5. Open Test 1. The default model is gemini-3.5-flash. All of the uploaded v1.8 test's questions, practice features, plots, library and reporting remain in Test 1.

No GitHub repository has been created or published automatically by this deliverable.

## API behavior
Both keys are stored locally in browser localStorage, scoped to this site's folder, and shared by test pages on that origin. No actual key is embedded in source or committed to GitHub. Anyone with access to the browser profile can access these stored keys.

Each new generated set starts with API 1. After its bounded retries, eligible service failures (408/5xx), access failures (401/403), or missing-model errors (404) switch to a distinct API 2 if saved. A successful API 2 remains active for that set's verification and following batches. Requests retain the existing 15-second pacing, Retry-After handling, and independent answer check. A 429 from API 1 switches directly to a distinct saved API 2 after the existing pacing delay, including daily/zero quota and long retry delays. API 2 retains its own bounded retries and quotas; it never switches back to API 1 within the same set. Cancellation, malformed requests and safety blocks do not switch keys. Paid backup use can incur charges. Two keys on the same Google project share its quotas. A provider-wide outage may affect both keys. Errors redact both saved key values.

The small API status button identifies the active API slot. Setup in Test 1 returns to the shared setup on the index. Keys are excluded from practice backups and reports. Remove keys in index setup to delete both saved values. Lock closes access for the tab's browser session; it does not delete saved keys.

## Password limitations
GitHub Pages serves static public files. This password feature is a browser-side convenience gate, NOT secure authentication or server authorization. Anyone able to inspect/modify client code or fetch public files can bypass it; the public repository and test source remain accessible. Do not use this mechanism to protect private student records or paid content. Real access protection requires a host or proxy with server-side authentication.

The gate applies to the index and direct Test 1 entry with JavaScript enabled, and expires when the tab's session ends or Lock is clicked. The password hash is in hub.js. HTTPS is required for hashing; GitHub Pages supplies HTTPS. For local development, serve this folder with `python -m http.server 8000` and visit http://localhost:8000. Do not depend on file:// for cross-page storage or authentication.

## Add Test 2 later
Test 2 appears as Coming next and has no broken Open link.
1. Add the revised Test 2 HTML as test2.html beside index.html.
2. In tests.js, set its `ready` to true and update its description.
3. Integrate it with hub.js: require VertexHub.requireAccess() before displaying its workspace; read VertexHub.load() for shared keys/model. Give it a distinct progress storage key such as vertex-test2-v1. Apply the same two-key generation wrapper as Test 1. A standalone test file needs this integration before it can claim shared API/password support.
4. Add future entries to tests.js following the same pattern. Test HTML pages remain independent; they do not overwrite Test 1's data.

## Existing progress
Test 1 uses vertex-test1-v1. On the same origin it reads legacy vertex-v1 progress if no Test 1 store exists, then saves independently. Data in a downloaded file or on another host cannot be read automatically by GitHub Pages. Export a progress backup from the old uploaded v1.8 app and import it using Test 1 Settings → Import backup. API keys must be saved again on a new origin.

## Verification
JavaScript syntax, relative entry files, Sat800 password hashing, wrong-password rejection, direct-page gate, locking, both-key save/removal, service/access failover, backup reuse and quota-fallback paths were checked locally with simulated API responses. No real user API key was available for live generation testing. Browser visual/end-to-end QA was not run.

References:
- https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
- https://docs.github.com/articles/creating-project-pages-manually

## Review packs and study guides
After completing an attempt, open My progress → Review & save.
- Study guide: opens a movable guide, grouped by missed skill, with review advice, common traps, questions, answers, worked solutions and a self-check checklist. It uses saved solutions without a further AI call.
- Save review pack: saves BOTH missed questions and the study guide together as JSON, Markdown or printable HTML. Unanswered questions are included by default and can be excluded. JSON includes structured plot/table data and guide sections. Markdown includes readable study notes plus a fenced import-data block. HTML includes a printable guide plus non-executing JSON import data.
- Import review pack: reads any of these three exported formats, allows reopening the guide, and offers the existing level/count/generate controls for new AI practice targeting the missed skills. The original workspace stays open. Import is also available under Settings, even without a completed report.
- More report options: full CSV/JSON reports, all solutions, print and deletion.

Printable HTML guides have a Print / Save as PDF button. Save the HTML or JSON/Markdown copy too: PDF alone cannot be reimported as a review pack. Reports/review packs contain student answers, but no API keys. Imported Test 2 data should be opened in Test 2, not silently assigned to Test 1. Imports are bounded to 2 MB and 500 questions and validate plot/table structure. Generated AI questions may still contain errors; guide content for them inherits their saved solutions.

Combined-pack tests passed for incorrect/unanswered selection, study-guide inclusion, round-trip JSON/Markdown/HTML import, embedded-script escaping and test-origin checks.

## Test 1 direct-entry update
The newly uploaded Practice Test #1 Math PDF has the same extracted contents as the earlier reference. The 54 original skill-aligned questions are retained, consistent with the request not to copy College Board questions. Test 1 now embeds the shared settings/password code and displays its own Sat800 password screen when opened directly, rather than requiring a redirect to the index. Opening Test 1 from an already-unlocked index still opens immediately. Shared AI settings continue to use the same folder-scoped browser storage. Keep the package files together to use All tests and shared AI setup. The password remains a convenience gate rather than secure authentication.

## Reference-aligned revision
All 54 study questions follow the uploaded reference sequence (27 per module), with new wording and values. See QUESTION_MAP.md. Each module has 20 multiple-choice and 7 numeric-entry questions. Start a new Study session to load the revised bank; earlier saved attempts retain their original question snapshots. Timed rehearsal remains a 44-question selection, not the full 54-question reference sequence.

## Estimated Gemini cost
Cost button shows this generation, today (UTC), and recorded browser totals, plus per-key input/output tokens. Each saved practice set retains its cost snapshot. Generation and review responses are counted before validation. Failed requests lacking usage remain unknown. No Gemini API cost is assigned to LM Studio. API 1 defaults free and API 2 paid, based on the owner's setup; change in AI setup if necessary. Pricing is editable per selected model. Known standard text rates checked September 5, 2026: Gemini 3.5 Flash $1.50/$9.00 per million input/output tokens; Gemini 3.1 Flash-Lite $0.25/$1.50. Thinking tokens are included in output. Cached input uses the full input price, so estimates may overstate charges. Unknown models require custom pricing. Totals exclude taxes, credits, other applications, previous untracked activity, and provider billing adjustments. This is a usage-based estimate, not a pre-generation quote or spending cap. Export history from the Cost window. Source: https://ai.google.dev/gemini-api/docs/pricing

## $10 monthly Gemini budget
Enabled automatically. Both test request paths checks recorded costs before every Gemini request, including answer checks, retries and backup-key calls. Once monthly estimated usage reaches $10, all Gemini calls stop. Paid requests stop early with less than $0.25 remaining; this is a safety margin, not a worst-case bound. Current Chrome/Edge Web Locks serialize Gemini calls across tabs on the same origin. Requests with unconfirmed usage pause Gemini for the rest of that UTC month. Rejected 400/401/403/404/429 requests without usage are recorded at $0. Network interruption or cancellation retains an uncertainty marker. The next UTC calendar month starts a fresh allowance without deleting history. LM Studio is unaffected.

This is a browser-local estimated-usage limit, not a guaranteed billing cap. An in-flight request may exceed the remaining balance. Other browsers/devices, changed origin, cleared site data, incorrect free/paid settings or prices, and other API clients are not covered. Keep tier selections accurate. Enforcing a shared account-wide hard limit requires a server-side gateway and authoritative billing controls.

## Currency formatting and one-question default
Bare and escaped currency dollar signs display as text, while paired math delimiters render equations. This applies when displaying existing saved questions too. AI instructions now request currency in words. Popup tables wrap long cells. The generation selector includes 1 question; new and existing installations default to 1 once, then remember subsequent user choices.

## Flexible practice library
Select sets using the row checkboxes or All shown. Choose Rename, Move, Combine, Duplicate, Export JSON, or Delete in the compact Actions menu, then Apply. Search and sorting help find sets; changing filters clears selection. Move destinations are test folders in this page's library, not separate HTML page storage. Moving preserves the set's saved answers. Combining replaces selected rows with one named set in library order, with unique question IDs and all questions retained (including repetitions). The merged set starts a fresh attempt. Originals and saved answers move to recoverable Trash. Duplication starts a fresh attempt. Delete sends sets to recoverable Trash; historical reports remain. Use Trash → Restore to recover the set and answers. Set exports contain practice content/progress, not API settings; use Settings → Export backup for a complete restorable app backup.

## Inline equation display
Removed scrollable overflow from inline MathML. Variables and equations no longer acquire miniature scrollbar arrows in problem text. The change applies to saved and new problems and solutions without regenerating content.

## Study guide math repair
Paired numerical expressions containing LaTeX multiplication commands now render correctly, including $1.15 \times 80 = 92$ and sums using \cdot. Currency prose still stays plain text. The shared renderer repairs saved guide content when reopened and newly exported printable guides; regenerate any previously exported HTML file to update its rendering.

## Recover from unconfirmed-cost pause
Open Cost → Reconcile month. Check both projects' month-to-date Gemini API spending, accounting for billing delays and interrupted calls. Enter a conservative total (at least the app's tracked estimate), confirm, and save. This establishes a monthly baseline and resumes requests only if funds remain. History is retained; future costs are added to the baseline. The $10 stop and $0.25 margin remain. Reconciliation is blocked during an active request in another tab. No keys or answers are removed.


## Test 2 and launcher management
Test 2 includes 54 original variants in the uploaded PDF’s module/question order, with worked solutions, line and exponential graphs, scatterplots, tables, angle and circle diagrams, and paired histograms. Progress and AI practice are separate from Test 1; AI credentials and the monthly cost ledger are shared.

On the index, Add test registers a future HTML file. Manage tests reveals editing, ordering, removal and restoration. Changes save locally; Export test list downloads tests.js to place in config/ before uploading to GitHub. Removing an entry does not erase its HTML file or answers. Use published list reloads the configuration supplied with the website.
