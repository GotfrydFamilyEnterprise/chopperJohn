// CAP-01..06: deterministic structural damage, ownership and rebuilding; no DOM/RNG.
export const TAKEOVER=Object.freeze({defenseHits:6,captureSeconds:5,rebuildSeconds:20,interior:58});
export function insideBase(unit,base){return unit.hp>0&&Math.abs(unit.x-base.x)<=TAKEOVER.interior;}
export function capturePoint(base,team){return base.x+(team===0?-43:43);}
export function rocketDefenseBlast(point,team,bases){
 const events=[];
 for(const b of bases){
  const dx=Math.max(b.x-80-point.x,0,point.x-b.x-80),dy=Math.max(460-(b.main?197:116)-point.y,0,point.y-460);
  if(b.team===team||Math.hypot(dx,dy)>25)continue;
  const before=b.defensePoints??6;b.defensePoints=Math.max(0,before-1);b.rebuildProgress=0;b.defenseFlash=.2;
  events.push({type:b.defensePoints===0&&before>0?'breach':'defenseHit',baseX:b.x,team,remaining:b.defensePoints});
 }
 return events;
}
function transfer(base,team,capturer,units){
 const previousTeam=base.team;
 for(const u of units)if(u.guardBase===base.x){u.guardBase=null;u.guardSlot=null;u.arrived=false;u.order={role:'advance'};}
 for(const u of units)if(u.team!==team&&u.order?.baseX===base.x)u.order={role:'advance'};
 base.team=team;base.everCaptured=true;base.captureProgress=0;base.captureTeam=null;base.rebuildProgress=0;base.contested=false;
 base.slots={rifle:[null,null],rocket:[null]};base.reservations={rifle:[null,null],rocket:[null]};
 if(!base.main){
  const slot=capturer.x<=base.x?0:1;capturer.guardBase=base.x;capturer.guardSlot=slot;capturer.arrived=false;capturer.order={role:'garrison',baseX:base.x};base.reservations.rifle[slot]=capturer.id;
  if(Math.abs(capturer.x-(base.x+(slot===0?-43:43)))<.001){capturer.arrived=true;base.slots.rifle[slot]=capturer.id;}
 }
 base.everOccupied=false;base.state=base.slots.rifle.some(id=>id!==null)?'ASSEMBLING':'UNCLAIMED';
 return {type:'captured',baseX:base.x,main:base.main,team,previousTeam,capturerId:capturer.id};
}
export function updateTakeover(base,units,dt){
 if(!Number.isFinite(dt)||dt<0)throw new RangeError('Invalid capture timestep');
 base.defenseFlash=Math.max(0,(base.defenseFlash||0)-dt);
 if((base.defensePoints??6)>0){base.captureProgress=0;base.captureTeam=null;base.rebuildProgress=0;base.contested=false;return null;}
 const present=units.filter(u=>['rifle','rocket'].includes(u.type)&&insideBase(u,base));
 const attackers=present.filter(u=>u.team!==base.team&&u.type==='rifle'&&u.guardBase===null).sort((a,b)=>a.id-b.id);
 const defenders=present.filter(u=>u.team===base.team);
 base.contested=present.some(u=>u.team!==base.team)&&defenders.length>0;
 if(!attackers.length){base.captureProgress=0;base.captureTeam=null;}
 else{
  const team=attackers[0].team;
  if(base.captureTeam!==team){base.captureProgress=0;base.captureTeam=team;}
  if(!defenders.length)base.captureProgress+=dt;
  if(base.captureProgress+1e-8>=TAKEOVER.captureSeconds)return transfer(base,team,attackers[0],units);
 }
 const builder=defenders.some(u=>u.type==='rifle');
 const enemy=present.some(u=>u.team!==base.team);
 if(builder&&!enemy){base.rebuildProgress=(base.rebuildProgress||0)+dt;if(base.rebuildProgress+1e-8>=TAKEOVER.rebuildSeconds){base.defensePoints=6;base.rebuildProgress=0;return {type:'rebuilt',baseX:base.x,team:base.team};}}
 else base.rebuildProgress=0;
 return null;
}
export function headquartersResult(events,time){const wins=[...new Set(events.filter(e=>e.type==='captured'&&e.main).map(e=>e.team))];return wins.length?{winner:wins.length===1?wins[0]:null,time,reason:'Headquarters captured'}:null;}
