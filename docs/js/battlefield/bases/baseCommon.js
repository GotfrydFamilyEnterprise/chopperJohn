export function baseColor(team){return team===0?"#397cb0":"#ae5e5b";}
export function baseTextColor(team){return team===0?"#a5dfff":"#ffc0b5";}
export function createBase(x,team,main){return {x,team,main,slots:{rifle:[null,null],rocket:[null]},flagProgress:0};}
export function drawFoundation(ctx,b){ctx.save();ctx.translate(b.x,460);ctx.fillStyle="#1c2933";ctx.fillRect(-76,0,152,10);}
export function finishBase(ctx){ctx.restore();}
