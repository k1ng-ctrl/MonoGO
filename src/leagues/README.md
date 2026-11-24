# League rules

The registry exposes getLeague(id). Each module defines eligibility, normalized move pools, level defaults and moveset enumeration. The first implementation is master-mega. PvPoke rankings are not consulted. Only entries explicitly marked released by the pinned GameMaster are included; no CP or popularity cutoff. This is a provisional eligibility proxy, not independent verification of official format restrictions.

The compiler includes one or two normal charged moves and optional extra moves in slot 3 for supported Mega forms; both charged slot orders are retained because upstream tie-breaking may depend on order. Duplicate move IDs are removed, not distinct moves. Return/Frustration are derived from upstream tags; Return is not added to Mega forms. Legacy and speculative moves present in upstream pools are not independently acquisition-verified. Non-Mega extra slots (e.g. Cramorant) are not modeled by this first version. Super Mega defaults to level 52 and Mega level 4, other Mega forms level 50 and Mega level 3. These are provisional modeling choices requiring game validation.

Add a new league module and registry entry for later formats, then adapt the UI and simulator cup/CP selection. Do not introduce ranking or minimum-CP eligibility rules. Keep precomputation optimizations separate from actual legality.

The compiler uses one default workload, selected-team-only, nine shield combinations, full HP and zero energy, perfect opponent IVs. Results are stored per opponent in data/teams/<hash>/, allowing resume and bounded browser memory. Failed movesets are explicitly saved, not treated as wins or as fully validated coverage. No whole-team strategy, live capture or automated inputs are implemented.
