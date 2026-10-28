import {groundY,visible} from './heightfield.js?v=0.2.0';
import {eye} from './simulation.js?v=0.2.0';
import {gait,TEAM_COLORS} from '../units/soldierCommon.js';
function line(ctx,a,b){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
function soldier(ctx,u,level){
 const dir=u.team===0?1:-1,color=TEAM_COLORS[u.team],pose=gait(u.phase,u.mode==='walk'?1:0),x=u.x,y=u.y;
 ctx.strokeStyle=color.body;ctx.fillStyle=color.body;ctx.lineCap='round';ctx.lineWidth=3;
 for(const leg of pose.legs){const foot={x:x+dir*leg.foot[0],y:groundY(level,x+dir*leg.foot[0])+leg.foot[1]},knee={x:x+dir*leg.knee[0],y:(y-19+foot.y)/2-2};line(ctx,{x,y:y-19},knee);line(ctx,knee,foot);line(ctx,foot,{x:foot.x+dir*5,y:groundY(level,foot.x+dir*5)+leg.foot[1]});}
 line(ctx,{x,y:y-19},{x,y:y-41});ctx.beginPath();ctx.arc(x,y-48,6,0,Math.PI*2);ctx.fill();
 line(ctx,{x,y:y-35},{x:x+dir*17,y:y-32});
 const aiming=u.state!=='march';ctx.strokeStyle=u.type==='rocket'?'#b9bc8f':'#dee6df';ctx.lineWidth=u.type==='rocket'?7:4;
 if(u.type==='rocket'&&aiming)line(ctx,{x:x-dir*4,y:y-39},{x:x+dir*25,y:y-66});
 else if(u.type==='rifle'&&u.rifleAimAngle!==null&&u.rifleAimAngle!==undefined){const a={x:x+dir*5,y:y-37};line(ctx,a,{x:a.x+29*Math.cos(u.rifleAimAngle),y:a.y+29*Math.sin(u.rifleAimAngle)});}
 else line(ctx,{x:x+dir*5,y:y-(aiming?37:26)},{x:x+dir*34,y:y-(aiming?37:26)});
 ctx.fillStyle='#102332';ctx.fillRect(x-15,y-71,30,3);ctx.fillStyle=color.body;ctx.fillRect(x-15,y-71,30*u.hp/(u.type==='rocket'?4:3),3);
 ctx.font='10px system-ui';ctx.textAlign='center';ctx.fillText((u.team===0?'B':'R')+' · '+(u.mode==='hold'?'HOLD':aiming?'WALK + FIRE':'WALK'),x,y-78);
}
export function drawLab(ctx,width,height,sim,{sight=true,zoom=1,center=600}={}){
 const {level}=sim,scale=Math.min(width/level.world.width,height/430)*zoom;
 const viewWidth=width/scale,viewCenter=viewWidth>=level.world.width?level.world.width/2:Math.max(viewWidth/2,Math.min(level.world.width-viewWidth/2,center));
 const offsetX=width/2-viewCenter*scale,offsetY=height*.72-level.world.baseline*scale;
 ctx.clearRect(0,0,width,height);const sky=ctx.createLinearGradient(0,0,0,height);sky.addColorStop(0,'#12283b');sky.addColorStop(1,'#38575d');ctx.fillStyle=sky;ctx.fillRect(0,0,width,height);
 ctx.save();ctx.translate(offsetX,offsetY);ctx.scale(scale,scale);
 // Faint baseline makes positive hills and negative valleys comparable.
 ctx.strokeStyle='#9bb7bd33';ctx.setLineDash([5,7]);line(ctx,{x:0,y:level.world.baseline},{x:level.world.width,y:level.world.baseline});ctx.setLineDash([]);
 ctx.beginPath();ctx.moveTo(-10000,1000);ctx.lineTo(-10000,groundY(level,0));for(const [x] of level.terrain.points)ctx.lineTo(x,groundY(level,x));ctx.lineTo(10000,groundY(level,level.world.width));ctx.lineTo(10000,1000);ctx.closePath();ctx.fillStyle='#3c5146';ctx.fill();
 ctx.beginPath();for(let i=0;i<level.terrain.points.length;i++){const x=level.terrain.points[i][0];if(i)ctx.lineTo(x,groundY(level,x));else ctx.moveTo(x,groundY(level,x));}ctx.strokeStyle='#b8c58c';ctx.lineWidth=4;ctx.stroke();
 ctx.font='12px system-ui';ctx.textAlign='center';
 for(let x=0;x<=level.world.width;x+=100){const y=groundY(level,x);ctx.fillStyle='#aac4bc';ctx.fillRect(x,y+9,1,7);ctx.fillText(String(x),x,y+30);}
 if(sight){const live=sim.units.filter(u=>u.hp>0);for(let i=0;i<live.length;i++)for(let j=i+1;j<live.length;j++)if(live[i].team!==live[j].team){const a=eye(live[i]),b=eye(live[j]);ctx.strokeStyle=visible(level,a,b)?'#8ce4b6':'#f0b463';ctx.lineWidth=1.5;ctx.setLineDash([5,5]);line(ctx,a,b);ctx.setLineDash([]);}}
 for(const u of sim.units)if(u.hp>0)soldier(ctx,u,level);else{ctx.strokeStyle=TEAM_COLORS[u.team].body;ctx.lineWidth=2;line(ctx,{x:u.x-6,y:u.y-10},{x:u.x+6,y:u.y});line(ctx,{x:u.x+6,y:u.y-10},{x:u.x-6,y:u.y});ctx.fillStyle=TEAM_COLORS[u.team].body;ctx.font='10px system-ui';ctx.textAlign='center';ctx.fillText((u.team===0?'BLUE':'RED')+' DOWN',u.x,u.y-17);}
 for(const p of sim.projectiles){if(p.kind==='rocket'){ctx.beginPath();for(let i=0;i<=10;i++){const t=Math.max(0,p.age-(10-i)*.025),x=p.originX+p.vx*t,y=p.originY+p.vy*t+120*t*t;if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y);}ctx.strokeStyle='#e6bf8c';ctx.lineWidth=1.5;ctx.stroke();}ctx.strokeStyle=p.kind==='rocket'?'#ffb65c':'#fff2ba';ctx.lineWidth=p.kind==='rocket'?4:2;line(ctx,{x:p.x-9*Math.sign(p.vx),y:p.y},{x:p.x,y:p.y});}
 for(const e of sim.effects){ctx.globalAlpha=1-e.age/.65;ctx.fillStyle=e.kind==='blast'?'#efb866':'#e9dec4';ctx.beginPath();ctx.arc(e.x,e.y,e.kind==='blast'?8+e.age*25:3,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;}
 ctx.restore();return {scale,offsetX,offsetY};
}
