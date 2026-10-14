# nm-engine

The simulation core behind Summation, the interactive EMG and nerve conduction
primer, and the neuromuscular teaching sims built on it.

The engine simulates nerve conduction studies by summing the individual
responses of a population of axons and motor units, each with its own
conduction velocity, threshold and waveform, so temporal dispersion, phase
cancellation, conduction block and axon loss come out of the simulation rather
than being hard-coded. It also models neuromuscular junction transmission to
simulate repetitive nerve stimulation in normal, myasthenia gravis and
Lambert-Eaton conditions.

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

## Versioning

Releases are git tags (`v0.1.0`, …) with notes in [CHANGELOG.md](CHANGELOG.md).
`ENGINE_VERSION` in `src/model.js` always equals the tag, so a page can show
which engine it runs.

- **Patch:** fixes that move outputs toward calibration targets, docs and references; no API change.
- **Minor:** new behaviour or parameters; existing calls keep working.
- **Major:** API changes, or changes that alter outputs a consumer depends on.

**Releasing.** Bump `ENGINE_VERSION` and `package.json` together, run
`npm test` and `npm run calibrate`, add a CHANGELOG entry, commit, then tag
`vX.Y.Z` and push the tag. Never move a published tag.

**Using it in a project.** Copy `src/model.js` from a tagged release into the
project and load it with a `<script>` tag (or `require` it under Node). Don't
edit the copy; change nm-engine and release instead. `ENGINE_VERSION` tells you
which release a project has, and the project can display it.

Current users: the emg primer (`patrick-glover/emg`) and local morning-report decks.

Educational use only. Reference values are approximate; labs differ.
