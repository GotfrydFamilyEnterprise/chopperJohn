// CAP-05: result presentation and restart actions; simulation freezing belongs to scene.
export function installMatchResult({onNewGame,onMenu,root=document}){
 const panel=root.getElementById('matchResult');let previous=null;
 root.getElementById('resultNewGame').addEventListener('click',onNewGame);root.getElementById('resultMenu').addEventListener('click',onMenu);
 return result=>{if(result===previous)return;previous=result;panel.hidden=!result;panel.inert=!result;if(!result)return;root.getElementById('resultTitle').textContent=result.winner===null?'Draw':result.winner===0?'Victory':'Defeat';root.getElementById('resultText').textContent=result.winner===null?'Both headquarters were captured at the same time.':`${result.winner===0?'Blue':'Red'} captured the enemy headquarters.`;root.getElementById('pilotControls').hidden=true;root.getElementById('pilotControls').inert=true;root.getElementById('resultNewGame').focus({preventScroll:true});};
}
