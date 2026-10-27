// CAP-06: status is drawn in-world, preserving the compact pilot HUD.
export function baseStatus(b){
 const owner=b.team===0?'BLUE':'RED',kind=b.main?'HQ':'FOB';
 if((b.defensePoints??6)>0)return `${owner} ${kind} · DEFENSE ${b.defensePoints??6}/6`;
 if(b.contested)return `${owner} ${kind} · CONTESTED${b.captureProgress>0?' '+b.captureProgress.toFixed(1)+'/5s':''}`;
 if(b.captureProgress>0)return `${owner} ${kind} · ${b.captureTeam===0?'BLUE':'RED'} CAP ${b.captureProgress.toFixed(1)}/5s`;
 if(b.rebuildProgress>0)return `${owner} ${kind} · REBUILD ${Math.floor(b.rebuildProgress+1e-8)}/20s`;
 return `${owner} ${kind} · BREACHED`;
}
export function drawTakeover(ctx,b){
 ctx.save();ctx.translate(b.x,460);ctx.textAlign='center';ctx.font='bold 10px system-ui';ctx.fillStyle=b.defensePoints===0?'#ffcf95':'#d3e6ea';ctx.fillText(baseStatus(b),0,b.main?-246:-148);
 if(b.defensePoints===0){ctx.strokeStyle='#402e28';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-35,-28);ctx.lineTo(-15,-9);ctx.lineTo(12,-23);ctx.lineTo(36,-5);ctx.stroke();}
 else for(let i=0;i<6;i++){ctx.fillStyle=i<b.defensePoints?'#9ecac0':'#334d52';ctx.fillRect(-32+i*11,b.main?-238:-140,8,4);}
 if(b.captureProgress>0||b.rebuildProgress>0){const capture=b.captureProgress>0;ctx.fillStyle='#102430';ctx.fillRect(-50,b.main?-238:-164,100,5);ctx.fillStyle=capture?'#f4c77a':'#8bd7c0';ctx.fillRect(-50,b.main?-238:-164,100*(capture?b.captureProgress/5:b.rebuildProgress/20),5);}
 ctx.restore();
}
