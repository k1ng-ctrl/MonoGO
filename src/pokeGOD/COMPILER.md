# Team compilation

One standard preparation flow, not selectable tiers. Global GameMaster facts are reused; league modules define provisional eligibility and candidate pools; expensive 1v1 simulations are specific to the selected team. Rankings are supplementary only. Never discard a released form because of CP or popularity.

Each team hash includes the selected team, league and revision of upstream data, simulator and rules. Per-opponent shards contain enumerated movesets and nine shield results for each selected Pokémon, or an explicit error. Only one opponent is loaded for manual review at a time. Completed shards survive cancellation. The manifest records processed coverage, not proof of successful simulation for every candidate. Rebuild by removing the corresponding team directory when needed; failed entries are not automatically retried yet.

Future: Node worker pool, per-member reuse, independently verified eligibility and move acquisition, damage tables, reverse CP index, state-dependent analysis and whole-battle offline research. Current browser batches are cooperative, not multithreaded.
