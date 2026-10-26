// MENU-05: a quiet practice range is visibly distinct from the live battlefield.
export function tutorialSpeedLimit(unit,dt){return Math.max(0,((unit.type==='rocket'?760:800)-unit.x)/dt);}
export function drawTutorialRange(ctx,ground){
 ctx.save();ctx.textAlign='center';ctx.font='bold 12px system-ui';ctx.fillStyle='#99d9cf';ctx.fillText('FLIGHT TRAINING',400,ground-100);
 ctx.strokeStyle='#99d9cf88';ctx.lineWidth=2;ctx.setLineDash([6,7]);ctx.beginPath();ctx.moveTo(360,ground-73);ctx.lineTo(470,ground-73);ctx.stroke();ctx.setLineDash([]);
 ctx.fillStyle='#b9e7df';ctx.fillRect(650,ground-52,3,52);ctx.fillStyle='#73b9ac';ctx.beginPath();ctx.moveTo(653,ground-52);ctx.lineTo(678,ground-43);ctx.lineTo(653,ground-34);ctx.fill();ctx.font='bold 10px system-ui';ctx.fillStyle='#b9e7df';ctx.fillText('TURN POINT',652,ground-65);ctx.restore();
}
