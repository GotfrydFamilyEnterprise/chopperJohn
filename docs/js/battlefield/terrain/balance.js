// TL-09: encounter economics use production prices; these are preassembled forces,
// not a model of live income, deployment timing, reinforcements, bases or aircraft.
import {SUPPLY_RULES} from '../economy/supply.js?v=2.2.0';
export const BLAST_RADII=Object.freeze([25,40,50]);
export const DEFAULT_BLAST_RADIUS=40;
export function checkedBlastRadius(radius=DEFAULT_BLAST_RADIUS){
 if(!BLAST_RADII.includes(radius))throw new RangeError('Blast radius must be 25, 40 or 50');
 return radius;
}
export function forceValue(units){return units.reduce((sum,u)=>sum+SUPPLY_RULES.costs[u.type],0);}
export function forceEconomics(sim,team){
 const units=sim.units.filter(u=>u.team===team),fielded=forceValue(units),surviving=forceValue(units.filter(u=>u.hp>0));
 return {fielded,surviving,lost:fielded-surviving,alive:units.filter(u=>u.hp>0).length};
}
const rifle=Array(12).fill('rifle'),rockets=Array(5).fill('rocket');
const mixed=['rifle','rifle','rifle','rifle','rocket','rocket'];
// Front-to-back unit order is deliberate: rifle screens lead mixed formations.
export const BALANCE_CASES=Object.freeze([
 {id:'close',name:'Close rush',description:'300 Supply each. Leading riflemen start inside the rocket minimum range.',blue:rifle,red:rockets,gap:190,spacing:18},
 {id:'long',name:'Open approach',description:'300 Supply each. Riflemen must cross open ground under rocket fire.',blue:rifle,red:rockets,gap:650,spacing:18},
 {id:'screen',name:'Mixed screen',description:'240 Supply budget: Blue 4 rifles + 2 rockets (220, 20 unspent); Red 4 rockets (240).',blue:mixed,red:Array(4).fill('rocket'),gap:650,spacing:35},
 {id:'cluster',name:'Clustered advance',description:'300 Supply each. Closely packed riflemen approach a rocket force.',blue:rifle,red:rockets,gap:650,spacing:8},
 {id:'spread',name:'Spread advance',description:'300 Supply each. Same troops with wider spacing; compare Clustered advance.',blue:rifle,red:rockets,gap:650,spacing:45},
 {id:'high',name:'High-ground defense',description:'240 Supply budget. Blue mixed force climbs toward four holding rocket defenders; Red starts elevated.',blue:mixed,red:Array(4).fill('rocket'),gap:650,spacing:35,hill:true,hold:true},
 {id:'reverse',name:'Reverse-slope cover',description:'240 Supply budget. Same mixed attack and holding rockets, with a hill between them.',blue:mixed,red:Array(4).fill('rocket'),gap:650,spacing:35,cover:true,hold:true},
 {id:'mirror',name:'Identical mixed forces',description:'220 Supply each: 4 rifles + 2 rockets. A faction-bias control, not a target win rate.',blue:mixed,red:mixed,gap:650,spacing:35},
]);
export function balanceLevel(seed=1){
 const width=2400;
 return {schemaVersion:1,id:'battle-lines',name:'Battle lines',seed,description:'Preassembled ground encounters using real unit prices. No income, reinforcement, FOB or helicopter simulation.',world:{width,baseline:500},terrain:{points:[[0,0],[width,0]]},scenarios:BALANCE_CASES.filter(c=>!c.hill&&!c.cover).map(c=>scenario(c))};
}
function scenario(c){
 let id=1;const units=[];
 for(const [team,types] of [[0,c.blue],[1,c.red]])types.forEach((type,i)=>units.push({id:id++,team,type,x:1200+(team===0?-1:1)*(c.gap/2+i*c.spacing),mode:team===1&&c.hold?'hold':'walk'}));
 return {id:c.id,name:c.name,description:c.description,combat:true,units};
}
export function encounterLevel(id,seed=1,mirrored=false){
 const c=BALANCE_CASES.find(c=>c.id===id);if(!c)throw new Error('Unknown balance encounter');
 const level=balanceLevel(seed);level.scenarios=[scenario(c)];
 if(c.hill)level.terrain.points=[[0,0],[1100,0],[1470,180],[2400,180]];
 if(c.cover)level.terrain.points=[[0,0],[1000,0],[1200,180],[1400,0],[2400,0]];
 if(mirrored){level.terrain.points=level.terrain.points.map(([x,h])=>[2400-x,h]).reverse();level.scenarios[0].units=level.scenarios[0].units.map(u=>({...u,x:2400-u.x,team:1-u.team}));}
 return level;
}
export function hillBalanceLevel(seed=1){
 const level=encounterLevel('high',seed);level.id='battle-hill';level.name='Battle hill';
 // Same ground, alternate advancing/holding compositions for interactive comparison.
 const alternate=scenario({...BALANCE_CASES.find(c=>c.id==='screen'),id:'hill-advance',name:'Both sides advance',hill:true});
 level.scenarios.push(alternate);return level;
}
