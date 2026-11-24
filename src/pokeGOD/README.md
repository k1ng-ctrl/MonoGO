# pokeGOD

**Status: research and design only.** pokeGOD is the proposed strategic intelligence layer of MonoGO, inspired by chess engines but designed for Pokémon GO's partially observable, simultaneous-action, resource-constrained PvP battles.

The objective is to understand not merely which Pokémon wins a 1v1 matchup, but which decisions maximize the chance of winning an entire 3v3 battle. It should distinguish observations from assumptions, explain its reasoning, and revise its strategy whenever new evidence changes the state.

## Design documents

- [DATASETS.md](DATASETS.md): precomputed knowledge and learned statistics.
- [STRATEGY.md](STRATEGY.md): conditional plans, uncertainty, search and replanning.
- [ARCHITECTURE.md](ARCHITECTURE.md): module boundaries, data contracts and future capture integration.
- [ROADMAP.md](ROADMAP.md): incremental implementation and validation.

## Starting point

MonoGO already has a working local Node.js website, a configurable team, the original PvPoke browser simulator, and cached 1v1 matchup results for nine shield combinations. Master League: Mega Edition is the initial supported format. The original test team is Mega Mewtwo Y (CP 7441, 15/15/15, level 52), Groudon (CP 4642, 15/15/14, level 50), and Crowned Sword Zacian (CP 5196, 15/15/12, level 44).

The existing dataset uses ranked opponents, recommended moves, perfect opponent IVs, full starting HP and zero energy. It is a baseline, not a complete model of a live battle.

## Principles

- Local-first, modular, reproducible, explainable.
- Reuse PvPoke mechanics, but validate simulator behavior against current game rules and recorded battles.
- Unknown is not zero, and a battle rating is not a win probability.
- Prefer conditional strategies over rigid move scripts.
- A simulated 100% success rate is not proof of a guaranteed win. A guarantee requires exhaustive coverage of legal opponent responses and uncertainty under a validated model.
- Develop and evaluate in offline simulations, practice and post-battle review. Live competitive assistance may violate Pokémon GO rules; do not assume approval. No automated game inputs, private API access or game modifications are part of this design.

No runtime implementation is introduced by these documents.
