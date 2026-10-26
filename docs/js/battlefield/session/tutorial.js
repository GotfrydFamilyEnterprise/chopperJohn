import {parkedOnPad} from '../aircraft/helicopter.js';
// MENU-03: progress comes from actual flight/weapon/economy state, never a timer.
export const TUTORIAL_STEPS=Object.freeze([
 {title:'Lift off',text:'Push the left stick up. Climb above the helipad; ease back toward the center to hover.'},
 {title:'Fly to the right',text:'Push the stick right to pitch forward. Add a little upward lift to maintain height.'},
 {title:'Turn around',text:'Tap TURN to face home. Turning keeps your momentum: use the stick to slow down.'},
 {title:'Try the machine gun',text:'Hold FIRE for at least eight rounds. The gun follows the helicopter’s nose; you carry 120 rounds.'},
 {title:'Deploy your troops',text:'Tap both soldier icons beside FIRE: rifle costs 25 supply, rocket costs 60. Blue purchases are always yours.'},
 {title:'Return and rearm',text:'Land on the blue H pad. Stay still and release FIRE to refill 120 rounds. The pad also repairs your hull.'},
 {title:'Ready for battle',text:'Red rockets lead your current speed: change speed to evade. A replacement costs 90 supply after a 10-second wait. Start a fresh game when ready.'},
]);
export function createTutorial(){return {step:0,complete:false,fireBaseline:0};}
export function advanceTutorial(state,{helicopter,shots,ledger}){
 if(state.complete)return false;
 const checks=[()=>helicopter.y<=387,()=>helicopter.x>=600,()=>helicopter.facing===-1&&helicopter.turnTime<=1e-8,()=>shots-state.fireBaseline>=8,()=>['rifle','rocket'].every(type=>ledger.some(e=>e.type===type)),()=>parkedOnPad(helicopter)&&helicopter.ammo>=120-1e-8];
 if(!checks[state.step]?.())return false;
 state.step++;if(state.step===3)state.fireBaseline=shots;if(state.step===6)state.complete=true;return true;
}
