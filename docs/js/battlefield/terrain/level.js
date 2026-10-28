// TL-01: versioned data contract, independent of DOM and battlefield composition.
export function validateLevel(input){
 const fail=message=>{throw new Error(`Invalid level: ${message}`);};
 if(!input||input.schemaVersion!==1)fail('schemaVersion must be 1');
 if(typeof input.id!=='string'||!input.id.trim()||typeof input.name!=='string'||!input.name.trim()||input.name.length>80)fail('id/name required (name max 80 characters)');
 if(!Number.isInteger(input.seed)||input.seed<0||input.seed>0xffffffff)fail('seed must be an unsigned 32-bit integer');
 const {width,baseline}=input.world??{};
 if(!Number.isFinite(width)||width<600||width>5000||!Number.isFinite(baseline)||baseline<250||baseline>700)fail('world width 600–5000 and baseline 250–700 required');
 const points=input.terrain?.points;
 if(!Array.isArray(points)||points.length<2||points.length>200)fail('terrain requires 2–200 points');
 for(let i=0;i<points.length;i++){
  const p=points[i];
  if(!Array.isArray(p)||p.length!==2||!p.every(Number.isFinite)||p[0]<0||p[0]>width||p[1]<-150||p[1]>250||baseline-p[1]<80)fail('terrain point outside supported bounds');
  if(i&&(p[0]<=points[i-1][0]||Math.abs((p[1]-points[i-1][1])/(p[0]-points[i-1][0]))>1))fail('points must increase in x with slope at most 1');
 }
 if(points[0][0]!==0||points.at(-1)[0]!==width)fail('terrain must span x=0 to world width');
 if(!Array.isArray(input.scenarios)||!input.scenarios.length||input.scenarios.length>12)fail('1–12 scenarios required');
 const ids=new Set();
 for(const scenario of input.scenarios){
  if(typeof scenario.id!=='string'||!scenario.id.trim()||ids.has(scenario.id)||typeof scenario.name!=='string'||!scenario.name.trim()||scenario.name.length>80)fail('scenario id must be unique and name required');
  ids.add(scenario.id);
  if(typeof scenario.combat!=='boolean')fail('scenario combat must be true or false');
  if(!Array.isArray(scenario.units)||scenario.units.length<1||scenario.units.length>24)fail('each scenario needs 1–24 units');
  const unitIds=new Set();
  for(const u of scenario.units){
   if(!Number.isSafeInteger(u.id)||unitIds.has(u.id)||![0,1].includes(u.team)||!['rifle','rocket'].includes(u.type)||!['walk','hold'].includes(u.mode)||!Number.isFinite(u.x)||u.x<40||u.x>width-40)fail('invalid unit id/team/type/mode/x');
   unitIds.add(u.id);
  }
 }
 // Retain only supported data; caller changes cannot mutate a running level.
 return {schemaVersion:1,id:input.id,name:input.name,description:String(input.description??'').slice(0,500),seed:input.seed,world:{width,baseline},terrain:{points:points.map(p=>[...p])},scenarios:input.scenarios.map(s=>({id:s.id,name:s.name,combat:s.combat,description:String(s.description??'').slice(0,500),units:s.units.map(u=>({id:u.id,team:u.team,type:u.type,x:u.x,mode:u.mode}))}))};
}
export async function loadLevel(url,fetcher=fetch){const response=await fetcher(url);if(!response.ok)throw new Error(`Level could not load (${response.status})`);return validateLevel(await response.json());}
