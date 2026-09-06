# Repair validation — v4.1.0

- 20 test pages, 1,120 questions: all answer entries and embedded solution steps checked for presence and rendering through the application functions.
- 432 newly authored solutions across Tests 14–21; primary and alternative numeric answers accepted.
- All 432 new question views execute in a simulated DOM.
- Answer-region repair includes empty and merged rows, superscript preservation, complete lower graph choices, and removal of page-footer fragments.
- Source text coverage checked around answer labels in the seven extractable-text PDFs; no uncovered answer-row tokens remained. Test 4 source uses outlined text and was checked through source images and existing native choices.
- Representative repaired fractions and full graph choices rendered and visually checked.
- Generation uses the selected example and worked method; simulated matched and mismatched responses verify that only matching responses are saved. No live provider call was made.
- Saved-question migration tested for all eight added tests while preserving answers, bookmarks, and elapsed time.
- All 22 password gates accept Sat800 and reject the former password and incorrect case.
- Browser-device end-to-end testing was unavailable; validation used JavaScript execution and standalone vector rendering.
