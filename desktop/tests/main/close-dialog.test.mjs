import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import test from 'node:test';
import { createShellCloseDialog } from '../../dist/main/close-dialog.js';
import { IpcChannels } from '../../dist/shared/ipc.js';

function harness() {
 const ipc=new EventEmitter();
 const contents=new EventEmitter();
 contents.mainFrame={url:'app://setup/ui.html'};
 contents.isDestroyed=()=>false;
 const sent=[]; contents.send=(channel,id)=>sent.push({channel,id});
 const window={webContents:contents,isDestroyed:()=>false,focus:()=>{}};
 const event={sender:contents,senderFrame:contents.mainFrame};
 return {ipc,contents,window,event,sent,controller:createShellCloseDialog(window,ipc)};
}

test('close request waits for shell readiness, deduplicates, and rejects forged responses',async()=>{
 const h=harness();
 const promise=h.controller.choose();
 assert.equal(h.sent.length,0);
 assert.equal(h.controller.choose(),promise);
 h.ipc.emit(IpcChannels.closeDialogReady,h.event);
 assert.equal(h.sent.length,1);
 const response={requestId:h.sent[0].id,behavior:'frontend',remember:true};
 let settled=false; void promise.then(()=>{settled=true;});
 h.ipc.emit(IpcChannels.closeDialogResolve,{...h.event,sender:{}},response);
 h.ipc.emit(IpcChannels.closeDialogResolve,{...h.event,senderFrame:{url:'app://setup/ui.html'}},response);
 h.ipc.emit(IpcChannels.closeDialogResolve,h.event,{...response,requestId:'stale'});
 h.ipc.emit(IpcChannels.closeDialogResolve,h.event,{...response,remember:'yes'});
 h.ipc.emit(IpcChannels.closeDialogResolve,h.event,{...response,behavior:'ask'});
 h.contents.mainFrame.url='https://untrusted.example';
 h.ipc.emit(IpcChannels.closeDialogResolve,h.event,response);
 await Promise.resolve(); assert.equal(settled,false);
 h.contents.mainFrame.url='app://setup/ui.html';
 h.ipc.emit(IpcChannels.closeDialogResolve,h.event,response);
 assert.deepEqual(await promise,{behavior:'frontend',remember:true});
 h.controller.dispose();
});

test('reload, renderer crash, and destruction cancel without leaving pending close promises',async()=>{
 const h=harness();
 h.ipc.emit(IpcChannels.closeDialogReady,h.event);
 const first=h.controller.choose();
 h.contents.emit('did-start-navigation',{},'app://setup/ui.html',false,true);
 assert.deepEqual(await first,{behavior:null,remember:false});
 const second=h.controller.choose();
 h.ipc.emit(IpcChannels.closeDialogReady,h.event);
 h.contents.emit('render-process-gone');
 assert.deepEqual(await second,{behavior:null,remember:false});
 const third=h.controller.choose();
 h.contents.emit('destroyed');
 assert.deepEqual(await third,{behavior:null,remember:false});
 assert.equal(h.ipc.listenerCount(IpcChannels.closeDialogReady),0);
 assert.equal(h.ipc.listenerCount(IpcChannels.closeDialogResolve),0);
});
