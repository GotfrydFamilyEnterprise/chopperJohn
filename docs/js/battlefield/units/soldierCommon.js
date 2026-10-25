export const TEAM_COLORS=[{body:"#a9e8fb",trim:"#2984b4"},{body:"#ffc0b4",trim:"#c25852"}];
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function createSoldier(id,team,type,x,ground){return {id,team,type,x,y:ground,phase:(id*2.399963)% (Math.PI*2),velocity:(type==="rifle"?47:33)*(team===0?1:-1),state:"march",timer:0};}
export function gait(phase,activity=1){
 const swing=Math.sin(phase),other=-swing;
 // Each leg has hip, articulated knee and foot. Swing foot lifts during the
 // forward-moving portion; stance foot remains on the terrain.
 function leg(v){const stride=v*10*activity,footX=stride+2,footY=-Math.max(0,v)*5*activity;const kneeX=stride*.47+2.6+Math.max(0,v)*3.5*activity;const kneeY=-13+Math.max(0,v)*4*activity;return {knee:[kneeX,kneeY],foot:[footX,footY]};}
 return {legs:[leg(swing),leg(other)],bob:Math.abs(Math.sin(phase*2))*1.4*activity};
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
 unit.timer+=dt;unit.phase+=dt*(unit.type==="rifle"?10.5:8)*speedScale;
 unit.x+=unit.velocity*speedScale*dt;
}
