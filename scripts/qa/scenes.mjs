import {call,evaluate,pause,close} from './cdp.mjs';
import assert from 'node:assert/strict';
await call('Page.navigate',{url:new URL('scripts/qa/scenes.html',process.env.GAME_URL||'http://127.0.0.1:5174/').href});
let result;
for(let i=0;i<200;i++){result=await evaluate('window.__checks');if(result)break;await pause(250);}
console.log(JSON.stringify(result,null,2));close();assert.equal(result?.status,'PASS');
