/* ═══════════ Calibration harness ═══════════
   Runs the model the way a lab would: supramaximal stimulation at each site,
   then the same measurements a report would list. Every calibration target
   is a small function of these. */
const M=require('../src/model.js');
const {NERVES,makePop,freshD,respond,segCv}=M;

const POPS={};
const pop=(nk,kind)=>POPS[nk+kind]||(POPS[nk+kind]=makePop(nk,kind));
const SUPRA=100;   // mA; well above every unit's threshold in a normal nerve

/* disease state from a partial description, e.g. {demy:.6, loss:.3} */
function state(over={}){const D=freshD();for(const [k,v] of Object.entries(over))D[k]=v&&typeof v==='object'&&!Array.isArray(v)?{...D[k],...v}:v;return D;}

/* a full motor study: every site, segment velocities, changes vs the distal site */
function motor(nk,over={},{mA=SUPRA}={}){
  const D=state(over),sites=NERVES[nk].motor.sites,P=pop(nk,'motor');
  const R=sites.map((s,i)=>respond(P,nk,'motor',s,D,Array.isArray(mA)?mA[i]:mA));
  const d=R[0];
  return{
    sites:sites.map(s=>s.k),R,
    dml:d.nr?null:d.onset, amp:d.amp, dur:d.dur, area:d.area,
    cv:R.slice(1).map((r,i)=>segCv(R[i],r)),
    /* proximal vs distal, as the conduction block criteria compare them */
    vsDistal:R.map(r=>r.nr||d.nr?null:{amp:r.amp/d.amp-1,area:r.area/d.area-1,dur:r.dur/d.dur-1}),
  };
}

/* one sensory recording at the standard 14 cm site */
function sensory(nk,over={},{site=0}={}){
  const D=state(over),s=NERVES[nk].sensory.sites[site],R=respond(pop(nk,'sensory'),nk,'sensory',s,D,SUPRA);
  return{R,amp:R.amp,peakLat:R.nr?null:R.peakLat,cv:R.nr?null:s.x/R.onset,dist:s.x};
}

/* smallest current (mA) giving ≥ frac of the supramaximal amplitude at a site */
function currentFor(nk,over,siteIdx,frac=.95){
  const D=state(over),s=NERVES[nk].motor.sites[siteIdx],P=pop(nk,'motor'),max=respond(P,nk,'motor',s,D,SUPRA).amp;
  for(let mA=1;mA<=SUPRA;mA+=.5)if(respond(P,nk,'motor',s,D,mA).amp>=frac*max)return mA;
  return null;
}

/* repetitive nerve stimulation: decrement (1st → lowest of 2nd–5th) and post-exercise change */
function rns(preset,{tSinceEx=Infinity,seed=1}={}){
  const P=pop('median','motor'),nmj=M.makeNmj(P),st=M.nmjState();st.tSinceEx=tSinceEx;
  const train=M.rnsTrain(P,nmj,preset,st,{rng:M.mulberry32(seed)});
  /* CMAP from the units that fire, using each unit's normal waveform */
  const base=respond(P,'median','motor',NERVES.median.motor.sites[0],freshD(),SUPRA);
  const amps=train.map(s=>{const sig=new Float32Array(base.sig.length);
    base.parts.forEach((p,i)=>{if(!s.fired[i].fire)return;const i0=Math.floor(p.t/base.dt),i1=Math.min(sig.length,Math.ceil((p.t+base.udur)/base.dt));
      for(let j=i0;j<i1;j++)sig[j]+=p.a*base.shape(j*base.dt-p.t);});
    let mx=0;for(const v of sig)mx=Math.max(mx,v);return mx;});
  const lowest=Math.min(...amps.slice(1,5));
  return{amps,first:amps[0],decrement:1-lowest/amps[0],minAt:amps.indexOf(lowest)+1,normalAmp:base.amp};
}

module.exports={M,NERVES,motor,sensory,currentFor,rns,state,SUPRA};
