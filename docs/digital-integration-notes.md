# Integration notes

## Inventory

Eight uploaded math sections were added as Vertex Tests 14–21. Each has 54 questions: 40 multiple-choice questions and 14 numeric-response questions, split into two modules of 27. Total added: 432 questions. Source numbers and module numbers remain visible in study mode.

## Source fidelity

Ordinary narrative text and some short math prompts/choices use HTML and MathML. Other source math, diagrams, tables and some text stay as clipped vector elements. Raster graphics already present within a source figure are retained. Question bars, headers, footers and reading/writing sections are excluded from displayed questions. This conversion preserves source graphics instead of claiming a complete manual transcription/redraw.

The full-page graph items and the two-page graph item in SAT Test 10 were handled separately. Numeric answers accept all alternatives listed in the official key. The actual answer-key page was used, not the older preview embedded in one scoring guide.

## Validation performed

- Parsed the scripts in all eight HTML files.
- Executed startup and all 432 question views in a DOM stub.
- Checked 54 unique question IDs per test, 27/27 module boundaries, answer types, primary and alternate answers, vector references, timers and calculator availability.
- Checked launcher file targets and preservation of existing question banks. Generator code was updated across every practice page.
- Rendered representative source-vector/prose combinations for visual inspection and added explicit clipping for equation and figure fragments.
- Full interactive browser visual testing was unavailable in this environment; these checks do not constitute a complete browser or device certification.

## September repair

All 432 added questions have independently written embedded worked solutions. No explanation button opens an external PDF. Repaired answer segmentation, restored complete lower graph choices, removed page-footer fragments, and protected mathematical expressions from being split during text reflow. Saved built-in sessions refresh their question content without deleting answers, bookmarks, or timing data.

Generation now receives the actual example and its solution, preserves its specific mathematical method, and checks similarity before saving. Matching only a broad domain is rejected. This flow was tested with simulated provider responses; no live API generation was run.

## Review exports

HTML review exports retain embedded source definitions. JSON question banks in native-data refer to formatting assets embedded in the corresponding test HTML; they are not standalone question renderers. Import a saved JSON review into the matching test page.

## Official sources

- SAT 4: [Answer key](https://satsuite.collegeboard.org/media/pdf/scoring-sat-practice-test-4-digital.pdf)
- SAT 5: [Answer key](https://satsuite.collegeboard.org/media/pdf/scoring-sat-practice-test-5-digital.pdf)
- SAT 6: [Answer key](https://satsuite.collegeboard.org/media/pdf/scoring-sat-practice-test-6-digital.pdf)
- SAT 7: [Answer key](https://satsuite.collegeboard.org/media/pdf/scoring-sat-practice-test-7-digital.pdf)
- SAT 8: [Answer key](https://satsuite.collegeboard.org/media/pdf/scoring-sat-practice-test-8-digital.pdf)
- SAT 9: [Answer key](https://satsuite.collegeboard.org/media/pdf/scoring-sat-practice-test-9-digital.pdf)
- SAT 10: [Answer key](https://satsuite.collegeboard.org/media/pdf/scoring-sat-practice-test-10-digital.pdf)
- SAT 11: [Answer key](https://satsuite.collegeboard.org/media/pdf/scoring-sat-practice-test-11-digital.pdf)
