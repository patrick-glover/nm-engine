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

## Versioning

Releases are git tags (`v0.1.0`, …) with notes in [CHANGELOG.md](CHANGELOG.md).
Consumers (the emg primer, morning report decks) copy `src/model.js` from a
tagged release and note which version they use.

- **Patch:** fixes that move outputs toward calibration targets without changing the API.
- **Minor:** new behaviour or parameters; existing calls keep working.
- **Major:** API changes, or changes that alter outputs a consumer depends on.

Every release regenerates the calibration report, so each version records how
well it matched the literature.

Educational use only. Reference values are approximate; labs differ.
