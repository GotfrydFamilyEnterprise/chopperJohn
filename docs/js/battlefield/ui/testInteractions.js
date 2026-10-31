// CP-06: install only in explicit test mode. Real buttons dispatch their normal
// click/change handlers; held controls share pilot input handlers. Browser-only
// permissions (e.g. fullscreen user activation) still need real browser gestures.
export function installTestInteractions({enabled=false,controls=null,step,snapshot,dt=1/120,root=document}){
 if(!enabled)return undefined;
 const element=id=>root.getElementById(String(id).replace(/^#/,''));
 const status=el=>{
  if(!el)return 'unknown';if(el.disabled)return 'disabled';if(el.closest('[hidden],[inert]')||!el.getClientRects().length)return 'hidden';if(root.querySelector('dialog[open]')&&!el.closest('dialog'))return 'modal';
  const r=el.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;if(x<0||y<0||x>root.documentElement.clientWidth||y>root.documentElement.clientHeight)return 'offscreen';const top=root.elementFromPoint(x,y);return top&&!el.contains(top)?'covered':null;
 };

 const result=(ok,reason)=>({ok,...reason?{reason}:{},state:snapshot()});
 const click=id=>{const el=element(id),blocked=status(el);if(blocked)return result(false,blocked);if(!el.matches('button,a,summary'))return result(false,'not-a-button');el.click();return result(true);};
 const advance=seconds=>{if(!Number.isFinite(seconds)||seconds<0||seconds>300)throw new RangeError('Advance must be0–300 seconds');let remaining=Math.round(seconds/dt);while(remaining>0){const chunk=Math.min(remaining,12000);step(chunk);remaining-=chunk;}return snapshot();};
 const press=id=>{const el=element(id),blocked=status(el);if(blocked)return result(false,blocked);const key=el.id;if(key==='heliFire'&&controls)return result(controls.setFire(true));if(key==='heliTurn'&&controls)return result(controls.turn());return click(id);};
 const release=id=>{if(String(id).replace(/^#/,'')==='heliFire'&&controls){controls.setFire(false);return result(true);}return result(false,'not-a-held-control');};
 return {click,press,release,advance,
  hold:(id,seconds)=>{const pressed=press(id);if(!pressed.ok)return pressed;try{advance(seconds);}finally{release(id);}return result(true);},
  joystick:(x,y)=>{const blocked=status(element('pilotStick'));if(blocked||!controls)return result(false,blocked||'unavailable');return result(controls.setStick(x,y));},
  releaseAll:()=>{controls?.release();return snapshot();},
  select:(id,value)=>{const el=element(id),blocked=status(el);if(blocked)return result(false,blocked);if(el.tagName!=='SELECT'||![...el.options].some(o=>o.value===String(value)&&!o.disabled))return result(false,'invalid-option');el.value=String(value);el.dispatchEvent(new Event('change',{bubbles:true}));return result(true);},
  list:()=>[...root.querySelectorAll('button[id],a[id],summary[id],select[id]')].map(el=>({id:el.id,label:el.getAttribute('aria-label')||el.textContent.trim(),blocked:status(el)})),
 };
}
