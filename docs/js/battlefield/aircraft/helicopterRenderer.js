import {apparentFacing} from './helicopter.js';
export function drawHelipad(ctx,ground){ctx.fillStyle='#657d88';ctx.fillRect(310,ground-6,180,7);ctx.strokeStyle='#c6eafa';ctx.lineWidth=2;ctx.strokeRect(320,ground-6,160,7);ctx.font='bold 20px system-ui';ctx.textAlign='center';ctx.fillStyle='#c6eafa';ctx.fillText('H',400,ground+29);ctx.font='10px system-ui';ctx.fillText('BLUE HELIPAD · REPAIR',400,ground+44);}
export function drawHelicopter(ctx,h){
 if(h.hp<=0){ctx.save();ctx.fillStyle='#e5bf9b';ctx.font='bold 12px system-ui';ctx.textAlign='center';ctx.fillText((h.respawnRemaining>0?`HELICOPTER LOST · ${Math.ceil(h.respawnRemaining)}s`:"AWAITING 90 SUPPLY"),h.x,h.y-32);ctx.restore();return;}
 ctx.save();ctx.translate(h.x,h.y);ctx.scale(apparentFacing(h),1);ctx.rotate(h.angle);
 ctx.fillStyle='#bcd3de';ctx.fillRect(-2,-31,4,10);
 ctx.fillStyle=h.hitFlash>0?'#ffe3a0':'#57b7cf';ctx.beginPath();ctx.moveTo(-28,-7);ctx.lineTo(19,-7);ctx.quadraticCurveTo(39,-5,34,9);ctx.lineTo(-18,12);ctx.closePath();ctx.fill();
 ctx.fillStyle='#143e5b';ctx.beginPath();ctx.ellipse(17,0,13,8,0,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#57b7cf';ctx.fillRect(-47,0,20,4);ctx.fillRect(-46,-8,3,16);
 ctx.fillStyle='#c6d7db';ctx.fillRect(24,3,14,3);
 ctx.strokeStyle='#d6eeff';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-15,17);ctx.lineTo(23,17);ctx.moveTo(-10,11);ctx.lineTo(-10,17);ctx.moveTo(16,11);ctx.lineTo(16,17);ctx.stroke();
 ctx.save();ctx.translate(0,-34);ctx.rotate(h.rotorAngle-h.angle);ctx.fillStyle='#c5eafa3d';ctx.beginPath();ctx.ellipse(0,0,70,7,0,0,Math.PI*2);ctx.fill();
 for(const phase of [h.rotorTime*31,h.rotorTime*31+1.1]){ctx.strokeStyle='#e4f7ffbb';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-67*Math.cos(phase),-5*Math.sin(phase));ctx.lineTo(67*Math.cos(phase),5*Math.sin(phase));ctx.stroke();}ctx.restore();
 ctx.save();ctx.translate(-47,0);ctx.rotate(h.rotorTime*40);ctx.strokeStyle='#d5f2ff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-9,0);ctx.lineTo(9,0);ctx.moveTo(0,-9);ctx.lineTo(0,9);ctx.stroke();ctx.restore();ctx.restore();
 ctx.fillStyle='#14212a';ctx.fillRect(h.x-28,h.y-55,56,5);ctx.fillStyle=h.hp>30?'#a4d77c':'#f1977b';ctx.fillRect(h.x-28,h.y-55,56*h.hp/100,5);
 if(h.repairing){ctx.fillStyle='#bceaa5';ctx.font='bold 11px system-ui';ctx.textAlign='center';ctx.fillText('REPAIRING +5/s',h.x,h.y-64);}
}
