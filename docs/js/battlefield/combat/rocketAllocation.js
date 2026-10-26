import {chooseRocketTarget} from './weapons.js';
import {planAirShot} from './airInterception.js';
// AA-GROUP: groups are same-faction rocket soldiers linked by <=240 world units.
// With both threats present, target2/3 air and1/3 ground, rounded to nearest,
// reserving at least one ground-capable soldier. Capability always beats quota.
export const ROCKET_ALLOCATION=Object.freeze({airShare:2/3,clusterGap:240});
export function allocateRocketTargets(units,helicopter,{stagger=false}={}){
 const choices=new Map();
 for(const team of [0,1]){
  const rockets=units.filter(u=>u.hp>0&&u.type==='rocket'&&u.team===team).sort((a,b)=>a.x-b.x||a.id-b.id),groups=[];
  for(const u of rockets){const group=groups.at(-1);if(!group||u.x-group.at(-1).x>240)groups.push([u]);else group.push(u);}
  for(const group of groups){
   const entries=group.map(unit=>({unit,air:helicopter?planAirShot(unit,helicopter):null,ground:chooseRocketTarget(unit,units)})).filter(e=>e.air||e.ground);
   const air=entries.filter(e=>e.air),ground=entries.filter(e=>e.ground),roles=new Map();
   if(!air.length)for(const e of entries)roles.set(e.unit.id,'ground');
   else if(!ground.length)for(const e of entries)roles.set(e.unit.id,'air');
   else{
    const reserved=[...ground].sort((a,b)=>Number(!!a.air)-Number(!!b.air)||Number(b.unit.rocketAssignment==='ground')-Number(a.unit.rocketAssignment==='ground')||b.unit.id-a.unit.id)[0];
    roles.set(reserved.unit.id,'ground');
    for(const e of entries)if(!e.air)roles.set(e.unit.id,'ground');else if(!e.ground)roles.set(e.unit.id,'air');
    const quota=entries.length===1?1:Math.min(air.length,entries.length-1,Math.max(1,Math.round(entries.length*2/3)));
    let count=[...roles.values()].filter(role=>role==='air').length;
    const dual=entries.filter(e=>e.air&&e.ground&&!roles.has(e.unit.id)).sort((a,b)=>Number(b.unit.rocketAssignment==='air')-Number(a.unit.rocketAssignment==='air')||a.unit.id-b.unit.id);
    for(const e of dual)roles.set(e.unit.id,count<quota?(count++,'air'):'ground');
    // A lone soldier prioritizes the higher aircraft threat over its ground lock.
    if(entries.length===1)roles.set(entries[0].unit.id,entries[0].air?'air':'ground');
   }
   const airCount=[...roles.values()].filter(v=>v==='air').length,groundCount=roles.size-airCount;
   const airRanks=new Map(entries.filter(e=>roles.get(e.unit.id)==='air').map(e=>e.unit.id).sort((a,b)=>a-b).map((id,rank)=>[id,rank]));
   for(const e of entries){const kind=roles.get(e.unit.id);choices.set(e.unit.id,{kind,target:kind==='air'?helicopter:e.ground,plan:kind==='air'?e.air:null,volleyDelay:kind==='air'&&stagger?airRanks.get(e.unit.id)*.22:0,allocation:{air:airCount,ground:groundCount,size:roles.size}});}
  }
 }
 return choices;
}
