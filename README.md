# Vertex for GitHub Pages — v4.3.0

This package contains individual test pages and a shared index, with the latest answer, explanation, variation, and review-ID fixes. Password: **Sat800** (case-sensitive).

## Files and folders

| Location | Contents |
| --- | --- |
| `index.html` | Launcher and shared AI setup |
| `test1.html`, `test2.html`, `test4.html` through `test21.html` | 20 individual test pages, 1,120 questions total |
| `wordproblems.html` | Word Problems practice |
| `assets/js/` | Launcher, shared settings, and supporting scripts |
| `config/tests.js` | Test list and navigation targets |
| `native-data/` | Editable native question-bank data |
| `docs/` | Usage guides and source/conversion notes |
| `tools/` | Optional local preview server |

Keep index.html and the test HTML files together at the repository root. Supporting folders must retain their names and structure. The preceding package did not contain Test 3, so no Test 3 entry is added.

Each test embeds its questions, math graphics, solutions, and practice interface. Updating a JSON bank by itself does not update the HTML; the corresponding embedded bank must also be updated. Shared AI settings and test progress remain browser-local. Existing standalone-file progress does not automatically transfer to a GitHub Pages address; export important practice/review records from the old app before moving.

## Publish to GitHub Pages

1. Extract the ZIP into a new folder.
2. Upload the **extracted files and folders** to your repository's main branch. Put index.html at the root, alongside the test HTML files and the supporting folders. Upload the contents of the extracted folder, not the ZIP file itself.
3. Open the repository's **Settings → Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**. Choose **main** (or the branch you uploaded to) and **/ (root)**, then Save.
5. When deployment completes, open the site link shown under Pages. Enter **Sat800**.

No build command, Node installation, or API key committed to the repository is required. Configure your AI provider in the app's AI setup screen.

Reference: [GitHub Pages publishing-source instructions](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Local preview

With Python 3 installed, run `python tools/serve-local.py` from this folder. On Windows, double-click `tools/start-local.bat`. The server opens http://localhost:8080. Stop it with Ctrl+C.

## AI setup popup

AI setup opens over each test and Word Problems workspace. Save or close it to continue with the same question, answers, and practice windows. Changes apply to the next generation request; an active request keeps its current settings. Timed tests continue counting while settings are open.

## Easy practice

Easy generates close variants of the selected source: reworded text, changed numbers, and renamed variables with the same mathematical task and solution method. Answers, worked steps, and necessary visuals are checked. Hard and Harder keep the existing broader variation behavior.

## Math rendering repair

Descriptive subscripts such as C_{new} and text labels inside equations render as math instead of exposing raw dollar delimiters. The repair applies when displaying saved practice as well as newly generated prompts, choices, tables, and worked solutions. Currency/prose protection remains enabled.

## Targeted practice and arithmetic checks

After an incorrect answer, open the solution and choose Practice this mistake. A popup offers a first-step hint and optional space to describe your reasoning before generating one Easy variant.

AI review now supplies an independent arithmetic expression for supported calculations. A local parser recalculates it and rejects mismatches before saving. Other problems retain model review. This checks arithmetic; interpretation and unsupported symbolic mathematics still depend on model review.

## Daily missed-problem review

The launcher shows due reviews from saved test queues. Each test organizes completed attempts into skill groups automatically. Opening a test on a new day offers due review, except during an unfinished timed test. The Missed review button opens the queue at any time. Review takes place in a separate popup without replacing the main session. Answers and review position persist.

Unassisted correct recalls advance through 1-, 3-, 7-, and 14-day intervals. Wrong or assisted recalls return the next calendar day. Retained means three spaced unassisted recalls, not a guarantee of mastery. Dates use the student device local calendar. Browser-local storage must be retained on the same site address.

## Current behavior

All 432 questions in Tests 14–21 include embedded solutions. Earlier native tests remain included. Generation preserves the specific skill while varying the unknown and reasoning direction. Review identifiers now map correctly across supported complete ID formats, with bounded review-only retries for malformed IDs. A verified built-in fallback is available for the supported absolute-value rational-inequality family and is explicitly labeled when used.

Question and interface checks were run locally with simulated provider responses. Live generation still depends on your selected model and provider.
