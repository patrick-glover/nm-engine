# Changelog

## v0.1.0 — 2026-10-13

First versioned release. `src/model.js` is unchanged from the emg primer at
commit `1b236d3`.

- Added the calibration suite: 49 literature targets across normal values,
  dispersion, temperature, axon loss, uniform and patchy demyelination,
  stimulation and repetitive stimulation, plus 3 documented gaps.
- Added CALIBRATION.md with the provenance of every parameter.

Calibration at this release: 48 of 49 targets pass. Ulnar sensory peak latency
is 3.16 ms against a 3.1 ms limit. Known gaps: CMT distal latency, terminal
latency index, and over-dispersion at typical CMT1A velocities.
