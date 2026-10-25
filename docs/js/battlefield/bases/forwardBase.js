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
 const front="#b7a07a",shadow="#77664d";
 // Four posts holding a camouflaged fabric roof.
 ctx.strokeStyle="#6b6a50";ctx.lineWidth=6;
 for(const x of [-58,-21,21,58]){ctx.beginPath();ctx.moveTo(x,-12);ctx.lineTo(x,-91);ctx.stroke();}
 ctx.fillStyle="#667a55";ctx.beginPath();ctx.moveTo(-78,-92);ctx.lineTo(-66,-114);ctx.lineTo(55,-112);ctx.lineTo(78,-91);ctx.closePath();ctx.fill();
 ctx.strokeStyle="#263c31";ctx.lineWidth=3;
 for(let j=0;j<10;j++){const x=-67+j*15;ctx.beginPath();ctx.moveTo(x,-105+(j%3)*4);ctx.lineTo(x+17,-96+(j%2)*5);ctx.stroke();}
 ctx.strokeStyle="#a7b28b";ctx.lineWidth=1.2;
 for(let j=0;j<8;j++){const x=-64+j*17;ctx.beginPath();ctx.moveTo(x,-111);ctx.lineTo(x+17,-91);ctx.stroke();}
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
