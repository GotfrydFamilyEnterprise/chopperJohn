// HG-SWEEP / AA-COLLISION: geometry is pure, with explicit world-space hulls.
export function segmentBox(a,b,box){let lo=0,hi=1;for(const [v,d,min,max] of [[a.x,b.x-a.x,box.left,box.right],[a.y,b.y-a.y,box.top,box.bottom]]){if(Math.abs(d)<1e-12){if(v<min||v>max)return null;}else{let t0=(min-v)/d,t1=(max-v)/d;if(t0>t1)[t0,t1]=[t1,t0];lo=Math.max(lo,t0);hi=Math.min(hi,t1);if(lo>hi)return null;}}return lo;}
export function hullLocal(point,h){const angle=h.angle*h.facing,c=Math.cos(angle),s=Math.sin(angle),x=point.x-h.x,y=point.y-h.y;return {x:x*c+y*s,y:-x*s+y*c};}
export function hullDistance(point,h){const p=hullLocal(point,h);return Math.hypot(Math.max(0,Math.abs(p.x)-32),Math.max(0,Math.abs(p.y)-12));}
export function lerpAircraft(a,b,t){if(a.id!==b.id)return b;return {...b,x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,angle:a.angle+(b.angle-a.angle)*t,turnTime:a.turnTime+(b.turnTime-a.turnTime)*t};}
export function boxDistance(point,box){return Math.hypot(Math.max(box.left-point.x,0,point.x-box.right),Math.max(box.top-point.y,0,point.y-box.bottom));}
export function soldierBox(u){return {left:u.x-9,right:u.x+9,top:u.y-55,bottom:u.y};}
