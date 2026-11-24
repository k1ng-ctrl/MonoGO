# MonoGo
ChatGPT tool
Node.js 20+ and Git required. Extract into the existing MonoGo folder (preserve src/pvpoke), or start in a new folder. Run `npm start`, open http://localhost:3000. A missing PvPoke clone is downloaded at the pinned commit automatically. No npm install needed. Configure the team in settings.js. Generate all matchups saves data/matchups.json and offers a download. Opponents are the ranked Mega Master League pool, with recommended moves and assumed perfect IVs; not every possible moveset. The original PvPoke simulator runs in the browser. No developer console needed. Upstream integration requires local testing; errors are shown in the UI. PvPoke upstream: https://github.com/pvpoke/pvpoke (MIT).

## Dashboard workflow

Select PvP, choose Master League: Mega Edition, configure the team (CP, IVs and moves), then Prepare for battle. The browser runs simulations in asynchronous batches while the page remains open. Complete datasets are cached under `data/cache/` by team and upstream data revision, and saved to `data/matchups.json`. Identical configurations reuse the cache. Only the ranked opponent pool and the tested Mega Mewtwo Y level-4 special configuration are currently supported. Use for manual matchup study and review.

## Standard team compiler

The current workflow now compiles released GameMaster forms independently of rankings, with enumerated opponent movesets. See `src/leagues/README.md` and `src/pokeGOD/COMPILER.md`. Results are sharded under `data/teams/`; older ranking-based caches are not reused. No tiers.
