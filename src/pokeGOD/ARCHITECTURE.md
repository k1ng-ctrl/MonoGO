# Proposed architecture

MonoGO remains a local Node.js application with vanilla browser UI and the original PvPoke source in src/pvpoke. pokeGOD is a future independent domain layer; do not edit upstream code just to add integration logic.

## Boundaries

- Catalog adapter: normalized species, moves, CP multipliers, formats and ruleset versions.
- Mechanics adapter: validated damage, energy, timing, CMP and special mechanics.
- Dataset builder/store: versioned generation, cache keys, indexed lookup, integrity checks, cancellation and progress.
- Battle state/replay: event-sourced state reconstruction and deterministic replay.
- Belief model: hidden stats, energy, moves and team hypotheses with explicit evidence and uncertainty.
- Search research: simulate alternative policies in a sandbox, evaluate terminal outcomes and produce explainable review results.
- Analytics: personal meta, team optimization, replay review and training scenarios.
- Capture adapter: future iPhone screen viewer integration, OCR and labeled event extraction for offline recordings or permitted practice.

Future UI concept: a BATTLE NOW entry beside Edit team would represent a separate session lifecycle and capture connection, subject to game rules. Do not implement it in this documentation commit. The existing manual matchup page remains operational. First develop an offline replay/import workflow that does not require a phone connection.

## Suggested contracts (illustrative, not existing code)

Observation: { id, timestampMs, source, kind, payload, confidence }
State: { rulesetId, revision, clock, ours, theirs, uncertainty }
PokemonState: { speciesId, possibleSpeciesIds, hpRange, energyRange, movesKnown, movesPossible, buffs, fainted }
TeamState: { slots, activeSlot, shields, switchReadyRange }
Evaluation: { stateRevision, modelVersion, method, horizon, outcomeEstimate, assumptions, coverage, explanation }

Use exact values only when established. Ranges represent uncertainty rather than random noise. Preserve correlated hypotheses where independent min/max ranges would invent impossible combinations. Use immutable snapshots for evaluation and append-only events for debugging. Do not send personal recordings to external services by default.

## Execution and storage

Keep current UI and cache contracts stable. Prefer workers or isolated processes for expensive offline computations, with cancellation and progress. Use versioned artifacts and atomic writes. Cache keys include mechanics and generator versions, upstream data, ruleset and complete team configuration. Store provenance and coverage alongside each result.

## Open technical questions

- Does the pinned PvPoke version accurately represent every Mega and extra charged move mechanic?
- Can its battle/training APIs provide reproducible 3v3 transitions and explicit choices?
- Which rules and timings differ by league or season?
- How accurate are video-derived HP, energy and move observations?
- What dataset sizes and search budgets are practical on the user's laptop?
- What forms of capture and assistance are permitted by the current game rules?
