// Uses a separate Chrome profile. Never run against a personal browser/save.
// Start Vite and Chrome as described in docs/Revision_end_to_end.md.
import {call,evaluate,pause,shot,close,onEvent} from './cdp.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const url=process.env.GAME_URL || 'http://127.0.0.1:5174/';
const out=process.env.QA_OUTPUT || '/tmp/museo-e2e';
await fs.mkdir(out,{recursive:true});
const errors=[],report={views:{},journeys:[]};
onEvent(async event=>{
  if(event.method==='Runtime.exceptionThrown')errors.push(event.params.exceptionDetails.text);
  if(event.method!=='Fetch.requestPaused')return;
  const {requestId}=event.params;
  try {
    const res=await call('Fetch.getResponseBody',{requestId});
    let body=res.base64Encoded?Buffer.from(res.body,'base64').toString():res.body;
    const marker='updateControls = controls.update;';
    assert.ok(body.includes(marker));
    body=body.replace(marker,`${marker} window.__game={world,camera,renderer,controls,getHistory:()=>history,getProgress:()=>saved,getScene:()=>scene,draw:()=>renderFrame(),run:(n)=>{for(let i=0;i<n;i++){updateControls(.05);updateScene(.05);}}};`);
    await call('Fetch.fulfillRequest',{requestId,responseCode:200,responseHeaders:[{name:'Content-Type',value:'application/javascript'}],body:Buffer.from(body).toString('base64')});
  } catch(e){errors.push(String(e));await call('Fetch.continueRequest',{requestId});}
});
await call('Page.addScriptToEvaluateOnNewDocument',{source:'window.__qaPageId=crypto.randomUUID();'});
await call('Fetch.enable',{patterns:[{urlPattern:'*/src/main.ts*',requestStage:'Response'}]});
await call('Page.navigate',{url});
async function ready(previous){for(let i=0;i<240;i++){if(await evaluate(`!!window.__game && !!window.__qaPageId && window.__qaPageId!==${JSON.stringify(previous??null)} && !document.querySelector("#menu-button").disabled`)){await evaluate('window.__game.renderer.setAnimationLoop(null)');return;}await pause(250);}throw Error('Loading timeout');}
async function reload(){const previous=await evaluate('window.__qaPageId');await call('Page.reload');await ready(previous);}
await ready();await evaluate("localStorage.removeItem('museo-del-tiempo:v1')");await reload();
const state=()=>evaluate(`({pos:window.__game.camera.position.toArray(),yaw:window.__game.camera.rotation.y,play:document.querySelector('#app').dataset.playState,location:document.querySelector('#app').dataset.location,room:document.querySelector('#app').dataset.room,prompt:document.querySelector('#interaction-label').textContent,interact:!document.querySelector('#interaction-prompt').hidden,lock:!!document.pointerLockElement,error:document.querySelector('#error').textContent})`);
const run=n=>evaluate(`window.__game.run(${n})`);
async function click(selector){const r=await evaluate(`document.querySelector('${selector}').getBoundingClientRect().toJSON()`);for(const type of ['mousePressed','mouseReleased'])await call('Input.dispatchMouseEvent',{type,x:r.x+r.width/2,y:r.y+r.height/2,button:'left',clickCount:1});await pause(100);}
async function key(code,type='keyDown'){const key=code.startsWith('Key')?code.slice(3).toLowerCase():code;await call('Input.dispatchKeyEvent',{type,key,code,windowsVirtualKeyCode:code==='Escape'?27:key.length===1?key.toUpperCase().charCodeAt(0):16});}
async function press(code){await key(code);await key(code,'keyUp');await run(1);}
async function face(yaw){const s=await state();await evaluate(`document.dispatchEvent(new MouseEvent('mousemove',{movementX:${(s.yaw-yaw)/.0022},movementY:${0}}));window.__game.run(1)`);}
async function walkTo(x,z){
  for(let attempt=0;attempt<8;attempt++){
    const s=await state(),dx=x-s.pos[0],dz=z-s.pos[2],d=Math.hypot(dx,dz);
    if(d<.14)return;
    await face(Math.atan2(-dx,-dz));await key('KeyW');await run(Math.max(1,Math.floor(d/.16)));await key('KeyW','keyUp');await run(1);
    const next=await state();if(Math.hypot(next.pos[0]-s.pos[0],next.pos[2]-s.pos[2])<.03)throw Error('Blocked route to '+JSON.stringify([x,z])+' at '+JSON.stringify(next));
  }
  throw Error('Did not reach '+[x,z]);
}
async function view(name){report.views[name]=await evaluate(`(()=>{const g=window.__game;g.renderer.info.autoReset=false;g.renderer.info.reset();g.draw();return {position:g.camera.position.toArray(),calls:g.renderer.info.render.calls,triangles:g.renderer.info.render.triangles,geometries:g.renderer.info.memory.geometries,textures:g.renderer.info.memory.textures};})()`);await shot(out+'/'+name+'.png');}
async function paused(){await press('Escape');await pause(120);assert.equal((await state()).play,'paused');const p=(await state()).pos;await run(40);assert.deepEqual((await state()).pos,p);}
async function resume(){await click('#menu-button');await run(1);assert.equal((await state()).lock,true);}
async function openDoor(){assert.equal((await state()).interact,true,JSON.stringify(await state()));await press('KeyE');await run(40);}
async function waitState(play,location){for(let i=0;i<200;i++){await run(1);const s=await state();if(s.play===play&&(!location||s.location===location))return;await pause(100);}throw Error('State timeout '+JSON.stringify(await state()));}
async function photograph(id,invalid=false){
  await press('KeyC');await pause(500);await run(30);assert.equal((await state()).play,'camera');await view(id+'-sala');
  if(invalid){const yaw=(await state()).yaw;await face(yaw+Math.PI);await click('#scene canvas');await run(80);await pause(100);assert.equal((await state()).play,'camera');assert.equal(await evaluate('Object.keys(window.__game.getProgress().photos).length'),0);await face(yaw);}
  await click('#scene canvas');await run(80);await pause(100);assert.equal((await state()).play,'transition');
  const p=(await state()).pos;await key('KeyW');await run(5);await key('KeyW','keyUp');await press('KeyM');assert.deepEqual((await state()).pos,p);assert.equal((await state()).play,'transition');
  if(id==='egipto'){
    await paused();const before=await evaluate('window.__game.getHistory()?.id || null');const opacity=await evaluate("document.querySelector('#time-transition').style.opacity");await pause(2200);assert.equal(await evaluate('window.__game.getHistory()?.id || null'),before);assert.equal(await evaluate("document.querySelector('#time-transition').style.opacity"),opacity);await resume();
  }
  await waitState('playing',id+'-history');await view(id+'-llegada');
  assert.equal(await evaluate('window.__game.getHistory().helpActive()'),false);await run(401);assert.equal(await evaluate('window.__game.getHistory().helpActive()'),true);
}
async function collect(id,count){assert.equal((await state()).interact,true,JSON.stringify(await state()));await view(id+'-destino');await press('KeyE');await waitState('pamphlet');await run(35);assert.equal((await state()).lock,false);assert.equal(await evaluate('Object.keys(window.__game.getProgress().photos).length'),count);assert.match(await evaluate("document.querySelector('#held-description').textContent"),new RegExp(count+'/5'));report.journeys.push(id);await press('KeyM');await pause(120);await run(1);}
try {
await resume();await view('patio');
await face(Math.PI);await run(40);await view('estacion');await paused();await resume();await face(0);
await walkTo(3.3,26.3);await walkTo(3.3,1.6);assert.match((await state()).prompt,/panfleto/);await press('KeyE');await run(35);
await press('KeyM');await run(35);assert.equal((await state()).lock,false);await view('panfleto-inicial');await press('KeyM');await pause(150);
await walkTo(0,1.6);await walkTo(0,-18);await view('hall');
await walkTo(-7.05,-18);await walkTo(-7.05,-19.3);await face(0);
// Door animations must stop along with the player.
await press('KeyE');await run(2);await paused();const doorProgress=await evaluate("window.__game.world.doors.find(d=>d.target==='egipto').progress");await run(50);assert.equal(await evaluate("window.__game.world.doors.find(d=>d.target==='egipto').progress"),doorProgress);await resume();await run(40);
await walkTo(-7.05,-25);await face(0);await photograph('egipto',true);await walkTo(0,-22.5);await collect('egipto',1);
await walkTo(-5.1,-25.3);await walkTo(-5.1,-35.2);await walkTo(-7.05,-35.2);await face(0);await openDoor();await walkTo(-7.05,-39.2);await face(0);await photograph('roma');await walkTo(0,-16.5);await collect('roma',2);
await walkTo(-5.1,-41.3);await walkTo(-5.1,-51.3);await walkTo(-7.05,-51.3);await face(0);await openDoor();await walkTo(-7.05,-55.7);await walkTo(0,-55.7);await face(0);await photograph('medieval');await walkTo(0,-17.5);await collect('medieval',3);
await walkTo(7.05,-55.7);await face(Math.PI);await openDoor();await walkTo(7.05,-51);await face(Math.PI);await photograph('japon');await walkTo(0,-39.5);await collect('japon',4);
await walkTo(5.1,-49.6);await walkTo(5.1,-39.6);await walkTo(7.05,-39.6);await face(Math.PI);await openDoor();await walkTo(7.05,-35.2);await face(Math.PI);await photograph('luna');
await press('KeyM');await run(35);await view('guantes');await press('KeyM');await pause(150);await walkTo(0,-24.6);assert.match((await state()).prompt,/Subir/);await press('KeyE');await run(15);await paused();await resume();await run(60);
assert.equal(await evaluate('window.__game.getHistory().boarding.state()'),'cabin');assert.ok(Math.abs((await state()).pos[1]-3.25)<.03);await view('luna-cabina');
await press('KeyM');await run(35);await press('KeyM');await pause(150);await run(1);assert.ok(Math.abs((await state()).pos[1]-3.25)<.03);assert.equal(await evaluate('Object.keys(window.__game.getProgress().photos).length'),4);
await press('KeyE');await run(12);await paused();await resume();await run(60);await waitState('pamphlet');await run(35);await view('cinco-recuerdos');report.journeys.push('luna');
assert.equal(await evaluate("window.__game.camera.getObjectByName('visor-casco-espacial').visible"),false);assert.equal(await evaluate('window.__game.camera.far'),100);assert.equal(await evaluate('Object.keys(window.__game.getProgress().photos).length'),5);
await press('KeyM');await pause(150);await walkTo(5.1,-33.6);await walkTo(5.1,-23.6);await walkTo(7.05,-23.6);await face(Math.PI);await openDoor();await walkTo(7.05,-18.5);await walkTo(0,-18.5);await view('regreso-hall');
await reload();assert.equal(await evaluate('Object.keys(window.__game.getProgress().photos).length'),5);await resume();await press('KeyM');await run(35);await view('recarga-cinco');
await paused();await click('#sound-button');assert.equal(await evaluate("document.querySelector('#sound-button').getAttribute('aria-pressed')"),'false');
onEvent(async e=>{if(e.method==='Page.javascriptDialogOpening')await call('Page.handleJavaScriptDialog',{accept:true});});const previous=await evaluate('window.__qaPageId');await click('#restart-button');await ready(previous);assert.equal(await evaluate('window.__game.getProgress().hasPamphlet'),false);assert.equal(await evaluate('Object.keys(window.__game.getProgress().photos).length'),0);
assert.deepEqual(errors,[]);report.result='PASS';console.log('FIVE JOURNEYS / REAL PHOTOS / CONTINUOUS WALK / PAUSES / RELOAD / RESTART PASS');
} catch(e){report.result='FAIL';report.failure=String(e);try{report.state=await state();await view('failure');}catch{}console.error(report);process.exitCode=1;}
await fs.writeFile(out+'/report.json',JSON.stringify(report,null,2));await call('Fetch.disable');close();
