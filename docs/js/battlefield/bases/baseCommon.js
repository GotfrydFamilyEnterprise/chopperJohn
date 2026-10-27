import {defenseCapacity} from './defenseRules.js?v=1.3.1';
export function baseColor(team){return team===0?"#397cb0":"#ae5e5b";}
export function baseTextColor(team){return team===0?"#a5dfff":"#ffc0b5";}
export function createBase(x,team,main){return {x,team,main,defensePoints:defenseCapacity({main}),captureProgress:0,captureTeam:null,rebuildProgress:0,everCaptured:false,slots:{rifle:[null,null],rocket:[null]},reservations:{rifle:[null,null],rocket:[null]},state:"UNCLAIMED",everOccupied:false,flagProgress:0};}
export function drawFoundation(ctx,b){ctx.save();ctx.translate(b.x,460);ctx.fillStyle="#1c2933";ctx.fillRect(-76,0,152,10);}
export function finishBase(ctx){ctx.restore();}
