# Contributing

Cases, source corrections, validator improvements and integrations are welcome.

For a case, copy one of the JSON examples and keep the `schemaVersion` at `1.0.0`. Provide a directly accessible source URL, the exact passage/section locator and the retrieval time for every claim. Label retrospective studies `historical_reference`; use `vigil_detection` only when there is a genuine public run receipt. Describe economic exposure as a conditional mechanism with observations to watch, not as a guaranteed price move.

Before a pull request, run `node src/cli.js validate examples/*.json` and `npm test` in your own environment. The repository CI runs those checks again. If you revise a case, keep stable IDs for unchanged sources, claims and exposures so `vigil compare` yields a useful revision record.

Prefer links and short locators over copying full articles or private materials. Do not submit credentials, private personal information, unpublished field evidence or a source you are not entitled to share.
