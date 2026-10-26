// H-INPUT: UI latches input; it never writes aircraft coordinates or projectiles.
export function installPilotControls({stick,knob,fire,turn,onTurn,onEngage,canControl=()=>true}){
 let pointer=null,firePointer=null;const keys=new Set(),input={x:0,y:0,fire:false};
 const release=()=>{const stickId=pointer,fireId=firePointer;pointer=null;firePointer=null;if(stickId!==null&&stick.hasPointerCapture?.(stickId))stick.releasePointerCapture(stickId);if(fireId!==null&&fire.hasPointerCapture?.(fireId))fire.releasePointerCapture(fireId);keys.clear();input.x=0;input.y=0;input.fire=false;knob.style.transform='translate(0px,0px)';};
 const move=e=>{const r=stick.getBoundingClientRect(),radius=r.width*.38,x=(e.clientX-r.x-r.width/2)/radius,y=(e.clientY-r.y-r.height/2)/radius,n=Math.max(1,Math.hypot(x,y));input.x=Math.max(-1,Math.min(1,x/n));input.y=Math.max(-1,Math.min(1,y/n));knob.style.transform=`translate(${input.x*radius}px,${input.y*radius}px)`;};
 stick.addEventListener('pointerdown',e=>{e.preventDefault();if(!canControl()){release();return;}pointer=e.pointerId;stick.setPointerCapture(pointer);onEngage();move(e);});
 stick.addEventListener('pointermove',e=>{if(e.pointerId===pointer)move(e);});
 for(const name of ['pointerup','pointercancel','lostpointercapture'])stick.addEventListener(name,e=>{if(e.pointerId===pointer){pointer=null;input.x=0;input.y=0;knob.style.transform='translate(0px,0px)';}});
 fire.addEventListener('pointerdown',e=>{e.preventDefault();if(!canControl()){release();return;}firePointer=e.pointerId;fire.setPointerCapture(e.pointerId);input.fire=true;onEngage();});
 for(const name of ['pointerup','pointercancel','lostpointercapture'])fire.addEventListener(name,e=>{if(e.pointerId===firePointer){firePointer=null;input.fire=false;}});
 turn.addEventListener('pointerdown',e=>{e.preventDefault();if(!canControl())return;onEngage();onTurn();});
 const flightKeys=['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','KeyW','KeyA','KeyS','KeyD','Space','KeyT'];
 addEventListener('keydown',e=>{if(!canControl()||document.querySelector('dialog[open]')||e.target.closest?.('button,a,summary,details,input,textarea,select'))return;if(flightKeys.includes(e.code)){e.preventDefault();keys.add(e.code);if(e.code==='KeyT'&&!e.repeat)onTurn();}});
 addEventListener('keyup',e=>keys.delete(e.code));addEventListener('blur',release);document.addEventListener('visibilitychange',()=>{if(document.hidden)release();});
 new MutationObserver(()=>{if(document.querySelector('dialog[open]'))release();}).observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});
 return {release,read:()=>({x:Math.max(-1,Math.min(1,input.x+(keys.has('ArrowRight')||keys.has('KeyD')?1:0)-(keys.has('ArrowLeft')||keys.has('KeyA')?1:0))),y:Math.max(-1,Math.min(1,input.y+(keys.has('ArrowDown')||keys.has('KeyS')?1:0)-(keys.has('ArrowUp')||keys.has('KeyW')?1:0))),fire:input.fire||keys.has('Space')})};
}
