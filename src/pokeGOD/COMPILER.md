# Team compilation

One standard preparation flow, not selectable tiers. Global GameMaster facts are reused; league modules define provisional eligibility and candidate pools; expensive 1v1 simulations are specific to the selected team. Rankings are supplementary only. Never discard a released form because of CP or popularity.

Each team hash includes the selected team, league and revision of upstream data, simulator and rules. Per-opponent shards contain enumerated movesets and nine shield results for each selected Pokémon, or an explicit error. Only one opponent is loaded for manual review at a time. Completed shards survive cancellation. The manifest records processed coverage, not proof of successful simulation for every candidate. Rebuild by removing the corresponding team directory when needed; failed entries are not automatically retried yet.

Future: Node worker pool, per-member reuse, independently verified eligibility and move acquisition, damage tables, reverse CP index, state-dependent analysis and whole-battle offline research. Current browser batches are cooperative, not multithreaded.

## Headless compiler v3

Node worker_threads compile one opponent shard per task, largest first, with atomic saves and server progress polling. The browser no longer loads PvPoke. Default workers: available CPU threads minus one, capped at 32; override with MONOGO_WORKERS. Successful calls are counted separately from planned cases and failed movesets. Cancellation preserves completed shards. Smeargle has thirdMoveCost=false and must not generate two charged slots; all single charged moves remain. Cache revision changes, so old shards are not reused. Run node test-leagues.js and node test-headless.js after npm start installs PvPoke. Full runtime and throughput require local verification. No object reuse or timeline suppression yet.
