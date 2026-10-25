export const TEAM_COLORS=[{body:"#a9e8fb",trim:"#2984b4"},{body:"#ffc0b4",trim:"#c25852"}];
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function createSoldier(id,team,type,x,ground){return {id,team,type,x,y:ground,phase:(id*0.31)%1,velocity:(type==="rifle"?47:33)*(team===0?1:-1),state:"march",timer:0,observedVelocity:0,hp:type==="rifle"?3:4,fireCooldown:0,guardBase:null,guardSlot:null,hitFlash:0};}
const CYCLE_DISTANCE=44,STANCE_PART=.60;
export function gait(phase,activity=1){
 // One cycle represents two steps. During stance, a planted foot moves
 // backward relative to the advancing body at precisely its travel speed.
 // In swing, it lifts and advances to the next contact.
 const stanceTravel=CYCLE_DISTANCE*STANCE_PART;
 function leg(offset){
  const t=((phase+offset)%1+1)%1;
  let x,y,swing=0;
  if(t<STANCE_PART){const p=t/STANCE_PART;x=stanceTravel*(.5-p);y=0;}
  else{const p=(t-STANCE_PART)/(1-STANCE_PART),smooth=p*p*(3-2*p);
    x=stanceTravel*(-.5+smooth);swing=Math.sin(Math.PI*p);y=-6*swing*activity;}
  const kneeX=x*.46+3+3*swing;
  const kneeY=-11+3*swing;
  return {knee:[kneeX,kneeY],foot:[x,y]};
 }
 return {legs:[leg(0),leg(.5)],bob:.65*(1-Math.cos(phase*2*Math.PI))*.5*activity};
}
function line(ctx,a,b){ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.stroke();}
export function drawBody(ctx,unit,activity=1){
 const colors=TEAM_COLORS[unit.team],pose=gait(unit.phase,activity),bob=pose.bob;
 ctx.save();ctx.translate(unit.x,unit.y);ctx.scale(unit.team===0?1:-1,1);
 ctx.lineCap="round";ctx.lineJoin="round";ctx.strokeStyle=colors.body;ctx.fillStyle=colors.body;ctx.lineWidth=3;
 const hip=[0,-19-bob],neck=[0,-40-bob],shoulder=[0,-34-bob];
 for(const leg of pose.legs){const knee=[leg.knee[0],leg.knee[1]-bob],foot=leg.foot;line(ctx,hip,knee);line(ctx,knee,foot);line(ctx,foot,[foot[0]+5,foot[1]]);}
 line(ctx,hip,neck);
 ctx.beginPath();ctx.arc(0,-47-bob,6,0,Math.PI*2);ctx.fill();
 ctx.strokeStyle=colors.trim;ctx.lineWidth=3.5;line(ctx,[-5,-54-bob],[5,-54-bob]);
 return {shoulder,bob,line:(a,b)=>line(ctx,a,b),colors};
}
export function endBody(ctx){ctx.restore();}
export function updateWalking(unit,dt,speedScale=1){
 unit.timer+=dt;
 const distance=Math.abs(unit.velocity*speedScale*dt);
 unit.phase=(unit.phase+distance/CYCLE_DISTANCE)%1;
 unit.x+=unit.velocity*speedScale*dt;
}
