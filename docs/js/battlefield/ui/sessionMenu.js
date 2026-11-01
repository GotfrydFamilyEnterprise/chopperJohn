import {GAME_VERSION} from '../session/version.js?v=1.3.1';
import {TUTORIAL_STEPS} from '../session/tutorial.js';
// MENU-01..04: presentation only; never mutates units, budgets or physics.
export function installSessionMenu({state,onStart,onEnd,root=document}){
 const menu=root.getElementById('mainMenu'),card=root.getElementById('tutorialCard'),end=root.getElementById('endSession');
 for(const el of root.querySelectorAll('[data-game-version]'))el.textContent=`v${GAME_VERSION}`;
 root.getElementById('newGame').addEventListener('click',()=>onStart('game'));
 root.getElementById('startTutorial').addEventListener('click',()=>onStart('tutorial-intro'));
 root.getElementById('beginTutorial').addEventListener('click',()=>onStart('tutorial'));
 root.getElementById('introReturn').addEventListener('click',onEnd);
 root.getElementById('tutorialNewGame').addEventListener('click',()=>onStart('game'));
 root.getElementById('tutorialReturn').addEventListener('click',onEnd);
 end.addEventListener('click',onEnd);
 let previous=null;
 return {render({focus=false}={}){
  const key=`${state.mode}:${state.tutorial?.step}`;if(previous===key&&!focus)return;previous=key;
  const home=state.mode==='menu',intro=state.mode==='tutorial-intro';menu.hidden=!home;menu.inert=!home;
  root.getElementById('tutorialIntro').hidden=!intro;root.getElementById('tutorialIntro').inert=!intro;
  for(const id of ['battleHUD','pilotControls','gameMenu']){const el=root.getElementById(id);el.hidden=home||(intro&&id!=='gameMenu');el.inert=el.hidden;}
  card.hidden=state.mode!=='tutorial';card.inert=state.mode!=='tutorial';
  end.textContent=state.mode.startsWith('tutorial')?'End tutorial':'End game';
  root.getElementById('reset').textContent=state.mode.startsWith('tutorial')?'Restart tutorial':'Reset';
  root.getElementById('redEconomy').hidden=state.mode==='tutorial';root.getElementById('redStrategy').hidden=state.mode==='tutorial';
  if(state.tutorial){const step=TUTORIAL_STEPS[state.tutorial.step];root.getElementById('tutorialTitle').textContent=step.title;root.getElementById('tutorialText').textContent=step.text;root.getElementById('tutorialProgress').textContent=state.tutorial.complete?'Complete':`${state.tutorial.step+1} / 6`;root.getElementById('tutorialFinish').hidden=!state.tutorial.complete;}
  for(const id of ['pause','followHelicopter','followRockets','jumpBlue','jumpRed'])root.getElementById(id).disabled=intro;
  root.getElementById('sessionModeLabel').hidden=state.mode!=='tutorial';
  root.getElementById('sessionModeLabel').textContent=state.mode==='tutorial'?'TUTORIAL · SAFE PRACTICE':'LIVE BATTLE';
  if(focus)(home?root.getElementById('newGame'):intro?root.getElementById('beginTutorial'):root.getElementById('field')).focus({preventScroll:true});
 }};
}
