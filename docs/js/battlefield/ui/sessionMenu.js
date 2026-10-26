import {GAME_VERSION} from '../session/version.js';
import {TUTORIAL_STEPS} from '../session/tutorial.js';
// MENU-01..04: presentation only; never mutates units, budgets or physics.
export function installSessionMenu({state,onStart,onEnd,root=document}){
 const menu=root.getElementById('mainMenu'),card=root.getElementById('tutorialCard'),end=root.getElementById('endSession');
 for(const el of root.querySelectorAll('[data-game-version]'))el.textContent=`v${GAME_VERSION}`;
 root.getElementById('newGame').addEventListener('click',()=>onStart('game'));
 root.getElementById('startTutorial').addEventListener('click',()=>onStart('tutorial'));
 root.getElementById('tutorialNewGame').addEventListener('click',()=>onStart('game'));
 root.getElementById('tutorialReturn').addEventListener('click',onEnd);
 end.addEventListener('click',onEnd);
 let previous=null;
 return {render({focus=false}={}){
  const key=`${state.mode}:${state.tutorial?.step}`;if(previous===key&&!focus)return;previous=key;
  const home=state.mode==='menu';menu.hidden=!home;menu.inert=!home;
  for(const id of ['battleHUD','pilotControls','gameMenu']){const el=root.getElementById(id);el.hidden=home;el.inert=home;}
  card.hidden=state.mode!=='tutorial';card.inert=state.mode!=='tutorial';
  end.textContent=state.mode==='tutorial'?'End tutorial':'End game';
  root.getElementById('reset').textContent=state.mode==='tutorial'?'Restart tutorial':'Reset';
  root.getElementById('redEconomy').hidden=state.mode==='tutorial';root.getElementById('redStrategy').hidden=state.mode==='tutorial';
  if(state.tutorial){const step=TUTORIAL_STEPS[state.tutorial.step];root.getElementById('tutorialTitle').textContent=step.title;root.getElementById('tutorialText').textContent=step.text;root.getElementById('tutorialProgress').textContent=state.tutorial.complete?'Complete':`${state.tutorial.step+1} / 6`;root.getElementById('tutorialFinish').hidden=!state.tutorial.complete;}
  if(focus)(home?root.getElementById('newGame'):root.getElementById('field')).focus({preventScroll:true});
 }};
}
