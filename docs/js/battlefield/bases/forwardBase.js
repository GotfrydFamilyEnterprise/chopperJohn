import {baseColor,baseTextColor,drawFoundation,finishBase} from "./baseCommon.js";
export const REQUIRED={rifle:2,rocket:1};
export function occupied(b){return b.slots.rifle.every(id=>id!==null)&&b.slots.rocket[0]!==null;}
export function assignDefender(b,u){
 if(b.main||b.team!==u.team||u.guardBase!=null)return false;
 const slots=b.reservations[u.type];
 if(!slots)return false;
 const index=slots.findIndex((id,i)=>id===null&&b.slots[u.type][i]===null);
 if(index<0)return false;
 slots[index]=u.id;u.guardBase=b.x;u.guardSlot=index;u.arrived=false;
 return true;
}
// FOB-03/04: reservations never count as physical occupation.
export function advanceDefender(b,u,dt){
 const target=b.x+(u.type==="rocket"?0:(u.guardSlot===0?-43:43));
 const distance=target-u.x,step=Math.min(Math.abs(distance),Math.abs(u.velocity)*dt);
 u.x+=Math.sign(distance)*step;u.phase=(u.phase+step/44)%1;
 u.state="enter";
 if(Math.abs(target-u.x)<.001){
  u.arrived=true;u.state=u.type==="rifle"?"guard":"fireStop";
  b.slots[u.type][u.guardSlot]=u.id;
 }
 refreshOccupation(b);
}
export function refreshOccupation(b){
 if(occupied(b)){b.state="OCCUPIED";b.everOccupied=true;}
 else b.state=b.everOccupied?"UNDERSTAFFED":Object.values(b.slots).flat().some(id=>id!==null)?"ASSEMBLING":"UNCLAIMED";
}
export function releaseDeadDefenders(b,aliveIds){
 for(const group of [b.slots,b.reservations])for(const type of ["rifle","rocket"])for(let i=0;i<group[type].length;i++){
  const id=group[type][i];if(id!==null&&!aliveIds.has(id))group[type][i]=null;
 }
}
export function drawForwardBase(ctx,b){
 drawFoundation(ctx,b);
 // Four posts holding a camouflaged fabric roof.
 ctx.strokeStyle="#6b6a50";ctx.lineWidth=6;
 for(const x of [-58,-21,21,58]){ctx.beginPath();ctx.moveTo(x,-12);ctx.lineTo(x,-91);ctx.stroke();}
 // FOB-01: a porous, sagging camouflage net rather than an opaque hut roof.
 ctx.save();
 ctx.beginPath();ctx.moveTo(-78,-98);ctx.lineTo(-65,-116);
 ctx.quadraticCurveTo(0,-102,57,-114);ctx.lineTo(80,-96);
 ctx.quadraticCurveTo(0,-86,-78,-98);ctx.closePath();
 ctx.fillStyle="#74845b55";ctx.fill();ctx.clip();
 ctx.strokeStyle="#c0bd8e";ctx.lineWidth=.9;
 for(let x=-100;x<100;x+=9){
  ctx.beginPath();ctx.moveTo(x,-120);ctx.lineTo(x+35,-85);ctx.stroke();
  ctx.beginPath();ctx.moveTo(x,-85);ctx.lineTo(x+35,-120);ctx.stroke();
 }
 // Uneven tied-on foliage patches leave the mesh visibly open.
 for(let i=0;i<20;i++){
  const x=-75+(i*29)%150,y=-113+(i*13)%22;
  ctx.fillStyle=["#536b42","#8d9160","#3b5140"][i%3];
  ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+9,y-3);
  ctx.lineTo(x+15,y+2);ctx.lineTo(x+7,y+6);ctx.closePath();ctx.fill();
 }
 ctx.restore();
 ctx.fillStyle=baseTextColor(b.team);ctx.font="bold 13px system-ui";ctx.textAlign="center";
 ctx.fillText(b.state+" · "+b.slots.rifle.filter(x=>x!==null).length+"/2 R · "+b.slots.rocket.filter(x=>x!==null).length+"/1 AT",0,-124);
 // Flag physically rises only after the occupation requirement is satisfied.
 ctx.strokeStyle="#ded9bd";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(65,-93);ctx.lineTo(65,-93-71*b.flagProgress);ctx.stroke();
 if(b.flagProgress>.02){const y=-93-71*b.flagProgress;ctx.fillStyle=baseColor(b.team);ctx.beginPath();ctx.moveTo(65,y);ctx.lineTo(98,y+8);ctx.lineTo(65,y+19);ctx.closePath();ctx.fill();}
 finishBase(ctx);
}

export function drawForwardFront(ctx,b){
 const front="#b7a07a",shadow="#77664d";
 drawFoundation(ctx,b);
 // Sandbags as overlapping staggered ovals.
 for(let row=0;row<3;row++)for(let i=0;i<7;i++){
  const x=-67+i*22+(row%2)*10,y=-5-row*7;
  ctx.fillStyle=(i+row)%2?front:shadow;ctx.beginPath();ctx.ellipse(x,y,13,5,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle="#493d2f";ctx.lineWidth=.8;ctx.stroke();
 }
 finishBase(ctx);
}
