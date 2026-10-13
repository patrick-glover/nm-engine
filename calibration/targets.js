/* ═══════════ Calibration targets ═══════════
   Each target is one claim the model should satisfy, with the reference it
   comes from. Targets are set from the literature, never from the model's own
   output: if the model misses one, it fails, or is marked as a known gap with
   a reason.

   status: 'calibrated' = must pass; 'gap' = documented failure the model is
   expected to miss for now (the test suite reports it without failing). */
const {NERVES,motor,sensory,currentFor,rns}=require('./harness.js');

/* The teaching presets shown in the primer's chapter 3. These mirror PRESETS3 in
   the emg repo's src/app.js; keep the two in step. */
const PRESET={
  cmt1a:{demy:.6,loss:.25,lossS:.7},
  cidp:{demy:.5,patch:.75,dblock:.6,loss:.15},
};
/* uniform demyelination strong enough to give a typical CMT1A median velocity (~20–25 m/s) */
const CMT_TYPICAL={demy:.7,loss:.3};

const pct=v=>(v>=0?'+':'−')+Math.abs(v*100).toFixed(0)+'%';
const ms=v=>v.toFixed(2)+' ms', mv=v=>v.toFixed(2)+' mV', uv=v=>v.toFixed(0)+' µV', mps=v=>v.toFixed(1)+' m/s', x=v=>v.toFixed(2)+'×';
const drop=v=>(v*100).toFixed(0)+'% drop', ofLimit=v=>(v*100).toFixed(0)+'% of limit';
const minOf=a=>Math.min(...a.filter(v=>v!=null)), maxOf=a=>Math.max(...a.filter(v=>v!=null));
const T=[];

/* ═══════════ 1 · Normal nerves sit inside reference limits ═══════════ */
for(const [nk,nv] of Object.entries(NERVES)){
  const n=nv.norm,sn=nv.sensory.nerve||nv.name,id=nv.name.toUpperCase().slice(0,3);
  const src=['PS'], motorSrc=nk==='median'?['PS','CHEN2016']:src;
  T.push(
    {id:`NORM-${id}-DML`,group:'Normal nerves',claim:`${nv.name} distal motor latency ≤ ${n.dml} ms`,
      measure:()=>motor(nk).dml,expect:{max:n.dml},fmt:ms,sources:motorSrc,status:'calibrated'},
    {id:`NORM-${id}-AMP`,group:'Normal nerves',claim:`${nv.name} CMAP amplitude ≥ ${n.amp} mV`,
      measure:()=>motor(nk).amp,expect:{min:n.amp},fmt:mv,sources:motorSrc,status:'calibrated'},
    {id:`NORM-${id}-CV`,group:'Normal nerves',claim:`${nv.name} motor velocity ≥ ${n.cv} m/s in every segment`,
      measure:()=>minOf(motor(nk).cv),expect:{min:n.cv},fmt:mps,sources:motorSrc,status:'calibrated'},
    {id:`NORM-${id}-SAMP`,group:'Normal nerves',claim:`${sn} SNAP amplitude ≥ ${n.samp} µV`,
      measure:()=>sensory(nk).amp,expect:{min:n.samp},fmt:uv,sources:src,status:'calibrated'},
    {id:`NORM-${id}-SLAT`,group:'Normal nerves',claim:`${sn} sensory peak latency ≤ ${n.slat} ms at 14 cm`,
      why:nk==='ulnar'?'Disputed limit: 3.1 ms is the Preston & Shapiro peak-latency value as recalled (unverified). Chen 2016 gives 3.1 ms as the ulnar onset-latency limit and 4.0 ms for peak latency. Confirm against the textbook before changing the model or the target.':undefined,
      measure:()=>sensory(nk).peakLat,expect:{max:n.slat},fmt:ms,sources:src,status:'calibrated'},
    {id:`NORM-${id}-SCV`,group:'Normal nerves',claim:`${sn} sensory velocity ≥ ${n.scv} m/s`,
      measure:()=>sensory(nk).cv,expect:{min:n.scv},fmt:mps,sources:src,status:'calibrated'},
  );
}

/* ═══════════ 2 · Physiological dispersion over distance ═══════════ */
/* AAEM consensus upper limits of normal for change from distal to proximal stimulation */
const OLNEY={median:{amp:.25,area:.20,dur:.25},ulnar:{amp:.25,area:.20,dur:.25},fibular:{amp:.30,area:.25,dur:.30}};
for(const [nk,nv] of Object.entries(NERVES)){
  const id=nv.name.toUpperCase().slice(0,3),L=OLNEY[nk],name=nv.name.toLowerCase(),prox=()=>motor(nk).vsDistal.slice(1);
  T.push(
    {id:`DISP-${id}-AMP`,group:'Normal dispersion',claim:`Normal ${name} CMAP amplitude falls ≤${L.amp*100}% from distal to the most proximal site`,
      why:'Normal nerves lose some amplitude proximally from phase cancellation, but stay inside the consensus normal limit.',
      measure:()=>-minOf(prox().map(v=>v.amp)),expect:{max:L.amp},fmt:drop,sources:['OLNEY1999'],status:'calibrated'},
    {id:`DISP-${id}-AREA`,group:'Normal dispersion',claim:`Normal ${name} CMAP area falls ≤${L.area*100}% proximally`,
      measure:()=>-minOf(prox().map(v=>v.area)),expect:{max:L.area},fmt:drop,sources:['OLNEY1999'],status:'calibrated'},
    {id:`DISP-${id}-DUR`,group:'Normal dispersion',claim:`Normal ${name} CMAP duration grows ≤${L.dur*100}% proximally`,
      measure:()=>maxOf(prox().map(v=>v.dur)),expect:{max:L.dur},fmt:pct,sources:['OLNEY1999'],status:'calibrated'},
  );
}
T.push({id:'DISP-SNAP',group:'Normal dispersion',claim:'Over the same 23 cm, the median SNAP falls at least twice as much as the CMAP',
  why:'A sensory fibre potential lasts ~1 ms against ~8 ms for a motor unit, so the same timing spread cancels far more of it.',
  measure:()=>{const s=1-sensory('median',{},{site:1}).amp/sensory('median').amp,m=-motor('median').vsDistal[1].amp;return s/m;},
  expect:{min:2},fmt:x,sources:['KIMURA2013'],status:'calibrated'});

/* ═══════════ 3 · Temperature ═══════════ */
const cool=(nk,a=32,b=27)=>{const w=motor(nk,{temp:a}),c=motor(nk,{temp:b});return{w,c,d:a-b};};
for(const nk of ['median','ulnar']){
  const nv=NERVES[nk],id=nv.name.toUpperCase().slice(0,3);
  T.push({id:`TEMP-${id}-CV`,group:'Temperature',claim:`${nv.name} velocity falls 1.5–2.5 m/s per °C of cooling (32 → 27 °C)`,
    measure:()=>{const {w,c,d}=cool(nk);return(w.cv[0]-c.cv[0])/d;},expect:{min:1.5,max:2.5},fmt:v=>v.toFixed(2)+' m/s/°C',sources:['RUTKOVE2001','DENYS1991'],status:'calibrated',
    why:'The direction is in both sources; the 1.5–2.5 m/s per °C range is a consensus estimate (see RUTKOVE2001 note).'});
}
T.push(
  {id:'TEMP-AMP',group:'Temperature',claim:'Cooling increases CMAP amplitude',
    measure:()=>{const {w,c}=cool('ulnar');return c.amp/w.amp-1;},expect:{min:0},fmt:pct,sources:['DENYS1991','RUTKOVE2001'],status:'calibrated'},
  {id:'TEMP-DUR',group:'Temperature',claim:'Cooling increases CMAP duration',
    measure:()=>{const {w,c}=cool('ulnar');return c.dur/w.dur-1;},expect:{min:0},fmt:pct,sources:['RUTKOVE2001'],status:'calibrated'},
);

/* ═══════════ 4 · Axon loss ═══════════ */
T.push(
  {id:'AXON-AMP',group:'Axon loss',claim:'Losing 70% of axons at random leaves 25–35% of the CMAP',
    why:'Amplitude tracks the number of surviving motor units when the loss is not size-selective.',
    measure:()=>motor('median',{loss:.7}).amp/motor('median').amp,expect:{min:.25,max:.35},fmt:x,sources:['PS'],status:'calibrated'},
  {id:'AXON-CV',group:'Axon loss',claim:'Even losing 95% of the largest axons keeps median velocity above 70% of the lower limit',
    why:'Axon loss alone cannot reach the demyelinating range; this is the reason that threshold exists.',
    measure:()=>minOf(motor('median',{loss:.95,lossMode:'largest'}).cv)/NERVES.median.norm.cv,expect:{min:.70},fmt:ofLimit,sources:['EANPNS2021','PS'],status:'calibrated'},
  {id:'AXON-DML',group:'Axon loss',claim:'…and keeps the distal latency below 150% of the upper limit',
    why:'EAN/PNS 2021 excludes the median nerve at the wrist from its distal latency criterion (carpal tunnel); here 150% is used only as a magnitude benchmark.',
    measure:()=>motor('median',{loss:.95,lossMode:'largest'}).dml/NERVES.median.norm.dml,expect:{max:1.5},fmt:ofLimit,sources:['EANPNS2021','PS'],status:'calibrated'},
);

/* ═══════════ 5 · Uniform demyelination (CMT1A preset) ═══════════ */
const tli=m=>NERVES.median.motor.sites[0].x/(m.dml*m.cv[0]);
T.push(
  {id:'CMT-CV',group:'Uniform demyelination',claim:'CMT1A preset: median velocity <38 m/s',
    measure:()=>maxOf(motor('median',PRESET.cmt1a).cv),expect:{max:38},fmt:mps,sources:['HARDING1980'],status:'calibrated'},
  {id:'CMT-CV70',group:'Uniform demyelination',claim:'CMT1A preset: median velocity ≤70% of the lower limit (demyelinating range)',
    measure:()=>maxOf(motor('median',PRESET.cmt1a).cv)/NERVES.median.norm.cv,expect:{max:.70},fmt:ofLimit,sources:['EANPNS2021'],status:'calibrated'},
  {id:'CMT-UNIFORM',group:'Uniform demyelination',claim:'CMT1A preset: forearm and upper-arm velocities within 10 m/s of each other',
    measure:()=>{const c=motor('median',PRESET.cmt1a).cv;return maxOf(c)-minOf(c);},expect:{max:10},fmt:mps,sources:['KAKU1993','LEWIS1982'],status:'calibrated'},
);
for(const nk of ['median','ulnar']){
  const nv=NERVES[nk],id=nv.name.toUpperCase().slice(0,3);
  T.push(
    {id:`CMT-${id}-NOBLOCK`,group:'Uniform demyelination',claim:`CMT1A preset: ${nv.name.toLowerCase()} CMAP falls <30% at every proximal site (no false block)`,
      measure:()=>-minOf(motor(nk,PRESET.cmt1a).vsDistal.slice(1).map(v=>v.amp)),expect:{max:.30},fmt:drop,sources:['LEWIS1982','KAKU1993','EANPNS2021'],status:'calibrated'},
    {id:`CMT-${id}-NODISP`,group:'Uniform demyelination',claim:`CMT1A preset: ${nv.name.toLowerCase()} CMAP duration grows <30% (no false dispersion)`,
      measure:()=>maxOf(motor(nk,PRESET.cmt1a).vsDistal.slice(1).map(v=>v.dur)),expect:{max:.30},fmt:pct,sources:['LEWIS1982','KAKU1993','EANPNS2021'],status:'calibrated'},
  );
}
T.push(
  {id:'CMT-DML',group:'Uniform demyelination',claim:'CMT1A preset: median distal latency ≥150% of the upper limit',
    why:'CMT1 slows the distal segment as much as the rest of the nerve. EAN/PNS 2021 excludes the median wrist from its latency criterion; 150% is used here only as a magnitude benchmark.',
    gap:'The residual latency (terminal branches, junction, muscle) is fixed per axon and never slows with demyelination, so distal latency barely rises. Fix: give the terminal segment its own demyelination factor.',
    measure:()=>motor('median',PRESET.cmt1a).dml/NERVES.median.norm.dml,expect:{min:1.5},fmt:ofLimit,sources:['KAKU1993','EANPNS2021'],status:'gap'},
  {id:'CMT-TLI',group:'Uniform demyelination',claim:'CMT1A preset: median terminal latency index within 25% of normal (uniform distal slowing)',
    gap:'Same cause as CMT-DML: the distal latency does not scale with the velocity, so the index climbs.',
    measure:()=>tli(motor('median',PRESET.cmt1a))/tli(motor('median')),expect:{min:.75,max:1.25},fmt:x,sources:['KAKU1993'],status:'gap'},
  {id:'CMT-TYPICAL-NOBLOCK',group:'Uniform demyelination',claim:'At a typical CMT1A median velocity (20–25 m/s), the CMAP still falls <30% from wrist to axilla',
    why:'Uniform demyelination does not produce block or abnormal dispersion, even when severe.',
    gap:'The model slows large axons the most, so at heavy demyelination the largest motor units arrive last and are cancelled by the earlier ones. The resulting drop meets the block criterion. Fix: scale velocities more evenly across fibre sizes in uniform disease.',
    measure:()=>-motor('median',CMT_TYPICAL).vsDistal[2].amp,expect:{max:.30},fmt:drop,sources:['LEWIS1982','KAKU1993'],status:'gap'},
  {id:'CMT-TYPICAL-CV',group:'Uniform demyelination',claim:'…and that setting does give a median velocity of 20–25 m/s (checks the test above)',
    measure:()=>minOf(motor('median',CMT_TYPICAL).cv),expect:{min:20,max:25},fmt:mps,sources:['HARDING1980','KAKU1993'],status:'calibrated'},
);

/* ═══════════ 6 · Patchy demyelination (CIDP preset) ═══════════ */
T.push({id:'CIDP-CRITERIA',group:'Patchy demyelination',claim:'CIDP preset: median nerve meets conduction block (≥30% drop) or dispersion (>30% duration rise) criteria',
  measure:()=>{const v=motor('median',PRESET.cidp).vsDistal.slice(1);return Math.max(-minOf(v.map(z=>z.amp))/.30,maxOf(v.map(z=>z.dur))/.30);},
  expect:{min:1},fmt:v=>v.toFixed(2)+'× threshold',sources:['EANPNS2021'],status:'calibrated'});

/* ═══════════ 7 · Stimulation ═══════════ */
T.push({id:'STIM-DEMY',group:'Stimulation',claim:'A demyelinated nerve needs more current than a normal one to reach 95% of maximum at the most proximal site',
  why:'Damaged myelin raises the threshold; under-stimulated proximal sites can mimic block.',
  measure:()=>{const last=NERVES.median.motor.sites.length-1;return currentFor('median',PRESET.cmt1a,last)/currentFor('median',{},last);},
  expect:{min:1.15},fmt:x,sources:['PS','KIMURA2013'],status:'calibrated'});

/* ═══════════ 8 · Neuromuscular junction (repetitive stimulation at 3 Hz) ═══════════ */
T.push(
  {id:'RNS-NORMAL',group:'Neuromuscular junction',claim:'Normal junction: decrement <10%',
    measure:()=>rns('normal').decrement,expect:{max:.10},fmt:pct,sources:['AANEM2001','PS'],status:'calibrated'},
  {id:'RNS-MG',group:'Neuromuscular junction',claim:'Mild MG: decrement >10%',
    measure:()=>rns('mgMild').decrement,expect:{min:.10},fmt:pct,sources:['AANEM2001','PS'],status:'calibrated'},
  {id:'RNS-MG-SHAPE',group:'Neuromuscular junction',claim:'Moderate MG: lowest response is the 4th or 5th',
    measure:()=>rns('mgMod').minAt,expect:{min:4,max:5},fmt:v=>'response '+v,sources:['PS'],status:'calibrated'},
  {id:'RNS-MG-PAF',group:'Neuromuscular junction',claim:'Moderate MG: post-exercise increment stays below 60%',
    why:'In Oh 2005, no MG patient reached a 60% increment after exercise; 60% or more points to a presynaptic disorder.',
    measure:()=>rns('mgMod',{tSinceEx:10}).first/rns('mgMod').first-1,expect:{max:.6},fmt:pct,sources:['OH2005'],status:'calibrated'},
  {id:'RNS-MG-PAE',group:'Neuromuscular junction',claim:'Moderate MG: decrement is worse 2–4 minutes after exercise than at rest',
    measure:()=>rns('mgMod',{tSinceEx:180}).decrement-rns('mgMod').decrement,expect:{min:0.001},fmt:v=>(v>=0?'+':'−')+Math.abs(v*100).toFixed(0)+' points',sources:['OH2014'],status:'calibrated'},
  {id:'RNS-LEMS-LOW',group:'Neuromuscular junction',claim:`LEMS: baseline CMAP below the normal limit (${NERVES.median.norm.amp} mV)`,
    measure:()=>rns('lems').first,expect:{max:NERVES.median.norm.amp},fmt:mv,sources:['PS'],status:'calibrated'},
  {id:'RNS-LEMS-INC',group:'Neuromuscular junction',claim:'LEMS: increment ≥100% just after 10 s of exercise',
    measure:()=>rns('lems',{tSinceEx:10}).first/rns('lems').first-1,expect:{min:1},fmt:pct,sources:['OH2005'],status:'calibrated'},
);

/* evaluate one target */
function evaluate(t){
  let value=null,error=null;
  try{value=t.measure();}catch(e){error=e;}
  const ok=error==null&&value!=null&&Number.isFinite(value)&&(t.expect.min==null||value>=t.expect.min)&&(t.expect.max==null||value<=t.expect.max);
  return{value,ok,error};
}
const describeExpect=t=>{const {min,max}=t.expect,f=t.fmt;
  return min!=null&&max!=null?`${f(min)} to ${f(max)}`:min!=null?`≥ ${f(min)}`:`≤ ${f(max)}`;};

module.exports={TARGETS:T,PRESET,CMT_TYPICAL,evaluate,describeExpect};
