# Development roadmap

All tasks below are proposed, not implemented. Keep changes incremental and independently testable.

## Phase 1: deterministic knowledge

- [ ] Normalize move catalog and legal movesets from PvPoke.
- [ ] Build exact charged/fast damage tables for configured teams.
- [ ] Validate shielded damage, type interactions, rounding, buffs, shadows and Mega mechanics.
- [ ] Add energy cost/gain and move timing reference.
- [ ] Add reverse CP/IV/level index and CMP comparisons.
- [ ] Display damage ranges and affordable candidate moves in an offline practice or manual study interface.

Acceptance: deterministic fixtures agree with the validated simulator, unknown moves remain unknown, and the current matchup workflow still works.

## Phase 2: richer matchups

- [ ] Add arbitrary starting HP and energy scenarios.
- [ ] Evaluate alternate legal movesets and stat hypotheses.
- [ ] Derive tested breakpoint intervals and shield/resource value.
- [ ] Research farm-down and residual energy transitions.
- [ ] Profile sparse caches and on-demand simulation.

Acceptance: reproduce the current baseline at full HP/zero energy, record every failure, and avoid unverified interpolated claims.

## Phase 3: recording and inference

- [ ] Import recorded practice/completed battle videos.
- [ ] Build labeled OCR/visual/audio fingerprints.
- [ ] Reconstruct team slots, HP, moves, energy, switches and shields with uncertainty.
- [ ] Maintain replayable event logs and evaluate recognition error.
- [ ] Research iPhone screen viewing separately; no dependence on USB capture for earlier phases.

Acceptance: compare reconstructed states to manually annotated fixtures and report uncertainty rather than invent missing events.

## Phase 4: personal analytics

- [ ] Build anonymized personal meta and team composition statistics.
- [ ] Compare alternative team orders, movesets, IVs, levels and roster choices.
- [ ] Add post-battle counterfactual review and mistake categorization.
- [ ] Generate targeted training exercises and track improvement.

## Phase 5: strategic research

- [ ] Validate a full 3v3 transition engine against fixtures.
- [ ] Solve small known endgames exhaustively.
- [ ] Explore policy search under uncertain opponent moves and teams.
- [ ] Evaluate conditional plan reuse and replanning on replayed unexpected events.
- [ ] Benchmark against baseline policies; report calibration, worst-case and expected outcomes.
- [ ] Add explanations and explicit limits of any claimed forced win.

## Phase 6: future session integration

- [ ] Review game rules and permitted uses before any live competitive integration.
- [ ] Design BATTLE NOW session UX, connection status, disconnect/recovery and privacy controls for permitted practice.
- [ ] Keep offline review and training usable independently of capture.

Next concrete engineering task: the charged move damage catalog, followed by the energy-conditioned candidate-move model in offline scenarios.
