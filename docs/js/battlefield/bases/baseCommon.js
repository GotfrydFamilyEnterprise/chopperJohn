export function baseColor(team){return team===0?"#397cb0":"#ae5e5b";}
export function baseTextColor(team){return team===0?"#a5dfff":"#ffc0b5";}
export function createBase(x,team,main,garrison=0){return {x,team,main,garrison};}
export function drawFoundation(ctx,b){ctx.save();ctx.translate(b.x,460);ctx.fillStyle="#1c2933";ctx.fillRect(-58,0,116,10);}
export function finishBase(ctx){ctx.restore();}
