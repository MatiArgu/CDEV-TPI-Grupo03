import {call,evaluate,pause,shot,close,onEvent} from './cdp.mjs';
import fs from 'node:fs/promises';
const label=process.argv[2]||'review';
onEvent(async e=>{if(e.method!=='Fetch.requestPaused')return;const {requestId}=e.params;try{const res=await call('Fetch.getResponseBody',{requestId});let body=res.base64Encoded?Buffer.from(res.body,'base64').toString():res.body;body=body.replace('updateControls = controls.update;',`updateControls = controls.update;window.__game={world,camera,renderer,controls,draw:()=>renderFrame(),run:(n)=>{for(let i=0;i<n;i++){updateControls(.05);updateScene(.05);}renderFrame();}};`);await call('Fetch.fulfillRequest',{requestId,responseCode:200,responseHeaders:[{name:'Content-Type',value:'application/javascript'}],body:Buffer.from(body).toString('base64')});}catch(err){console.log(err);await call('Fetch.continueRequest',{requestId});}});
await call('Fetch.enable',{patterns:[{urlPattern:'*/src/main.ts*',requestStage:'Response'}]});
await call('Page.navigate',{url:process.env.GAME_URL||'http://127.0.0.1:5174/'});
for(let i=0;i<100;i++){await pause(200);if(await evaluate('!!window.__game && !document.querySelector("#menu-button").disabled'))break;}
await evaluate(`window.__game.renderer.setAnimationLoop(null);document.querySelector('#app').dataset.playState='playing';window.__game.world.rooms.forEach(r=>r.root.userData.setLight(1));`);
await evaluate("document.querySelector('#menu-button').closest('section').style.display='none'");
const results={};
for(const [name,p,t] of [['patio',[3,1.7,23],[0,3,-5]],['hall',[0,1.7,-5],[0,2.3,-18]],['hall-side',[4,1.7,-12],[11,2,-12]],['roma',[-7.05,1.7,-39],[-7.05,2,-47]]]){
 results[name]=await evaluate(`(()=>{const g=window.__game;g.camera.position.set(...${JSON.stringify(p)});g.camera.lookAt(...${JSON.stringify(t)});g.renderer.info.autoReset=false;g.draw();const times=[];for(let i=0;i<3;i++){g.renderer.info.reset();const a=performance.now();g.draw();g.renderer.getContext().finish();times.push(performance.now()-a);}return {calls:g.renderer.info.render.calls,triangles:g.renderer.info.render.triangles,median:times.sort((a,b)=>a-b)[1],programs:g.renderer.info.programs.length};})()`);
 await shot(`/tmp/${label}-${name}.png`);
}
console.log(label,results);await fs.writeFile(`/tmp/perf-${label}.json`,JSON.stringify(results,null,2));await call('Fetch.disable');close();
