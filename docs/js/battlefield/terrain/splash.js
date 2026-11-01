// TL-10: allocate a pre-hit blast budget. Price/team/type never affect shares.
export const DAMAGE_MODELS=Object.freeze(['shared','individual']);
export function checkedDamageModel(model='shared'){
 if(!DAMAGE_MODELS.includes(model))throw new RangeError('Damage model must be shared or individual');return model;
}
export function allocateSplash(victims,random,model='shared'){
 checkedDamageModel(model);
 const sorted=[...victims].sort((a,b)=>a.id-b.id),ids=new Set();
 for(const v of sorted){if(!Number.isSafeInteger(v.id)||ids.has(v.id)||!Number.isFinite(v.falloff)||v.falloff<0||v.falloff>1)throw new RangeError('Invalid splash victim');ids.add(v.id);}
 const weight=sorted.reduce((sum,v)=>sum+v.falloff,0),maximum=2*weight;
 const budget=model==='individual'?maximum:2*Math.min(weight,Math.sqrt(weight));
 // Singleton/weak fringe bursts keep old damage and consume no extra randomness.
 if(maximum-budget<1e-10)return {model,budget,shares:sorted.map(v=>({id:v.id,amount:2*v.falloff}))};
 const rows=sorted.map(v=>({id:v.id,cap:2*v.falloff,weight:v.falloff*(.75+.5*random()),amount:0}));
 let remaining=budget,active=rows.filter(v=>v.cap>0);
 while(active.length&&remaining>1e-10){
  const total=active.reduce((sum,v)=>sum+v.weight,0),capped=active.filter(v=>remaining*v.weight/total>=v.cap-v.amount);
  if(!capped.length){for(const v of active)v.amount+=remaining*v.weight/total;remaining=0;break;}
  for(const v of capped){const amount=v.cap-v.amount;v.amount+=amount;remaining-=amount;}
  active=active.filter(v=>!capped.includes(v));
 }
 return {model,budget,shares:rows.map(({id,amount})=>({id,amount}))};
}
