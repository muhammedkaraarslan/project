# Vigil Open Intelligence

**Turn fragmented signals into sourced, challenged, market-relevant intelligence.**

Vigil is an open-world intelligence network: specialist analysis connects what happened, what supports it, what might disprove it, and why it could matter to a decision. This repository gives researchers and builders a portable format for that work. A case is a traceable chain from **event → source-bound claims → competing hypotheses → conditional exposure → what to watch**.

Imagine a bridge collapse blocking a port approach. The headline establishes the event; a useful intelligence case also identifies the investigation source, tests whether alternate channels remained open, and shows how a route restriction *could* affect vessel schedules. The [Baltimore bridge case](examples/baltimore-bridge-2024.json) demonstrates the chain with a real NTSB source and an explicit historical-reference label.

## Use it

- **Researchers:** keep claims, evidence, uncertainty and follow-up questions together as a case changes.
- **Developers:** validate case JSON before publishing it or consuming it in an app or agent workflow.
- **Readers:** render a source-linked assessment and compare two revisions without losing the underlying evidence trail.

The repository includes a [versioned JSON Schema](schema/case.v1.schema.json), [TypeScript types](src/index.d.ts), a dependency-free Node.js validator and CLI, two sourced historical examples, and tests. It does not require a hosted Vigil service.

```bash
git clone https://github.com/muhammedkaraarslan/project.git
cd project
node src/cli.js validate examples/*.json
node src/cli.js render examples/baltimore-bridge-2024.json
node src/cli.js compare case-before.json case-after.json
```

`validate` prints one result per file and exits nonzero on an invalid case. `render` writes a Markdown assessment to standard output. `compare` writes machine-readable JSON listing added, removed and changed sources, claims, hypotheses and exposures. Node.js 20 or newer is required; there are no runtime dependencies.

Programmatic use:

```js
import { validateCase, renderCase, compareCases } from './src/index.js';

const result = validateCase(caseJson);
if (!result.valid) console.error(result.errors);
else console.log(renderCase(caseJson));
```

## Case contract

| Layer | Question answered |
| --- | --- |
| Event | What happened, where and when? |
| Sources and claims | Which exact source supports or contradicts each claim? |
| Challenge | What explanations compete, what would falsify them and what remains unresolved? |
| Exposure | Through which conditional channel might a route, company, commodity, sector or market be affected? |
| Assessment | What is the present reading, as of when, and what should be watched next? |
| Provenance | Is this a historical reference study or a case backed by a genuine Vigil detection receipt? |

See [Case format](docs/CASE_FORMAT.md) for field semantics, validation rules and versioning. The two examples are **historical reference studies**, not claims that Vigil detected those events in real time. A `vigil_detection` case must include an actual run ID, timestamp and public receipt URL; the validator rejects a detection label without that receipt.

The examples' exposure links are conditional analysis, not measured price effects or trading signals. Citations bind to individual claims; a URL by itself is not treated as independent corroboration.

## Contribute

Start with [CONTRIBUTING.md](CONTRIBUTING.md). A case contribution should preserve exact source links and retrieval times, distinguish observed facts from hypotheses, and include a falsifier and a concrete next observation. The CI workflow validates the examples and tests the core contract on every push and pull request.

MIT licensed. The schema version is `1.0.0`; package version is `0.1.0`.
