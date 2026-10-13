# nm-engine

The simulation core behind Summation, the interactive EMG and nerve conduction
primer, and the neuromuscular teaching sims built on it.

A nerve is a population of individual axons and motor units. Each has its own
conduction velocity, threshold and unit waveform, and every response is their
sum, so dispersion, phase cancellation, block and the effects of axon loss come
out of the model rather than being drawn by hand. The engine also models the
neuromuscular junction for repetitive stimulation (normal, MG, LEMS).

- `src/model.js`: the engine. Plain JavaScript, no dependencies. Works as a
  browser `<script>` (global functions) or under Node (`require`).
- `calibration/`: the targets the model is checked against, their references,
  and the generated [REPORT.md](calibration/REPORT.md).
- [CALIBRATION.md](CALIBRATION.md): how the model was built, where every
  parameter came from, and its known gaps.

```
npm test            # calibration suite (Node 18+)
npm run calibrate   # regenerate calibration/REPORT.md
```

## Versioning and chain of custody

Releases are git tags (`v0.1.0`, …) with notes in [CHANGELOG.md](CHANGELOG.md).
`ENGINE_VERSION` in `src/model.js` always equals the tag, so a page can show
which engine it runs.

- **Patch:** fixes that move outputs toward calibration targets, docs and references; no API change.
- **Minor:** new behaviour or parameters; existing calls keep working.
- **Major:** API changes, or changes that alter outputs a consumer depends on.

**Releasing.** Bump `ENGINE_VERSION` and `package.json` together, run
`npm test` and `npm run calibrate`, add a CHANGELOG entry, commit, then tag
`vX.Y.Z` and push the tag. Never move a published tag.

**Consuming.** Projects never edit their copy of the engine. Each one keeps
`tools/sync-engine.js` (copied from this repo) and an `engine.lock.json`
recording the release tag, commit and sha256 of its copy:

```
node tools/sync-engine.js sync v0.1.1      # pull a release, write the lock
node tools/sync-engine.js check            # local copy still matches the lock?
node tools/sync-engine.js check --remote   # …and the tag still points to that commit?
```

Current consumers: the emg primer (`patrick-glover/emg`) and local
morning-report decks.

Educational use only. Reference values are approximate; labs differ.
