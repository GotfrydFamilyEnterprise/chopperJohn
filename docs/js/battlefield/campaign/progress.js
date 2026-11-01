// CP-04: only completed IDs persist; each attempt starts a fresh world.
export const PROGRESS_KEY='chopperjohn:campaign:first-sorties:v1';
export function readProgress(storage,campaign){try{const value=JSON.parse(storage.getItem(PROGRESS_KEY));const completed=[];if(value?.schemaVersion===1&&Array.isArray(value.completed))for(const l of campaign.levels){if(!value.completed.includes(l.id))break;completed.push(l.id);}return {completed};}catch{return {completed:[]};}}
export function unlocked(campaign,progress,id){const i=campaign.levels.findIndex(l=>l.id===id);return i>=0&&campaign.levels.slice(0,i).every(l=>progress.completed.includes(l.id));}
export function completeLevel(campaign,progress,id,result,storage){if(result?.winner!==0||!unlocked(campaign,progress,id))return false;if(!progress.completed.includes(id))progress.completed.push(id);try{storage.setItem(PROGRESS_KEY,JSON.stringify({schemaVersion:1,completed:progress.completed}));return true;}catch{return false;}}
