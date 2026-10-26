const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function groundScreenY(height){return height-(height<500?52:125);}
export function groundOffset(height,scale,ground=460){return groundScreenY(height)-ground*scale;}
// H-CAMERA: reserve the control bands, fit rotor + ground, bound look-ahead in pixels.
export function pilotView(h,width,height,world=3600,ground=460){
 const top=56,groundY=groundScreenY(height);
 let scale=Math.max(.3,Math.min(1.35,Math.max(.58,Math.min(height/585,1.35)),width/500,(groundY-top)/Math.max(80,ground-h.y+72)));
 const onPad=h.grounded&&Math.abs(h.x-400)<=90;
 if(onPad)scale=Math.min(scale,width/580);
 const lead=Math.min(100,width*.1/scale);
 const camera=onPad?0:clamp(h.x+h.facing*lead-width/(2*scale),0,Math.max(0,world-width/scale));
 return {scale,camera,offsetY:groundY-ground*scale};
}
