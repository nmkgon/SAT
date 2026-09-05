# Vertex SAT Math — GitHub Pages package

## Files to upload together
- index.html — password entry, compact test launcher, shared setup
- index.js — launcher controls
- hub.js — browser entry gate and shared AI settings
- tests.js — list of tests shown on the index
- test1.html — revised copy of the supplied Vertex SAT Math v1.8 HTML
- .nojekyll — disables Jekyll processing

Password: **Katie** (case-sensitive).

## Launch on GitHub Pages
1. Extract this ZIP. Upload its CONTENTS together into the root of your chosen GitHub repository (not the ZIP itself).
2. In repository Settings → Pages, choose Deploy from a branch, then your branch and /(root). Save.
3. Open the published GitHub Pages URL. Enter Katie.
4. Open AI setup. Paste Gemini API 1 and, optionally, Gemini API 2. Click Save on this computer.
5. Open Test 1. The default model is gemini-3.5-flash. All of the uploaded v1.8 test's questions, practice features, plots, library and reporting remain in Test 1.

No GitHub repository has been created or published automatically by this deliverable.

## API behavior
Both keys are stored locally in browser localStorage, scoped to this site's folder, and shared by test pages on that origin. No actual key is embedded in source or committed to GitHub. Anyone with access to the browser profile can access these stored keys.

Each new generated set starts with API 1. After its bounded retries, eligible service failures (408/5xx), access failures (401/403), or missing-model errors (404) switch to a distinct API 2 if saved. A successful API 2 remains active for that set's verification and following batches. Requests retain the existing 15-second pacing, Retry-After handling, and independent answer check. Cancellation, malformed requests, safety blocks, and quota exhaustion do not rotate keys. Two keys on the same Google project share its quotas. A provider-wide outage may affect both keys. Errors redact both saved key values.

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
JavaScript syntax, relative entry files, Katie password hashing, wrong-password rejection, direct-page gate, locking, both-key save/removal, service/access failover, backup reuse and quota-stop paths were checked locally with simulated API responses. No real user API key was available for live generation testing. Browser visual/end-to-end QA was not run.

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
