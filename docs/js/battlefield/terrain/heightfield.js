// TL-02/03: one piecewise-linear surface serves feet, visibility and projectiles.
export function groundY(level,x){
 const points=level.terrain.points;
 x=Math.max(0,Math.min(level.world.width,x));
 for(let i=1;i<points.length;i++)if(x<=points[i][0]){const [a,h]=points[i-1],[b,k]=points[i];return level.world.baseline-h-(k-h)*(x-a)/(b-a);}
 return level.world.baseline-points.at(-1)[1];
}
// Return earliest swept contact, including vertex/tangent hits and vertical shots.
export function terrainContact(level,a,b){
 const cuts=[0,1],dx=b.x-a.x,dy=b.y-a.y;
 if(dx)for(const [x] of level.terrain.points){const t=(x-a.x)/dx;if(t>0&&t<1)cuts.push(t);}
 cuts.sort((x,y)=>x-y);
 const at=t=>({x:a.x+dx*t,y:a.y+dy*t});
 const clearance=t=>{const p=at(t);return groundY(level,p.x)-p.y;};
 for(let i=0;i<cuts.length-1;i++){
  const lo=cuts[i],hi=cuts[i+1],c=clearance(lo),d=clearance(hi);
  if(c<=1e-8)return {...at(lo),t:lo};
  if(d<=1e-8){const t=lo+(hi-lo)*c/(c-d);return {...at(t),t};}
 }
 return null;
}
export const visible=(level,a,b)=>!terrainContact(level,a,b);
// Walk actual surface distance, crossing corners without a vertical teleport.
export function walkSurface(level,x,distance){
 const direction=Math.sign(distance),points=level.terrain.points;
 let remaining=Math.abs(distance),position=x;
 if(!direction)return x;
 while(remaining>1e-9){
  const next=direction>0?points.find(p=>p[0]>position+1e-8):[...points].reverse().find(p=>p[0]<position-1e-8);
  if(!next)break;
  const length=Math.hypot(next[0]-position,groundY(level,next[0])-groundY(level,position));
  const amount=Math.min(remaining,length);
  position+=(next[0]-position)*(amount/length);remaining-=amount;
 }
 return position;
}
