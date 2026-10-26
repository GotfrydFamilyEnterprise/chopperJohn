// UI-01: a native disclosure keeps secondary controls off the battlefield.
export function installGameMenu(menu,onOpen=()=>{}){
 const summary=menu.querySelector('summary');
 const close=()=>{menu.open=false;};
 menu.addEventListener('toggle',()=>{if(menu.open)onOpen();});
 menu.addEventListener('click',e=>{if(e.target.closest('#tools button, #tools a'))close();});
 document.addEventListener('pointerdown',e=>{if(menu.open&&!menu.contains(e.target))close();});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.open){close();summary.focus();}});
}
