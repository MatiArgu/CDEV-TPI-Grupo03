import fs from 'node:fs/promises';
const targets=await(await fetch((process.env.CDP_URL || 'http://127.0.0.1:9240') + '/json/list')).json();
const target=targets.find(t=>t.type==='page');
if (!target) throw new Error('Abrí un navegador de prueba con --remote-debugging-port=9240');
const socket=new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true});});
let serial=0;const waiting=new Map();
socket.addEventListener('message',event=>{const m=JSON.parse(event.data);if(m.id&&waiting.has(m.id)){const p=waiting.get(m.id);waiting.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}else if(m.method==='Runtime.exceptionThrown') console.log('EXCEPTION',JSON.stringify(m.params));});
export function call(method,params={}){return new Promise((resolve,reject)=>{const id=++serial;waiting.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});}
export async function evaluate(expression){const r=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true,userGesture:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result?.value;}
export const pause=ms=>new Promise(r=>setTimeout(r,ms));
export async function shot(path){const {data}=await call('Page.captureScreenshot',{format:'png'});await fs.writeFile(path,Buffer.from(data,'base64'));console.log(path);}
export function close(){socket.close();}
await call('Page.enable');await call('Runtime.enable');
await call('Emulation.setDeviceMetricsOverride',{width:1280,height:800,deviceScaleFactor:1,mobile:false});
export function onEvent(listener){socket.addEventListener('message',event=>{const m=JSON.parse(event.data);if(!m.id)listener(m);});}
