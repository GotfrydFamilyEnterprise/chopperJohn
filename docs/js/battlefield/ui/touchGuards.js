// UI-03: gameplay gestures must not become selection, dragging or callout menus.
export function installTouchGuards(root=document){
 const gameplay=target=>target?.closest?.('button,summary,canvas,#pilotControls');
 for(const name of ['contextmenu','selectstart','dragstart'])root.addEventListener(name,event=>{if(gameplay(event.target))event.preventDefault();});
}
