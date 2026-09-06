/* Browser-local launcher management. Export the list to publish changes. */
window.VertexCatalog=(()=>{
 const key=VertexHub.settingsKey+':test-catalog-v1';
 function validate(t){if(!t||!/^[-a-zA-Z0-9_]+$/.test(t.id)||typeof t.name!=='string'||!t.name.trim()||t.name.length>100||typeof t.file!=='string'||!/^[-a-zA-Z0-9_]+(?:\/[-a-zA-Z0-9_]+)*\.html$/.test(t.file))throw Error('Enter a name and a relative HTML path, such as test3.html. Use letters, numbers, hyphens or underscores.');return {id:t.id,name:t.name.trim(),file:t.file,description:String(t.description||'').slice(0,240),ready:!!t.ready};}
 function load(){const raw=localStorage.getItem(key);let s=raw?JSON.parse(raw):{items:[],trash:[]};if(!Array.isArray(s.items)||!Array.isArray(s.trash))throw Error('Test list is invalid. Restore the published list.');s={items:s.items.map(validate),trash:s.trash.map(validate)};for(const t of VERTEX_TESTS)if(![...s.items,...s.trash].some(x=>x.id===t.id))s.items.push(validate(t));for(const t of VERTEX_TESTS){const i=s.items.findIndex(x=>x.id===t.id&&x.file===t.file);if(i>=0&&/^test-(?:[4-9]|1[0-3])$/.test(t.id))s.items[i]={...s.items[i],ready:t.ready,description:t.description};}return s;}
 function save(s){localStorage.setItem(key,JSON.stringify(s));return s;}
 function upsert(t){t=validate(t);const s=load();if(s.items.some(x=>x.file===t.file&&x.id!==t.id))throw Error('This HTML file is already on the list.');const i=s.items.findIndex(x=>x.id===t.id);if(i<0)s.items.push(t);else s.items[i]=t;return save(s);}
 function remove(id){const s=load(),i=s.items.findIndex(x=>x.id===id);if(i>=0)s.trash.push(...s.items.splice(i,1));return save(s);}
 function restore(){const s=load();for(const t of s.trash)if(s.items.some(x=>x.file===t.file))throw Error('A removed test uses a path already on the list. Edit that path before restoring.');s.items.push(...s.trash);s.trash=[];return save(s);}
 function move(id,delta){const s=load(),i=s.items.findIndex(x=>x.id===id),j=i+delta;if(i>=0&&j>=0&&j<s.items.length)[s.items[i],s.items[j]]=[s.items[j],s.items[i]];return save(s);}
 function reset(){localStorage.removeItem(key);return load();}
 function exportJS(){return 'window.VERTEX_TESTS = '+JSON.stringify(load().items,null,2)+';\n';}
 return {load,upsert,remove,restore,move,reset,exportJS,validate};
})();
