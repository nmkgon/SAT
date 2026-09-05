'use strict';
// Shared browser settings; never put real API keys in this file.
window.VertexHub=(()=>{
 const ROOT=new URL('.',document.currentScript.src),SCOPE='vertex-hub:'+ROOT.pathname,SETTINGS=SCOPE+':ai',ACCESS=SCOPE+':access';
 const HASH='0e7ba1c1a960f6da5a9567b6c25f49c61dff0ad7be4a8c1008f097926c47ec06';
 function load(){try{const d=JSON.parse(localStorage.getItem(SETTINGS)||'null');if(d)return d;}catch{}return{key1:'',key2:'',active:'key1',model:'gemini-3.5-flash'};}
 function save(d){const clean={key1:String(d.key1||'').trim(),key2:String(d.key2||'').trim(),active:'key1',model:String(d.model||'gemini-3.5-flash')};if(!clean[clean.active])throw Error('Enter a key for the selected API slot.');if(!/^[a-zA-Z0-9._-]+$/.test(clean.model))throw Error('Check the model ID.');localStorage.setItem(SETTINGS,JSON.stringify(clean));return clean;}
 function clear(){localStorage.removeItem(SETTINGS);}
 function unlocked(){try{return sessionStorage.getItem(ACCESS)===HASH;}catch{return false;}}
 async function unlock(password){if(!crypto.subtle)throw Error('Open this website through HTTPS or localhost.');const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(password));const digest=Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');if(digest!==HASH)return false;sessionStorage.setItem(ACCESS,HASH);return true;}
 function lock(){sessionStorage.removeItem(ACCESS);location.replace(new URL('index.html',ROOT));}
 function requireAccess(){if(!unlocked()){document.documentElement.style.visibility='hidden';const dest=new URL('index.html',ROOT);dest.searchParams.set('next',location.pathname.split('/').pop());location.replace(dest);return false;}return true;}
 return{load,save,clear,unlocked,unlock,lock,requireAccess,settingsKey:SETTINGS,root:ROOT};
})();
