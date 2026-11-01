import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateLevel} from '../../js/battlefield/terrain/level.js';
import {groundY,terrainContact,walkSurface} from '../../js/battlefield/terrain/heightfield.js';
import {createSimulation,stepSimulation,snapshot,targetFor} from '../../js/battlefield/terrain/simulation.js';
const base=JSON.parse(readFileSync(new URL('../../levels/ridge.json',import.meta.url)));let checks=0;
for(const mutate of [d=>d.terrain.points=[[0,0],[0,1],[1200,0]],d=>d.scenarios[0].units[1].id=1,d=>d.scenarios[0].units[0].team=2,d=>d.scenarios[0].units[0].type='tank',d=>d.scenarios[0].combat=1,d=>d.world.baseline=NaN,d=>d.scenarios.push(structuredClone(d.scenarios[0]))]){let d=structuredClone(base);mutate(d);assert.throws(()=>validateLevel(d));checks++;}
let d;for(const change of [d=>d.name='',d=>d.name='   ',d=>d.scenarios[0].name='',d=>d.scenarios[0].name='  ']){d=structuredClone(base);change(d);assert.throws(()=>validateLevel(d));checks++;}console.log('EMPTY_AND_WHITESPACE_NAMES_REJECTED',true);
for(const id of ['ridge','valley','bumps']){const data=JSON.parse(readFileSync(new URL('../../levels/'+id+'.json',import.meta.url)));const sim=createSimulation(data,'walk');for(let i=0;i<4800;i++){const old=sim.units.map(u=>({...u}));stepSimulation(sim);sim.units.forEach((u,k)=>{assert.equal(u.y,groundY(data,u.x));assert.ok(Math.hypot(u.x-old[k].x,u.y-old[k].y)<=47/120+1e-8);assert.ok(u.x>=40&&u.x<=1160);});}assert.equal(sim.stats.rifleShots+sim.stats.rocketShots,0);checks++;}
d=structuredClone(base);d.terrain.points=[[0,0],[1200,0]];d.scenarios=[{id:'probe',name:'probe',combat:false,units:[{id:1,team:0,type:'rocket',mode:'hold',x:100},{id:2,team:1,type:'rifle',mode:'hold',x:300},{id:3,team:0,type:'rifle',mode:'hold',x:300},{id:4,team:1,type:'rifle',mode:'hold',x:324}]}];const sim=createSimulation(d,'probe');sim.projectiles.push({kind:'rocket',team:0,originX:300,originY:499,x:300,y:499,vx:0,vy:240,age:0});stepSimulation(sim);assert.equal(sim.units[1].hp,1);assert.equal(sim.units[2].hp,3);assert.ok(Math.abs(sim.units[3].hp-2.92)<1e-9);checks++;
const a=createSimulation(base,'rockets'),b=createSimulation(base,'rockets');stepSimulation(a,3600);for(let i=0;i<360;i++)stepSimulation(b,10);assert.deepEqual(snapshot(a),snapshot(b));checks++;
console.log('INDEPENDENT_GROUPS_PASS',checks);
