// CP-01: JSON is data only; validate a complete candidate before replacing state.
import {validateLevel} from '../terrain/level.js?v=2.2.0';
import {groundY} from '../terrain/heightfield.js?v=2.2.0';
export function validateBattlefield(input){
 const fail=m=>{throw new Error('Invalid battlefield: '+m);};
 if(input?.schemaVersion!==1||input.kind!=='battlefield')fail('schemaVersion1/kind battlefield required');
 if(input.balanceProfile!=='campaign-v1')fail('unknown balance profile');
 const layout=validateLevel({...input,scenarios:[{id:'geometry',name:'Geometry',combat:false,units:[{id:1,team:0,type:'rifle',x:100,mode:'hold'}]}]});
 if(!Array.isArray(input.bases)||input.bases.length<2||input.bases.length>8)fail('2–8 bases required');
 const ids=new Set(),bases=input.bases.map(b=>{
  if(typeof b.id!=='string'||!b.id.trim()||ids.has(b.id)||![0,1].includes(b.team)||!['hq','fob'].includes(b.type)||!Number.isFinite(b.x)||b.x<100||b.x>layout.world.width-100)fail('invalid base id/team/type/position');ids.add(b.id);
  const y=groundY(layout,b.x);for(const x of [b.x-85,b.x+85,...layout.terrain.points.filter(([x])=>Math.abs(x-b.x)<=85).map(([x])=>x)])if(Math.abs(groundY(layout,x)-y)>1e-6)fail('base '+b.id+' requires a flat170-unit footprint');
  return {id:b.id,team:b.team,type:b.type,x:b.x};
 });
 for(const team of [0,1])if(bases.filter(b=>b.type==='hq'&&b.team===team).length!==1)fail('one HQ per faction required');
 for(let i=0;i<bases.length;i++)for(let j=i+1;j<bases.length;j++)if(Math.abs(bases[i].x-bases[j].x)<190)fail('base footprints overlap');
 const pad=input.helipad;if(!pad||typeof pad.id!=='string'||!pad.id.trim()||ids.has(pad.id)||!Number.isFinite(pad.x)||pad.x<140||pad.x>layout.world.width-140)fail('invalid helipad');
 const padY=groundY(layout,pad.x);for(const x of [pad.x-100,pad.x+100,...layout.terrain.points.filter(([x])=>Math.abs(x-pad.x)<=100).map(([x])=>x)])if(Math.abs(groundY(layout,x)-padY)>1e-6)fail('helipad requires a flat200-unit footprint');
 if(bases.some(b=>Math.abs(b.x-pad.x)<185))fail('helipad overlaps a base');
 if(!Array.isArray(input.factions)||input.factions.length!==2)fail('two faction configurations required');
 const teams=new Set(),factions=input.factions.map(f=>{
  if(![0,1].includes(f.team)||teams.has(f.team))fail('unique faction team required');teams.add(f.team);
  if(f.controller!==(f.team===0?'manual':'ai'))fail('blue manual/red AI required');
  for(const key of ['spawnX','rallyX','defenseX'])if(!Number.isFinite(f[key])||f[key]<80||f[key]>layout.world.width-80)fail('invalid '+key);
  if(f.supply!==120)fail('campaign starts each side with120 Supply');
  if(!Array.isArray(f.opening)||f.opening.length!==5||f.opening.filter(u=>u.type==='rifle').length!==3||f.opening.filter(u=>u.type==='rocket').length!==2)fail('opening must be3 rifles and2 rockets');
  const opening=f.opening.map(u=>{if(!Number.isFinite(u.x)||u.x<80||u.x>layout.world.width-80||!['garrison','advance'].includes(u.order))fail('invalid opening unit');return {type:u.type,x:u.x,order:u.order};});
  const composition=f.wave;if(!composition||!Number.isInteger(composition.rifle)||!Number.isInteger(composition.rocket)||composition.rifle<2||composition.rocket<1||composition.rifle+composition.rocket>10)fail('wave needs2+ rifles (including sergeant),1+ rocket, at most10 soldiers');
  return {team:f.team,controller:f.controller,spawnX:f.spawnX,rallyX:f.rallyX,defenseX:f.defenseX,supply:f.supply,opening,wave:{rifle:composition.rifle,rocket:composition.rocket}};
 });
 if(input.objective?.type!=='capture-hq'||!bases.some(b=>b.id===input.objective.target&&b.team===1&&b.type==='hq'))fail('objective must capture red HQ');
 const hq=team=>bases.find(b=>b.type==='hq'&&b.team===team).x;if(hq(0)>=hq(1))fail('blue HQ must be west of red HQ');
 for(const f of factions){const dir=f.team===0?1:-1;if((f.spawnX-hq(f.team))*dir<0||(f.rallyX-f.spawnX)*dir<0||(f.defenseX-hq(f.team))*dir<0)fail('faction deployment/rally order invalid');}
 return {schemaVersion:1,kind:'battlefield',id:layout.id,name:layout.name,description:layout.description,seed:layout.seed,world:layout.world,terrain:layout.terrain,balanceProfile:'campaign-v1',bases,helipad:{id:pad.id,x:pad.x},factions,objective:{type:'capture-hq',target:input.objective.target}};
}
export function validateCampaign(input){
 if(input?.schemaVersion!==1||input.id!=='first-sorties'||!Array.isArray(input.levels)||input.levels.length<1||input.levels.length>20)throw Error('Invalid campaign');const ids=new Set();
 const levels=input.levels.map(l=>{if(typeof l.id!=='string'||ids.has(l.id)||!/^[-a-z0-9]+$/.test(l.id)||typeof l.name!=='string'||!l.name.trim()||l.file!==l.id+'.json')throw Error('Invalid campaign level');ids.add(l.id);return {id:l.id,name:l.name,file:l.file};});return {schemaVersion:1,id:input.id,levels};
}
export async function fetchJson(url,validator){const r=await fetch(url,{cache:'no-cache'});if(!r.ok)throw Error('Could not load level ('+r.status+'). Retry from the menu.');return validator(await r.json());}
