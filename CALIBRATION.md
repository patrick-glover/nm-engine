# Where the numbers come from

Every waveform in Summation (the EMG primer) and the sims built on this engine is computed, not drawn. This page explains how the
model is built, which numbers come from the literature, which were tuned, and
how we check the result. The current check results are in
[calibration/REPORT.md](calibration/REPORT.md).

```
npm test            # calibration suite (Node 18+, no dependencies)
npm run calibrate   # regenerate calibration/REPORT.md
```

## The short answer for an attending

1. **The structure comes from physiology.** A nerve is a population of
   individual axons. Each has its own conduction velocity, threshold and motor
   unit. A recorded response is the sum of every unit that arrives. Dispersion,
   phase cancellation, the stimulus–response curve and the effects of axon loss
   all follow from that sum. None of them is drawn by hand.
2. **Most parameters are tuned, not measured.** The velocity range, unit sizes,
   thresholds and waveform shapes were adjusted until a normal median, ulnar and
   fibular nerve fell inside published reference limits. Each parameter is
   labelled below as *literature*, *tuned* or *modelling choice*.
3. **The disease behaviour is checked separately.** The normal-value targets were
   also the tuning targets, so passing them proves little on its own. The
   stronger evidence is the set of disease checks the parameters were *not*
   tuned to: that axon loss never reaches the demyelinating range, that cooling
   slows conduction by the published amount, that uniform demyelination
   does not mimic block, and that MG and LEMS give the right RNS patterns.
4. **Where the model is wrong, it says so.** Known gaps are listed in the
   report with the reason and the fix. They are not hidden by loosening a target.

It is a teaching model. It reproduces the patterns electromyographers
reason with, at roughly the right magnitudes. It is not a cable-equation
simulation and should not be used to interpret a patient's study.

## How the model works

`src/model.js`, in the order a response is computed:

1. **Population.** Each nerve has 200 motor axons and 300 sensory axons, ranked
   by size (rank *r* from 0, small, to 1, large). The same population is reused
   every time, so changing a slider moves the same axons.
2. **Conduction.** Each axon travels from the stimulation site to the recording
   electrode in 1 cm steps. Its speed in each step depends on its normal
   velocity, the nerve, temperature, and any demyelination in that 5 cm zone.
   A lesion can block it, either in a focal region or at random per zone.
3. **Stimulation.** An axon fires if the current exceeds its threshold. The
   threshold is higher for deeper sites and for demyelinated axons.
4. **Summation.** Every stimulated, surviving, unblocked axon adds its unit
   waveform at its arrival time. The response is the sum.
5. **Measurement.** Latency, amplitude, duration and area are read off the
   sum the way a lab would (conventions below).

## Parameters and where each came from

**L** = taken from the literature · **T** = tuned so the outputs match a
reference target · **M** = modelling choice, a simplification we made on purpose

### Population

| Parameter | Value | Origin | Rationale |
|---|---|---|---|
| Motor axons per nerve | 200 | M | Order of magnitude of motor unit number estimates for distal hand muscles; enough units for smooth sums. |
| Sensory axons per nerve | 300 | M | Enough fibres for a smooth SNAP. |
| Motor velocity by size rank | 33 + 23·*r*^0.6 m/s (33–56) | T | Velocity scales with fibre diameter [Hursh 1939]. The range and skew were tuned so the *fastest* fibres give normal velocities. Measured velocity reflects the fastest fibres only. |
| Sensory velocity by size rank | 40 + 18·*r*^0.7 m/s (40–58) | T | As above, tuned to sensory reference values. |
| Nerve velocity factor | median 1.0, ulnar 1.01, fibular 0.84 | T | Leg nerves conduct more slowly than arm nerves. |
| Proximal speed-up | up to +10% over the first 60 cm | T | Proximal segments conduct faster. Keeps upper-arm segment velocities realistic. |
| Motor unit size | 0.35 + 1.3·*r*^1.6 (relative) | M | Size principle [Henneman 1965]: large axons drive large motor units. |
| Sensory fibre potential size | 0.6 + 0.8·*r* | M | Larger fibres give larger potentials. |
| Amplitude scale | motor ×0.062, sensory ×0.28; per nerve: median 1, ulnar 1 (sensory 0.85), fibular 0.6 (sural 0.45) | T | Sets CMAP and SNAP amplitudes in mV and µV against reference values. |

### Stimulation

| Parameter | Value | Origin | Rationale |
|---|---|---|---|
| Motor threshold | (19 − 11·*r*) mA, ±12% log-normal scatter | T, M | Large axons have the lowest threshold to external stimulation [Kimura]. Values tuned so a normal nerve saturates around 20–25 mA. |
| Sensory threshold | (14 − 6·*r*) mA, ±10% scatter | T | As above. |
| Site depth | ×1.0 distal, up to ×1.5 at the axilla | T | Deeper sites need more current. |
| Demyelination | threshold ÷ √(local velocity factor) | M | Damaged myelin raises the threshold, so under-stimulated proximal sites can mimic block [Preston & Shapiro]. The exact form is a choice. |

### Latency, temperature and waveforms

| Parameter | Value | Origin | Rationale |
|---|---|---|---|
| Motor residual latency | 2.45 ± 0.22 ms per axon | T | Terminal branches, junction (~1 ms) and muscle activation. Tuned so distal motor latencies are normal. **Does not slow with demyelination; see gap CMT-DML.** |
| Temperature, velocity | −3% per °C below 32 °C | T | Gives about 1.5 m/s per °C at normal velocities [Denys 1991]. |
| Temperature, timing | waveforms and residual latency +3% per °C | M | Cooling prolongs channel kinetics. |
| Temperature, amplitude | +2.5% per °C | T | Cooling increases amplitude [Denys 1991]. |
| Motor unit waveform | biphasic, ~11 ms | M | Difference of Gaussians, initial negative. Duration sets how much phase cancellation occurs. |
| Sensory fibre waveform | triphasic, ~2.2 ms | M | Brief potential, which is why SNAPs cancel more than CMAPs [Kimura]. |

### Disease

| Parameter | Value | Origin | Rationale |
|---|---|---|---|
| Axon loss | removes a fraction of axons, at random or largest first | M | Random loss lowers amplitude in proportion. Largest-first shows the most slowing axon loss can cause. |
| Diffuse demyelination | velocity × (1 − demy·(0.55 + 0.45·*r*)) per zone | M | Large, heavily myelinated fibres lose the most speed. **At heavy settings this reverses the speed order and over-disperses; see gap CMT-TYPICAL-NOBLOCK.** |
| Patchiness | scatters that factor ±90% per axon per 5 cm zone | M | Non-uniform slowing gives abnormal dispersion. |
| Diffuse block | blocks each axon in a zone with probability demy-block × 8% | M | Block accumulates with length. Phenomenological; not safety-factor based. |
| Velocity floor | an axon slowed below 10% of normal is blocked | M | Very severe demyelination fails to conduct. |
| Focal lesion | 5 cm region; slowing and block probability set separately | M | Entrapment, MMN, and similar. |

### Measurement conventions

| Measure | How the model reads it | Note |
|---|---|---|
| Onset latency | arrival of the earliest stimulated unit | A lab reads the first deflection off the trace, which is usually slightly later. |
| Amplitude | baseline to negative peak | Standard. |
| Duration | onset to the first baseline return after the negative peak | Negative-peak duration, as used in the EAN/PNS 2021 criteria. |
| Area | area of the negative phase | Standard. |
| Velocity | distance ÷ onset-latency difference | Standard two-site method. |
| No response | below 0.08 mV (motor) or 1.5 µV (sensory) | Detection floor. |

### Neuromuscular junction

| Parameter | Value | Origin | Rationale |
|---|---|---|---|
| Safety factor | log-normal, mean 3.6 | T | Normal junctions never fail at 3 Hz. |
| Release fraction | 0.20 (normal, MG), 0.045 (LEMS) | T | LEMS reduces release probability. |
| Quantal response | 0.46 (mild MG), 0.36 (moderate MG) | T | MG reduces the postsynaptic response. |
| Store depletion and refill | depletes by release fraction; refills at 1.15/s, sped up by mobilisation | T | Gives the U-shaped decrement with its low point at the 4th–5th response. |
| Post-exercise facilitation | release ×(1 + 0.42·e^(−t/35 s))⁴ | T | Short-lived increment after brief exercise. |
| Post-exercise exhaustion | peaks at −13% around 150 s | T | Decrement worsens 2–4 minutes after exercise. |
| Endplate noise | ±7% per response | M | Run-to-run variability. |

## Known gaps

These are tracked as targets with status `gap` in `calibration/targets.js`, so
they show up in every report.

- **Distal latency doesn't slow in demyelination (CMT-DML, CMT-TLI).**
  Simulated CMT1A median distal latency is about 4.6 ms, against a criterion of
  ≥6.6 ms that CMT1A routinely meets.
- **Uniform demyelination over-disperses at realistic CMT velocities
  (CMT-TYPICAL-NOBLOCK).** At a median velocity of ~24 m/s, the simulated CMAP
  falls 58% from wrist to axilla, which meets the block criterion.
- **Ulnar sensory peak latency is 0.06 ms over the upper limit (NORM-ULN-SLAT).**
  This is a calibrated target that currently fails. The 3.1 ms limit is
  itself in question: Chen 2016 gives 3.1 ms as the ulnar *onset* latency
  limit and 4.0 ms for peak latency. Check Preston & Shapiro before changing
  either the model or the target.

Not modelled at all, so nothing tests them yet:

- Reinnervation: surviving units never enlarge after axon loss, so chronic
  neuropathies don't show preserved CMAPs or large needle MUAPs.
- Temperature effects on block (warming worsens block in demyelinated nerve).
- Stimulus pulse width, anodal block, and current spreading to neighbouring nerves.
- F-waves, A-waves, H-reflexes.
- Muscle-specific motor unit shapes and electrode geometry.

## Changing the model

1. Make the change in `src/model.js`.
2. Run `npm test`. Every calibrated target must still pass.
3. If a known gap starts passing, change its status to `calibrated`.
4. If you add behaviour, add a target for it in `calibration/targets.js`, with
   a reference in `calibration/references.js`. Set the expected value from the
   source, never from the model's output.
5. Run `npm run calibrate` and commit the updated report with the change.

The disease presets in the primer's chapter 3 (`PRESETS3` in the emg repo's
`src/app.js`) are copied into `calibration/targets.js` as `PRESET`. If you
change one, change the other.

## References

`calibration/references.js` lists each source with its PMID or DOI, what we
use it for, and two separate judgements recorded on 2026-10-13: whether the
**citation** is correct, and whether the **claim** was seen in the source
(*supported*), only partly or secondhand (*partial*), or not checked
(*unverified*, mostly textbook pages that aren't online). The report prints
all of this. Before quoting a number marked *partial* or *unverified*, check
it in the source.
