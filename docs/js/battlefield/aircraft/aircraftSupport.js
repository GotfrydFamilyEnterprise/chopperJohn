import {parkedOnPad,createHelicopter} from './helicopter.js';
import {purchaseReplacement} from '../economy/supply.js';
// BAL-02/03: pad logistics and replacement accounting, separate from flight physics.
export const AIR_SUPPORT=Object.freeze({ammo:120,rearmRate:30,replacementCost:90});
export function updateAircraftSupport(h,dt,account,{fire=false,rearm=true,replace=true,ground=460}={}){
 h.rearming=false;
 if(h.hp<=0){
  if(!replace||h.respawnRemaining>1e-8)return {};
  const result=purchaseReplacement(account,()=>createHelicopter(ground,h.generation+1));
  if(result.unit){Object.assign(h,result.unit);return {respawned:true,cost:AIR_SUPPORT.replacementCost};}
  return {waitingSupply:true};
 }
 if(rearm&&!fire&&parkedOnPad(h,ground)&&h.ammo<AIR_SUPPORT.ammo){h.rearming=true;h.ammo=Math.min(AIR_SUPPORT.ammo,h.ammo+AIR_SUPPORT.rearmRate*dt);}
 return {};
}
