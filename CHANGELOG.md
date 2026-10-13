# Changelog

## v0.1.2 — 2026-10-13

Model behaviour unchanged. Removed `tools/sync-engine.js` and its lock files:
projects now copy `src/model.js` from a tagged release and read
`ENGINE_VERSION` to know which one they have.

## v0.1.1 — 2026-10-13

Model behaviour is unchanged from v0.1.0. Adds versioning and corrects the
references.

- `ENGINE_VERSION` constant in `src/model.js` (and exported under Node); a
  test keeps it equal to `package.json`.
- `tools/sync-engine.js` for consumers: pulls a tagged release, records tag,
  commit and sha256 in `engine.lock.json`, and checks local copies for edits.
- References checked against PubMed, publisher pages and AANEM. Kaku 1993
  authors corrected (Lupski JR, Garcia CA, not Lewis and Sumner); EAN/PNS 2021
  dual publication and correction added; full author lists and PMIDs/DOIs
  added. Each reference now records whether the citation and the claim were
  verified. Added Rutkove 2001, Oh 2014 and the AAEM 2001 RNS practice parameter.
- Targets updated to match the sources: normal dispersion limits now follow
  the AAEM consensus per nerve (median/ulnar amplitude ≤25%, area ≤20%,
  duration ≤25%; fibular ≤30%, ≤25%, ≤30%); MG post-exercise increment must
  stay below 60% (Oh 2005), not 100%; Chen 2016 now backs only the median
  motor values.

Calibration: 51 of 52 targets pass. The ulnar sensory peak latency (3.16 ms
against 3.1 ms) still fails, and that 3.1 ms limit itself is in question:
Chen 2016 gives 3.1 ms as an onset, not a peak, latency. Three known gaps unchanged.

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
