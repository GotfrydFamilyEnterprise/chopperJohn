// BAL-04: use visible live aircraft position, never future input or hidden accuracy buffs.
export function updateAirPressure(state,helicopter,dt){
 const visible=helicopter&&helicopter.hp>0&&helicopter.team!==state.rules.team&&Math.abs(helicopter.x-state.rules.hqX)<=1300;
 const prior=state.airPressure??{exposure:0,quiet:0,active:false};
 if(visible){prior.exposure+=dt;prior.quiet=0;if(prior.exposure+1e-8>=2)prior.active=true;}
 else{prior.quiet+=dt;prior.exposure=0;if(prior.quiet>=6||!helicopter||helicopter.hp<=0)prior.active=false;}
 state.airPressure=prior;return prior.active;
}
