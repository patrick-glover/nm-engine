/* Calibration suite: `npm test` (or `node --test test/`).
   Calibrated targets must pass. Known gaps run as TODO: they are reported but
   do not fail the suite, and a gap that starts passing is flagged so its status
   can be promoted. */
const test=require('node:test');
const assert=require('node:assert/strict');
const {TARGETS,evaluate,describeExpect}=require('../calibration/targets.js');
const REFS=require('../calibration/references.js');

test('every target cites known references',()=>{
  for(const t of TARGETS){
    assert.ok(t.sources?.length,`${t.id} has no sources`);
    for(const s of t.sources)assert.ok(REFS[s],`${t.id} cites unknown reference ${s}`);
    if(t.status==='gap')assert.ok(t.gap,`${t.id} is a gap but does not say why`);
  }
});

test('target ids are unique',()=>{
  const ids=TARGETS.map(t=>t.id);
  assert.equal(new Set(ids).size,ids.length);
});

for(const t of TARGETS){
  const name=`${t.id}: ${t.claim}`;
  if(t.status==='gap'){
    test(name,{todo:`known gap: ${t.gap}`},()=>{
      const r=evaluate(t);
      if(r.ok)console.log(`  ${t.id} now passes; promote it to 'calibrated'.`);
      assert.ok(r.ok,`model gives ${r.value==null?'no value':t.fmt(r.value)}, expected ${describeExpect(t)}`);
    });
  }else{
    test(name,()=>{
      const r=evaluate(t);
      if(r.error)throw r.error;
      assert.ok(r.ok,`model gives ${r.value==null?'no value':t.fmt(r.value)}, expected ${describeExpect(t)}`);
    });
  }
}
