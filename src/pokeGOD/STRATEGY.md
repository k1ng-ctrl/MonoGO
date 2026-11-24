# Strategic planning under uncertainty

## Vision

pokeGOD should research the strongest achievable policy from a battle state, not just recommend the Pokémon with the highest rating. A policy is a conditional set of decisions responding to possible opponent actions. A fixed script assumes the opponent cooperates; a policy does not.

The user's motivating example is: if a winning strategy is known, retain it while its assumptions hold; if the opponent takes an unexpected action or new information appears, recompute the strongest strategy. This is a receding-horizon planning concept. Implement and validate it first in synthetic games and offline replay analysis.

## State and uncertainty

A state includes both teams' remaining Pokémon, active slots, HP, energy, shields, buffs/debuffs, move timing, switch availability, battle clock and applicable rules. Unrevealed opponents, exact IVs, equipped moves and missed events create hidden variables. Maintain a belief set or weighted hypotheses rather than a single fictional exact state.

New evidence updates hypotheses. Contradictions should trigger reconciliation, wider uncertainty and invalidation of stale plans, not negative energy or impossible HP. Distinguish observed, inferred and assumed fields. Retain timestamps and provenance.

## Research search methods

- Exhaustive enumeration for small fully specified endgames and deterministic fixtures.
- Minimax or simultaneous-action game models for worst-case responses; a simple alternating-turn chess model is insufficient.
- Monte Carlo tree search or belief-state sampling for larger uncertain scenarios; a sampled win fraction depends on the sampling and opponent model.
- Beam search, memoization/transposition tables and bounded horizons for tractability.
- Dynamic programming for reusable exact small subproblems.
- Reinforcement learning only after a validated simulator and baseline policies exist; compare against held-out teams and strategies.

The current PvPoke 1v1 simulator cannot be assumed to expose arbitrary whole-battle transitions. Investigate its action and training modules; a separate validated 3v3 transition engine may be needed. Never conflate the existing matchup rating with a state value.

## Policy evaluation

Optimize terminal battle outcome, not local HP or matchup score alone. Intermediate evaluation may consider remaining team health, shield inventory, stored energy, alignment, switch cooldown, tempo and uncertainty. Evaluate expected and worst-case outcomes separately. A robust policy can sacrifice a local matchup to preserve an advantageous future state.

Report whether a result is exact under a bounded model, a sampled estimate, a heuristic, or unknown. Include model version, horizon, coverage, assumed opponent distribution and uncertainty. A 100/100 simulation result is not a 100% guarantee. Even exhaustive modeled wins do not cover network lag, recognition errors, unmodeled mechanics or human execution.

## Plan lifecycle (offline research)

Represent a plan as a versioned policy tied to a state snapshot, assumptions, legal response branches, and evaluation metadata. Replay the observed events against that snapshot. If the next state is covered, reuse the relevant branch; otherwise mark the plan stale and evaluate from the updated state. Also invalidate when new observations change a hidden-state hypothesis or a rule/data version changes. Compare planned and actual outcomes in completed battle reviews.

Example: a simulated endgame is winning if an opponent has only a particular charged move. Revealing another legal move invalidates that conditional result. A revised review must include both possibilities where evidence permits, rather than labeling the original line guaranteed.

## Validation

Use exact small-state fixtures, replay comparisons, randomized legal states, deterministic seeds, and checks on HP/energy/shields. Compare against simple policies and the original PvPoke results where assumptions align. Track calibration, regret versus alternative decisions, replay reconstruction accuracy and compute cost. Keep real-time competitive deployment outside the initial scope pending rules and compliance review.
