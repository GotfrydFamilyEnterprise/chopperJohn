import {createTutorial,advanceTutorial} from './tutorial.js';
// MENU-01/02: pure session state; the scene owns resetting its simulation.
export function createSession(mode='menu'){return {mode,tutorial:mode==='tutorial'?createTutorial():null};}
export function beginSession(state,mode){if(!['game','tutorial','tutorial-intro'].includes(mode))throw new RangeError('Invalid session mode');state.mode=mode;state.tutorial=mode==='tutorial'?createTutorial():null;}
export function endSession(state){state.mode='menu';state.tutorial=null;}
export function updateSession(state,observation){return state.mode==='tutorial'&&advanceTutorial(state.tutorial,observation);}
