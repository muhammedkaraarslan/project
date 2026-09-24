# Vigil Open Intelligence

An open case format for turning fragmented signals into **sourced, challenged, market-relevant intelligence**.

Vigil's intelligence network is built to help people understand an event sooner, test the evidence behind it, and see what it could change. This repository will make the *case format* inspectable and useful to other builders without publishing Vigil's live product or proprietary intelligence engine.

## What a case should answer

Consider a reported tanker diversion near a strategic shipping route. A useful case should let a reader trace:

1. **What happened?** Event, place, time, and the distinction between a report and a confirmed observation.
2. **What supports it?** Source links, retrieval times, and evidence tied to specific claims.
3. **What might contradict it?** Alternative explanations, uncertainty, and facts that would change the assessment.
4. **Why might it matter?** Potential exposure for a route, commodity, company, or market—not an automatic trading call.
5. **What should we watch next?** Observable developments that could strengthen or weaken the thesis.

## Initial scope

- A versioned, machine-readable intelligence case format.
- A validator for case structure and evidence references.
- A small set of clearly labelled historical examples.

This is the first Vigil-specific commit, not a released schema, CLI, benchmark, live feed, or API. Historical examples will be labelled as reference studies unless they are backed by genuine Vigil detection receipts.

The production website, ingestion infrastructure, ranking and admission logic, classifier prompts, private intelligence, Marketplace operations, credentials, and deployment tooling remain outside this repository.
