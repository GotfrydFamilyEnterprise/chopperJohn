import {capturePoint} from './takeover.js';
import {chooseRocketTarget,WEAPONS} from '../combat/weapons.js?v=1.3.0';
// CAP-01/03: empty fortified structures remain valid rocket targets.
export function chooseAssaultRocketTarget(unit,units,bases){
 const direction=unit.team===0?1:-1;
 const buildings=bases.filter(b=>b.team!==unit.team&&(b.defensePoints??6)>0&&(b.x-unit.x)*direction>=WEAPONS.rocketMinRange&&(b.x-unit.x)*direction<=WEAPONS.rocketMaxRange).sort((a,b)=>Math.abs(a.x-unit.x)-Math.abs(b.x-unit.x));
 const infantry=chooseRocketTarget(unit,units),base=buildings[0];
 if(!base||infantry&&Math.abs(infantry.x-unit.x)<=Math.abs(base.x-unit.x))return infantry;
 return {kind:'base',id:`base:${base.x}`,x:base.x,y:460,team:base.team,hp:base.defensePoints??6,observedVelocity:0};
}
export function rifleAssaultBase(unit,bases){
 if(unit.type!=='rifle'||unit.guardBase!==null)return null;
 const direction=unit.team===0?1:-1;
 return bases.filter(b=>b.team!==unit.team&&b.defensePoints===0&&(b.x-unit.x)*direction>=-80&&(b.x-unit.x)*direction<=300).sort((a,b)=>Math.abs(a.x-unit.x)-Math.abs(b.x-unit.x))[0]??null;
}
export function advanceCaptureRifle(unit,base,dt,engaging){
 const distance=capturePoint(base,unit.team)-unit.x,step=Math.min(Math.abs(distance),Math.abs(unit.velocity)*dt*(engaging?.42:1));
 unit.x+=Math.sign(distance)*step;unit.phase=(unit.phase+step/44)%1;unit.timer+=dt;unit.state=engaging?'fireWalk':step?'march':'guard';
}
