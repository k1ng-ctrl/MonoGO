# Knowledge and datasets

Each generated dataset must carry a schema version, upstream commit and data hash, ruleset, simulator version, assumptions, timestamp and coverage/error counts. Team-specific keys include exact species/form, IVs, level, CP, moves and special mechanics. Keep static knowledge separate from observations and inferred probabilities.

## 1. Move catalog and charged damage (first priority)

Import legal fast and charged move pools including legacy and special slots, energy costs/gains, duration, damage, typing, buffs/debuffs and their probabilities. Derive damage using the validated PvPoke damage calculator and exact defender stats; do not use generic type multipliers as damage estimates.

Build a team-specific threat table for every opponent form and legal charged move. Store damage in HP and percent of maximum HP, shielded damage, plausible min/max across attacker configurations, buff stages and ruleset modifiers, and lethal HP thresholds. Distinguish raw damage from effective HP loss. Include fast move damage and CMP attack-stat comparisons. Validate rounding, STAB, shadows, Mega variants and special move behavior.

Energy-conditioned threat analysis: retain possible equipped movesets, a set or distribution of feasible energy values, and observed attacks. For each candidate charged move, classify it as confirmed, possible, affordable in some hypotheses, affordable in all hypotheses, or impossible under current evidence. Affordable does not imply equipped or selected. For example, if feasible energy is 40–50 and a move costs 45, the move is conditionally affordable. A move costing 60 is excluded only under those energy assumptions. Unknown or missed fast moves must widen the range. This supports offline shielding exercises with lethal and nonlethal alternatives and their uncertainty.

## 2. Reverse CP index and damage fingerprints

For each species/form and legal half-level, enumerate IV combinations and index by displayed CP. Store candidate effective attack, defense and maximum HP. Respect level caps, buddy boosts, special forms and acquisition constraints where known. Retain collisions rather than selecting a single configuration arbitrarily. Compress or generate per species lazily.

Damage observations can narrow candidates if the move, buffs, HP reading and rounding are known. CMP observations can constrain attack stats; ties and ambiguous timing must remain possible. Use weighted priors only when supported by data.

## 3. State-dependent matchup matrix

Extend the current nine shield scenarios with starting HP, energy, buffs/debuffs, moveset variants, opponent level/IV hypotheses and relevant timing states. Begin with sparse HP/energy grids and compute exact unusual states on demand. The full Cartesian product grows rapidly; do not materialize it blindly. Store final HP, energy, shields remaining, duration, outcome, damage, and assumptions. Preserve ties and failed simulations separately.

## 4. Breakpoints and resource value

Measure when energy, HP, shield advantage, attack/defense breakpoints or CMP change an outcome. Avoid assuming monotonicity: bait decisions and timing can cause multiple winning intervals. Store tested ranges and boundary evidence. Compare shield/no-shield outcomes, energy overcap, fainting with unused energy and residual resources, using whole-team value rather than only 1v1 ratings.

## 5. Farm-down and transition data

Study how a losing matchup can leave an opponent in a useful HP range for the next Pokémon. Record fast attacks required, energy earned, incoming damage, chance of another charged attack, and residual resources. Also consider catch/switch scenarios, intentional sacrifices, preserving switch alignment and endgame cleanup. These are research scenarios, not automatic actions.

## 6. Recognition fingerprints

Future offline recording analysis may use frame timestamps, name/CP text, HP bar samples, move announcements, animations, audio, particle signatures and switch/faint events. Label confidence and provenance. Distinguish a forced replacement from a voluntary switch. Build versioned labeled clips, including negative examples, device/resolution differences and missed-event tests. No player identifiers are needed.

## 7. Personal metagame and team composition

Record anonymized observed teams, lead/order, league, date/season, rating bracket, revealed moves and outcome. Track incomplete observations and selection bias. Estimate conditional teammate/moveset distributions with smoothing and sample counts. Unrevealed Pokémon are not absent. Weight matchup coverage by encounter frequencies, with uncertainty and time decay. No claims about actual frequencies until measured.

## 8. Team optimization and practice

Explore alternative legal movesets, team ordering, Mega choice, buddy choice, levels and Pokémon in the user's available roster. Evaluate lead, safe switch, closer, shared weaknesses, resource carryover and worst-case coverage; avoid optimizing only mean 1v1 score. Generate counterfactual replay datasets and recurring mistake categories (shield allocation, alignment, energy waste, timing). Build training scenarios from real losses and synthetic hard positions.

## Proposed storage

Existing data/matchups.json and data/cache/ stay unchanged. Future logical datasets: moves, damage, cp-index, cmp, state-matchups, breakpoints, transitions, fingerprints, metagame, team-compositions, replay-events and training-scenarios. Start with JSON, move large indexed tables to SQLite if profiling justifies it. Do not commit generated personal battle logs or large caches.
