'use strict';
// Shared browser settings; never put real API keys in this file.
window.VertexHub=(()=>{
 const ROOT=new URL('.',location.href),SCOPE='vertex-hub:'+ROOT.pathname,SETTINGS=SCOPE+':ai',ACCESS=SCOPE+':access';
 const HASH='e09a778d8b415945c24eff70b4ec11cc1d6bf1640de3ff2732967446cedff2e7';
 function load(){try{const d=JSON.parse(localStorage.getItem(SETTINGS)||'null');if(d)return d;}catch{}return{key1:'',key2:'',active:'key1',model:'gemini-3.5-flash'};}
 function save(d){const clean={billing1:d.billing1==='paid'?'paid':'free',billing2:d.billing2==='free'?'free':'paid',priceModel:String(d.model||'gemini-3.5-flash'),inputRate:d.inputRate==null||d.inputRate===''?null:Number(d.inputRate),outputRate:d.outputRate==null||d.outputRate===''?null:Number(d.outputRate),provider:d.provider==='lmstudio'?'lmstudio':'gemini',localUrl:localBase(d.localUrl),localModel:String(d.localModel||'').trim(),localToken:String(d.localToken||'').trim(),key1:String(d.key1||'').trim(),key2:String(d.key2||'').trim(),active:'key1',model:String(d.model||'gemini-3.5-flash')};if([clean.inputRate,clean.outputRate].some(x=>x!==null&&(!Number.isFinite(x)||x<0)))throw Error('Prices must be nonnegative numbers.');if(clean.provider==='lmstudio'&&!clean.localModel)throw Error('Connect LM Studio and select a model.');if(clean.provider==='gemini'&&!clean[clean.active])throw Error('Enter a key for the selected API slot.');if(!/^[a-zA-Z0-9._-]+$/.test(clean.model))throw Error('Check the model ID.');localStorage.setItem(SETTINGS,JSON.stringify(clean));return clean;}
 function clear(){localStorage.removeItem(SETTINGS);}
 function unlocked(){try{return sessionStorage.getItem(ACCESS)===HASH;}catch{return false;}}
 async function unlock(password){if(!crypto.subtle)throw Error('Open this website through HTTPS or localhost.');const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(password));const digest=Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');if(digest!==HASH)return false;sessionStorage.setItem(ACCESS,HASH);return true;}
 function lock(){sessionStorage.removeItem(ACCESS);location.replace(new URL('index.html',ROOT));}
 function requireAccess(){if(unlocked())return true;document.documentElement.setAttribute('data-vertex-locked','');if(!document.getElementById('vertex-gate-style')){const style=document.createElement('style');style.id='vertex-gate-style';style.textContent='html[data-vertex-locked] body > :not(#vertex-entry){display:none!important}#vertex-entry{position:fixed;inset:0;z-index:999999;background:#f3f6f9;display:grid;place-items:center;font:16px/1.5 system-ui,sans-serif;color:#163047;padding:20px}#vertex-entry form{background:white;padding:28px;border:1px solid #dce5ec;border-radius:14px;width:100%;max-width:380px}#vertex-entry h1{font-size:26px;margin:0 0 8px}#vertex-entry p{font-size:14px;color:#617385}#vertex-entry label{display:block;margin-bottom:6px}#vertex-entry input{box-sizing:border-box;width:100%;padding:12px;border:1px solid #bccbd5;border-radius:8px;font:inherit}#vertex-entry button{width:100%;padding:12px;background:#086c59;color:white;border:0;border-radius:8px;margin-top:16px;font:inherit;font-weight:650}#vertex-entry .error{color:#b23849;min-height:20px}';document.head.append(style);}const mount=()=>{if(document.getElementById('vertex-entry'))return;const entry=document.createElement('section');entry.id='vertex-entry';entry.innerHTML='<form><h1>Test 1</h1><p>Enter your password to open practice.</p><label for="vertex-password">Password</label><input id="vertex-password" type="password" autocomplete="current-password" required><button>Open Test 1</button><p class="error" role="status"></p></form>';document.body.append(entry);entry.querySelector('form').onsubmit=async event=>{event.preventDefault();try{if(!await unlock(entry.querySelector('input').value)){entry.querySelector('.error').textContent='Incorrect password. Try again.';return;}document.documentElement.removeAttribute('data-vertex-locked');entry.remove();}catch(e){entry.querySelector('.error').textContent=e.message;}};entry.querySelector('input').focus();};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();return false;}


 function localBase(value){const u=new URL(value||'http://localhost:1234/v1');if(!['http:','https:'].includes(u.protocol)||u.username||u.password||u.search||u.hash)throw Error('Enter an HTTP server URL without credentials or query parameters.');return u.href.replace(/\/$/,'').replace(/\/v1$/,'')+'/v1';}
 async function localRequest(settings,path,body,signal){
  const controller=new AbortController(),abort=()=>controller.abort();
  if(signal?.aborted)throw new DOMException('Cancelled','AbortError');
  signal?.addEventListener('abort',abort,{once:true});const timer=setTimeout(abort,body?300000:15000);
  try{const headers={};if(body)headers['Content-Type']='application/json';if(settings.localToken)headers.Authorization='Bearer '+settings.localToken;
   const response=await fetch(localBase(settings.localUrl)+path,{method:body?'POST':'GET',headers,body:body?JSON.stringify(body):undefined,signal:controller.signal});
   if(!response.ok)throw Error('LM Studio returned HTTP '+response.status+'. '+(response.status===401?'Check the local server token.':response.status===400?'Check model context size and structured-output support.':'Check that the server is running and the model is loaded.'));
   return await response.json();
  }catch(e){if(signal?.aborted)throw new DOMException('Cancelled','AbortError');if(controller.signal.aborted)throw Error('LM Studio timed out. Try a smaller model or shorter context.');if(e instanceof TypeError)throw Error('Cannot reach LM Studio. Start its server, enable CORS, and allow local-network access in your browser. If blocked on GitHub Pages, run this package on localhost.');throw e;
  }finally{clearTimeout(timer);signal?.removeEventListener('abort',abort);}
 }
 async function localGenerate(settings,prompt,schema,signal){
  const data=await localRequest(settings,'/chat/completions',{model:settings.localModel,messages:[{role:'user',content:prompt}],temperature:0.4,max_tokens:2048,stream:false,response_format:{type:'json_schema',json_schema:{name:'sat_response',strict:true,schema}}},signal);
  const choice=data?.choices?.[0];if(choice?.finish_reason!=='stop')throw Error('LM Studio returned an incomplete response. Increase context or output capacity, or try another model.');
  try{return JSON.parse(choice.message.content);}catch{throw Error('LM Studio returned invalid JSON. Try a model supporting structured output.');}
 }

 function rates(settings,model){if(settings.priceModel===model&&settings.inputRate!=null&&settings.outputRate!=null)return [settings.inputRate,settings.outputRate];return {'gemini-3.5-flash':[1.5,9],'gemini-3.1-flash-lite':[0.25,1.5]}[model]||null;}
 function estimateUsage(settings,model,slot,usage){const tier=settings[slot==='key2'?'billing2':'billing1']||(slot==='key2'?'paid':'free'),rate=rates(settings,model),valid=usage&&Number.isFinite(usage.promptTokenCount)&&usage.promptTokenCount>=0;
  const input=valid?usage.promptTokenCount:null,output=valid?(usage.candidatesTokenCount||0)+(usage.thoughtsTokenCount||0):null;
  return {model,slot,tier,input,output,thinking:usage?.thoughtsTokenCount||0,rates:rate,usd:tier==='free'?0:valid&&rate?(input*rate[0]+output*rate[1])/1e6:null,usageMissing:!valid};
 }
 return{rates,estimateUsage,localBase,localRequest,localGenerate,load,save,clear,unlocked,unlock,lock,requireAccess,settingsKey:SETTINGS,root:ROOT};
})();
