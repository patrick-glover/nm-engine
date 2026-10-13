/* ═══════════ References behind the calibration targets ═══════════
   `verified` means someone has checked the citation and the number against the
   source itself. Entries were first written from memory, so every one starts
   unverified: check it before quoting it to anyone. */
module.exports={
  PS:{cite:'Preston DC, Shapiro BE. Electromyography and Neuromuscular Disorders: Clinical-Electrophysiologic-Ultrasound Correlations. 4th ed. Elsevier; 2020.',
    used:'Normal values (distal latency, amplitude, velocity, SNAPs); RNS decrement >10% as abnormal; maximal MG decrement at the 4th–5th response; demyelinated nerves need more stimulating current.',verified:false},
  CHEN2016:{cite:'Chen S, Andary M, Buschbacher R, et al. Electrodiagnostic reference values for upper and lower limb nerve conduction studies in adult populations. Muscle Nerve. 2016;54(3):371–377.',
    used:'Cross-check of the normal values above.',verified:false},
  EANPNS2021:{cite:'Van den Bergh PYK, van Doorn PA, Hadden RDM, et al. European Academy of Neurology/Peripheral Nerve Society guideline on diagnosis and treatment of chronic inflammatory demyelinating polyradiculoneuropathy: report of a joint Task Force — second revision. J Peripher Nerv Syst. 2021;26(3):242–268.',
    used:'Demyelinating thresholds: distal latency ≥150% ULN, velocity ≤70% LLN, conduction block ≥30% amplitude drop, abnormal temporal dispersion >30% duration increase.',verified:false},
  OLNEY1999:{cite:'Olney RK. Consensus criteria for the diagnosis of partial conduction block. Muscle Nerve Suppl. 1999;8:S225–S229.',
    used:'Normal nerves show some proximal amplitude decline from physiological dispersion, but below block thresholds.',verified:false},
  DENYS1991:{cite:'Denys EH. AAEM minimonograph #14: The influence of temperature in clinical neurophysiology. Muscle Nerve. 1991;14(9):795–811.',
    used:'Velocity falls about 1.5–2.5 m/s per °C of cooling; amplitude and duration increase.',verified:false},
  HARDING1980:{cite:'Harding AE, Thomas PK. The clinical features of hereditary motor and sensory neuropathy types I and II. Brain. 1980;103(2):259–280.',
    used:'Median motor velocity <38 m/s separates HMSN I (CMT1) from HMSN II.',verified:false},
  LEWIS1982:{cite:'Lewis RA, Sumner AJ. The electrodiagnostic distinctions between chronic familial and acquired demyelinative neuropathies. Neurology. 1982;32(6):592–596.',
    used:'Familial demyelinating neuropathy: uniform slowing without conduction block or abnormal dispersion.',verified:false},
  KAKU1993:{cite:'Kaku DA, Parry GJ, Malamut R, Lewis RA, Sumner AJ. Uniform slowing of conduction velocities in Charcot-Marie-Tooth polyneuropathy type 1. Neurology. 1993;43(12):2664–2667.',
    used:'CMT1 slowing is uniform across nerves and segments, distal segments included.',verified:false},
  KIMURA2013:{cite:'Kimura J. Electrodiagnosis in Diseases of Nerve and Muscle: Principles and Practice. 4th ed. Oxford University Press; 2013.',
    used:'Phase cancellation affects brief SNAPs far more than CMAPs over the same distance; large axons have the lowest threshold to external stimulation.',verified:false},
  OH2005:{cite:'Oh SJ, Kurokawa K, Claussen GC, Ryan HF Jr. Electrophysiological diagnostic criteria of Lambert-Eaton myasthenic syndrome. Muscle Nerve. 2005;32(4):515–520.',
    used:'LEMS: low baseline CMAP, post-exercise increment ≥100% (≥60% as a more sensitive cut-off).',verified:false},
  HURSH1939:{cite:'Hursh JB. Conduction velocity and diameter of nerve fibers. Am J Physiol. 1939;127(1):131–139.',
    used:'Velocity scales with fibre diameter (about 6 m/s per µm), the basis for ranking axons by size.',verified:false},
  HENNEMAN1965:{cite:'Henneman E, Somjen G, Carpenter DO. Functional significance of cell size in spinal motoneurons. J Neurophysiol. 1965;28:560–580.',
    used:'Larger motor neurons have larger, faster axons and larger motor units.',verified:false},
};
