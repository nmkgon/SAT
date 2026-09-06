'use strict';
window.VertexWordLab=(()=>{
const PALETTES={
 light:{ink:'#172033',slate:'#5b6577',rule:'#e3e7ee',wash:'#f5f7fb',paper:'#ffffff',scene:'#fbfdff',signal:'#2457c5',signalSoft:'#e4ecfb',marker:'#f2a93b',markerSoft:'#fdf1da',check:'#1d8f5b',checkSoft:'#e2f5ea',miss:'#c9362c',missSoft:'#fbe6e4',orange:'#e8630a',teal:'#0e8a8a',purple:'#7c4dbe',grid1:'#dfe6f2',grid2:'#d3dff7',grid3:'#c4d3f2'},
 dark:{ink:'#e9eef8',slate:'#98a5bd',rule:'#2c3752',wash:'#101827',paper:'#1b2436',scene:'#131b2b',signal:'#7ba4ff',signalSoft:'#22304f',marker:'#f0b64a',markerSoft:'#3d3018',check:'#42cb8d',checkSoft:'#15382a',miss:'#ff7d75',missSoft:'#3d1f1f',orange:'#ff9f57',teal:'#3fd0d0',purple:'#b596ff',grid1:'#2a3550',grid2:'#33405f',grid3:'#3d4c6f'}};
/* Scene colours are stored as tokens ("@signal") so a generated problem keeps working
   after the user flips themes; tokens resolve to hex at paint time. */
const C={};for(const k in PALETTES.light)C[k]='@'+k;
let PAL=PALETTES.light;
const TC=v=>(typeof v==='string'&&v.charCodeAt(0)===64)?(PAL[v.slice(1)]||v):v;
function applyScenePalette(mode){PAL=PALETTES[mode]||PALETTES.light}
const ease=t=>t<0?0:t>1?1:t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
const fmt=(n,d=2)=>{if(!isFinite(n))return'';const s=(+n).toFixed(d);return s.includes('.')?s.replace(/\.?0+$/,''):s};
const money=n=>'$'+(+n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const cm=n=>(+n).toLocaleString('en-US');
function canvasMathText(value){
  let s=String(value??'').replace(/⟦([^⟧]+)⟧/g,(_,x)=>{try{return decodeURIComponent(x)}catch{return x}});
  let prev='';
  while(prev!==s){prev=s;s=s.replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g,'$1/$2')}
  return s.replace(/\\(?:mathit|mathrm|text)\{([^{}]*)\}/g,'$1').replace(/\^\{([^{}]*)\}/g,'^$1')
    .replace(/\\times/g,'×').replace(/\\div/g,'÷').replace(/\\le/g,'≤').replace(/\\ge/g,'≥')
    .replace(/\\approx/g,'≈').replace(/\\pm/g,'±').replace(/\\cdot/g,'·').replace(/\\pi/g,'π')
    .replace(/\\circ/g,'°').replace(/\\left|\\right/g,'').replace(/\\\$/g,'$').replace(/[{}]/g,'');
}
function txt(g,s,x,y,o={}){s=canvasMathText(s);const c=g.ctx;c.save();c.font=`${o.bold?'600 ':''}${o.size||12}px ${o.serif?'Georgia,serif':'Roboto,system-ui,sans-serif'}`;c.fillStyle=o.color||C.ink;c.textAlign=o.align||'center';c.textBaseline=o.base||'middle';if(o.bg){const w=c.measureText(s).width+10;c.fillStyle=o.bg;const ax=o.align==='left'?x-5:o.align==='right'?x-w+5:x-w/2;c.fillRect(ax,y-9,w,18);c.fillStyle=o.color||C.ink}c.fillText(s,x,y);c.restore()}
function ln(g,x1,y1,x2,y2,o={}){const c=g.ctx;c.save();c.strokeStyle=o.color||C.ink;c.lineWidth=o.w||1.5;if(o.dash)c.setLineDash(o.dash);c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();c.restore()}
function arrow(g,x1,y1,x2,y2,o={}){ln(g,x1,y1,x2,y2,o);const c=g.ctx,a=Math.atan2(y2-y1,x2-x1),s=o.head||7;c.save();c.fillStyle=o.color||C.ink;c.beginPath();c.moveTo(x2,y2);c.lineTo(x2-s*Math.cos(a-.45),y2-s*Math.sin(a-.45));c.lineTo(x2-s*Math.cos(a+.45),y2-s*Math.sin(a+.45));c.closePath();c.fill();c.restore()}
function dot(g,x,y,r,color,stroke){const c=g.ctx;c.save();c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle=color;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=2;c.stroke()}c.restore()}
function nice(range){const p=Math.pow(10,Math.floor(Math.log10(range)));const r=range/p;return (r<1.5?.2:r<3?.5:r<7?1:2)*p}
function axes(g,v,o){const {W,H}=g;const L=o.L||50,R=o.R||16,T=o.T||18,B=o.B||34;const ax={x0:L,x1:W-R,y0:H-B,y1:T,xmax:v.xmax,ymax:v.ymax,xmin:v.xmin||0,ymin:v.ymin||0};ax.sx=x=>ax.x0+(x-ax.xmin)/(ax.xmax-ax.xmin)*(ax.x1-ax.x0);ax.sy=y=>ax.y0-(y-ax.ymin)/(ax.ymax-ax.ymin)*(ax.y0-ax.y1);
  const xs=nice(ax.xmax-ax.xmin),ys=nice(ax.ymax-ax.ymin);
  for(let y=ax.ymin;y<=ax.ymax+1e-9;y+=ys){ln(g,ax.x0,ax.sy(y),ax.x1,ax.sy(y),{color:C.rule,w:1});txt(g,fmt(y),ax.x0-6,ax.sy(y),{align:'right',color:C.slate,size:11})}
  for(let x=ax.xmin;x<=ax.xmax+1e-9;x+=xs){ln(g,ax.sx(x),ax.y0,ax.sx(x),ax.y1,{color:C.rule,w:1});txt(g,fmt(x),ax.sx(x),ax.y0+12,{color:C.slate,size:11})}
  ln(g,ax.x0,ax.y0,ax.x1,ax.y0,{color:C.slate});ln(g,ax.x0,ax.y0,ax.x0,ax.y1,{color:C.slate});
  if(v.xlabel)txt(g,v.xlabel,(ax.x0+ax.x1)/2,ax.y0+27,{color:C.slate,size:11});
  if(v.ylabel){const c=g.ctx;c.save();c.translate(12,(ax.y0+ax.y1)/2);c.rotate(-Math.PI/2);txt(g,v.ylabel,0,0,{color:C.slate,size:11});c.restore()}
  return ax}
function plotFn(g,ax,f,xa,xb,o){const c=g.ctx;c.save();c.strokeStyle=o.color||C.signal;c.lineWidth=o.w||2.5;if(o.dash)c.setLineDash(o.dash);c.beginPath();let pen=false;const n=80;for(let i=0;i<=n;i++){const x=xa+(xb-xa)*i/n,y=f(x);if(y<ax.ymin-1e-9||y>ax.ymax+1e-9){pen=false;continue}const px=ax.sx(x),py=ax.sy(y);pen?c.lineTo(px,py):c.moveTo(px,py);pen=true}c.stroke();c.restore()}
function badge(g,s,x,y,color){txt(g,s,x,y,{bg:color||C.markerSoft,size:12,bold:true})}

const R={};
/* ---- motion: movers on a track (meeting) or in lanes (combined work) ---- */
R.motion=(g,v,t,f)=>{const {W,H}=g,x0=44,x1=W-44,sc=(x1-x0)/v.len,time=ease(t)*v.T;
  const lanes=v.lanes;const ys=lanes?v.movers.map((_,i)=>H*(0.32+0.36*i)):v.movers.map(()=>H*0.58);
  const step=nice(v.len);
  ys.forEach((y,i)=>{if(lanes&&i>0)return;ln(g,x0,y,x1,y,{color:C.slate,w:2});for(let x=0;x<=v.len+1e-9;x+=step){ln(g,x0+x*sc,y-5,x0+x*sc,y+5,{color:C.slate});txt(g,fmt(x),x0+x*sc,y+16,{color:C.slate,size:11})}});
  if(lanes){ys.forEach(y=>ln(g,x0,y,x1,y,{color:C.rule,w:12}));txt(g,v.unit,x1+2,ys[0]+16,{align:'left',color:C.slate,size:11})}else txt(g,v.unit,x1,ys[0]+30,{align:'right',color:C.slate,size:11});
  let total=0;
  v.movers.forEach((m,i)=>{const y=ys[i];const d=Math.min(m.speed*time,v.len);total+=d;const px=x0+(m.start+m.dir*d)*sc;
    ln(g,x0+m.start*sc,y+(lanes?0:(i?6:-6)),px,y+(lanes?0:(i?6:-6)),{color:m.color,w:lanes?12:5});
    dot(g,px,y,9,m.color,C.paper);const lx=Math.min(Math.max(px,70),W-70);txt(g,m.label,lx,y-(lanes?30:(i?-36:22)),{color:m.color,bold:true,size:12,bg:lanes?'':C.wash});
    if(!lanes)txt(g,`${fmt(d,1)} ${v.unit}`,x0+(m.start+m.dir*d/2)*sc,y+(i?34:-38),{color:m.color,size:11});
    else txt(g,`${cm(Math.round(d))} ${v.unit}`,lx,y-15,{color:m.color,size:11})});
  txt(g,`t = ${fmt(time,2)} ${v.tunit}`,W-16,18,{align:'right',bold:true,size:13,bg:C.wash});
  if(!lanes&&(f==='meet'||t>=.999)){const mx=x0+v.meet*sc;ln(g,mx,ys[0]-40,mx,ys[0]+40,{color:C.marker,w:2,dash:[4,3]});badge(g,`meet at ${fmt(v.meet)} ${v.unit}, t = ${fmt(v.T,2)} ${v.tunit}`,Math.min(Math.max(mx,110),W-110),ys[0]+52)}
  if(!lanes&&f==='rate'){v.movers.forEach((m,i)=>{const y=ys[i];const ax=x0+(m.start+m.dir*v.len*0.18)*sc;arrow(g,x0+m.start*sc,y+(i?6:-6)+(i?22:-22),ax,y+(i?6:-6)+(i?22:-22),{color:m.color,w:2});txt(g,`${m.speed} ${v.unit}/${v.tunit}`,(x0+m.start*sc+ax)/2,y+(i?42:-42),{color:m.color,size:11,bold:true})});badge(g,`closing speed ${v.movers[0].speed} + ${v.movers[1].speed} = ${v.movers[0].speed+v.movers[1].speed} ${v.unit}/${v.tunit}`,W/2,H-14)}
  if(lanes){badge(g,`together: ${cm(Math.round(total))} ${v.unit}`,W/2,H-12,f==='total'?C.markerSoft:C.wash);if(f==='rate'){badge(g,`combined rate ${v.movers[0].speed} + ${v.movers[1].speed} = ${v.movers[0].speed+v.movers[1].speed} ${v.unit}/${v.tunit}`,W/2,16)}}
};
/* ---- tank: container + volume-vs-time graph ---- */
R.tank=(g,v,t,f)=>{const {W,H}=g,time=ease(t)*v.T,V=Math.max(0,Math.min(v.cap,v.V0+v.rate*time));
  const cw=W*0.2,cx=26,cy=24,ch=H-64;g.ctx.save();g.ctx.strokeStyle=C.slate;g.ctx.lineWidth=2;g.ctx.strokeRect(cx,cy,cw,ch);g.ctx.restore();
  const lh=ch*V/v.cap;g.ctx.fillStyle=C.signalSoft;g.ctx.fillRect(cx+1,cy+ch-lh,cw-2,lh);g.ctx.fillStyle=C.signal;g.ctx.fillRect(cx+1,cy+ch-lh,cw-2,3);
  txt(g,`${fmt(V,1)} ${v.unit}`,cx+cw/2,cy+ch+14,{bold:true,size:12,color:C.signal});
  if(v.rate>0)arrow(g,cx+cw/2,cy-16,cx+cw/2,cy+8,{color:C.signal,w:2});else{arrow(g,cx+cw/2,cy+ch,cx+cw/2,cy+ch+22,{color:C.orange,w:2})}
  const ax=axes(g,{xmax:v.T,ymax:v.cap,xlabel:v.xlabel,ylabel:v.ylabel},{L:W*0.34+30,B:36,T:20});
  ln(g,ax.sx(0),ax.sy(v.V0),ax.sx(time),ax.sy(V),{color:C.signal,w:2.5});dot(g,ax.sx(time),ax.sy(V),5,C.signal,C.paper);
  if(t>.02)txt(g,`(${fmt(time,1)}, ${fmt(V,1)})`,ax.sx(time),ax.sy(V)-14,{size:11,color:C.signal,bg:C.paper});
  if(f==='v0'){dot(g,ax.sx(0),ax.sy(v.V0),8,C.marker);badge(g,`starts at ${fmt(v.V0)} ${v.unit} when t = 0`,ax.sx(0)+8,ax.sy(v.V0)-18);txt(g,'',0,0)}
  if(f==='rate'){const dx=v.T/4,y1=v.V0+v.rate*dx;const x0=ax.sx(0),y0=ax.sy(v.V0);ln(g,x0,y0,ax.sx(dx),y0,{color:C.marker,w:2});ln(g,ax.sx(dx),y0,ax.sx(dx),ax.sy(y1),{color:C.marker,w:2});badge(g,`${v.rate>0?'+':''}${fmt(v.rate)} ${v.unit} per ${v.tunit}`,ax.sx(dx)+10,(y0+ax.sy(y1))/2)}
  if(f==='point'){dot(g,ax.sx(v.T),ax.sy(v.V0+v.rate*v.T),8,C.marker);badge(g,`t = ${fmt(v.T)} → ${fmt(v.V0+v.rate*v.T)} ${v.unit}`,ax.sx(v.T)-40,ax.sy(v.V0+v.rate*v.T)-18)}
  if(f==='empty'){dot(g,ax.sx(v.T),ax.sy(0),8,C.marker);badge(g,`empty at t = ${fmt(v.T)} ${v.tunit}`,ax.sx(v.T)-30,ax.sy(0)-18)}
};
/* ---- linegraph: one or two lines, optional point ---- */
R.linegraph=(g,v,t,f)=>{const ax=axes(g,v,{});const xe=ease(t)*v.xmax;
  v.lines.forEach(L=>{plotFn(g,ax,x=>L.m*x+L.b,0,xe,{color:L.color});if(L.label){const lx=Math.min(xe,v.xmax*0.2),ly=L.m*lx+L.b;if(ly>=0&&ly<=v.ymax)txt(g,L.label,ax.sx(lx),ax.sy(ly)-12,{color:L.color,size:11,bold:true,bg:C.paper})}});
  const showPt=t>=.98||f==='point'||f==='intersect';
  if(showPt&&v.point){const px=ax.sx(v.point.x),py=ax.sy(v.point.y);ln(g,px,py,px,ax.y0,{color:C.marker,dash:[4,3]});ln(g,ax.x0,py,px,py,{color:C.marker,dash:[4,3]});dot(g,px,py,6,f?C.marker:C.signal,C.paper);badge(g,v.point.label,Math.min(px+8,g.W-90),py-16)}
  if(f==='intercept'){const L=v.lines[0];dot(g,ax.sx(0),ax.sy(L.b),8,C.marker);badge(g,`y-intercept ${fmt(L.b)}`,ax.sx(0)+70,ax.sy(L.b)-16)}
  if(f==='slope'){const L=v.lines[0],dx=nice(v.xmax);const x0=v.xmax*0.3,x1=x0+dx;ln(g,ax.sx(x0),ax.sy(L.m*x0+L.b),ax.sx(x1),ax.sy(L.m*x0+L.b),{color:C.marker,w:2});ln(g,ax.sx(x1),ax.sy(L.m*x0+L.b),ax.sx(x1),ax.sy(L.m*x1+L.b),{color:C.marker,w:2});badge(g,`slope ${fmt(L.m)} per unit`,ax.sx(x1)+10,ax.sy(L.m*x0+L.b)+(L.m>0?-16:16))}
};
/* ---- numberline: inequality shading ---- */
R.numberline=(g,v,t,f)=>{const {W,H}=g,x0=30,x1=W-30,y=H*0.5,sc=(x1-x0)/(v.max-v.min),sx=x=>x0+(x-v.min)*sc;
  ln(g,x0,y,x1,y,{color:C.slate,w:2});const step=Math.max(1,Math.round(nice(v.max-v.min)));
  for(let x=Math.ceil(v.min);x<=v.max;x++){ln(g,sx(x),y-4,sx(x),y+4,{color:C.slate});if(x%step===0)txt(g,x,sx(x),y+18,{size:11,color:C.slate})}
  const ge=v.dir==='ge';const from=v.from!=null?v.from:(ge?v.max:v.min),to=from+(v.bound-from)*ease(t);ln(g,sx(from),y,sx(to),y,{color:C.signal,w:6});
  if(t>=.999){dot(g,sx(v.bound),y,7,v.inclusive?C.signal:C.paper,C.signal);badge(g,`${v.label} ${ge?(v.inclusive?'≥':'>'):(v.inclusive?'≤':'<')} ${fmt(v.bound,2)}`,Math.min(Math.max(sx(v.bound),60),W-60),y-24)}
  if(f==='int'){const lo=ge?Math.ceil(v.bound-1e-9):Math.ceil(from),hi=ge?Math.floor(from):Math.floor(v.bound+1e-9);for(let x=lo;x<=hi;x++)dot(g,sx(x),y,x===v.ans?9:4,x===v.ans?C.marker:C.signal);badge(g,v.intLabel||`largest whole number: ${v.ans}`,Math.min(Math.max(sx(v.ans),90),W-90),y+44)}
  txt(g,v.unit||'',x1,y+34,{align:'right',size:11,color:C.slate});
};
/* ---- pipeline: unit conversion chain ---- */
R.pipeline=(g,v,t,f)=>{const {W,H}=g,n=v.stages.length,bw=Math.min(120,(W-40)/n-44),gap=(W-40-n*bw)/(n-1),y=H*0.5,prog=ease(t)*(n-1);
  v.stages.forEach((s,i)=>{const x=20+i*(bw+gap);const on=prog>=i-1e-6;const hl=f==='s'+i;g.ctx.save();g.ctx.fillStyle=hl?C.markerSoft:on?C.signalSoft:C.wash;g.ctx.strokeStyle=hl?C.marker:on?C.signal:C.rule;g.ctx.lineWidth=2;g.ctx.beginPath();g.ctx.roundRect(x,y-32,bw,64,10);g.ctx.fill();g.ctx.stroke();g.ctx.restore();
    txt(g,s.label,x+bw/2,y-12,{size:11,color:C.slate});txt(g,on?s.value:'?',x+bw/2,y+10,{size:14,bold:true,color:on?C.ink:C.slate});
    if(i<n-1){arrow(g,x+bw+4,y,x+bw+gap-4,y,{color:C.slate,w:1.5});txt(g,v.ops[i],x+bw+gap/2,y-18,{size:10.5,bold:true,color:C.orange,bg:C.scene})}});
  const i0=Math.floor(prog),fr=prog-i0;if(t<.999){const xa=20+i0*(bw+gap)+bw,xb=xa+gap;dot(g,xa+fr*(xb-xa),y,6,C.marker)}
};
/* ---- bars ---- */
R.bars=(g,v,t,f)=>{const {W,H}=g,n=v.bars.length,L=50,B=36,T=22,RM=v.line?96:16,gw=(W-L-RM)/n,bw=Math.min(70,gw*0.6),y0=H-B,ymax=v.ymax,sy=val=>y0-(val/ymax)*(y0-T);
  for(let k=0;k<=4;k++){const yy=y0-(y0-T)*k/4;ln(g,L,yy,W-16,yy,{color:C.rule,w:1});txt(g,fmt(ymax*k/4),L-6,yy,{align:'right',size:11,color:C.slate})}
  ln(g,L,y0,W-16,y0,{color:C.slate});
  v.bars.forEach((b,i)=>{const x=L+gw*i+(gw-bw)/2,val=b.value*ease(Math.min(1,t*n-i*0.6)),h=y0-sy(val);g.ctx.fillStyle=(f===i)?C.marker:(b.color||C.signal);g.ctx.fillRect(x,y0-h,bw,h);txt(g,b.label,x+bw/2,y0+13,{size:11,color:C.slate});if(val>0)txt(g,b.fmt?b.fmt(val):fmt(val,2),x+bw/2,Math.max(12,y0-h-10),{size:12,bold:true,bg:C.paper})});
  if(v.line&&(t>.9||f==='mean')){ln(g,L,sy(v.line.value),W-16,sy(v.line.value),{color:f==='mean'?C.marker:C.orange,w:2,dash:[6,4]});txt(g,v.line.label,W-14,sy(v.line.value)+13,{align:'right',size:11,bold:true,color:f==='mean'?C.marker:C.orange,bg:C.paper})}
  if(f==='diff'&&n>=2){const a=v.bars[0].value,b=v.bars[1].value,x=L+gw*1+(gw-bw)/2+bw+8;ln(g,x,sy(a),x,sy(b),{color:C.marker,w:3});ln(g,x-6,sy(a),x+6,sy(a),{color:C.marker,w:2});ln(g,x-6,sy(b),x+6,sy(b),{color:C.marker,w:2});badge(g,v.diffLabel||`change ${fmt(b-a)}`,x+14,(sy(a)+sy(b))/2)}
  if(v.note)txt(g,v.note,W/2,10,{size:11,color:C.slate});
};
/* ---- mixture: proportional beakers + ratio blocks ---- */
R.mixture=(g,v,t,f)=>{const {W,H}=g,mx=Math.max(v.a.amt,v.b.amt),bh=H*0.5,by=20,bw=Math.min(90,W*0.18);const e=ease(t);
  [[v.a,W*0.05],[v.b,W*0.05+bw+22]].forEach(([s,x])=>{g.ctx.save();g.ctx.strokeStyle=C.slate;g.ctx.lineWidth=2;g.ctx.strokeRect(x,by,bw,bh);const h=bh*(s.amt/mx)*e;g.ctx.fillStyle=s.color;g.ctx.globalAlpha=.75;g.ctx.fillRect(x+1,by+bh-h,bw-2,h);g.ctx.restore();txt(g,s.label,x+bw/2,by+bh+14,{size:11,color:C.slate});txt(g,`${fmt(s.amt*e,1)} ${s.unit}`,x+bw/2,by+bh+30,{size:12,bold:true,color:s.color})});
  const bx=W*0.05+2*bw+50,unit=Math.min(22,(W-bx-70)/Math.max(v.ratio[0],v.ratio[1]));let yy=by+10;
  txt(g,'ratio',bx,yy-4,{align:'left',size:11,color:C.slate});yy+=12;
  const drawBlocks=(n,color,y)=>{for(let i=0;i<n;i++){g.ctx.fillStyle=color;g.ctx.globalAlpha=f==='ratio'?1:.8;g.ctx.fillRect(bx+i*(unit+3),y,unit,unit);g.ctx.globalAlpha=1}};
  drawBlocks(v.ratio[0],v.a.color,yy);txt(g,`${v.ratio[0]} ${v.a.label}`,bx+v.ratio[0]*(unit+3)+8,yy+unit/2,{align:'left',size:11});yy+=unit+8;
  drawBlocks(v.ratio[1],v.b.color,yy);txt(g,`${v.ratio[1]} ${v.b.label}`,bx+v.ratio[1]*(unit+3)+8,yy+unit/2,{align:'left',size:11});yy+=unit+22;
  if(f==='k'||t>=.999){badge(g,`scale factor ×${fmt(v.k,2)}`,bx+60,yy,f==='k'?C.markerSoft:C.wash);yy+=22;txt(g,`${v.ratio[0]} × ${fmt(v.k,2)} = ${fmt(v.a.amt)}   ${v.ratio[1]} × ${fmt(v.k,2)} = ${fmt(v.b.amt)}`,bx,yy,{align:'left',size:11,color:C.slate})}
};
/* ---- table: two-way frequency table ---- */
R.table=(g,v,t,f)=>{const {W,H}=g,rows=v.rows,cols=v.cols,nr=rows.length+2,nc=cols.length+2,cw=Math.min(120,(W-30)/nc),ch=Math.min(38,(H-20)/nr),x0=(W-cw*nc)/2,y0=(H-ch*nr)/2;
  const rt=v.data.map(r=>r.reduce((a,b)=>a+b,0)),ct=cols.map((_,j)=>v.data.reduce((a,r)=>a+r[j],0)),tot=rt.reduce((a,b)=>a+b,0);
  const cells=[];for(let i=0;i<nr;i++)for(let j=0;j<nc;j++)cells.push([i,j]);const shown=Math.floor(ease(t)*(nr*nc-1)+1);
  const hl=(i,j)=>{if(!f)return false;const di=i-1,dj=j-1;if(f==='total')return i===nr-1&&j===nc-1;if(f.startsWith('row-'))return di===+f.slice(4)&&j>0;if(f.startsWith('col-'))return dj===+f.slice(4)&&i>0;if(f.startsWith('cell-')){const[a,b]=f.slice(5).split('-').map(Number);return di===a&&dj===b}if(f.startsWith('rowtot-'))return di===+f.slice(7)&&j===nc-1;return false};
  cells.forEach(([i,j],k)=>{const x=x0+j*cw,y=y0+i*ch;const head=i===0||j===0;g.ctx.fillStyle=hl(i,j)?C.markerSoft:head?C.wash:C.paper;g.ctx.fillRect(x,y,cw,ch);g.ctx.strokeStyle=C.rule;g.ctx.strokeRect(x,y,cw,ch);
    let s='';if(i===0&&j===0)s='';else if(i===0)s=j<=cols.length?cols[j-1]:'Total';else if(j===0)s=i<=rows.length?rows[i-1]:'Total';else if(k<shown){s=(i<=rows.length&&j<=cols.length)?v.data[i-1][j-1]:(i<=rows.length)?rt[i-1]:(j<=cols.length)?ct[j-1]:tot}
    txt(g,s,x+cw/2,y+ch/2,{size:head?11:13,bold:head||hl(i,j),color:head?C.slate:C.ink})});
  if(v.caption&&f)badge(g,v.caption(f),W/2,y0+ch*nr+16);
};
/* ---- scatter + line of best fit ---- */
R.scatter=(g,v,t,f)=>{const ax=axes(g,v,{});const e=ease(t),n=v.pts.length,shown=Math.min(n,Math.floor(e*1.4*n));
  v.pts.slice(0,shown).forEach(p=>dot(g,ax.sx(p[0]),ax.sy(p[1]),4,C.signal));
  const lt=Math.max(0,(e-0.6)/0.4);if(lt>0)plotFn(g,ax,x=>v.m*x+v.b,0,v.xmax*lt,{color:C.orange});
  if(v.point&&(t>=.98||f==='point')){const px=ax.sx(v.point.x),py=ax.sy(v.point.y);ln(g,px,ax.y0,px,py,{color:C.marker,dash:[4,3]});ln(g,ax.x0,py,px,py,{color:C.marker,dash:[4,3]});dot(g,px,py,6,C.marker,C.paper);badge(g,`predicted ${fmt(v.point.y)}`,Math.max(px-70,ax.x0+60),py+(v.point.actual!=null&&v.point.actual<v.point.y?-16:16));if(v.point.actual!=null){const ay=ax.sy(v.point.actual);ln(g,px,py,px,ay,{color:C.miss,w:3});dot(g,px,ay,6,C.miss,C.paper);badge(g,`actual ${fmt(v.point.actual)}`,Math.min(px+60,g.W-60),ay+(v.point.actual>v.point.y?-16:16),C.missSoft)}}
  if(f==='slope'){const x0=v.xmax*0.35,x1=x0+1;const yA=v.m*x0+v.b,yB=v.m*x1+v.b;ln(g,ax.sx(x0),ax.sy(yA),ax.sx(x1),ax.sy(yA),{color:C.marker,w:3});ln(g,ax.sx(x1),ax.sy(yA),ax.sx(x1),ax.sy(yB),{color:C.marker,w:3});badge(g,`1 ${v.xunit} → ${v.m>0?'+':''}${fmt(v.m)} ${v.yunit}`,ax.sx(x1)+12,(ax.sy(yA)+ax.sy(yB))/2)}
  if(f==='intercept'){dot(g,ax.sx(0),ax.sy(v.b),8,C.marker);badge(g,`at x = 0, y = ${fmt(v.b)}`,ax.sx(0)+70,ax.sy(v.b)-16)}
};
/* ---- growth: exponential curve with period markers ---- */
R.growth=(g,v,t,f)=>{const yf=x=>v.a*Math.pow(v.base,v.k*x);const ymax=v.ymax||Math.max(yf(0),yf(v.T))*1.12;const ax=axes(g,{xmax:v.T,ymax,xlabel:v.xlabel,ylabel:v.ylabel},{L:60});const xe=ease(t)*v.T;
  if(v.line){plotFn(g,ax,x=>v.line.m*x+v.line.b,0,xe,{color:C.orange,w:2});if(v.line.label)txt(g,v.line.label,ax.sx(xe*0.5),ax.sy(v.line.m*xe*0.5+v.line.b)+14,{size:11,color:C.orange,bg:C.paper});if(f==='compare'){dot(g,ax.sx(v.T),ax.sy(v.line.m*v.T+v.line.b),7,C.marker);dot(g,ax.sx(v.T),ax.sy(yf(v.T)),7,C.marker)}}
  plotFn(g,ax,yf,0,xe,{color:C.signal});const per=v.period||1;
  for(let x=0;x<=xe+1e-9;x+=per){dot(g,ax.sx(x),ax.sy(yf(x)),4,C.signal);txt(g,v.fmt?v.fmt(yf(x)):fmt(yf(x),0),ax.sx(x),ax.sy(yf(x))-12,{size:10.5,bg:C.paper,color:C.signal})}
  dot(g,ax.sx(xe),ax.sy(yf(xe)),6,C.signal,C.paper);
  if(f==='start'){dot(g,ax.sx(0),ax.sy(v.a),9,C.marker);badge(g,`starts at ${v.fmt?v.fmt(v.a):fmt(v.a)}`,ax.sx(0)+60,ax.sy(v.a)-18)}
  if(f==='factor'){for(let x=0;x+per<=v.T+1e-9&&x<3*per;x+=per){arrow(g,ax.sx(x),ax.sy(yf(x)),ax.sx(x+per),ax.sy(yf(x+per)),{color:C.marker,w:2});txt(g,`×${fmt(Math.pow(v.base,v.k*per),3)}`,ax.sx(x+per/2),ax.sy(yf(x+per/2))+16,{size:11,bold:true,color:C.orange,bg:C.paper})}badge(g,`each ${v.perLabel||'period'} multiplies by ${fmt(Math.pow(v.base,v.k*per),3)}`,g.W/2,16)}
  if(f==='end'){dot(g,ax.sx(v.T),ax.sy(yf(v.T)),9,C.marker);badge(g,`at ${fmt(v.T)}: ${v.fmt?v.fmt(yf(v.T)):fmt(yf(v.T),2)}`,ax.sx(v.T)-70,ax.sy(yf(v.T))-18)}
};
/* ---- parabola: projectile height vs time ---- */
R.parabola=(g,v,t,f)=>{const h=x=>v.a*x*x+v.b*x+v.c;const tv=-v.b/(2*v.a),hv=h(tv);const tl=v.xmax||(-v.b-Math.sqrt(v.b*v.b-4*v.a*v.c))/(2*v.a);const xs=v.xs||'t',ys=v.ys||'h',xu=v.xu||'s',yu=v.yu||'ft';const ax=axes(g,{xmax:Math.ceil(tl),ymax:Math.ceil(hv*1.15/10)*10,xlabel:v.xlabel||'time (seconds)',ylabel:v.ylabel||'height (feet)'},{L:52});const te=ease(t)*tl;
  plotFn(g,ax,h,0,te,{color:C.signal,dash:[3,4],w:2});dot(g,ax.sx(te),ax.sy(h(te)),8,C.orange,C.paper);
  const q=(val,un,d)=>un==='$'?'$'+fmt(val,d):fmt(val,d)+' '+un;txt(g,`${xs} = ${q(te,xu,2)}, ${ys} = ${q(h(te),yu,1)}`,ax.x0+8,ax.y1+8,{align:'left',size:12,bold:true,bg:C.wash});
  if(f==='vertex'||t>=.999){ln(g,ax.sx(tv),ax.sy(hv),ax.sx(tv),ax.y0,{color:C.marker,dash:[4,3]});ln(g,ax.x0,ax.sy(hv),ax.sx(tv),ax.sy(hv),{color:C.marker,dash:[4,3]});dot(g,ax.sx(tv),ax.sy(hv),7,C.marker);badge(g,v.vtxLabel||`max ${v.yname||'height'} ${q(hv,yu,2)} at ${xs} = ${q(tv,xu,2)}`,ax.sx(tv),ax.sy(hv)+22)}
  if(f==='start'){dot(g,ax.sx(0),ax.sy(v.c),8,C.marker);badge(g,v.startLabel||`launched from ${v.c} ${yu}`,ax.sx(0)+60,ax.sy(v.c)-18)}
  if(f==='land'){dot(g,ax.sx(tl),ax.sy(0),8,C.marker);badge(g,v.landLabel||`lands at ${xs} = ${fmt(tl,2)} ${xu}`,ax.sx(tl)-40,ax.sy(0)-18)}
};
/* ---- shape: rect / cyl / tri / tri2 / circle ---- */
R.shape=(g,v,t,f)=>{const {W,H}=g,c=g.ctx,e=ease(t),u=v.unit||'';
  if(v.kind==='rect'){const ar=v.w/v.h,mw=W*0.6,mh=H*0.62;let rw=mw,rh=mw/ar;if(rh>mh){rh=mh;rw=mh*ar}const x=(W-rw)/2,y=(H-rh)/2-6;
    c.save();c.strokeStyle=C.slate;c.lineWidth=2;c.strokeRect(x,y,rw,rh);c.restore();
    if(f==='area'||v.mode==='area'){c.save();c.fillStyle=f==='area'?C.markerSoft:C.signalSoft;c.fillRect(x,y,rw,rh*e);c.restore();txt(g,`area = ${v.w} × ${v.h} = ${cm(v.w*v.h)} ${u}²`,W/2,y+rh/2,{size:13,bold:true,bg:C.paper})}
    else{const P=2*(rw+rh),d=P*e;const segs=[[x,y,x+rw,y],[x+rw,y,x+rw,y+rh],[x+rw,y+rh,x,y+rh],[x,y+rh,x,y]];let left=d;segs.forEach(s=>{const L=Math.hypot(s[2]-s[0],s[3]-s[1]);if(left<=0)return;const k=Math.min(1,left/L);ln(g,s[0],s[1],s[0]+(s[2]-s[0])*k,s[1]+(s[3]-s[1])*k,{color:f==='perim'?C.marker:C.signal,w:6});left-=L});
      txt(g,`traced ${fmt(2*(v.w+v.h)*e,1)} ${u}`,W/2,y+rh/2,{size:12,color:C.signal,bg:C.paper});if(f==='perim'||t>=.999)badge(g,`perimeter = 2(${v.w} + ${v.h}) = ${cm(2*(v.w+v.h))} ${u}`,W/2,H-16)}
    txt(g,`${v.wl||v.w+' '+u}`,W/2,y-12,{size:12,bold:true});txt(g,`${v.hl||v.h+' '+u}`,x+rw+8,y+rh/2,{align:'left',size:12,bold:true})}
  if(v.kind==='cyl'){const cx=W*0.42,ry=16,rx=Math.min(70,W*0.16),top=40,bot=H-36;c.save();c.strokeStyle=C.slate;c.lineWidth=2;
    const lvl=bot-(bot-top)*e;c.fillStyle=C.signalSoft;c.beginPath();c.ellipse(cx,bot,rx,ry,0,0,Math.PI);c.lineTo(cx-rx,lvl);c.ellipse(cx,lvl,rx,ry,0,Math.PI,0,true);c.closePath();c.fill();
    c.beginPath();c.moveTo(cx-rx,top);c.lineTo(cx-rx,bot);c.moveTo(cx+rx,top);c.lineTo(cx+rx,bot);c.stroke();c.beginPath();c.ellipse(cx,bot,rx,ry,0,0,Math.PI);c.stroke();c.setLineDash([3,3]);c.beginPath();c.ellipse(cx,bot,rx,ry,0,Math.PI,0);c.stroke();c.setLineDash([]);c.strokeStyle=f==='base'?C.marker:C.slate;c.lineWidth=f==='base'?3:2;c.beginPath();c.ellipse(cx,top,rx,ry,0,0,Math.PI*2);c.stroke();c.restore();
    ln(g,cx,top,cx+rx,top,{color:C.orange,w:2});txt(g,`r = ${v.r} ${u}`,cx+rx/2,top-ry-12,{size:12,bold:true,color:C.orange});ln(g,cx+rx+16,top,cx+rx+16,bot,{color:C.signal,w:2});txt(g,`h = ${v.h} ${u}`,cx+rx+24,(top+bot)/2,{align:'left',size:12,bold:true,color:C.signal});
    txt(g,`filled: ${fmt(v.r*v.r*v.h*e,1)}π ${u}³`,cx,H-12,{size:12,color:C.signal});
    if(f==='base')badge(g,`base area = π(${v.r})² = ${v.r*v.r}π ${u}²`,W*0.42,H-30);if(f==='vol')badge(g,`V = ${v.r*v.r}π × ${v.h} = ${v.r*v.r*v.h}π ${u}³`,W*0.42,H-30)}
  if(v.kind==='tri'){const [a,b]=v.legs,hyp=v.hyp||Math.hypot(a,b);const sc=Math.min((W*0.5)/a,(H*0.66)/b);const x0=W*0.2,y0=H*0.84,x1=x0+a*sc,y1=y0-b*sc;const nl=Math.hypot(a,b),nx=-b/nl*20,ny=-a/nl*20;
    c.save();c.fillStyle=C.wash;c.fillRect(x1+2,y1-10,8,y0-y1+10);c.restore();ln(g,x0-30,y0,x1+14,y0,{color:C.slate,w:2});
    ln(g,x1,y0,x1,y1,{color:v.wallColor||C.slate,w:3});ln(g,x0,y0,x1,y0,{color:f==='leg'?C.marker:C.signal,w:3});
    ln(g,x0,y0,x0+(x1-x0)*e,y0+(y1-y0)*e,{color:f==='hyp'?C.marker:C.orange,w:5});
    if(v.area){c.save();c.fillStyle=f==='area'?C.markerSoft:C.signalSoft;c.beginPath();c.moveTo(x0,y0);c.lineTo(x1,y0);c.lineTo(x1,y0-(y0-y1)*e);c.closePath();c.fill();c.restore();if(f==='area')badge(g,`area = ½ × ${a} × ${b} = ${a*b/2} ${u}²`,W/2,22)}
    ln(g,x1-12,y0,x1-12,y0-12,{color:C.slate});ln(g,x1-12,y0-12,x1,y0-12,{color:C.slate});
    txt(g,v.al||`${a} ${u}`,(x0+x1)/2,y0+16,{size:12,bold:true,color:C.signal});txt(g,v.bl||(v.askB?'?':`${b} ${u}`),x1+16,(y0+y1)/2,{align:'left',size:12,bold:true,color:f==='leg2'?C.marker:C.slate});if(v.cl!=='')txt(g,v.cl||`${fmt(hyp)} ${u}`,(x0+x1)/2+nx,(y0+y1)/2+ny,{size:12,bold:true,color:C.orange});
    if(v.angle){c.save();c.strokeStyle=f==='angle'?C.marker:C.slate;c.lineWidth=2;c.beginPath();c.arc(x0,y0,34,-Math.atan2(b,a),0);c.stroke();c.restore();txt(g,`${v.angle}°`,x0-8,y0-14,{align:'right',size:12,bold:true,color:f==='angle'?C.marker:C.slate})}
    if(f==='hyp')badge(g,v.hypNote||`hypotenuse = ${fmt(hyp)} ${u}`,W/2,22);if(f==='leg2')badge(g,v.legNote||`${a}² + b² = ${fmt(hyp)}²`,W/2,22);if(f==='angle')badge(g,v.angNote||'',W/2,22);if(f==='pyth')badge(g,v.pythNote||'',W/2,22)}
  if(v.kind==='tri2'){const S=v.big.s,sc=(W*0.62)/S,y0=H*0.8,scH=Math.min(sc,(H*0.6)/v.big.h);const draw=(o,x0,col,tt)=>{const x1=x0+o.s*sc,y1=y0-o.h*scH;ln(g,x1,y0,x1,y1,{color:col,w:5});ln(g,x0,y0,x1,y0,{color:C.slate,w:3});ln(g,x0,y0,x0+(x1-x0)*tt,y0+(y1-y0)*tt,{color:C.marker,w:2,dash:[5,4]});txt(g,o.hl,x1+8,(y0+y1)/2,{align:'left',size:12,bold:true,color:col});txt(g,o.sl,(x0+x1)/2,y0+16,{size:12,bold:true,color:C.slate})};
    ln(g,10,y0,W-10,y0,{color:C.rule,w:2});draw(v.small,W*0.06,C.signal,e);draw(v.big,W*0.34,C.check,e);
    if(f==='ratio')badge(g,v.note,W/2,20)}
  if(v.kind==='box'){const l=v.l,w=v.w,h=v.h,mx=Math.max(l+w*0.5,h+w*0.35),sc=Math.min((W*0.5)/mx,(H*0.6)/mx),ox=W*0.22,oy=H*0.82,dx=w*sc*0.5,dy=-w*sc*0.35;const L=l*sc,Hh=h*sc;const fl=Hh*e;
    c.save();c.fillStyle=C.signalSoft;c.beginPath();c.moveTo(ox,oy);c.lineTo(ox+L,oy);c.lineTo(ox+L,oy-fl);c.lineTo(ox,oy-fl);c.closePath();c.fill();c.beginPath();c.moveTo(ox+L,oy);c.lineTo(ox+L+dx,oy+dy);c.lineTo(ox+L+dx,oy+dy-fl);c.lineTo(ox+L,oy-fl);c.closePath();c.fillStyle=C.grid2;c.fill();c.beginPath();c.moveTo(ox,oy-fl);c.lineTo(ox+L,oy-fl);c.lineTo(ox+L+dx,oy+dy-fl);c.lineTo(ox+dx,oy+dy-fl);c.closePath();c.fillStyle=C.grid3;c.fill();
    c.strokeStyle=C.slate;c.lineWidth=2;c.strokeRect(ox,oy-Hh,L,Hh);c.beginPath();c.moveTo(ox,oy-Hh);c.lineTo(ox+dx,oy+dy-Hh);c.lineTo(ox+L+dx,oy+dy-Hh);c.lineTo(ox+L,oy-Hh);c.moveTo(ox+L+dx,oy+dy-Hh);c.lineTo(ox+L+dx,oy+dy);c.lineTo(ox+L,oy);c.stroke();c.restore();
    txt(g,`${l} ${u}`,ox+L/2,oy+14,{size:12,bold:true,color:C.signal});txt(g,`${w} ${u}`,ox+L+dx/2+16,oy+dy/2+8,{size:12,bold:true,color:C.orange,align:'left'});txt(g,`${h} ${u}`,ox-10,oy-Hh/2,{size:12,bold:true,color:C.check,align:'right'});
    txt(g,`filled: ${fmt(l*w*h*e,0)} ${u}³`,W*0.72,H*0.3,{size:12,color:C.signal});if(f==='base')badge(g,`base area = ${l} × ${w} = ${l*w} ${u}²`,W*0.7,H*0.5);if(f==='vol')badge(g,`V = ${l} × ${w} × ${h} = ${cm(l*w*h)} ${u}³`,W*0.7,H*0.5)}
  if(v.kind==='cone'){const cx=W*0.4,top=34,bot=H-40,rx=Math.min(70,W*0.16),ry=14;c.save();c.strokeStyle=C.slate;c.lineWidth=2;c.fillStyle=C.signalSoft;const lv=top+(bot-top)*(1-e);const k=(bot-lv)/(bot-top);c.beginPath();c.moveTo(cx,bot);c.lineTo(cx-rx*k,lv);c.ellipse(cx,lv,rx*k,ry*k,0,Math.PI,0,true);c.closePath();c.fill();
    c.beginPath();c.moveTo(cx,bot);c.lineTo(cx-rx,top);c.moveTo(cx,bot);c.lineTo(cx+rx,top);c.stroke();c.strokeStyle=f==='base'?C.marker:C.slate;c.beginPath();c.ellipse(cx,top,rx,ry,0,0,Math.PI*2);c.stroke();c.restore();
    ln(g,cx,top,cx+rx,top,{color:C.orange,w:2});txt(g,`r = ${v.r} ${u}`,cx+rx/2,top-ry-12,{size:12,bold:true,color:C.orange});ln(g,cx,top,cx,bot,{color:C.signal,w:2,dash:[4,3]});txt(g,`h = ${v.h} ${u}`,cx+8,(top+bot)/2,{align:'left',size:12,bold:true,color:C.signal});
    if(f==='base')badge(g,`base area = π(${v.r})² = ${v.r*v.r}π ${u}²`,W*0.42,H-16);if(f==='vol')badge(g,`V = ⅓ × ${v.r*v.r}π × ${v.h} = ${fmt(v.r*v.r*v.h/3)}π ${u}³`,W*0.42,H-16);if(f==='third')badge(g,'a cone holds one third of the cylinder around it',W*0.42,H-16)}
  if(v.kind==='lshape'){const {ow,oh,cw,chh}=v;const sc=Math.min((W*0.42)/ow,(H*0.62)/oh),x=W*0.14,y=H*0.16;const P=[[0,0],[ow,0],[ow,chh],[ow-cw,chh],[ow-cw,oh],[0,oh]].map(p=>[x+p[0]*sc,y+p[1]*sc]);
    c.save();c.fillStyle=C.signalSoft;c.beginPath();P.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();c.fill();c.strokeStyle=C.slate;c.lineWidth=2;c.stroke();c.restore();
    if(f==='split'||t>=.999){ln(g,x,y+chh*sc,x+ow*sc,y+chh*sc,{color:C.marker,w:2,dash:[5,4]});txt(g,'A',x+ow*sc/2,y+chh*sc/2,{size:13,bold:true,color:C.signal});txt(g,'B',x+(ow-cw)*sc/2,y+(chh+(oh-chh)/2)*sc,{size:13,bold:true,color:C.orange});txt(g,`A: ${ow} × ${chh} = ${ow*chh}`,W*0.74,H*0.3,{size:12,bold:true,color:C.signal});txt(g,`B: ${ow-cw} × ${oh-chh} = ${(ow-cw)*(oh-chh)}`,W*0.74,H*0.3+20,{size:12,bold:true,color:C.orange})}
    txt(g,`${ow} ${u}`,x+ow*sc/2,y-12,{size:12,bold:true});txt(g,`${oh-chh} ${u}`,x-8,y+(chh+(oh-chh)/2)*sc,{align:'right',size:12,bold:true});txt(g,`${chh} ${u}`,x+ow*sc+8,y+chh*sc/2,{align:'left',size:12,bold:true});txt(g,`${cw} ${u}`,x+(ow-cw/2)*sc,y+chh*sc+14,{size:12,bold:true});txt(g,`${ow-cw} ${u}`,x+(ow-cw)*sc/2,y+oh*sc+14,{size:12,bold:true});
    if(f==='area')badge(g,`total = ${ow*chh} + ${(ow-cw)*(oh-chh)} = ${ow*chh+(ow-cw)*(oh-chh)} ${u}²`,W*0.74,H*0.3+46)}
  if(v.kind==='sector'){const cx=W*0.36,cy=H*0.52,r=Math.min(H*0.4,W*0.2),th=v.angle*Math.PI/180,a0=-Math.PI/2;c.save();c.strokeStyle=C.rule;c.lineWidth=2;c.beginPath();c.arc(cx,cy,r,0,Math.PI*2);c.stroke();c.fillStyle=f==='area'?C.markerSoft:C.signalSoft;c.beginPath();c.moveTo(cx,cy);c.arc(cx,cy,r,a0,a0+th*e);c.closePath();c.fill();c.strokeStyle=f==='arc'?C.marker:C.signal;c.lineWidth=6;c.beginPath();c.arc(cx,cy,r,a0,a0+th*e);c.stroke();c.restore();
    ln(g,cx,cy,cx,cy-r,{color:C.slate,w:2});ln(g,cx,cy,cx+r*Math.cos(a0+th),cy+r*Math.sin(a0+th),{color:C.slate,w:2});txt(g,`${v.angle}°`,cx+22*Math.cos(a0+th/2),cy+22*Math.sin(a0+th/2),{size:12,bold:true,color:C.orange});txt(g,`r = ${v.r} ${u}`,cx+8,cy-r/2,{align:'left',size:12,bold:true,color:C.slate,bg:C.scene});
    const frac=v.angle/360;txt(g,`${v.angle}/360 = ${fmt(frac,3)} of the circle`,W*0.78,cy-30,{size:11.5,color:C.slate});txt(g,`arc: ${fmt(2*v.r*frac*e,2)}π ${u}`,W*0.78,cy-8,{size:12,bold:true,color:f==='arc'?C.marker:C.signal});txt(g,`area: ${fmt(v.r*v.r*frac*e,2)}π ${u}²`,W*0.78,cy+14,{size:12,bold:true,color:f==='area'?C.marker:C.signal});
    if(f==='frac')badge(g,`fraction of circle = ${v.angle}/360`,W*0.78,cy+44)}
  if(v.kind==='circle'){const cx=W*0.4,cy=H/2,r=Math.min(H*0.38,W*0.22);c.save();c.strokeStyle=C.rule;c.lineWidth=2;c.beginPath();c.arc(cx,cy,r,0,Math.PI*2);c.stroke();c.strokeStyle=f==='circ'?C.marker:C.signal;c.lineWidth=6;c.beginPath();c.arc(cx,cy,r,-Math.PI/2,-Math.PI/2+Math.PI*2*e);c.stroke();c.restore();
    ln(g,cx,cy,cx+r,cy,{color:f==='radius'?C.marker:C.orange,w:2});txt(g,`r = ${v.r} ${u}`,cx+r/2,cy+14,{size:12,bold:true,color:C.orange});dot(g,cx,cy,3,C.ink);
    const ang=-Math.PI/2+Math.PI*2*e;dot(g,cx+r*Math.cos(ang),cy+r*Math.sin(ang),7,C.signal,C.paper);
    txt(g,`run: ${fmt(2*Math.PI*v.r*e,1)} ${u}`,cx+r+16,cy-10,{align:'left',size:11.5,color:C.signal});txt(g,`= ${fmt(2*v.r*e,2)}π ${u}`,cx+r+16,cy+10,{align:'left',size:11.5,color:C.signal});
    if(f==='circ')badge(g,`one lap = 2πr = ${2*v.r}π ${u}`,W/2,H-14)}
};

/* ---- dotplot: one or two dot plots with median / mean / spread ---- */
R.dotplot=(g,v,t,f)=>{const {W,H}=g,sets=v.sets||[{vals:v.vals,label:v.label||''}],x0=40,x1=W-30,sc=(x1-x0)/(v.max-v.min),sx=x=>x0+(x-v.min)*sc,e=ease(t);
  sets.forEach((s,si)=>{const y=sets.length>1?H*(0.42+0.46*si):H*0.78;ln(g,x0,y+10,x1,y+10,{color:C.slate,w:1.5});for(let x=v.min;x<=v.max;x++){ln(g,sx(x),y+7,sx(x),y+13,{color:C.slate});if((x-v.min)%(v.step||1)===0)txt(g,x,sx(x),y+22,{size:10.5,color:C.slate})}
    if(s.label)txt(g,s.label,x0,y-(sets.length>1?H*0.2:H*0.6)+8,{align:'left',size:11,bold:true,color:C.slate});
    const sorted=[...s.vals].sort((a,b)=>a-b),n=sorted.length,shown=Math.floor(e*n+1e-9),cnt={};const mean=sorted.reduce((a,b)=>a+b,0)/n,med=n%2?sorted[(n-1)/2]:(sorted[n/2-1]+sorted[n/2])/2;
    const hl=(f===('median'+(si||''))||f==='median')?'median':(f===('mean'+(si||''))||f==='mean')?'mean':null;
    const ho=Math.max(...Object.values(sorted.reduce((o,x)=>(o[x]=(o[x]||0)+1,o),{})));const dy=Math.min(14,(sets.length>1?H*0.16:H*0.5)/ho);
    sorted.slice(0,shown).forEach((x,i)=>{cnt[x]=(cnt[x]||0)+1;const isMid=n%2?i===(n-1)/2:(i===n/2-1||i===n/2);const isOut=f==='outlier'&&(x===sorted[n-1]&&sorted[n-1]-sorted[n-2]>(v.max-v.min)/4);dot(g,sx(x),y-cnt[x]*dy+dy/2,Math.min(6,dy/2-1),(hl==='median'&&isMid)||isOut?C.marker:C.signal)});
    if(hl==='median'||(t>=.999&&v.mark==='median')){ln(g,sx(med),y+10,sx(med),y-ho*dy-6,{color:C.marker,w:2,dash:[4,3]});badge(g,`median = ${fmt(med,1)}`,Math.min(Math.max(sx(med),70),W-70),y-ho*dy-18)}
    if(hl==='mean'||(t>=.999&&v.mark==='mean')){ln(g,sx(mean),y+10,sx(mean),y-ho*dy-6,{color:C.orange,w:2,dash:[4,3]});badge(g,`mean = ${fmt(mean,2)}`,Math.min(Math.max(sx(mean),70),W-70),y-ho*dy-18,C.markerSoft)}
    if(f==='spread'||f==='spread'+si){ln(g,sx(sorted[0]),y+34,sx(sorted[n-1]),y+34,{color:C.marker,w:3});badge(g,`range = ${sorted[n-1]-sorted[0]}`,(sx(sorted[0])+sx(sorted[n-1]))/2,y+48)}
    if(f==='outlier')badge(g,v.outNote||'outlier pulls the mean, not the median',W/2,14)});
};
/* ---- boxplot: animated five-number summaries and comparisons ---- */
R.boxplot=(g,v,t,f)=>{const {W,H}=g,c=g.ctx,e=ease(t),sets=v.sets||[v],x0=50,x1=W-24,axisY=H-31,sx=x=>x0+(x-v.min)/(v.max-v.min)*(x1-x0),step=Math.max(1,Math.round(nice(v.max-v.min)));
  ln(g,x0,axisY,x1,axisY,{color:C.slate,w:1.5});for(let x=Math.ceil(v.min/step)*step;x<=v.max+1e-9;x+=step){ln(g,sx(x),axisY-4,sx(x),axisY+4,{color:C.slate});txt(g,fmt(x),sx(x),axisY+14,{size:10.5,color:C.slate})}if(v.unit)txt(g,v.unit,(x0+x1)/2,axisY+27,{size:10,color:C.slate});
  sets.forEach((s,i)=>{const y=sets.length>1?H*(.29+.32*i):H*.47,col=s.color||[C.signal,C.orange][i%2],right=s.min+(s.max-s.min)*e,qRight=s.q1+(s.q3-s.q1)*e,hlMed=f===`median${i}`||f==='median',hlIqr=f===`iqr${i}`||f==='iqr',hlRange=f===`range${i}`||f==='range';txt(g,s.label||`Set ${i+1}`,x0,y-31,{align:'left',size:11,bold:true,color:C.slate});ln(g,sx(s.min),y,sx(right),y,{color:hlRange?C.marker:col,w:3});if(e>.25){ln(g,sx(s.min),y-10,sx(s.min),y+10,{color:col,w:2});ln(g,sx(right),y-10,sx(right),y+10,{color:col,w:2})}c.save();c.fillStyle=hlIqr?C.markerSoft:C.signalSoft;c.strokeStyle=hlIqr?C.marker:col;c.lineWidth=2;c.fillRect(sx(s.q1),y-14,Math.max(0,sx(qRight)-sx(s.q1)),28);c.strokeRect(sx(s.q1),y-14,Math.max(0,sx(qRight)-sx(s.q1)),28);c.restore();if(e>.62){ln(g,sx(s.med),y-14,sx(s.med),y+14,{color:hlMed?C.marker:C.ink,w:hlMed?4:2.5})}
    if(hlMed)badge(g,`median = ${fmt(s.med)}`,Math.min(Math.max(sx(s.med),72),W-72),y-29);if(hlIqr)badge(g,`IQR = ${fmt(s.q3-s.q1)}`,Math.min(Math.max((sx(s.q1)+sx(s.q3))/2,68),W-68),y+31);if(hlRange)badge(g,`range = ${fmt(s.max-s.min)}`,Math.min(Math.max((sx(s.min)+sx(s.max))/2,72),W-72),y+31)});
  if(f==='compare'&&v.compare)badge(g,v.compare,W/2,15,C.markerSoft);
};
/* ---- residual plot: signed prediction errors around zero ---- */
R.residuals=(g,v,t,f)=>{const lim=v.rmax||Math.max(5,...v.pts.map(p=>Math.abs(p[1])))*1.25,ax=axes(g,{xmin:v.xmin||0,xmax:v.xmax,ymin:-lim,ymax:lim,xlabel:v.xlabel||'input',ylabel:v.ylabel||'residual'},{}),e=ease(t),shown=Math.min(v.pts.length,Math.floor(e*1.4*v.pts.length));ln(g,ax.x0,ax.sy(0),ax.x1,ax.sy(0),{color:f==='zero'?C.marker:C.orange,w:f==='zero'?3:2,dash:[6,4]});
  v.pts.slice(0,shown).forEach((p,i)=>dot(g,ax.sx(p[0]),ax.sy(p[1]),f==='point'&&i===v.point?8:5,p[1]>=0?C.signal:C.purple,C.paper));
  if((t>=.98||f==='point')&&v.point!=null){const p=v.pts[v.point];ln(g,ax.sx(p[0]),ax.sy(0),ax.sx(p[0]),ax.sy(p[1]),{color:C.marker,w:3});badge(g,`${v.labels?.[v.point]||`x = ${fmt(p[0])}`}: residual ${p[1]>0?'+':''}${fmt(p[1])}`,Math.min(Math.max(ax.sx(p[0]),88),g.W-88),ax.sy(p[1])+(p[1]>0?-17:17))}
  if(f==='closest'){const i=v.pts.reduce((best,p,j)=>Math.abs(p[1])<Math.abs(v.pts[best][1])?j:best,0),p=v.pts[i];dot(g,ax.sx(p[0]),ax.sy(p[1]),9,C.marker,C.paper);badge(g,`smallest |residual| = ${fmt(Math.abs(p[1]))}`,Math.min(Math.max(ax.sx(p[0]),92),g.W-92),ax.sy(p[1])+(p[1]>0?-18:18))}
  if(f==='magnitude'){const i=v.pts.reduce((best,p,j)=>Math.abs(p[1])>Math.abs(v.pts[best][1])?j:best,0),p=v.pts[i];dot(g,ax.sx(p[0]),ax.sy(p[1]),9,C.marker,C.paper);badge(g,`greatest |residual| = ${fmt(Math.abs(p[1]))}`,Math.min(Math.max(ax.sx(p[0]),92),g.W-92),ax.sy(p[1])+(p[1]>0?-18:18))}
  if(f==='pattern'){if(v.pattern==='curve'){plotFn(g,ax,x=>v.curveA*Math.pow(x-v.center,2)+v.curveC,v.xmin||0,v.xmax,{color:C.marker,w:3,dash:[5,3]});badge(g,v.note||'curved pattern → linear model misses structure',g.W/2,14,C.markerSoft)}else badge(g,v.note||'random scatter around zero → linear model is reasonable',g.W/2,14,C.checkSoft)}if(f==='zero')badge(g,'residual = actual − predicted',g.W/2,14,C.markerSoft);
};
/* ---- angles: triangle / parallel lines / exterior angle ---- */
R.angles=(g,v,t,f)=>{const {W,H}=g,c=g.ctx,e=ease(t);const arc=(x,y,a0,a1,r,col,lab,lx,ly,on)=>{c.save();c.strokeStyle=col;c.lineWidth=on?3:2;c.beginPath();c.arc(x,y,r,a0,a0+(a1-a0)*e,false);c.stroke();c.restore();txt(g,lab,lx,ly,{size:12,bold:true,color:col,bg:on?C.markerSoft:''})};
  if(v.kind==='tri'||v.kind==='ext'){const [A,B,Cc]=v.angles;const by=H*0.8;let bx=W*0.14,cx=W*0.8;let bl=cx-bx;const ar=A*Math.PI/180,br=B*Math.PI/180;let h=bl/(1/Math.tan(ar)+1/Math.tan(br));if(h>H*0.62){const k=H*0.62/h;bl*=k;h*=k;bx=W*0.47-bl/2;cx=bx+bl}const ax=bx+h/Math.tan(ar),ay=by-h;
    ln(g,bx,by,cx,by,{color:C.slate,w:2});ln(g,bx,by,ax,ay,{color:C.slate,w:2});ln(g,cx,by,ax,ay,{color:C.slate,w:2});
    const lab=v.labels||[`${A}°`,`${B}°`,`${Cc}°`];
    arc(bx,by,-ar,0,26,f==='A'?C.marker:C.signal,lab[0],bx+40,by-14,f==='A');arc(cx,by,Math.PI,Math.PI+br,26,f==='B'?C.marker:C.orange,lab[1],cx-40,by-14,f==='B');
    const t1=Math.atan2(by-ay,bx-ax),t2=Math.atan2(by-ay,cx-ax);arc(ax,ay,Math.min(t1,t2),Math.max(t1,t2),24,f==='C'?C.marker:C.check,lab[2],ax,ay+38,f==='C');
    if(v.kind==='ext'){ln(g,cx,by,cx+W*0.15,by,{color:C.slate,w:2,dash:[5,4]});arc(cx,by,-(Math.PI-br),0,34,f==='E'?C.marker:C.purple,v.extLabel||`${A+Cc}°`,cx+46,by-20,f==='E')}
    if(f==='sum')badge(g,'the three angles of a triangle add to 180°',W/2,16);if(f==='ext')badge(g,'exterior angle = sum of the two remote interior angles',W/2,16)}
  if(v.kind==='parallel'){const y1=H*0.3,y2=H*0.7,ang=v.angle*Math.PI/180,x0=W*0.42;ln(g,20,y1,W-20,y1,{color:C.slate,w:2});ln(g,20,y2,W-20,y2,{color:C.slate,w:2});const dx=(y2-y1)/Math.tan(ang);const px=x0-dx*0.6,qx=x0+dx*1.4;ln(g,px,y1+(y2-y1)*(-0.6),qx,y2+(y2-y1)*0.4,{color:C.signal,w:2});
    const a=v.angle;const P=[x0,y1],Q=[x0+dx,y2];const spots=[[P,-ang,0,`${a}°`,1,0],[P,Math.PI-ang,Math.PI,`${180-a}°`,-1,0],[Q,-ang,0,'?',1,1],[Q,Math.PI-ang,Math.PI,`${180-a}°`,-1,1]];
    v.show.forEach(i=>{const [pt,a0,a1,lab,sgn,bot]=spots[i];const on=f==='a'+i;arc(pt[0],pt[1],Math.min(a0,a1),Math.max(a0,a1),22,on?C.marker:i<2?C.signal:C.orange,i===v.ask?'?':lab,pt[0]+sgn*34,pt[1]-12,on)});
    txt(g,'ℓ₁',W-28,y1-12,{size:12,color:C.slate});txt(g,'ℓ₂',W-28,y2-12,{size:12,color:C.slate});if(f==='corr')badge(g,v.note||'parallel lines: corresponding angles are equal',W/2,14);if(f==='supp')badge(g,'angles on a straight line add to 180°',W/2,14)}
};
/* ---- sample: population, random sample, estimate + margin of error ---- */
R.sample=(g,v,t,f)=>{const {W,H}=g,e=ease(t),cols=20,rows=10,N=cols*rows,gx=16,gy=26,cw=(W*0.55-gx)/cols,ch=(H-gy-30)/rows;const rr=rng(v.seed||7);const idx=rr.shuffle([...Array(N).keys()]);const ns=Math.round(N*(v.n/v.N));const chosen=new Set(idx.slice(0,ns));const yes=new Set(idx.slice(0,ns).filter((_,i)=>i<Math.round(ns*v.p)));
  txt(g,`population: ${cm(v.N)}`,gx,12,{align:'left',size:11,bold:true,color:C.slate});const shown=Math.floor(e*ns);let k=0;
  for(let i=0;i<N;i++){const x=gx+(i%cols)*cw+cw/2,y=gy+Math.floor(i/cols)*ch+ch/2;let col=C.rule;if(chosen.has(i)){k++;if(k<=shown)col=yes.has(i)?C.signal:C.orange}dot(g,x,y,Math.min(cw,ch)*0.32,col)}
  txt(g,`random sample: ${cm(v.n)}`,gx,H-12,{align:'left',size:11,bold:true,color:f==='random'?C.marker:C.slate});
  const bx=W*0.62,bw=W*0.32,by=H*0.32,bh=14;if(v.p!=null){txt(g,`sample result`,bx,by-22,{align:'left',size:11,color:C.slate});g.ctx.fillStyle=C.rule;g.ctx.fillRect(bx,by,bw,bh);g.ctx.fillStyle=C.signal;g.ctx.fillRect(bx,by,bw*v.p*e,bh);txt(g,`${Math.round(v.p*100)}% ${v.what||''}`,bx,by+bh+12,{align:'left',size:11,bold:true,color:C.signal})}
  if(v.interval){const [lo,hi,unit]=v.interval;const y=H*0.68;const sc=bw/(hi-lo)/2.6,mid=(lo+hi)/2,cx=bx+bw/2;ln(g,cx-(mid-lo)*sc,y,cx+(hi-mid)*sc,y,{color:f==='interval'?C.marker:C.check,w:5});dot(g,cx,y,6,C.check,C.paper);txt(g,`${fmt(mid)} ± ${fmt(hi-mid)} ${unit||''}`,cx,y-16,{size:11.5,bold:true,color:f==='interval'?C.marker:C.check});txt(g,fmt(lo),cx-(mid-lo)*sc,y+14,{size:10.5,color:C.slate});txt(g,fmt(hi),cx+(hi-mid)*sc,y+14,{size:10.5,color:C.slate})}
  if(v.est&&(f==='estimate'||t>=.999))badge(g,v.est,W/2,H*0.5,f==='estimate'?C.markerSoft:C.wash);if(f==='random')badge(g,'random selection lets the sample stand in for the population',W/2,H*0.5-30,C.markerSoft);if(f==='note'&&v.note)badge(g,v.note,W/2,H*0.5-30);
};

/* ---- balance: animated equation modeling and inverse operations ---- */
R.balance=(g,v,t,f)=>{const {W,H}=g,c=g.ctx,e=ease(t),cx=W/2,beamY=H*.57,panY=beamY-30;
  txt(g,v.title||'equivalent operations keep both sides balanced',W/2,24,{size:12,bold:true,color:C.slate});
  c.save();c.strokeStyle=C.slate;c.lineWidth=3;c.beginPath();c.moveTo(cx-100,beamY);c.lineTo(cx+100,beamY);c.stroke();c.beginPath();c.moveTo(cx,beamY);c.lineTo(cx-20,beamY+50);c.lineTo(cx+20,beamY+50);c.closePath();c.fillStyle=C.grid1;c.fill();c.restore();
  const pan=(x,col,label)=>{ln(g,x-58,panY,x+58,panY,{color:col,w:3});ln(g,x-42,panY,x-58,beamY,{color:col});ln(g,x+42,panY,x+58,beamY,{color:col});txt(g,label,x,panY-22,{size:15,bold:true,color:col,bg:C.paper})};
  pan(cx-100,f==='left'?C.marker:C.signal,v.left);pan(cx+100,f==='right'?C.marker:C.orange,v.right);
  if(e>.45){const a=(e-.45)/.55;txt(g,v.operation||'apply the same operation to both sides',W/2,H*.34,{size:12,bold:true,color:C.purple,bg:C.wash});dot(g,cx-100+(cx-(cx-100))*a,H*.78,5,C.signal);dot(g,cx+100+(cx-(cx+100))*a,H*.78,5,C.orange)}
  if(f==='result'||t>=.999)badge(g,v.result,W/2,H-18,f==='result'?C.markerSoft:C.checkSoft);
  if(f==='trap'&&v.trap)badge(g,v.trap,W/2,H*.34,C.missSoft);
};

/* ---- nonlinear system: line and parabola with intersection points ---- */
R.systemgraph=(g,v,t,f)=>{const {W}=g,ax=axes(g,{xmin:v.xmin,xmax:v.xmax,ymin:v.ymin||0,ymax:v.ymax,xlabel:v.xlabel||'x',ylabel:v.ylabel||'y'},{L:50,R:20,T:22,B:34});const e=ease(t);
  plotFn(g,ax,x=>v.a*x*x+v.b*x+v.c,v.xmin,v.xmin+(v.xmax-v.xmin)*e,{color:C.signal,w:2.8});
  plotFn(g,ax,x=>v.m*x+v.q,v.xmin,v.xmin+(v.xmax-v.xmin)*e,{color:C.orange,w:2.5});
  txt(g,v.curveLabel||'quadratic',ax.sx(v.xmin+(v.xmax-v.xmin)*.75),ax.sy(v.a*Math.pow(v.xmin+(v.xmax-v.xmin)*.75,2)+v.b*(v.xmin+(v.xmax-v.xmin)*.75)+v.c)-12,{size:10.5,bold:true,color:C.signal,bg:C.paper});
  txt(g,v.lineLabel||'linear',ax.sx(v.xmin+(v.xmax-v.xmin)*.28),ax.sy(v.m*(v.xmin+(v.xmax-v.xmin)*.28)+v.q)+13,{size:10.5,bold:true,color:C.orange,bg:C.paper});
  if(t>=.98||f==='intersect')v.points.forEach((p,i)=>{dot(g,ax.sx(p[0]),ax.sy(p[1]),7,C.marker,C.paper);badge(g,p[2]||`(${fmt(p[0])}, ${fmt(p[1])})`,Math.min(Math.max(ax.sx(p[0])+(i?34:-34),70),W-70),ax.sy(p[1])-17)});
};

/* ---- circle in the coordinate plane ---- */
R.circleplane=(g,v,t,f)=>{const {W,H}=g,c=g.ctx,e=ease(t),pad=2,loX=Math.min(0,v.h-v.r)-pad,hiX=Math.max(0,v.h+v.r)+pad,loY=Math.min(0,v.k-v.r)-pad,hiY=Math.max(0,v.k+v.r)+pad,midX=(loX+hiX)/2,midY=(loY+hiY)/2,s=Math.min((W-62)/(hiX-loX),(H-48)/(hiY-loY)),sx=x=>W/2+(x-midX)*s,sy=y=>H/2-(y-midY)*s;
  for(let x=Math.ceil(loX);x<=hiX;x++){ln(g,sx(x),sy(loY),sx(x),sy(hiY),{color:x===0?C.slate:C.rule,w:x===0?1.6:1});if(x%2===0)txt(g,x,sx(x),sy(0)+13,{size:9.5,color:C.slate})}for(let y=Math.ceil(loY);y<=hiY;y++){ln(g,sx(loX),sy(y),sx(hiX),sy(y),{color:y===0?C.slate:C.rule,w:y===0?1.6:1});if(y!==0&&y%2===0)txt(g,y,sx(0)-7,sy(y),{align:'right',size:9.5,color:C.slate})}
  const cx=sx(v.h),cy=sy(v.k),rad=v.r*s;c.save();c.strokeStyle=C.signal;c.lineWidth=3;c.beginPath();c.arc(cx,cy,rad*e,0,Math.PI*2);c.stroke();c.restore();dot(g,cx,cy,7,f==='center'?C.marker:C.signal,C.paper);
  ln(g,cx,cy,cx+rad*e,cy,{color:f==='radius'?C.marker:C.orange,w:3});
  if(f==='center'||t>=.999)badge(g,`center (${v.h}, ${v.k})`,Math.min(Math.max(cx,75),g.W-75),cy-18);
  if(f==='radius'||t>=.999)txt(g,`r = ${v.r}`,cx+rad/2,cy-14,{size:11,bold:true,color:C.orange,bg:C.paper});
};

/* ============================== PROBLEM BANK ============================== */
function rng(seed){let s=seed>>>0;const n=()=>{s+=0x6D2B79F5;let t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296};return{n,ri:(a,b)=>a+Math.floor(n()*(b-a+1)),pick:a=>a[Math.floor(n()*a.length)],shuffle:a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(n()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}}}
function mc(r,correct,wrongs){const set=[correct];for(const w of wrongs){if(!set.includes(w)&&set.length<4)set.push(w)}const perm=r.shuffle(set.map((_,i)=>i));const choices=perm.map(i=>set[i]);return{choices,ans:choices.indexOf(correct)}}
/* Offline LaTeX-to-MathML renderer: keeps professional equations available in Android WebView without a network dependency. */
const escMath=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const texToken=s=>`⟦${encodeURIComponent(String(s))}⟧`,TEX_TOKEN_RE=/⟦([^⟧]+)⟧/g;
function texOf(x){return String(x??'').replace(TEX_TOKEN_RE,(_,s)=>decodeURIComponent(s)).replace(/<[^>]*>/g,'')}
function texNormalize(s){return String(s).replace(/×/g,'\\times ').replace(/÷/g,'\\div ').replace(/≤/g,'\\le ').replace(/≥/g,'\\ge ').replace(/≈/g,'\\approx ').replace(/±/g,'\\pm ').replace(/·/g,'\\cdot ').replace(/−/g,'-')}
function latexMath(tex){const s=texNormalize(tex);let i=0;const skip=()=>{while(/\s/.test(s[i]||''))i++};const rawGroup=()=>{skip();if(s[i]!=='{')return'';let d=1,j=++i;while(i<s.length&&d){if(s[i]==='{')d++;else if(s[i]==='}')d--;i++}return s.slice(j,i-1)};const group=()=>{skip();if(s[i]==='{'){i++;const z=parse('}');if(s[i]==='}')i++;return`<mrow>${z}</mrow>`}return atom()};const atom=()=>{skip();if(i>=s.length)return'';if(s[i]==='\\'){i++;if(s[i]==='$'){i++;return'<mo>$</mo>'}let cmd='';while(/[A-Za-z]/.test(s[i]||''))cmd+=s[i++];if(cmd==='frac'){const a=group(),b=group();return`<mfrac>${a}${b}</mfrac>`}if(cmd==='sqrt')return`<msqrt>${group()}</msqrt>`;if(cmd==='mathit'||cmd==='mathrm'){const z=rawGroup();return`<mi mathvariant="${cmd==='mathit'?'italic':'normal'}">${escMath(z)}</mi>`}if(cmd==='text')return`<mtext>${escMath(rawGroup())}</mtext>`;if(cmd==='left'||cmd==='right')return'';const mp={times:'×',div:'÷',le:'≤',ge:'≥',approx:'≈',pm:'±',cdot:'·',pi:'π',circ:'°'};return`<mo>${mp[cmd]||escMath(cmd)}</mo>`}if(s[i]==='{'){i++;const z=parse('}');if(s[i]==='}')i++;return`<mrow>${z}</mrow>`}if(/[0-9.]/.test(s[i])){let z='';while(/[0-9.,]/.test(s[i]||''))z+=s[i++];return`<mn>${escMath(z)}</mn>`}if(/[A-Za-zα-ωΑ-Ωθ]/.test(s[i])){let z='';while(/[A-Za-zα-ωΑ-Ωθ]/.test(s[i]||''))z+=s[i++];return`<mi>${escMath(z)}</mi>`}return`<mo>${escMath(s[i++])}</mo>`};const parse=stop=>{let out='';while(i<s.length&&s[i]!==stop){let a=atom();skip();if(s[i]==='^'){i++;a=`<msup>${a}${group()}</msup>`}out+=a}return out};const body=parse('');return`<math class="tex-math" xmlns="http://www.w3.org/1998/Math/MathML" aria-label="${escMath(tex)}"><semantics><mrow>${body}</mrow><annotation encoding="application/x-tex">${escMath(tex)}</annotation></semantics></math>`}
const TEX_SEQ_RE=/[\s\d.,$%+−\-×÷=≤≥<>/()\[\]{}:;·°π√^→≈±]*⟦[^⟧]+⟧(?:[\s\d.,$%+−\-×÷=≤≥<>/()\[\]{}:;·°π√^→≈±]*⟦[^⟧]+⟧)*[\s\d.,$%+−\-×÷=≤≥<>/()\[\]{}:;·°π√^→≈±]*/g;
const NUM_EQ_RE=/(?:\$?\d[\d,.]*%?)(?:\s*(?:\+|−|-|×|÷|=|≤|≥|→|≈|±|·|\/)\s*(?:\$?\d[\d,.]*%?)){1,}/g;
function mathChunk(s){const held=[];s=s.replace(TEX_SEQ_RE,m=>{let lead=(m.match(/^\s*/)||[''])[0],tail=(m.match(/\s*$/)||[''])[0],core=m.slice(lead.length,m.length-tail.length);while(/^[,.;:]/.test(core)){lead+=core[0];core=core.slice(1)}while(/[,.;:]$/.test(core)){tail=core.slice(-1)+tail;core=core.slice(0,-1)}if(!core)return m;const n=held.push(latexMath(texOf(core)))-1;return`${lead}\uE000${n}\uE001${tail}`});s=s.replace(NUM_EQ_RE,m=>latexMath(m));return s.replace(/\uE000(\d+)\uE001/g,(_,n)=>held[+n])}
function mathHTML(html){return String(html??'').split(/(<\/?[A-Za-z][^>]*>)/g).map(x=>/^<\/?[A-Za-z]/.test(x)?x:mathChunk(x)).join('')}
const EQ=s=>texToken(s),V=s=>texToken(`\\mathit{${s}}`),FR=(a,b)=>texToken(`\\frac{${texOf(a)}}{${texOf(b)}}`),SUP=(b,e)=>texToken(`${texOf(b)}^{${texOf(e)}}`);
const gcd=(a,b)=>b?gcd(b,a%b):a;const frac=(a,b)=>{if(!Number.isFinite(a)||!Number.isFinite(b))return FR(a,b);const d=gcd(a,b);return FR(a/d,b/d)};
const DOMAINS=[
 {id:'alg',name:'Algebra',desc:'Linear equations, functions, systems, and inequalities in context'},
 {id:'psda',name:'Problem Solving & Data Analysis',desc:'Ratios, percents, data, probability, and statistical reasoning'},
 {id:'adv',name:'Advanced Math',desc:'Quadratic, exponential, rational, and radical situations'},
 {id:'geo',name:'Geometry & Trigonometry',desc:'Area, volume, angles, right triangles, and circles'}];
const SKILLS=[
 {id:'lin1',dom:'alg',name:'Linear equations in one variable'},{id:'linf',dom:'alg',name:'Linear functions'},{id:'lin2',dom:'alg',name:'Linear equations in two variables'},{id:'sys',dom:'alg',name:'Systems of two linear equations'},{id:'ineq',dom:'alg',name:'Linear inequalities'},
 {id:'ratio',dom:'psda',name:'Ratios, rates, proportions, and units'},{id:'pct',dom:'psda',name:'Percentages'},{id:'one',dom:'psda',name:'One-variable data: center and spread'},{id:'two',dom:'psda',name:'Two-variable data: models and scatterplots'},{id:'prob',dom:'psda',name:'Probability and conditional probability'},{id:'infer',dom:'psda',name:'Inference and margin of error'},{id:'claims',dom:'psda',name:'Evaluating statistical claims'},
 {id:'equiv',dom:'adv',name:'Equivalent expressions'},{id:'nonlin',dom:'adv',name:'Nonlinear equations and systems'},{id:'nonf',dom:'adv',name:'Nonlinear functions'},
 {id:'area',dom:'geo',name:'Area and volume'},{id:'lines',dom:'geo',name:'Lines, angles, and triangles'},{id:'trig',dom:'geo',name:'Right triangles and trigonometry'},{id:'circ',dom:'geo',name:'Circles'}];
const P=[];const def=o=>P.push(o);

/* ---------------- ALGEBRA ---------------- */
def({id:'a1',sk:'lin1',dom:'alg',skill:'Linear equations in one variable · distance = rate × time',fmt:'spr',gen(r){const v1=r.pick([50,60,70,80]),v2=r.pick([40,45,50,55]),T=r.ri(2,5),d=(v1+v2)*T;const meet=v1*T;
 return{text:`Two trains leave stations that are ${cm(d)} miles apart at the same time and travel toward each other on parallel tracks. One train travels at a constant speed of ${v1} miles per hour, and the other travels at a constant speed of ${v2} miles per hour. How many hours after they leave will the two trains pass each other?`,
  ans:T,ansText:`${T}`,viz:{type:'motion',len:d,unit:'mi',tunit:'h',T,meet,movers:[{label:`${v1} mph`,start:0,speed:v1,dir:1,color:C.signal},{label:`${v2} mph`,start:d,speed:v2,dir:-1,color:C.orange}]},
  steps:[{t:`The trains close the gap from both sides, so their speeds add: ${v1} + ${v2} = ${v1+v2} miles per hour of closing speed.`,f:'rate'},{t:`The gap is ${cm(d)} miles. Distance = rate × time gives ${v1+v2}${V('t')} = ${cm(d)}.`,f:'rate'},{t:`${V('t')} = ${cm(d)} ÷ ${v1+v2} = ${T} hours. In the picture, the first train has gone ${cm(meet)} mi and the second ${cm(d-meet)} mi when they meet.`,f:'meet'}]}}});

def({id:'a2',sk:'linf',dom:'alg',skill:'Linear models · writing an equation from a situation',fmt:'mc',gen(r){const V0=r.pick([40,50,60,80,120]),rate=r.pick([2,2.5,3,4,5]);const T=V0/rate;
 const c=mc(r,`${V('V')} = ${V0} − ${rate}${V('t')}`,[`${V('V')} = ${V0} + ${rate}${V('t')}`,`${V('V')} = ${rate}${V('t')} − ${V0}`,`${V('V')} = ${V0} − ${FR(V('t'),rate)}`]);
 return{text:`A storage tank contains ${V0} gallons of water. A valve is opened and water drains from the tank at a constant rate of ${rate} gallons per minute. Which equation gives the volume ${V('V')}, in gallons, of water remaining in the tank ${V('t')} minutes after the valve is opened?`,
  ...c,viz:{type:'tank',V0,rate:-rate,T,cap:V0,unit:'gal',tunit:'min',xlabel:'minutes',ylabel:'gallons'},
  steps:[{t:`At ${V('t')} = 0 nothing has drained yet, so ${V('V')} starts at ${V0}. That is the constant term.`,f:'v0'},{t:`Each minute removes ${rate} gallons, so the volume changes by −${rate} per minute: the slope is −${rate}.`,f:'rate'},{t:`Start plus change: ${V('V')} = ${V0} − ${rate}${V('t')}. The tank is empty when ${V0} − ${rate}${V('t')} = 0, at ${V('t')} = ${fmt(T)} minutes.`,f:'empty'}]}}});

def({id:'a3',sk:'lin1',dom:'alg',skill:'Linear equations in one variable · solving from a bill',fmt:'spr',gen(r){const fee=r.pick([15,20,25,30]),per=r.pick([0.05,0.10,0.08]),m=r.ri(15,45)*10,bill=+(fee+per*m).toFixed(2);
 return{text:`A phone plan charges a monthly fee of ${money(fee)} plus ${money(per)} for each minute of calls. In March, the total bill for the plan was ${money(bill)}. How many minutes of calls were made in March?`,
  ans:m,ansText:`${m}`,viz:{type:'linegraph',xmax:500,ymax:Math.ceil((fee+per*500)/10)*10,xlabel:'minutes of calls',ylabel:'bill ($)',lines:[{m:per,b:fee,color:C.signal,label:`bill = ${fee} + ${per}·min`}],point:{x:m,y:bill,label:`${m} min → ${money(bill)}`}},
  steps:[{t:`Bill = fee + rate × minutes, so ${fmt(bill)} = ${fee} + ${per}${V('m')}. The ${money(fee)} is where the line starts.`,f:'intercept'},{t:`Subtract the fixed fee: ${per}${V('m')} = ${fmt(bill)} − ${fee} = ${fmt(bill-fee)}.`,f:'slope'},{t:`Divide by the per-minute rate: ${V('m')} = ${fmt(bill-fee)} ÷ ${per} = ${m} minutes.`,f:'point'}]}}});

def({id:'a4',sk:'sys',dom:'alg',skill:'Systems of two linear equations · tickets and revenue',fmt:'spr',gen(r){const pa=r.pick([10,12,15,20]),pc=r.pick([5,6,8]),n=r.ri(10,25)*10,a=r.ri(3,Math.floor(n/10)-2)*10,cch=n-a,Rv=pa*a+pc*cch;
 return{text:`A community theater sold ${n} tickets to a play. Adult tickets cost ${money(pa)} each and child tickets cost ${money(pc)} each. The total revenue from ticket sales was ${money(Rv)}. How many adult tickets were sold?`,
  ans:a,ansText:`${a}`,viz:{type:'linegraph',xmax:n,ymax:Math.ceil(Rv/pc/10)*10,xlabel:'adult tickets a',ylabel:'child tickets c',lines:[{m:-1,b:n,color:C.signal,label:`a + c = ${n}`},{m:-pa/pc,b:Rv/pc,color:C.orange,label:`${pa}a + ${pc}c = ${cm(Rv)}`}],point:{x:a,y:cch,label:`(${a}, ${cch})`}},
  steps:[{t:`Two unknowns, two facts. Count: ${V('a')} + ${V('c')} = ${n}. Money: ${pa}${V('a')} + ${pc}${V('c')} = ${cm(Rv)}.`},{t:`From the count, ${V('c')} = ${n} − ${V('a')}. Substitute into the money equation: ${pa}${V('a')} + ${pc}(${n} − ${V('a')}) = ${cm(Rv)}.`},{t:`${pa-pc}${V('a')} + ${cm(pc*n)} = ${cm(Rv)}, so ${pa-pc}${V('a')} = ${cm(Rv-pc*n)} and ${V('a')} = ${a}. The lines cross at (${a}, ${cch}).`,f:'intersect'}]}}});

def({id:'a5',sk:'ineq',dom:'alg',skill:'Linear inequalities in one variable · staying within a budget',fmt:'mc',gen(r){const budget=r.pick([150,200,250,300]),price=r.pick([6,7,8,9,11]),fee=r.pick([10,12,15,18]);const bound=(budget-fee)/price,ans=Math.floor(bound+1e-9);
 const c=mc(r,`${ans}`,[`${ans+1}`,`${Math.floor(budget/price)}`,`${ans-1}`,`${ans+2}`]);
 return{text:`An office manager has a budget of ${money(budget)} for a lunch order. Each sandwich costs ${money(price)}, and there is a flat delivery fee of ${money(fee)}. What is the greatest number of sandwiches the manager can order without exceeding the budget?`,
  ...c,viz:{type:'numberline',min:0,max:Math.floor(budget/price)+2,bound,inclusive:true,label:'s',ans,unit:'sandwiches'},
  steps:[{t:`Let ${V('s')} be the number of sandwiches. Cost must stay at or below the budget: ${price}${V('s')} + ${fee} ≤ ${budget}.`},{t:`Subtract the fee, then divide: ${price}${V('s')} ≤ ${budget-fee}, so ${V('s')} ≤ ${fmt(bound,2)}.`},{t:`You can only buy whole sandwiches, so take the largest whole number at or below ${fmt(bound,2)}: ${ans}. (Forgetting the fee gives ${Math.floor(budget/price)}, which is over budget.)`,f:'int'}]}}});

def({id:'a6',sk:'linf',dom:'alg',skill:'Linear models · interpreting a constant in context',fmt:'mc',gen(r){const rate=r.pick([1.5,2,2.5,0.75]),h0=r.pick([6,8,10,12]);
 const c=mc(r,`The height of the water in the barrel before the storm began`,[`The number of inches the water rises each hour`,`The height of the water after 1 hour of rain`,`The number of hours until the barrel is full`]);
 return{text:`The height ${V('h')}, in inches, of water in a rain barrel ${V('t')} hours after a storm begins is modeled by the equation ${V('h')} = ${rate}${V('t')} + ${h0}. Which of the following is the best interpretation of the number ${h0} in this context?`,
  ...c,viz:{type:'tank',V0:h0,rate,T:8,cap:h0+rate*8,unit:'in',tunit:'h',xlabel:'hours',ylabel:'height (in)'},
  steps:[{t:`Plug in ${V('t')} = 0 (the moment the storm starts): ${V('h')} = ${rate}(0) + ${h0} = ${h0}. The constant is the starting height.`,f:'v0'},{t:`The ${rate} is the slope: the water rises ${rate} inches every hour. That is a rate, not a starting value.`,f:'rate'},{t:`After 1 hour the height is ${rate} + ${h0} = ${fmt(rate+h0)}, not ${h0}. So ${h0} is the height before the storm.`,f:'point'}]}}});

/* ---------------- PROBLEM SOLVING & DATA ANALYSIS ---------------- */
def({id:'p1',sk:'ratio',dom:'psda',skill:'Units · multi-step conversion',fmt:'spr',gen(r){const mpg=r.pick([25,28,30,32,35,40]),price=r.pick([3,3.2,3.5,4,4.5]),gal=r.ri(8,16),miles=mpg*gal,cost=+(gal*price).toFixed(2);
 return{text:`A car averages ${mpg} miles per gallon of gasoline, and gasoline costs ${money(price)} per gallon. At these rates, what is the cost, in dollars, of the gasoline needed to drive ${cm(miles)} miles? (Disregard the $ sign when entering your answer.)`,
  ans:cost,ansText:fmt(cost),viz:{type:'pipeline',stages:[{label:'distance',value:`${cm(miles)} mi`},{label:'gasoline',value:`${gal} gal`},{label:'cost',value:money(cost)}],ops:[`÷ ${mpg} mi/gal`,`× $${fmt(price)}/gal`]},
  steps:[{t:`Start with what you know: ${cm(miles)} miles.`,f:'s0'},{t:`Miles → gallons. Divide by miles per gallon: ${cm(miles)} ÷ ${mpg} = ${gal} gallons. (The mile units cancel.)`,f:'s1'},{t:`Gallons → dollars. Multiply by price per gallon: ${gal} × ${fmt(price)} = ${money(cost)}.`,f:'s2'}]}}});

def({id:'p2',sk:'pct',dom:'psda',skill:'Percentages · discount followed by tax',fmt:'mc',gen(r){const price=r.pick([60,80,120,150,200]),d=r.pick([15,20,25,30]),tx=r.pick([5,6,7,8]);const afterD=price*(1-d/100),final=+(afterD*(1+tx/100)).toFixed(2);
 const c=mc(r,money(final),[money(price*(1-(d-tx)/100)),money(afterD),money(afterD*(1-tx/100)),money(price*(1+tx/100))]);
 return{text:`A jacket has a regular price of ${money(price)}. It is on sale for ${d}% off the regular price, and a sales tax of ${tx}% is applied to the sale price. What is the total cost of the jacket, including tax?`,
  ...c,viz:{type:'bars',ymax:Math.ceil(price*1.1/50)*50,bars:[{label:'regular',value:price,color:C.slate,fmt:money},{label:`−${d}%`,value:afterD,color:C.signal,fmt:money},{label:`+${tx}% tax`,value:final,color:C.check,fmt:money}]},
  steps:[{t:`${d}% off means you pay ${100-d}% of the regular price: ${price} × ${fmt(1-d/100)} = ${money(afterD)}.`,f:1},{t:`Tax is applied to the sale price, not the regular price: ${fmt(afterD)} × ${fmt(1+tx/100)} = ${money(final)}.`,f:2},{t:`Shortcut: ${price} × ${fmt(1-d/100)} × ${fmt(1+tx/100)}. Note that a ${d}% decrease and a ${tx}% increase do not simply combine to ${d-tx}%.`,f:'diff'}]}}});

def({id:'p3',sk:'ratio',dom:'psda',skill:'Ratios and proportional relationships · scaling a recipe',fmt:'spr',gen(r){const f=r.pick([2,3,4,5]),s=r.pick([1,2,3]),k=r.pick([1.5,2,2.5,3,3.5,4]),F=f*k,S=s*k;
 return{text:`A recipe uses ${f} cups of flour for every ${s} cup${s>1?'s':''} of sugar. A baker wants to make a larger batch of the recipe using ${fmt(F)} cups of flour. How many cups of sugar should the baker use to keep the same ratio of flour to sugar?`,
  ans:S,ansText:fmt(S),viz:{type:'mixture',a:{label:'flour',amt:F,unit:'cups',color:C.marker},b:{label:'sugar',amt:S,unit:'cups',color:C.purple},ratio:[f,s],k},
  steps:[{t:`The ratio flour : sugar = ${f} : ${s} must stay the same in the larger batch.`,f:'ratio'},{t:`Find the scale factor from the flour: ${fmt(F)} ÷ ${f} = ${fmt(k)}. The batch is ${fmt(k)} times the recipe.`,f:'k'},{t:`Scale the sugar by the same factor: ${s} × ${fmt(k)} = ${fmt(S)} cups. Check: ${frac(F*10,S*10)} = ${frac(f,s)}.`,f:'k'}]}}});

def({id:'p4',sk:'prob',dom:'psda',skill:'Two-way tables · conditional probability',fmt:'mc',gen(r){const a=r.ri(15,45),b=r.ri(20,60);let cc=r.ri(15,45),d=r.ri(20,60);while(cc===a||cc===d||d===a){cc=r.ri(15,45);d=r.ri(20,60)}const data=[[a,b],[cc,d]];const tot=a+b+cc+d;
 const c=mc(r,frac(cc,cc+d),[frac(cc,a+cc),frac(cc,tot),frac(cc+d,tot),frac(d,cc+d),frac(a+cc,tot)]);
 return{text:`The table shows the number of juniors and seniors at a school who are members of the robotics club and the number who are not.<table><tr><th></th><th>Member</th><th>Not a member</th><th>Total</th></tr><tr><th>Juniors</th><td>${a}</td><td>${b}</td><td>${a+b}</td></tr><tr><th>Seniors</th><td>${cc}</td><td>${d}</td><td>${cc+d}</td></tr><tr><th>Total</th><td>${a+cc}</td><td>${b+d}</td><td>${tot}</td></tr></table>If a senior is selected at random, what is the probability that the selected senior is a member of the robotics club?`,
  ...c,viz:{type:'table',rows:['Juniors','Seniors'],cols:['Member','Not a member'],data,caption:f=>f==='row-1'?`"a senior is selected" → only this row (${cc+d} students)`:f==='cell-1-0'?`seniors who are members: ${cc}`:f==='rowtot-1'?`P = ${cc}/${cc+d}`:''},
  steps:[{t:`"If a senior is selected" restricts the sample space to the seniors row: ${cc} + ${d} = ${cc+d} students. That is the denominator.`,f:'row-1'},{t:`Of those seniors, ${cc} are members. That is the numerator.`,f:'cell-1-0'},{t:`Probability = ${frac(cc,cc+d)}. Using ${tot} or ${a+cc} as the denominator answers a different question.`,f:'rowtot-1'}]}}});

def({id:'p5',sk:'one',dom:'psda',skill:'Statistics · mean of a data set after adding a value',fmt:'spr',gen(r){const n=r.pick([4,5,6]),avg=r.ri(76,88);let tgt=avg+r.ri(1,3);let need=(n+1)*tgt-n*avg;while(need>100){tgt--;need=(n+1)*tgt-n*avg}
 const bars=[];for(let i=0;i<n;i++)bars.push({label:`test ${i+1}`,value:avg,color:C.signal});bars.push({label:`test ${n+1}`,value:need,color:C.check});
 return{text:`Malik has taken ${n} tests in his history class, and the mean of his ${n} scores is ${avg}. What score does Malik need on his next test so that the mean of all ${n+1} scores will be ${tgt}?`,
  ans:need,ansText:`${need}`,viz:{type:'bars',ymax:100,bars,line:{value:tgt,label:`target mean ${tgt}`},note:`the first ${n} tests are drawn at their average, ${avg}`},
  steps:[{t:`Mean = total ÷ count, so the current total is ${n} × ${avg} = ${cm(n*avg)} points.`,f:'mean'},{t:`For ${n+1} tests to average ${tgt}, the total must be ${n+1} × ${tgt} = ${cm((n+1)*tgt)} points.`,f:'mean'},{t:`The next test must supply the difference: ${cm((n+1)*tgt)} − ${cm(n*avg)} = ${need}. Raising a mean by ${tgt-avg} costs ${tgt-avg} extra points for every test taken.`,f:n}]}}});

def({id:'p6',sk:'two',dom:'psda',skill:'Scatterplots · interpreting the slope of a line of best fit',fmt:'mc',gen(r){const m=r.pick([1.2,1.5,2,2.4]),b=r.pick([18,20,22,24]);const rr=rng(r.ri(1,1e9));const pts=[];for(let i=0;i<14;i++){const x=+(rr.n()*10).toFixed(1);pts.push([x,+(b-m*x+(rr.n()-0.5)*4).toFixed(1)])}
 const c=mc(r,`The predicted price of a car decreases by ${fmt(m)} thousand dollars for each additional year of age`,[`The predicted price of a new car is ${fmt(m)} thousand dollars`,`The predicted price of a car increases by ${fmt(m)} thousand dollars for each additional year of age`,`A car that is ${fmt(m)} years old has a predicted price of ${b} thousand dollars`]);
 return{text:`The scatterplot shows the price ${V('y')}, in thousands of dollars, of ${pts.length} used cars of the same model and their ages ${V('x')}, in years. A line of best fit is also shown, with equation ${V('y')} = −${fmt(m)}${V('x')} + ${b}. Which of the following is the best interpretation of the slope of the line of best fit?`,
  ...c,viz:{type:'scatter',pts,m:-m,b,xmax:10,ymax:Math.ceil((b+2)/5)*5,xlabel:'age (years)',ylabel:'price ($ thousands)',xunit:'year',yunit:'thousand $'},
  steps:[{t:`Slope = change in ${V('y')} per 1 unit change in ${V('x')}. Here ${V('x')} is age in years and ${V('y')} is price in thousands of dollars.`,f:'slope'},{t:`The slope is −${fmt(m)}: for each extra year of age, the predicted price drops by ${fmt(m)} thousand dollars.`,f:'slope'},{t:`The ${b} is the ${V('y')}-intercept, the predicted price at age 0 (a new car). Don't mix the two up.`,f:'intercept'}]}}});

def({id:'p7',sk:'pct',dom:'psda',skill:'Percentages · percent increase',fmt:'spr',gen(r){const p0=r.ri(20,80)*1000,pct=r.ri(4,25),p1=p0*(1+pct/100);
 return{text:`The population of a town was ${cm(p0)} in 2015 and ${cm(p1)} in 2025. By what percent did the population of the town increase from 2015 to 2025?`,
  ans:pct,ansText:`${pct}`,viz:{type:'bars',ymax:Math.ceil(p1*1.15/10000)*10000,bars:[{label:'2015',value:p0,color:C.slate,fmt:v=>cm(Math.round(v))},{label:'2025',value:p1,color:C.signal,fmt:v=>cm(Math.round(v))}],diffLabel:`+${cm(p1-p0)}`},
  steps:[{t:`Find the actual change: ${cm(p1)} − ${cm(p0)} = ${cm(p1-p0)} people.`,f:'diff'},{t:`Percent change compares the change to the original amount: ${cm(p1-p0)} ÷ ${cm(p0)} = ${fmt(pct/100,2)}.`,f:0},{t:`Convert to a percent: ${fmt(pct/100,2)} × 100 = ${pct}%. (Dividing by the new value ${cm(p1)} is a common trap.)`,f:1}]}}});

def({id:'p8',sk:'ratio',dom:'psda',skill:'Rates · combined work',fmt:'spr',gen(r){const r1=r.pick([30,40,50]),r2=r.pick([50,60,70,80]),T=r.ri(10,30),pages=(r1+r2)*T;
 return{text:`One printer prints ${r1} pages per minute, and a second printer prints ${r2} pages per minute. If both printers work at the same time at these rates, how many minutes will it take them to print a total of ${cm(pages)} pages?`,
  ans:T,ansText:`${T}`,viz:{type:'motion',lanes:true,len:pages,unit:'pages',tunit:'min',T,movers:[{label:`${r1} pages/min`,start:0,speed:r1,dir:1,color:C.signal},{label:`${r2} pages/min`,start:0,speed:r2,dir:1,color:C.orange}]},
  steps:[{t:`Working together, the rates add: ${r1} + ${r2} = ${r1+r2} pages per minute.`,f:'rate'},{t:`Total pages = combined rate × time: ${r1+r2}${V('t')} = ${cm(pages)}.`,f:'total'},{t:`${V('t')} = ${cm(pages)} ÷ ${r1+r2} = ${T} minutes. Printer 1 produces ${cm(r1*T)} of the pages and printer 2 produces ${cm(r2*T)}.`,f:'total'}]}}});

/* ---------------- ADVANCED MATH ---------------- */
def({id:'m1',sk:'nonf',dom:'adv',skill:'Exponential models · writing a doubling model',fmt:'mc',gen(r){const N0=r.pick([200,300,500,800]),per=r.pick([2,3,4,6]);
 const c=mc(r,`${V('N')} = ${N0}·${SUP('2',`${V('t')}/${per}`)}`,[`${V('N')} = ${N0}·${SUP('2',`${per}${V('t')}`)}`,`${V('N')} = ${N0} + ${FR(2+V('t'),per)}`,`${V('N')} = ${N0}·${SUP(`(${V('t')}/${per})`,'2')}`]);
 return{text:`A biologist observes that a bacteria population starts with ${N0} cells and doubles every ${per} hours. Which equation models the number of cells ${V('N')} in the population ${V('t')} hours after the observation begins?`,
  ...c,viz:{type:'growth',a:N0,base:2,k:1/per,T:3*per,period:per,perLabel:`${per} hours`,xlabel:'hours',ylabel:'cells'},
  steps:[{t:`At ${V('t')} = 0 the population is ${N0}, so the starting value multiplies the whole expression.`,f:'start'},{t:`Doubling means multiplying by 2 once per ${per}-hour period. In ${V('t')} hours there are ${V('t')}/${per} such periods, giving the exponent ${V('t')}/${per}.`,f:'factor'},{t:`Check: ${V('t')} = ${per} gives ${N0}·2¹ = ${N0*2}; ${V('t')} = ${2*per} gives ${N0}·2² = ${N0*4}. The model is ${V('N')} = ${N0}·${SUP('2',`${V('t')}/${per}`)}.`,f:'end'}]}}});

def({id:'m2',sk:'nonf',dom:'adv',skill:'Exponential models · compound interest',fmt:'spr',gen(r){const Pv=r.pick([1000,2000,2500,4000,5000]),rt=r.pick([3,4,5,6]),y=r.pick([2,3,4]);const A=Pv*Math.pow(1+rt/100,y),ans=Math.round(A);
 return{text:`Dana deposits ${money(Pv)} into a savings account that earns ${rt}% interest compounded annually. If no other deposits or withdrawals are made, what will the balance of the account be, to the nearest dollar, after ${y} years? (Disregard the $ sign when entering your answer.)`,
  ans,ansText:`${ans}`,tol:0.5,viz:{type:'growth',a:Pv,base:1+rt/100,k:1,T:y,period:1,perLabel:'year',xlabel:'years',ylabel:'balance ($)',fmt:v=>money(v).replace('.00','')},
  steps:[{t:`Compounded annually at ${rt}% means each year the balance is multiplied by 1 + ${rt/100} = ${fmt(1+rt/100)}.`,f:'factor'},{t:`After ${y} years the multiplication happens ${y} times: ${V('A')} = ${cm(Pv)}·${SUP(`(${fmt(1+rt/100)})`,y)}.`,f:'factor'},{t:`${cm(Pv)} × ${fmt(Math.pow(1+rt/100,y),5)} = ${money(A)}, which rounds to ${cm(ans)}.`,f:'end'}]}}});

def({id:'m3',sk:'nonf',dom:'adv',skill:'Quadratic models · maximum of a projectile',fmt:'spr',gen(r){const v=r.pick([32,48,64,80,96]),h0=r.pick([4,5,6,8]);const tv=v/32,hmax=h0+v*v/64;
 return{text:`A ball is thrown straight up from a platform. Its height ${V('h')}, in feet, ${V('t')} seconds after it is thrown is given by ${V('h')} = −16${SUP(V('t'),2)} + ${v}${V('t')} + ${h0}. What is the maximum height, in feet, that the ball reaches?`,
  ans:hmax,ansText:`${hmax}`,viz:{type:'parabola',a:-16,b:v,c:h0},
  steps:[{t:`The graph of ${V('h')} is a parabola opening downward (the ${SUP(V('t'),2)} coefficient is negative), so its maximum is at the vertex.`,f:'start'},{t:`The vertex time is ${V('t')} = −${V('b')}/(2${V('a')}) = −${v}/(2·(−16)) = ${fmt(tv)} seconds.`,f:'vertex'},{t:`Plug it back in: ${V('h')} = −16(${fmt(tv)})² + ${v}(${fmt(tv)}) + ${h0} = ${-16*tv*tv} + ${v*tv} + ${h0} = ${hmax} feet.`,f:'vertex'}]}}});

def({id:'m4',sk:'nonlin',dom:'adv',skill:'Quadratic equations · area of a rectangle',fmt:'spr',gen(r){const w=r.ri(4,10),d=r.pick([2,3,4,5,6]),A=w*(w+d);
 return{text:`A rectangular garden has a length that is ${d} feet greater than its width. The area of the garden is ${A} square feet. What is the width of the garden, in feet?`,
  ans:w,ansText:`${w}`,viz:{type:'shape',kind:'rect',w:w+d,h:w,unit:'ft',mode:'area',wl:`w + ${d}`,hl:'w'},
  steps:[{t:`Let the width be ${V('w')}. Then the length is ${V('w')} + ${d}, and area = length × width: ${V('w')}(${V('w')} + ${d}) = ${A}.`,f:'area'},{t:`Expand and set to zero: ${V('w')}² + ${d}${V('w')} − ${A} = 0. Factor: (${V('w')} + ${w+d})(${V('w')} − ${w}) = 0.`},{t:`${V('w')} = ${w} or ${V('w')} = −${w+d}. A width can't be negative, so the width is ${w} feet (and the length is ${w+d} feet: ${w+d} × ${w} = ${A}).`,f:'area'}]}}});

def({id:'m5',sk:'nonf',dom:'adv',skill:'Exponential models · depreciation',fmt:'mc',gen(r){const Vv=r.pick([18000,24000,30000,36000]),p=r.pick([10,12,15,20]);
 const c=mc(r,`${V('V')} = ${cm(Vv)}${SUP(`(${fmt(1-p/100)})`,V('t'))}`,[`${V('V')} = ${cm(Vv)}${SUP(`(${fmt(1+p/100)})`,V('t'))}`,`${V('V')} = ${cm(Vv)} − ${fmt(p/100)}${V('t')}`,`${V('V')} = ${cm(Vv)}${SUP(`(${fmt(p/100)})`,V('t'))}`]);
 return{text:`A new car is purchased for ${money(Vv)}. Each year, the car loses ${p}% of its value from the previous year. Which equation models the value ${V('V')}, in dollars, of the car ${V('t')} years after it is purchased?`,
  ...c,viz:{type:'growth',a:Vv,base:1-p/100,k:1,T:6,period:1,perLabel:'year',xlabel:'years',ylabel:'value ($)',fmt:v=>'$'+cm(Math.round(v))},
  steps:[{t:`Losing ${p}% each year means keeping ${100-p}% of the previous year's value. Each year multiplies by ${fmt(1-p/100)}.`,f:'factor'},{t:`Repeated multiplication is an exponent: after ${V('t')} years, ${V('V')} = ${cm(Vv)}·${SUP(`(${fmt(1-p/100)})`,V('t'))}.`,f:'start'},{t:`A linear model ${cm(Vv)} − ${fmt(p/100)}${V('t')} would subtract the same amount each year; here the loss shrinks as the value shrinks, so the curve flattens.`,f:'end'}]}}});

/* ---------------- GEOMETRY & TRIGONOMETRY ---------------- */
def({id:'g1',sk:'area',dom:'geo',skill:'Perimeter · cost of fencing',fmt:'spr',gen(r){const L=r.ri(20,45),W=r.ri(10,20),cost=r.pick([8,10,12,15,18]),ans=2*(L+W)*cost;
 return{text:`A rectangular backyard is ${L} feet long and ${W} feet wide. A homeowner plans to build a fence around the entire yard. If the fencing costs ${money(cost)} per foot, what is the total cost of the fence, in dollars? (Disregard the $ sign when entering your answer.)`,
  ans,ansText:cm(ans),viz:{type:'shape',kind:'rect',w:L,h:W,unit:'ft'},
  steps:[{t:`A fence goes around the edge, so you need the perimeter, not the area.`,f:'perim'},{t:`Perimeter = 2(length + width) = 2(${L} + ${W}) = ${2*(L+W)} feet of fencing.`,f:'perim'},{t:`Cost = ${2*(L+W)} ft × ${money(cost)}/ft = ${money(ans)}.`}]}}});

def({id:'g2',sk:'area',dom:'geo',skill:'Volume · right circular cylinder',fmt:'mc',gen(r){const rr=r.pick([2,3,4,5,6]),h=r.pick([5,6,8,10,12]);const N=rr*rr*h;
 const wr=[2*rr*h,rr*h,N%3===0?N/3:null,rr*h*h,2*N].filter(x=>x!=null&&x!==N).map(x=>`${x}π`);const c=mc(r,`${N}π`,wr);
 return{text:`A cylindrical water tank has a radius of ${rr} feet and a height of ${h} feet. What is the volume of the tank, in cubic feet?`,
  ...c,viz:{type:'shape',kind:'cyl',r:rr,h,unit:'ft'},
  steps:[{t:`Volume of a cylinder = (area of the circular base) × height.`,f:'base'},{t:`Base area = π${SUP(V('r'),2)} = π(${rr})² = ${rr*rr}π square feet.`,f:'base'},{t:`Multiply by the height: ${rr*rr}π × ${h} = ${N}π cubic feet (about ${cm(Math.round(N*Math.PI))} ft³). Using 2πr instead of πr² gives ${2*rr*h}π, the wrong formula.`,f:'vol'}]}}});

def({id:'g3',sk:'trig',dom:'geo',skill:'Right triangles · Pythagorean theorem',fmt:'spr',gen(r){const tr=r.pick([[5,12,13],[6,8,10],[8,15,17],[9,12,15],[7,24,25],[10,24,26],[12,16,20]]);const [a,b,cc]=tr;
 return{text:`A ${cc}-foot ladder leans against a vertical wall. The bottom of the ladder is ${a} feet from the base of the wall. How many feet above the ground does the top of the ladder touch the wall?`,
  ans:b,ansText:`${b}`,viz:{type:'shape',kind:'tri',legs:[a,b],hyp:cc,unit:'ft',askB:true,legNote:`${a}² + b² = ${cc}²  →  b² = ${cc*cc} − ${a*a} = ${b*b}`,hypNote:`the ladder is the hypotenuse: ${cc} ft`},
  steps:[{t:`The wall, the ground, and the ladder form a right triangle. The ladder is the hypotenuse (${cc} ft); the distance along the ground is one leg (${a} ft).`,f:'hyp'},{t:`Pythagorean theorem: ${a}² + ${V('b')}² = ${cc}², so ${V('b')}² = ${cc*cc} − ${a*a} = ${b*b}.`,f:'leg2'},{t:`${V('b')} = √${b*b} = ${b} feet. (Adding the squares instead of subtracting is the classic error when the hypotenuse is known.)`,f:'leg2'}]}}});

def({id:'g4',sk:'lines',dom:'geo',skill:'Similar triangles · shadows',fmt:'spr',gen(r){const ph=r.pick([5,6]),ps=r.pick([2,3,4]),k=r.ri(5,12),ts=ps*k,th=ph*k;
 return{text:`At a certain time of day, a ${ph}-foot-tall person standing on level ground casts a shadow that is ${ps} feet long. At the same time, a nearby tree casts a shadow that is ${ts} feet long. What is the height of the tree, in feet?`,
  ans:th,ansText:`${th}`,viz:{type:'shape',kind:'tri2',small:{h:ph,s:ps,hl:`${ph} ft`,sl:`${ps} ft shadow`},big:{h:th,s:ts,hl:`? ft`,sl:`${ts} ft shadow`},note:`same sun angle → same ratio: height/shadow = ${ph}/${ps} = ${fmt(ph/ps,2)}`},
  steps:[{t:`The sun's rays hit at the same angle, so the person-and-shadow triangle and the tree-and-shadow triangle are similar.`,f:'ratio'},{t:`Corresponding sides are proportional: ${frac(V('h'),ts)} = ${frac(ph,ps)}.`,f:'ratio'},{t:`Cross-multiply: ${ps}${V('h')} = ${ph} × ${ts} = ${ph*ts}, so ${V('h')} = ${th} feet. (The tree's shadow is ${k} times longer, so the tree is ${k} times taller.)`,f:'ratio'}]}}});

def({id:'g5',sk:'trig',dom:'geo',skill:'Right-triangle trigonometry · using sine',fmt:'mc',gen(r){const L=r.pick([12,16,20,24,30]),ang=r.pick([10,12,15,18,20,25]);const rad=ang*Math.PI/180;const h=L*Math.sin(rad),bse=L*Math.cos(rad);
 const c=mc(r,`${L} sin ${ang}°`,[`${L} cos ${ang}°`,`${L} tan ${ang}°`,`${FR(L,'sin '+ang+'°')}`]);
 return{text:`A wheelchair ramp is ${L} feet long and makes an angle of ${ang}° with the level ground. Which expression gives the vertical height, in feet, of the top of the ramp above the ground?`,
  ...c,viz:{type:'shape',kind:'tri',legs:[+bse.toFixed(2),+h.toFixed(2)],hyp:L,unit:'ft',angle:ang,al:`${L} cos ${ang}° ≈ ${fmt(bse,1)} ft`,bl:`height = ?`,cl:`${L} ft`,angNote:`sin ${ang}° = opposite / hypotenuse = height / ${L}`,hypNote:`the ramp itself is the hypotenuse: ${L} ft`},
  steps:[{t:`The ramp is the hypotenuse of a right triangle; the height is the side opposite the ${ang}° angle.`,f:'hyp'},{t:`SOH: sin(angle) = opposite ÷ hypotenuse, so sin ${ang}° = height ÷ ${L}.`,f:'angle'},{t:`Height = ${L} sin ${ang}° ≈ ${fmt(h,2)} feet. (Cosine would give the horizontal run, ≈ ${fmt(bse,2)} ft.)`,f:'leg'}]}}});

def({id:'g6',sk:'circ',dom:'geo',skill:'Circles · circumference in context',fmt:'mc',gen(r){const rr=r.pick([40,50,60,75,80,100]);
 const c=mc(r,`${2*rr}π`,[`${rr}π`,`${rr*rr}π`,`${4*rr}π`]);
 return{text:`A circular running track has a radius of ${rr} meters. A runner completes exactly one lap along the track. What is the distance, in meters, that the runner travels?`,
  ...c,viz:{type:'shape',kind:'circle',r:rr,unit:'m'},
  steps:[{t:`One lap around a circle is its circumference, ${V('C')} = 2π${V('r')}.`,f:'radius'},{t:`Substitute the radius: ${V('C')} = 2π(${rr}) = ${2*rr}π meters.`,f:'circ'},{t:`That is about ${cm(Math.round(2*Math.PI*rr))} meters. ${rr*rr}π would be the area (square meters), not a distance.`,f:'circ'}]}}});

/* ======== ALGEBRA (extended) ======== */
def({id:'a7',sk:'lin1',dom:'alg',skill:'Linear equations in one variable · ages that add up',fmt:'spr',gen(r){const d=r.pick([3,4,5,6,7]),y=r.ri(8,16),sum=2*y+d;
 return{text:`Priya is ${d} years older than her brother Sam. The sum of their ages is ${sum}. How old is Sam?`,ans:y,ansText:`${y}`,
  viz:{type:'bars',ymax:Math.ceil((y+d)*1.3/5)*5,bars:[{label:'Sam',value:y,color:C.signal},{label:'Priya',value:y+d,color:C.orange},{label:'sum',value:sum,color:C.slate}],diffLabel:`+${d}`},
  steps:[{t:`Let Sam's age be ${V('s')}. Then Priya's age is ${V('s')} + ${d}.`,f:'diff'},{t:`Their ages add to ${sum}: ${V('s')} + (${V('s')} + ${d}) = ${sum}, so 2${V('s')} + ${d} = ${sum}.`,f:2},{t:`2${V('s')} = ${sum-d}, so ${V('s')} = ${y}. Sam is ${y} and Priya is ${y+d}; check: ${y} + ${y+d} = ${sum}.`,f:0}]}}});
def({id:'a8',sk:'lin1',dom:'alg',skill:'Linear equations in one variable · flat fee plus hourly rate',fmt:'spr',gen(r){const fee=r.pick([40,50,60,75]),rate=r.pick([35,45,55,60]),h=r.pick([1.5,2,2.5,3,4]),tot=fee+rate*h;
 return{text:`A plumber charges a flat fee of ${money(fee)} for a service call plus ${money(rate)} per hour of work. A customer was billed ${money(tot)} for one service call. How many hours did the plumber work?`,ans:h,ansText:fmt(h),
  viz:{type:'linegraph',xmax:5,ymax:Math.ceil((fee+rate*5)/50)*50,xlabel:'hours worked',ylabel:'bill ($)',lines:[{m:rate,b:fee,color:C.signal,label:`${fee} + ${rate}h`}],point:{x:h,y:tot,label:`${fmt(h)} h → ${money(tot)}`}},
  steps:[{t:`Bill = flat fee + rate × hours: ${fee} + ${rate}${V('h')} = ${fmt(tot)}. The ${money(fee)} is paid even for 0 hours.`,f:'intercept'},{t:`Remove the flat fee first: ${rate}${V('h')} = ${fmt(tot)} − ${fee} = ${fmt(tot-fee)}.`,f:'slope'},{t:`${V('h')} = ${fmt(tot-fee)} ÷ ${rate} = ${fmt(h)} hours.`,f:'point'}]}}});
def({id:'a9',sk:'lin1',dom:'alg',skill:'Linear equations in one variable · perimeter with a described length',fmt:'spr',gen(r){const w=r.ri(5,14),k=r.pick([2,3]),ad=r.pick([1,2,3,4]),L=k*w+ad,P=2*(L+w);
 return{text:`The length of a rectangular poster is ${ad} inch${ad>1?'es':''} more than ${k===2?'twice':'three times'} its width. The perimeter of the poster is ${P} inches. What is the width of the poster, in inches?`,ans:w,ansText:`${w}`,
  viz:{type:'shape',kind:'rect',w:L,h:w,unit:'in',wl:`${k}w + ${ad}`,hl:'w'},
  steps:[{t:`Let the width be ${V('w')}. The length is ${k}${V('w')} + ${ad}.`,f:'perim'},{t:`Perimeter = 2(length + width): 2(${k}${V('w')} + ${ad} + ${V('w')}) = ${P}, so 2(${k+1}${V('w')} + ${ad}) = ${P}.`,f:'perim'},{t:`${2*(k+1)}${V('w')} + ${2*ad} = ${P} → ${2*(k+1)}${V('w')} = ${P-2*ad} → ${V('w')} = ${w} inches (length ${L} in).`}]}}});
def({id:'a10',sk:'lin1',dom:'alg',skill:'Linear equations in one variable · catching up (same direction)',fmt:'spr',gen(r){const v1=r.pick([40,45,50]),v2=v1+r.pick([10,15,20]),hs=r.pick([1,2,3]);const d0=v1*hs;const T=d0/(v2-v1);const meet=v2*T;
 return{text:`A truck leaves a warehouse traveling at a constant ${v1} miles per hour. ${hs===1?'One hour':hs+' hours'} later, a car leaves the same warehouse on the same road traveling at a constant ${v2} miles per hour. How many hours after the car leaves will it catch up to the truck?`,ans:T,ansText:fmt(T),
  viz:{type:'motion',len:Math.ceil(meet*1.15/50)*50,unit:'mi',tunit:'h',T,meet,movers:[{label:`truck ${v1} mph`,start:d0,speed:v1,dir:1,color:C.signal},{label:`car ${v2} mph`,start:0,speed:v2,dir:1,color:C.orange}]},
  steps:[{t:`When the car starts, the truck already has a head start of ${v1} × ${hs} = ${d0} miles.`,f:'rate'},{t:`The car closes the gap at ${v2} − ${v1} = ${v2-v1} miles per hour (same direction, so subtract).`,f:'rate'},{t:`Time to close ${d0} miles: ${d0} ÷ ${v2-v1} = ${fmt(T)} hours. Both are then ${fmt(meet)} miles from the warehouse.`,f:'meet'}]}}});
def({id:'a11',sk:'linf',dom:'alg',skill:'Linear functions · evaluating a function in context',fmt:'spr',gen(r){const b=r.pick([2.5,3,3.5]),m=r.pick([1.75,2,2.25,2.5]),x=r.ri(4,12),y=+(b+m*x).toFixed(2);
 return{text:`The function ${V('f')} defined by ${V('f')}(${V('x')}) = ${fmt(m)}${V('x')} + ${fmt(b)} gives the fare, in dollars, for a taxi ride of ${V('x')} miles. What is the fare, in dollars, for a ride of ${x} miles? (Disregard the $ sign when entering your answer.)`,ans:y,ansText:fmt(y),
  viz:{type:'linegraph',xmax:15,ymax:Math.ceil((b+m*15)/10)*10,xlabel:'miles',ylabel:'fare ($)',lines:[{m,b,color:C.signal,label:`f(x) = ${fmt(m)}x + ${fmt(b)}`}],point:{x,y,label:`f(${x}) = ${money(y)}`}},
  steps:[{t:`${V('f')}(${x}) means: replace ${V('x')} with ${x}.`,f:'intercept'},{t:`${V('f')}(${x}) = ${fmt(m)}(${x}) + ${fmt(b)} = ${fmt(m*x)} + ${fmt(b)}.`,f:'slope'},{t:`= ${fmt(y)}. The fare is ${money(y)}: the ${money(b)} flag drop plus ${fmt(m)} per mile for ${x} miles.`,f:'point'}]}}});
def({id:'a12',sk:'linf',dom:'alg',skill:'Linear functions · writing an equation from a table',fmt:'mc',gen(r){const b=r.pick([25,30,40]),m=r.pick([10,15,20]);const rows=[1,2,3,4].map(x=>[x,b+m*x]);
 const c=mc(r,`${V('C')} = ${m}${V('n')} + ${b}`,[`${V('C')} = ${b}${V('n')} + ${m}`,`${V('C')} = ${m+b}${V('n')}`,`${V('C')} = ${m}${V('n')} + ${b+m}`]);
 return{text:`The table shows the total cost ${V('C')}, in dollars, of a gym membership for ${V('n')} months.<table><tr><th>Months, n</th>${rows.map(rw=>`<td>${rw[0]}</td>`).join('')}</tr><tr><th>Cost, C ($)</th>${rows.map(rw=>`<td>${rw[1]}</td>`).join('')}</tr></table>Which equation represents the relationship between ${V('n')} and ${V('C')}?`,...c,
  viz:{type:'linegraph',xmax:5,ymax:Math.ceil((b+5*m)/20)*20,xlabel:'months n',ylabel:'cost C ($)',lines:[{m,b,color:C.signal}],point:{x:0,y:b,label:`n = 0 → $${b}`}},
  steps:[{t:`Each extra month adds the same amount: ${rows[1][1]} − ${rows[0][1]} = ${m}. That constant change is the slope, ${m} per month.`,f:'slope'},{t:`Go back one month from ${V('n')} = 1: ${rows[0][1]} − ${m} = ${b}. That is the cost at ${V('n')} = 0, the one-time sign-up fee.`,f:'intercept'},{t:`${V('C')} = ${m}${V('n')} + ${b}. Check ${V('n')} = 3: ${m}(3) + ${b} = ${b+3*m}. ✓`,f:'point'}]}}});
def({id:'a13',sk:'linf',dom:'alg',skill:'Linear functions · when does the value reach zero',fmt:'spr',gen(r){const V0=r.pick([12000,15000,18000,24000]),d=r.pick([1500,2000,2400,3000]);const T=V0/d;
 return{text:`The value ${V('V')}, in dollars, of a delivery van ${V('t')} years after it was purchased is modeled by ${V('V')}(${V('t')}) = ${cm(V0)} − ${cm(d)}${V('t')}. According to the model, how many years after purchase will the value of the van be $0?`,ans:T,ansText:fmt(T),
  viz:{type:'tank',V0,rate:-d,T,cap:V0,unit:'$',tunit:'yr',xlabel:'years',ylabel:'value ($)'},
  steps:[{t:`The van starts at ${money(V0)} and loses ${money(d)} every year.`,f:'rate'},{t:`Set the value to zero: ${cm(V0)} − ${cm(d)}${V('t')} = 0, so ${cm(d)}${V('t')} = ${cm(V0)}.`,f:'v0'},{t:`${V('t')} = ${cm(V0)} ÷ ${cm(d)} = ${fmt(T)} years. That is the ${V('t')}-intercept of the graph.`,f:'empty'}]}}});
def({id:'a14',sk:'linf',dom:'alg',skill:'Linear functions · interpreting the slope',fmt:'mc',gen(r){const m=r.pick([0.4,0.55,0.6,0.75]),b=r.pick([20,25,30]);
 const c=mc(r,`The cost increases by ${money(m)} for each additional mile driven`,[`The cost of renting the truck for one day with no miles driven is ${money(m)}`,`The cost increases by ${money(b)} for each additional mile driven`,`The truck can be driven ${fmt(m)} miles for each dollar paid`]);
 return{text:`A rental company charges ${V('C')}(${V('m')}) = ${fmt(m)}${V('m')} + ${b} dollars to rent a moving truck for one day and drive it ${V('m')} miles. Which of the following is the best interpretation of the coefficient ${fmt(m)} in this context?`,...c,
  viz:{type:'linegraph',xmax:100,ymax:Math.ceil((b+100*m)/20)*20,xlabel:'miles m',ylabel:'cost C ($)',lines:[{m,b,color:C.signal,label:`C = ${fmt(m)}m + ${b}`}]},
  steps:[{t:`In ${V('C')} = ${fmt(m)}${V('m')} + ${b}, the coefficient of ${V('m')} is the slope: the change in ${V('C')} when ${V('m')} increases by 1.`,f:'slope'},{t:`One more mile → ${money(m)} more cost. That is a rate (dollars per mile).`,f:'slope'},{t:`The ${b} is the ${V('C')}-intercept: the cost with 0 miles, ${money(b)}. Answer choices that swap the two are the usual traps.`,f:'intercept'}]}}});
def({id:'a15',sk:'linf',dom:'alg',skill:'Linear functions · time to reach a target value',fmt:'spr',gen(r){const T0=r.pick([55,60,65,70]),rate=r.pick([2,2.5,3,4]),tgt=r.pick([120,130,140,150]);const T=(tgt-T0)/rate;
 return{text:`A water heater is turned on when the water temperature is ${T0}°F. The temperature of the water rises at a constant rate of ${fmt(rate)}°F per minute. How many minutes after the heater is turned on will the water temperature reach ${tgt}°F?`,ans:T,ansText:fmt(T),
  viz:{type:'tank',V0:T0,rate,T,cap:tgt,unit:'°F',tunit:'min',xlabel:'minutes',ylabel:'temperature (°F)'},
  steps:[{t:`Temperature = ${T0} + ${fmt(rate)}${V('t')}. The heater starts at ${T0}°F.`,f:'v0'},{t:`Set it equal to the target: ${T0} + ${fmt(rate)}${V('t')} = ${tgt}, so ${fmt(rate)}${V('t')} = ${tgt-T0}.`,f:'rate'},{t:`${V('t')} = ${tgt-T0} ÷ ${fmt(rate)} = ${fmt(T)} minutes.`,f:'point'}]}}});
def({id:'a16',sk:'lin2',dom:'alg',skill:'Linear equations in two variables · finding one quantity given the other',fmt:'spr',gen(r){const pa=r.pick([3,4,5]),pb=r.pick([2,4,6]),tot=r.pick([60,72,84,96,120]);let x=r.ri(2,Math.floor(tot/pa)-2);while(((tot-pa*x)%pb)!==0||tot-pa*x<=0)x=r.ri(2,Math.floor(tot/pa)-2);const y=(tot-pa*x)/pb;
 return{text:`A café sells bagels for ${money(pa)} each and muffins for ${money(pb)} each. On one morning, the café earned ${money(tot)} from selling ${V('x')} bagels and ${V('y')} muffins, where ${pa}${V('x')} + ${pb}${V('y')} = ${tot}. If the café sold ${x} bagels that morning, how many muffins did it sell?`,ans:y,ansText:`${y}`,
  viz:{type:'linegraph',xmax:Math.ceil(tot/pa/5)*5,ymax:Math.ceil(tot/pb/5)*5,xlabel:'bagels x',ylabel:'muffins y',lines:[{m:-pa/pb,b:tot/pb,color:C.signal,label:`${pa}x + ${pb}y = ${tot}`}],point:{x,y,label:`(${x}, ${y})`}},
  steps:[{t:`Every point on the line is a (bagels, muffins) pair earning exactly ${money(tot)}.`,f:'intercept'},{t:`Substitute ${V('x')} = ${x}: ${pa}(${x}) + ${pb}${V('y')} = ${tot}, so ${pb}${V('y')} = ${tot} − ${pa*x} = ${tot-pa*x}.`,f:'point'},{t:`${V('y')} = ${tot-pa*x} ÷ ${pb} = ${y} muffins.`,f:'point'}]}}});
def({id:'a17',sk:'lin2',dom:'alg',skill:'Linear equations in two variables · meaning of an intercept',fmt:'mc',gen(r){const pb=r.pick([4,5,6]),pm=r.pick([8,10,12]),B=pb*pm*r.pick([3,4,5]);
 const c=mc(r,`The number of magazines Lena can buy if she buys no books`,[`The number of books Lena can buy if she buys no magazines`,`The cost of one magazine`,`The total amount of money Lena has`]);
 return{text:`Lena has ${money(B)} to spend on books and magazines. Each book costs ${money(pb)} and each magazine costs ${money(pm)}. The equation ${pb}${V('x')} + ${pm}${V('y')} = ${B} relates the number of books ${V('x')} and magazines ${V('y')} she can buy with all of her money. In this context, what does the ${V('y')}-intercept of the graph of this equation represent?`,...c,
  viz:{type:'linegraph',xmax:B/pb,ymax:B/pm,xlabel:'books x',ylabel:'magazines y',lines:[{m:-pb/pm,b:B/pm,color:C.signal}],point:{x:0,y:B/pm,label:`(0, ${B/pm})`}},
  steps:[{t:`The ${V('y')}-intercept is where ${V('x')} = 0: no books at all.`,f:'intercept'},{t:`Then ${pm}${V('y')} = ${B}, so ${V('y')} = ${B/pm}: ${B/pm} magazines and nothing else.`,f:'point'},{t:`The ${V('x')}-intercept (${B/pb}, 0) is the mirror image: all books, no magazines.`,f:'slope'}]}}});
def({id:'a18',sk:'lin2',dom:'alg',skill:'Linear equations in two variables · line through two data points',fmt:'mc',gen(r){const x1=r.pick([2,3]),x2=x1+r.pick([2,3,4]),m=r.pick([12,15,18,20]),b=r.pick([20,25,30,35]);const y1=b+m*x1,y2=b+m*x2;
 const c=mc(r,`${V('y')} = ${m}${V('x')} + ${b}`,[`${V('y')} = ${m}${V('x')} + ${y1}`,`${V('y')} = ${fmt(y1/x1,2)}${V('x')}`,`${V('y')} = ${b}${V('x')} + ${m}`,`${V('y')} = ${m}${V('x')} + ${y2}`]);
 return{text:`A bike-rental shop charges a fixed fee plus an hourly rate. Renting a bike for ${x1} hours costs ${money(y1)}, and renting it for ${x2} hours costs ${money(y2)}. Which equation gives the cost ${V('y')}, in dollars, of renting a bike for ${V('x')} hours?`,...c,
  viz:{type:'linegraph',xmax:x2+2,ymax:Math.ceil((b+m*(x2+2))/20)*20,xlabel:'hours x',ylabel:'cost y ($)',lines:[{m,b,color:C.signal}],point:{x:x2,y:y2,label:`(${x2}, ${y2})`}},
  steps:[{t:`Two points on the line: (${x1}, ${y1}) and (${x2}, ${y2}). Slope = rise ÷ run = (${y2} − ${y1}) ÷ (${x2} − ${x1}) = ${m} dollars per hour.`,f:'slope'},{t:`Use one point to find the fixed fee: ${y1} = ${m}(${x1}) + ${V('b')}, so ${V('b')} = ${y1} − ${m*x1} = ${b}.`,f:'intercept'},{t:`${V('y')} = ${m}${V('x')} + ${b}. Check with the other point: ${m}(${x2}) + ${b} = ${y2}. ✓`,f:'point'}]}}});
def({id:'a19',sk:'sys',dom:'alg',skill:'Systems of two linear equations · coins',fmt:'spr',gen(r){const n=r.ri(20,40),q=r.ri(5,n-5),d=n-q,tot=+(0.25*q+0.1*d).toFixed(2);
 return{text:`A jar contains only dimes and quarters. There are ${n} coins in the jar, and their total value is ${money(tot)}. How many quarters are in the jar?`,ans:q,ansText:`${q}`,
  viz:{type:'linegraph',xmax:n,ymax:n,xlabel:'quarters q',ylabel:'dimes d',lines:[{m:-1,b:n,color:C.signal,label:`q + d = ${n}`},{m:-2.5,b:tot*10,color:C.orange,label:`25q + 10d = ${Math.round(tot*100)}`}],point:{x:q,y:d,label:`(${q}, ${d})`}},
  steps:[{t:`Count equation: ${V('q')} + ${V('d')} = ${n}. Value equation in cents: 25${V('q')} + 10${V('d')} = ${Math.round(tot*100)}.`},{t:`From the count, ${V('d')} = ${n} − ${V('q')}. Substitute: 25${V('q')} + 10(${n} − ${V('q')}) = ${Math.round(tot*100)} → 15${V('q')} + ${10*n} = ${Math.round(tot*100)}.`},{t:`15${V('q')} = ${Math.round(tot*100)-10*n}, so ${V('q')} = ${q} quarters (and ${d} dimes).`,f:'intersect'}]}}});
def({id:'a20',sk:'sys',dom:'alg',skill:'Systems of two linear equations · two pay rates',fmt:'spr',gen(r){const r1=r.pick([12,14,15]),r2=r1+r.pick([3,4,5,6]),H=r.pick([20,25,30,40]),h2=r.ri(4,H-4),h1=H-h2,pay=r1*h1+r2*h2;
 return{text:`Jonah works two jobs. He earns ${money(r1)} per hour at a bookstore and ${money(r2)} per hour as a tutor. Last week he worked a total of ${H} hours at the two jobs and earned ${money(pay)}. How many hours did Jonah tutor last week?`,ans:h2,ansText:`${h2}`,
  viz:{type:'linegraph',xmax:H,ymax:H,xlabel:'tutoring hours t',ylabel:'bookstore hours b',lines:[{m:-1,b:H,color:C.signal,label:`b + t = ${H}`},{m:-r2/r1,b:pay/r1,color:C.orange,label:`${r1}b + ${r2}t = ${cm(pay)}`}],point:{x:h2,y:h1,label:`(${h2}, ${h1})`}},
  steps:[{t:`Hours: ${V('b')} + ${V('t')} = ${H}. Pay: ${r1}${V('b')} + ${r2}${V('t')} = ${cm(pay)}.`},{t:`Substitute ${V('b')} = ${H} − ${V('t')}: ${r1}(${H} − ${V('t')}) + ${r2}${V('t')} = ${cm(pay)} → ${r2-r1}${V('t')} + ${cm(r1*H)} = ${cm(pay)}.`},{t:`${r2-r1}${V('t')} = ${cm(pay-r1*H)}, so ${V('t')} = ${h2} tutoring hours (and ${h1} bookstore hours).`,f:'intersect'}]}}});
def({id:'a21',sk:'sys',dom:'alg',skill:'Systems of two linear equations · plane with and against the wind',fmt:'spr',gen(r){const p=r.pick([150,180,200,240]),w=r.pick([20,30,40]),T=r.pick([2,3,4]);const d1=(p+w)*T,d2=(p-w)*T;
 return{text:`Flying with the wind, a small plane travels ${cm(d1)} miles in ${T} hours. Flying against the same wind, the plane travels ${cm(d2)} miles in ${T} hours. What is the speed of the plane in still air, in miles per hour?`,ans:p,ansText:`${p}`,
  viz:{type:'motion',lanes:true,len:Math.ceil(d1/100)*100,unit:'mi',tunit:'h',T,movers:[{label:`with wind ${p+w} mph`,start:0,speed:p+w,dir:1,color:C.signal},{label:`against wind ${p-w} mph`,start:0,speed:p-w,dir:1,color:C.orange}]},
  steps:[{t:`Speeds from distance ÷ time: with the wind ${cm(d1)} ÷ ${T} = ${p+w} mph; against it ${cm(d2)} ÷ ${T} = ${p-w} mph.`,f:'rate'},{t:`Let ${V('p')} = plane speed, ${V('w')} = wind speed: ${V('p')} + ${V('w')} = ${p+w} and ${V('p')} − ${V('w')} = ${p-w}.`,f:'total'},{t:`Add the equations: 2${V('p')} = ${2*p}, so ${V('p')} = ${p} mph (and the wind is ${w} mph).`,f:'total'}]}}});
def({id:'a22',sk:'sys',dom:'alg',skill:'Systems of two linear equations · when two plans cost the same',fmt:'spr',gen(r){const f1=r.pick([20,25,30]),r1=r.pick([0.05,0.04]),f2=r.pick([5,10,12]),r2=r1+r.pick([0.05,0.06,0.1]);const m=(f1-f2)/(r2-r1);
 return{text:`Plan A for a streaming service costs ${money(f1)} per month plus ${money(r1)} for each movie rented. Plan B costs ${money(f2)} per month plus ${money(r2)} for each movie rented. For how many movie rentals in a month do the two plans cost the same amount?`,ans:m,ansText:fmt(m),
  viz:{type:'linegraph',xmax:Math.ceil(m*1.6/50)*50,ymax:Math.ceil((f1+r1*m*1.6)/10)*10+10,xlabel:'movies rented m',ylabel:'monthly cost ($)',lines:[{m:r1,b:f1,color:C.signal,label:'Plan A'},{m:r2,b:f2,color:C.orange,label:'Plan B'}],point:{x:m,y:f1+r1*m,label:`${fmt(m)} movies → ${money(f1+r1*m)}`}},
  steps:[{t:`Plan A: ${V('C')} = ${f1} + ${fmt(r1)}${V('m')}. Plan B: ${V('C')} = ${f2} + ${fmt(r2)}${V('m')}. Plan B starts lower but climbs faster.`,f:'intercept'},{t:`Same cost means set them equal: ${f1} + ${fmt(r1)}${V('m')} = ${f2} + ${fmt(r2)}${V('m')} → ${f1-f2} = ${fmt(r2-r1)}${V('m')}.`,f:'slope'},{t:`${V('m')} = ${f1-f2} ÷ ${fmt(r2-r1)} = ${fmt(m)} movies. Beyond that, Plan A is cheaper.`,f:'intersect'}]}}});
def({id:'a23',sk:'ineq',dom:'alg',skill:'Linear inequalities in two variables · testing a combination',fmt:'mc',gen(r){const pa=r.pick([10,12,15]),pc=r.pick([5,6,8]),B=r.pick([180,200,240,300]);const ok=[];for(let a=1;a<=B/pa;a++)for(let cq=1;cq<=B/pc;cq++){const cost=pa*a+pc*cq;if(cost<=B&&cost>B-Math.min(pa,pc))ok.push([a,cq])}const good=r.pick(ok);const bad1=[good[0]+1,good[1]],bad2=[good[0],good[1]+2],bad3=[good[0]+2,good[1]-1];
 const lab=p=>`${p[0]} adult tickets and ${p[1]} child tickets`;const c=mc(r,lab(good),[lab(bad1),lab(bad2),lab(bad3)]);
 return{text:`A youth group has at most ${money(B)} to spend on tickets to a museum. Adult tickets cost ${money(pa)} each and child tickets cost ${money(pc)} each. If ${V('a')} is the number of adult tickets and ${V('c')} is the number of child tickets, the inequality ${pa}${V('a')} + ${pc}${V('c')} ≤ ${B} describes the possible purchases. Which of the following purchases is possible?`,...c,
  viz:{type:'linegraph',xmax:Math.ceil(B/pa/5)*5,ymax:Math.ceil(B/pc/5)*5,xlabel:'adult tickets a',ylabel:'child tickets c',lines:[{m:-pa/pc,b:B/pc,color:C.signal,label:`${pa}a + ${pc}c = ${B}`}],point:{x:good[0],y:good[1],label:`(${good[0]}, ${good[1]}) costs $${pa*good[0]+pc*good[1]}`}},
  steps:[{t:`The boundary line ${pa}${V('a')} + ${pc}${V('c')} = ${B} is where the money runs out. Allowed purchases lie on or below it.`,f:'intercept'},{t:`Test the correct choice: ${pa}(${good[0]}) + ${pc}(${good[1]}) = ${pa*good[0]+pc*good[1]} ≤ ${B}. ✓`,f:'point'},{t:`The other choices exceed the budget, e.g. ${pa}(${bad1[0]}) + ${pc}(${bad1[1]}) = ${pa*bad1[0]+pc*bad1[1]} > ${B}.`,f:'point'}]}}});
def({id:'a24',sk:'ineq',dom:'alg',skill:'Linear inequalities in one variable · minimum score for an average',fmt:'spr',gen(r){const s=[r.ri(80,92),r.ri(78,90),r.ri(82,94)],tgt=r.pick([88,90]);let need=4*tgt-s.reduce((a,b)=>a+b,0);while(need>100||need<70){s[0]=r.ri(80,92);s[1]=r.ri(78,90);s[2]=r.ri(82,94);need=4*tgt-s.reduce((a,b)=>a+b,0)}
 return{text:`Tara's scores on her first three chemistry tests were ${s[0]}, ${s[1]}, and ${s[2]}. What is the minimum score she needs on her fourth test so that the average (arithmetic mean) of her four scores is at least ${tgt}?`,ans:need,ansText:`${need}`,
  viz:{type:'numberline',min:60,max:100,bound:need,inclusive:true,dir:'ge',label:'score',ans:need,unit:'points',step:5,intLabel:`minimum score: ${need}`},
  steps:[{t:`"Average at least ${tgt}" means (${s[0]} + ${s[1]} + ${s[2]} + ${V('x')}) ÷ 4 ≥ ${tgt}.`},{t:`Multiply by 4: ${s.reduce((a,b)=>a+b,0)} + ${V('x')} ≥ ${4*tgt}.`},{t:`${V('x')} ≥ ${need}. Any score from ${need} up works; the minimum is ${need}.`,f:'int'}]}}});
def({id:'a25',sk:'ineq',dom:'alg',skill:'Linear inequalities in one variable · weight limit',fmt:'spr',gen(r){const lim=r.pick([1500,2000,2500]),bx=r.pick([35,40,45,60]),d=r.pick([160,180,200]);const bound=(lim-d)/bx,ans=Math.floor(bound+1e-9);
 return{text:`A freight elevator has a maximum load of ${cm(lim)} pounds. A worker who weighs ${d} pounds rides the elevator with boxes that each weigh ${bx} pounds. What is the greatest number of boxes the worker can bring on the elevator in one trip without exceeding the maximum load?`,ans,ansText:`${ans}`,
  viz:{type:'numberline',min:Math.max(0,ans-8),max:ans+4,bound,inclusive:true,label:'boxes',ans,unit:'boxes',from:Math.max(0,ans-8)},
  steps:[{t:`Total weight = worker + boxes: ${d} + ${bx}${V('n')} ≤ ${cm(lim)}.`},{t:`${bx}${V('n')} ≤ ${cm(lim-d)}, so ${V('n')} ≤ ${fmt(bound,2)}.`},{t:`Boxes come in whole numbers: ${ans} boxes (${ans+1} would weigh ${cm(d+bx*(ans+1))} lb total, over the limit).`,f:'int'}]}}});
def({id:'a26',sk:'ineq',dom:'alg',skill:'Systems of linear inequalities · translating constraints',fmt:'mc',gen(r){const N=r.pick([150,200,250]),k=r.pick([2,3]);
 const c=mc(r,`${V('a')} + ${V('c')} ≥ ${N} and ${V('a')} ≥ ${k}${V('c')}`,[`${V('a')} + ${V('c')} ≤ ${N} and ${V('a')} ≥ ${k}${V('c')}`,`${V('a')} + ${V('c')} ≥ ${N} and ${k}${V('a')} ≥ ${V('c')}`,`${V('a')} + ${V('c')} ≥ ${N} and ${V('a')} ≤ ${k}${V('c')}`]);
 return{text:`A charity run must have at least ${N} participants. The organizers also require that the number of adult participants ${V('a')} be at least ${k===2?'twice':'three times'} the number of child participants ${V('c')}. Which system of inequalities represents these conditions?`,...c,
  viz:{type:'linegraph',xmax:N,ymax:N,xlabel:'children c',ylabel:'adults a',lines:[{m:-1,b:N,color:C.signal,label:`a + c = ${N}`},{m:k,b:0,color:C.orange,label:`a = ${k}c`}],point:{x:N/(k+1),y:k*N/(k+1),label:'corner of the allowed region'}},
  steps:[{t:`"At least ${N} participants": ${V('a')} + ${V('c')} ≥ ${N}. Points on or above the blue line.`,f:'intercept'},{t:`"Adults at least ${k===2?'twice':'three times'} children": ${V('a')} ≥ ${k}${V('c')}. Points on or above the orange line.`,f:'slope'},{t:`Both must hold, so the allowed region is above both lines; its corner is where they meet.`,f:'intersect'}]}}});

/* ======== PROBLEM SOLVING & DATA ANALYSIS (extended) ======== */
def({id:'p9',sk:'ratio',dom:'psda',skill:'Ratios and units · map scale',fmt:'spr',gen(r){const sc=r.pick([20,25,40,50]),inch=r.pick([2.4,3.2,3.6,4.5,5.2]),mi=+(sc*inch).toFixed(1);
 return{text:`On a map, 1 inch represents ${sc} miles. Two towns are ${fmt(inch)} inches apart on the map. What is the actual distance, in miles, between the two towns?`,ans:mi,ansText:fmt(mi),
  viz:{type:'pipeline',stages:[{label:'on the map',value:`${fmt(inch)} in`},{label:'actual',value:`${fmt(mi)} mi`}],ops:[`× ${sc} mi per in`]},
  steps:[{t:`The scale is a unit rate: ${sc} miles per 1 inch.`,f:'s0'},{t:`Multiply map inches by miles per inch: ${fmt(inch)} × ${sc} = ${fmt(mi)}. The inch units cancel.`,f:'s1'},{t:`Alternatively set up a proportion: ${FR(1,sc)} = ${FR(fmt(inch),V('d'))}, giving ${V('d')} = ${fmt(mi)} miles.`,f:'s1'}]}}});
def({id:'p10',sk:'ratio',dom:'psda',skill:'Unit rates · comparing prices per unit',fmt:'mc',gen(r){const o1=r.pick([12,16,18]),p1=+(o1*r.pick([0.28,0.3,0.32])).toFixed(2),o2=r.pick([24,32,40]),p2=+(o2*r.pick([0.25,0.27,0.35])).toFixed(2);const u1=p1/o1,u2=p2/o2;const big=u2<u1;
 const c=mc(r,`The ${big?'large':'small'} box; it costs about ${money(Math.min(u1,u2))} per ounce`,[`The ${big?'small':'large'} box; it costs about ${money(Math.max(u1,u2))} per ounce`,`The ${big?'small':'large'} box; it costs about ${money(Math.min(u1,u2))} per ounce`,`The ${big?'large':'small'} box; it costs about ${money(Math.max(u1,u2))} per ounce`]);
 return{text:`A small box of cereal contains ${o1} ounces and costs ${money(p1)}. A large box contains ${o2} ounces and costs ${money(p2)}. Which box has the lower cost per ounce, and what is that cost?`,...c,
  viz:{type:'bars',ymax:Math.ceil(Math.max(u1,u2)*1.3*100)/100,bars:[{label:`small ($${fmt(p1)}/${o1} oz)`,value:u1,color:C.signal,fmt:v=>'$'+v.toFixed(3)},{label:`large ($${fmt(p2)}/${o2} oz)`,value:u2,color:C.orange,fmt:v=>'$'+v.toFixed(3)}],note:'cost per ounce'},
  steps:[{t:`Unit price = price ÷ ounces. Small: ${fmt(p1)} ÷ ${o1} ≈ ${money(u1)} per ounce.`,f:0},{t:`Large: ${fmt(p2)} ÷ ${o2} ≈ ${money(u2)} per ounce.`,f:1},{t:`The lower unit price is the better deal: the ${big?'large':'small'} box at about ${money(Math.min(u1,u2))} per ounce.`,f:big?1:0}]}}});
def({id:'p11',sk:'ratio',dom:'psda',skill:'Units · converting a speed',fmt:'spr',gen(r){const kmh=r.pick([36,54,72,90,108]);const ms=kmh*1000/3600;
 return{text:`A train travels at a constant speed of ${kmh} kilometers per hour. What is the speed of the train in meters per second? (1 kilometer = 1,000 meters)`,ans:ms,ansText:fmt(ms),
  viz:{type:'pipeline',stages:[{label:'km per hour',value:`${kmh} km/h`},{label:'m per hour',value:`${cm(kmh*1000)} m/h`},{label:'m per second',value:`${fmt(ms)} m/s`}],ops:['× 1,000 m/km','÷ 3,600 s/h']},
  steps:[{t:`Convert the distance unit: ${kmh} km/h × 1,000 m/km = ${cm(kmh*1000)} m/h.`,f:'s1'},{t:`Convert the time unit: one hour is 60 × 60 = 3,600 seconds, so divide by 3,600.`,f:'s2'},{t:`${cm(kmh*1000)} ÷ 3,600 = ${fmt(ms)} m/s. (Shortcut: km/h ÷ 3.6 = m/s.)`,f:'s2'}]}}});
def({id:'p12',sk:'ratio',dom:'psda',skill:'Proportional reasoning · machines, hours, and output',fmt:'spr',gen(r){const m1=r.pick([4,5,6]),h1=r.pick([3,4,5]),out=m1*h1*r.pick([5,8,10]),m2=m1+r.pick([2,3,4]),h2=h1+r.pick([1,2,3]);const per=out/(m1*h1),ans=per*m2*h2;
 return{text:`${m1} identical machines can produce ${cm(out)} parts in ${h1} hours. At the same rate, how many parts can ${m2} of these machines produce in ${h2} hours?`,ans,ansText:cm(ans),
  viz:{type:'pipeline',stages:[{label:`${m1} machines, ${h1} h`,value:`${cm(out)} parts`},{label:'1 machine, 1 h',value:`${fmt(per)} parts`},{label:`${m2} machines, ${h2} h`,value:`${cm(ans)} parts`}],ops:[`÷ ${m1} ÷ ${h1}`,`× ${m2} × ${h2}`]},
  steps:[{t:`Find the rate for one machine in one hour: ${cm(out)} ÷ ${m1} ÷ ${h1} = ${fmt(per)} parts per machine-hour.`,f:'s1'},{t:`Scale up to ${m2} machines for ${h2} hours: ${fmt(per)} × ${m2} × ${h2}.`,f:'s2'},{t:`= ${cm(ans)} parts. Output is proportional to both the number of machines and the time.`,f:'s2'}]}}});
def({id:'p13',sk:'ratio',dom:'psda',skill:'Units · currency conversion with a fee',fmt:'spr',gen(r){const rate=r.pick([0.8,0.85,0.9,0.92]),fee=r.pick([2,3,5]),usd=r.pick([200,250,300,400]);const ans=+((usd-fee)*rate).toFixed(2);
 return{text:`A currency exchange charges a flat fee of ${money(fee)} and then converts the remaining US dollars to euros at a rate of ${fmt(rate)} euros per dollar. If a traveler gives the exchange ${money(usd)}, how many euros does the traveler receive? (Disregard the € sign when entering your answer.)`,ans,ansText:fmt(ans),
  viz:{type:'pipeline',stages:[{label:'given',value:`$${usd}`},{label:'after fee',value:`$${usd-fee}`},{label:'received',value:`€${fmt(ans)}`}],ops:[`− $${fee} fee`,`× ${fmt(rate)} €/$`]},
  steps:[{t:`The fee comes off first: ${usd} − ${fee} = ${usd-fee} dollars are actually converted.`,f:'s1'},{t:`Multiply by euros per dollar: ${usd-fee} × ${fmt(rate)} = ${fmt(ans)} euros.`,f:'s2'},{t:`Converting first and subtracting the fee after would give ${fmt(usd*rate-fee)}, which is wrong: the fee is charged in dollars.`,f:'s2'}]}}});
def({id:'p14',sk:'ratio',dom:'psda',skill:'Ratios · part of a total',fmt:'spr',gen(r){const a=r.pick([2,3,5]),b=r.pick([3,4,7]),k=r.pick([3,4,5,6]),tot=(a+b)*k;
 return{text:`A painter mixes blue and yellow paint in the ratio ${a}:${b} to make a shade of green. How many liters of blue paint are needed to make ${tot} liters of the green paint?`,ans:a*k,ansText:`${a*k}`,
  viz:{type:'mixture',a:{label:'blue',amt:a*k,unit:'L',color:C.signal},b:{label:'yellow',amt:b*k,unit:'L',color:C.marker},ratio:[a,b],k},
  steps:[{t:`The ratio ${a}:${b} has ${a} + ${b} = ${a+b} equal parts in total.`,f:'ratio'},{t:`Each part is ${tot} ÷ ${a+b} = ${k} liters.`,f:'k'},{t:`Blue is ${a} parts: ${a} × ${k} = ${a*k} liters (yellow is ${b*k} L; ${a*k} + ${b*k} = ${tot} ✓).`,f:'k'}]}}});
def({id:'p15',sk:'pct',dom:'psda',skill:'Percentages · finding the original amount',fmt:'spr',gen(r){const orig=r.pick([40,60,75,80,120,150]),p=r.pick([15,20,25,30]),now=orig*(1+p/100);
 return{text:`After a ${p}% price increase, a concert ticket costs ${money(now)}. What was the price of the ticket, in dollars, before the increase? (Disregard the $ sign when entering your answer.)`,ans:orig,ansText:fmt(orig),
  viz:{type:'bars',ymax:Math.ceil(now*1.2/20)*20,bars:[{label:'before',value:orig,color:C.slate,fmt:money},{label:`after +${p}%`,value:now,color:C.signal,fmt:money}],diffLabel:`+${p}% of before`},
  steps:[{t:`A ${p}% increase means the new price is ${100+p}% of the original: ${fmt(1+p/100)} × original = ${fmt(now)}.`,f:'diff'},{t:`Divide, don't subtract ${p}%: original = ${fmt(now)} ÷ ${fmt(1+p/100)} = ${fmt(orig)}.`,f:0},{t:`Check: ${fmt(orig)} × ${fmt(1+p/100)} = ${fmt(now)}. (Taking ${p}% off ${fmt(now)} gives ${fmt(now*(1-p/100))}, a common wrong answer.)`,f:1}]}}});
def({id:'p16',sk:'pct',dom:'psda',skill:'Percentages · percent of a percent',fmt:'spr',gen(r){const p1=r.pick([40,50,60]),p2=r.pick([20,25,30,40]),N=r.pick([400,500,800,1000]);const ans=N*p1/100*p2/100;
 return{text:`At a high school with ${cm(N)} students, ${p1}% of the students are seniors, and ${p2}% of the seniors have a part-time job. How many seniors at the school have a part-time job?`,ans,ansText:cm(ans),
  viz:{type:'bars',ymax:N,bars:[{label:'all students',value:N,color:C.rule},{label:`seniors ${p1}%`,value:N*p1/100,color:C.signal},{label:`with jobs ${p2}%`,value:ans,color:C.check}]},
  steps:[{t:`Seniors: ${p1}% of ${cm(N)} = ${fmt(p1/100)} × ${cm(N)} = ${cm(N*p1/100)}.`,f:1},{t:`With jobs: ${p2}% of those ${cm(N*p1/100)} seniors = ${fmt(p2/100)} × ${cm(N*p1/100)} = ${cm(ans)}.`,f:2},{t:`Overall that is ${fmt(p1/100*p2/100*100)}% of the school, not ${p1+p2}% or ${p2}% of all students.`,f:2}]}}});
def({id:'p17',sk:'pct',dom:'psda',skill:'Percentages · commission',fmt:'spr',gen(r){const base=r.pick([1800,2000,2400,2500]),pc=r.pick([4,5,6,8]),sales=r.pick([15000,20000,25000,30000,40000]),earn=base+sales*pc/100;
 return{text:`A salesperson earns a base salary of ${money(base)} per month plus a commission of ${pc}% of her monthly sales. In one month she earned a total of ${money(earn)}. What were her sales that month, in dollars? (Disregard the $ sign when entering your answer.)`,ans:sales,ansText:cm(sales),
  viz:{type:'linegraph',xmax:50000,ymax:Math.ceil((base+50000*pc/100)/1000)*1000,xlabel:'sales ($)',ylabel:'earnings ($)',lines:[{m:pc/100,b:base,color:C.signal,label:`${base} + ${pc}% of sales`}],point:{x:sales,y:earn,label:`$${cm(sales)} → $${cm(earn)}`}},
  steps:[{t:`Earnings = base + ${pc}% of sales: ${cm(base)} + ${fmt(pc/100)}${V('s')} = ${cm(earn)}.`,f:'intercept'},{t:`Commission alone: ${cm(earn)} − ${cm(base)} = ${cm(earn-base)}.`,f:'slope'},{t:`${V('s')} = ${cm(earn-base)} ÷ ${fmt(pc/100)} = ${cm(sales)} dollars of sales.`,f:'point'}]}}});
def({id:'p18',sk:'pct',dom:'psda',skill:'Percentages · successive percent changes',fmt:'mc',gen(r){const p=r.pick([10,20,25]),N=r.pick([1000,2000,5000]);const after=N*(1+p/100)*(1-p/100);const net=Math.round((after/N-1)*1000)/10;
 const c=mc(r,`It decreased by ${fmt(Math.abs(net))}%`,[`It did not change`,`It increased by ${fmt(Math.abs(net))}%`,`It decreased by ${p}%`]);
 return{text:`The number of subscribers to a newsletter increased by ${p}% from January to February, and then decreased by ${p}% from February to March. How did the number of subscribers in March compare with the number in January?`,...c,
  viz:{type:'bars',ymax:Math.ceil(N*(1+p/100)*1.1/500)*500,bars:[{label:'January',value:N,color:C.slate,fmt:cm},{label:`Feb (+${p}%)`,value:N*(1+p/100),color:C.signal,fmt:cm},{label:`Mar (−${p}%)`,value:after,color:C.orange,fmt:cm}],note:`example with ${cm(N)} subscribers in January`},
  steps:[{t:`Suppose January had ${cm(N)}. February: ${cm(N)} × ${fmt(1+p/100)} = ${cm(N*(1+p/100))}.`,f:1},{t:`March: ${p}% of the larger February number is removed: ${cm(N*(1+p/100))} × ${fmt(1-p/100)} = ${cm(after)}.`,f:2},{t:`${cm(after)} ÷ ${cm(N)} = ${fmt(after/N,4)}: a net ${fmt(Math.abs(net))}% decrease. Up ${p}% then down ${p}% never returns to the start.`,f:'diff'}]}}});
def({id:'p19',sk:'one',dom:'psda',skill:'One-variable data · median from a dot plot',fmt:'spr',gen(r){const rr=rng(r.ri(1,1e9));const n=r.pick([11,13,15]);const vals=[];for(let i=0;i<n;i++)vals.push(rr.ri(0,7));const sorted=[...vals].sort((a,b)=>a-b);const med=sorted[(n-1)/2];
 return{text:`The dot plot shows the number of books read last month by each of the ${n} students in a reading club. What is the median number of books read?`,ans:med,ansText:`${med}`,
  viz:{type:'dotplot',vals,min:0,max:8,mark:'median',label:'books read'},
  steps:[{t:`The median is the middle value when the ${n} data values are in order.`},{t:`With ${n} values the middle one is the ${(n+1)/2}th: count dots from the left (${sorted.slice(0,4).join(', ')}, …) until you reach it.`,f:'median'},{t:`The ${(n+1)/2}th value is ${med}, so the median is ${med}. Counting columns instead of dots is the usual mistake.`,f:'median'}]}}});
def({id:'p20',sk:'one',dom:'psda',skill:'One-variable data · effect of an outlier on mean and median',fmt:'mc',gen(r){const rr=rng(r.ri(1,1e9));const vals=[];for(let i=0;i<9;i++)vals.push(rr.ri(20,30));vals.push(r.pick([55,60,65]));const sorted=[...vals].sort((a,b)=>a-b);const mean=vals.reduce((a,b)=>a+b,0)/10,med=(sorted[4]+sorted[5])/2;
 const c=mc(r,`The mean will decrease more than the median`,[`The median will decrease more than the mean`,`The mean and the median will decrease by the same amount`,`Neither the mean nor the median will change`]);
 return{text:`The dot plot shows the ages, in years, of 10 members of a community garden. If the oldest member, who is ${sorted[9]} years old, leaves the garden, how will the mean and median ages of the remaining members be affected?`,...c,
  viz:{type:'dotplot',vals,min:15,max:70,step:5,label:'ages',outNote:`mean ${fmt(mean,1)} → ${fmt((vals.reduce((a,b)=>a+b,0)-sorted[9])/9,1)};  median ${fmt(med,1)} → ${sorted[4]}`},
  steps:[{t:`The ${sorted[9]}-year-old is an outlier: far from the cluster of the other nine values.`,f:'outlier'},{t:`The mean uses every value, so removing ${sorted[9]} pulls it down: ${fmt(mean,1)} → ${fmt((vals.reduce((a,b)=>a+b,0)-sorted[9])/9,1)}.`,f:'mean'},{t:`The median only depends on the middle: it moves from ${fmt(med,1)} to ${sorted[4]}, barely at all. Outliers move the mean far more than the median.`,f:'median'}]}}});
def({id:'p21',sk:'one',dom:'psda',skill:'One-variable data · comparing spread (standard deviation)',fmt:'mc',gen(r){const rr=rng(r.ri(1,1e9));const A=[],B=[];for(let i=0;i<10;i++){A.push(rr.ri(9,11));B.push(rr.ri(4,16))}
 const c=mc(r,`The standard deviation of Class B is greater than that of Class A`,[`The standard deviation of Class A is greater than that of Class B`,`The standard deviations are equal because the means are about the same`,`The standard deviation cannot be compared from a dot plot`]);
 return{text:`The dot plots show the number of hours of sleep reported by 10 students in Class A and 10 students in Class B on the same night. Which statement about the standard deviations of the two data sets is true?`,...c,
  viz:{type:'dotplot',sets:[{vals:A,label:'Class A'},{vals:B,label:'Class B'}],min:2,max:18,step:2},
  steps:[{t:`Standard deviation measures how spread out values are around the mean; you don't need to compute it to compare.`,f:'spread0'},{t:`Class A's values are bunched within a couple of hours of 10.`,f:'spread0'},{t:`Class B's values are scattered from ${Math.min(...B)} to ${Math.max(...B)}, so Class B has the greater standard deviation.`,f:'spread1'}]}}});
def({id:'p22',sk:'one',dom:'psda',skill:'One-variable data · mean from a frequency table',fmt:'spr',gen(r){const fr=[r.ri(2,6),r.ri(3,8),r.ri(3,8),r.ri(1,5)];const tot=fr.reduce((a,b)=>a+b,0);const sum=fr.reduce((a,f,i)=>a+f*i,0);const ans=+(sum/tot).toFixed(2);
 return{text:`The table shows the number of pets owned by each of the ${tot} students in a class.<table><tr><th>Number of pets</th><td>0</td><td>1</td><td>2</td><td>3</td></tr><tr><th>Number of students</th>${fr.map(f=>`<td>${f}</td>`).join('')}</tr></table>What is the mean number of pets per student?`,ans,ansText:fmt(ans),tol:0.011,
  viz:{type:'bars',ymax:Math.ceil(Math.max(...fr)*1.3),bars:fr.map((f,i)=>({label:`${i} pet${i===1?'':'s'}`,value:f,color:C.signal,fmt:v=>fmt(v,0)})),note:'bar height = number of students'},
  steps:[{t:`Total pets = each value × its frequency: 0·${fr[0]} + 1·${fr[1]} + 2·${fr[2]} + 3·${fr[3]} = ${sum}.`,f:2},{t:`Total students = ${fr.join(' + ')} = ${tot} (not 4, the number of rows).`,f:'mean'},{t:`Mean = ${sum} ÷ ${tot} = ${fmt(ans)} pets per student.`,f:1}]}}});
def({id:'p23',sk:'one',dom:'psda',skill:'One-variable data · reading a histogram',fmt:'spr',gen(r){const fr=[r.ri(2,6),r.ri(4,10),r.ri(5,12),r.ri(3,8),r.ri(1,4)];const tot=fr.reduce((a,b)=>a+b,0);const ans=fr[3]+fr[4];const pct=Math.round(100*ans/tot);
 return{text:`The histogram shows the distribution of the number of minutes ${tot} customers waited in line at a bank. Each bar represents a 5-minute interval, and the intervals are 0–4, 5–9, 10–14, 15–19, and 20–24 minutes. How many customers waited 15 minutes or longer?`,ans,ansText:`${ans}`,
  viz:{type:'bars',ymax:Math.ceil(Math.max(...fr)*1.3),bars:fr.map((f,i)=>({label:`${5*i}–${5*i+4}`,value:f,color:i>=3?C.orange:C.signal,fmt:v=>fmt(v,0)})),note:'minutes waited (bar height = customers)'},
  steps:[{t:`"15 minutes or longer" means the last two bars: 15–19 and 20–24.`,f:3},{t:`Add their heights: ${fr[3]} + ${fr[4]} = ${ans} customers.`,f:4},{t:`As a share of all ${tot} customers that is about ${pct}%. A histogram gives counts per interval, never individual values.`,f:4}]}}});
def({id:'p24',sk:'two',dom:'psda',skill:'Two-variable data · predicting with a line of best fit',fmt:'spr',gen(r){const m=r.pick([1.5,2,2.5,3]),b=r.pick([10,12,15]),x=r.ri(4,9);const rr=rng(r.ri(1,1e9));const pts=[];for(let i=0;i<12;i++){const xx=+(rr.n()*10).toFixed(1);pts.push([xx,+(b+m*xx+(rr.n()-0.5)*5).toFixed(1)])}const y=b+m*x;
 return{text:`The scatterplot shows the relationship between the number of hours ${V('x')} a student studied and the score ${V('y')} on a quiz, with a line of best fit ${V('y')} = ${fmt(m)}${V('x')} + ${b}. Based on the line of best fit, what is the predicted quiz score for a student who studied ${x} hours?`,ans:y,ansText:fmt(y),
  viz:{type:'scatter',pts,m,b,xmax:10,ymax:Math.ceil((b+10*m+3)/10)*10,xlabel:'hours studied',ylabel:'quiz score',xunit:'hour',yunit:'points',point:{x,y}},
  steps:[{t:`A prediction from the line means plugging into the line's equation, ignoring the individual dots.`,f:'intercept'},{t:`${V('y')} = ${fmt(m)}(${x}) + ${b} = ${fmt(m*x)} + ${b}.`,f:'slope'},{t:`Predicted score: ${fmt(y)}.`,f:'point'}]}}});
def({id:'p25',sk:'two',dom:'psda',skill:'Two-variable data · residual (actual minus predicted)',fmt:'spr',gen(r){const m=r.pick([4,5,6]),b=r.pick([20,30,40]),x=r.ri(3,8),res=r.pick([-6,-4,-3,3,5,7]);const pred=b+m*x,act=pred+res;const rr=rng(r.ri(1,1e9));const pts=[];for(let i=0;i<10;i++){const xx=+(rr.n()*10).toFixed(1);pts.push([xx,+(b+m*xx+(rr.n()-0.5)*10).toFixed(1)])}pts.push([x,act]);
 return{text:`The scatterplot shows the daily high temperature ${V('x')}, in °C, and the number of smoothies ${V('y')} sold at a café, with line of best fit ${V('y')} = ${m}${V('x')} + ${b}. On a day when the high temperature was ${x}°C, the café sold ${act} smoothies. What is the difference between the actual number of smoothies sold and the number predicted by the line of best fit for that day? (A negative answer means fewer than predicted.)`,ans:res,ansText:`${res}`,
  viz:{type:'scatter',pts,m,b,xmax:10,ymax:Math.ceil((b+10*m+8)/10)*10,xlabel:'high temperature (°C)',ylabel:'smoothies sold',xunit:'°C',yunit:'smoothies',point:{x,y:pred,actual:act}},
  steps:[{t:`Predicted value from the line at ${V('x')} = ${x}: ${m}(${x}) + ${b} = ${pred}.`,f:'point'},{t:`Actual value that day: ${act}.`,f:'point'},{t:`Actual − predicted = ${act} − ${pred} = ${res}. The point sits ${Math.abs(res)} ${res<0?'below':'above'} the line.`,f:'point'}]}}});
def({id:'p26',sk:'two',dom:'psda',skill:'Two-variable data · linear or exponential from a table',fmt:'mc',gen(r){const a=r.pick([50,80,100,200]),k=r.pick([2,3,1.5]);const rows=[0,1,2,3].map(x=>[x,a*Math.pow(k,x)]);
 const c=mc(r,`Exponential, because ${V('y')} is multiplied by ${fmt(k)} each time ${V('x')} increases by 1`,[`Linear, because ${V('y')} increases each time ${V('x')} increases by 1`,`Linear, because ${V('y')} increases by ${rows[1][1]-rows[0][1]} each time ${V('x')} increases by 1`,`Exponential, because ${V('y')} increases by a growing amount each time`]);
 return{text:`The table shows the number of views ${V('y')} of a video ${V('x')} days after it was posted.<table><tr><th>x (days)</th>${rows.map(rw=>`<td>${rw[0]}</td>`).join('')}</tr><tr><th>y (views)</th>${rows.map(rw=>`<td>${cm(rw[1])}</td>`).join('')}</tr></table>Which of the following best describes the relationship between ${V('x')} and ${V('y')}, and why?`,...c,
  viz:{type:'growth',a,base:k,k:1,T:3,period:1,perLabel:'day',xlabel:'days',ylabel:'views',line:{m:rows[1][1]-rows[0][1],b:a,label:'if it were linear'},fmt:v=>cm(Math.round(v))},
  steps:[{t:`Linear: equal differences. Here the jumps are ${cm(rows[1][1]-rows[0][1])}, ${cm(rows[2][1]-rows[1][1])}, ${cm(rows[3][1]-rows[2][1])} — not constant.`,f:'compare'},{t:`Exponential: equal ratios. ${cm(rows[1][1])}/${cm(rows[0][1])} = ${fmt(k)}, ${cm(rows[2][1])}/${cm(rows[1][1])} = ${fmt(k)}, ${cm(rows[3][1])}/${cm(rows[2][1])} = ${fmt(k)}. Constant.`,f:'factor'},{t:`So ${V('y')} = ${a}·${SUP(fmt(k),V('x'))}, an exponential model. "Increasing by a growing amount" alone isn't the test; a constant ratio is.`,f:'end'}]}}});
def({id:'p27',sk:'two',dom:'psda',skill:'Two-variable data · interpreting the y-intercept',fmt:'mc',gen(r){const m=r.pick([8,10,12]),b=r.pick([40,50,60]);const rr=rng(r.ri(1,1e9));const pts=[];for(let i=0;i<12;i++){const xx=+(rr.n()*8).toFixed(1);pts.push([xx,+(b+m*xx+(rr.n()-0.5)*16).toFixed(1)])}
 const c=mc(r,`The predicted height of a plant that has received no fertilizer`,[`The predicted increase in height for each additional gram of fertilizer`,`The amount of fertilizer needed for a plant to grow ${b} cm`,`The maximum height a plant can reach`]);
 return{text:`The scatterplot shows the height ${V('y')}, in centimeters, of tomato plants and the amount of fertilizer ${V('x')}, in grams, each plant received. The line of best fit is ${V('y')} = ${m}${V('x')} + ${b}. Which of the following is the best interpretation of the ${V('y')}-intercept of the line of best fit?`,...c,
  viz:{type:'scatter',pts,m,b,xmax:8,ymax:Math.ceil((b+8*m+10)/20)*20,xlabel:'fertilizer (g)',ylabel:'height (cm)',xunit:'g',yunit:'cm'},
  steps:[{t:`The ${V('y')}-intercept is the value of ${V('y')} when ${V('x')} = 0: zero grams of fertilizer.`,f:'intercept'},{t:`Predicted height with no fertilizer: ${b} cm.`,f:'intercept'},{t:`The ${m} is the slope: about ${m} cm of extra height per gram. Different number, different meaning.`,f:'slope'}]}}});
def({id:'p28',sk:'prob',dom:'psda',skill:'Probability · "and" from a two-way table',fmt:'mc',gen(r){const a=r.ri(10,40),b=r.ri(10,40),cc=r.ri(10,40),d=r.ri(10,40);const tot=a+b+cc+d;
 const c=mc(r,frac(a,tot),[frac(a,a+b),frac(a,a+cc),frac(a+b,tot),frac(b,tot),frac(cc,tot)]);
 return{text:`The table shows how ${tot} customers at a car dealership paid for their vehicles.<table><tr><th></th><th>Financed</th><th>Paid in full</th></tr><tr><th>New car</th><td>${a}</td><td>${b}</td></tr><tr><th>Used car</th><td>${cc}</td><td>${d}</td></tr></table>If one of the ${tot} customers is selected at random, what is the probability that the customer bought a new car and financed it?`,...c,
  viz:{type:'table',rows:['New car','Used car'],cols:['Financed','Paid in full'],data:[[a,b],[cc,d]],caption:f=>f==='cell-0-0'?`new AND financed: ${a} customers`:f==='total'?`out of all ${tot} customers`:''},
  steps:[{t:`No condition is given ("one of the ${tot} customers"), so the denominator is the grand total ${tot}.`,f:'total'},{t:`"New car and financed" is a single cell: ${a}.`,f:'cell-0-0'},{t:`Probability = ${frac(a,tot)}. Dividing by a row or column total would answer a conditional question instead.`,f:'cell-0-0'}]}}});
def({id:'p29',sk:'prob',dom:'psda',skill:'Probability · complement (not an outcome)',fmt:'mc',gen(r){let rd=r.ri(3,7),bl=r.ri(2,6),gr=r.ri(1,5);while(rd===bl+gr||bl===gr||rd===bl||rd===gr){rd=r.ri(3,7);bl=r.ri(2,6);gr=r.ri(1,5)}const tot=rd+bl+gr;
 const c=mc(r,frac(bl+gr,tot),[frac(rd,tot),frac(bl,tot),frac(bl+gr,rd),frac(gr,tot),frac(rd,bl+gr)]);
 return{text:`A bag contains ${rd} red marbles, ${bl} blue marbles, and ${gr} green marbles, all the same size. If one marble is drawn at random, what is the probability that the marble is not red?`,...c,
  viz:{type:'bars',ymax:tot,bars:[{label:'red',value:rd,color:C.miss,fmt:v=>fmt(v,0)},{label:'blue',value:bl,color:C.signal,fmt:v=>fmt(v,0)},{label:'green',value:gr,color:C.check,fmt:v=>fmt(v,0)},{label:'not red',value:bl+gr,color:C.slate,fmt:v=>fmt(v,0)}],note:`${tot} marbles in the bag`},
  steps:[{t:`Total marbles = ${rd} + ${bl} + ${gr} = ${tot}.`,f:0},{t:`"Not red" counts blue and green: ${bl} + ${gr} = ${bl+gr} favorable outcomes.`,f:3},{t:`P(not red) = ${frac(bl+gr,tot)}. Equivalently 1 − P(red) = 1 − ${frac(rd,tot)}.`,f:3}]}}});
def({id:'p30',sk:'prob',dom:'psda',skill:'Conditional probability · given a column',fmt:'mc',gen(r){const a=r.ri(10,40),b=r.ri(10,40),cc=r.ri(10,40),d=r.ri(10,40);
 const c=mc(r,frac(b,b+d),[frac(b,a+b),frac(b,a+b+cc+d),frac(d,b+d),frac(a,a+cc)]);
 return{text:`The table shows the results of a survey of ${a+b+cc+d} people about whether they prefer coffee or tea, by age group.<table><tr><th></th><th>Coffee</th><th>Tea</th></tr><tr><th>Under 30</th><td>${a}</td><td>${b}</td></tr><tr><th>30 and over</th><td>${cc}</td><td>${d}</td></tr></table>If a person who prefers tea is selected at random, what is the probability that the person is under 30?`,...c,
  viz:{type:'table',rows:['Under 30','30 and over'],cols:['Coffee','Tea'],data:[[a,b],[cc,d]],caption:f=>f==='col-1'?`"prefers tea" → only this column (${b+d} people)`:f==='cell-0-1'?`tea drinkers under 30: ${b}`:''},
  steps:[{t:`"Prefers tea" is the given condition, so restrict to the Tea column: ${b} + ${d} = ${b+d} people.`,f:'col-1'},{t:`Of those, ${b} are under 30.`,f:'cell-0-1'},{t:`P(under 30 | tea) = ${frac(b,b+d)}. Note this differs from P(tea | under 30) = ${frac(b,a+b)}.`,f:'cell-0-1'}]}}});
def({id:'p31',sk:'prob',dom:'psda',skill:'Probability · expected count from a probability',fmt:'spr',gen(r){const p=r.pick([0.15,0.2,0.35,0.4,0.65]),n=r.pick([200,300,400,500]);const ans=p*n;
 return{text:`Based on past data, the probability that a randomly selected customer at a bakery buys a croissant is ${fmt(p)}. If ${n} customers visit the bakery on Saturday, how many of them are expected to buy a croissant?`,ans,ansText:cm(ans),
  viz:{type:'bars',ymax:n,bars:[{label:'customers',value:n,color:C.rule,fmt:v=>fmt(v,0)},{label:`buy a croissant (${fmt(p)})`,value:ans,color:C.signal,fmt:v=>fmt(v,0)},{label:'do not',value:n-ans,color:C.slate,fmt:v=>fmt(v,0)}]},
  steps:[{t:`Probability ${fmt(p)} means about ${fmt(p*100)}% of customers, in the long run.`,f:0},{t:`Expected number = probability × number of trials = ${fmt(p)} × ${n}.`,f:1},{t:`= ${cm(ans)} customers. (The rest, ${cm(n-ans)}, are expected not to buy one.)`,f:2}]}}});
def({id:'p32',sk:'infer',dom:'psda',skill:'Inference · estimating a population count from a sample',fmt:'spr',gen(r){const n=r.pick([200,250,400,500]),p=r.pick([0.3,0.36,0.45,0.6,0.72]),N=r.pick([6000,8000,12000,15000]);const ans=p*N;
 return{text:`A random sample of ${n} residents of a city with ${cm(N)} residents was surveyed, and ${fmt(p*100)}% of those surveyed said they use public transit at least once a week. Based on the survey, about how many residents of the city use public transit at least once a week?`,ans,ansText:cm(ans),
  viz:{type:'sample',N,n,p,what:'use transit',seed:r.ri(1,999),est:`${fmt(p*100)}% of ${cm(N)} ≈ ${cm(ans)}`},
  steps:[{t:`Because the sample was random, its proportion is a fair estimate of the population proportion.`,f:'random'},{t:`Sample proportion: ${fmt(p*100)}% = ${fmt(p)}.`,f:'estimate'},{t:`Apply it to the whole city: ${fmt(p)} × ${cm(N)} ≈ ${cm(ans)} residents.`,f:'estimate'}]}}});
def({id:'p33',sk:'infer',dom:'psda',skill:'Inference · interpreting a margin of error',fmt:'mc',gen(r){const mean=r.pick([6.4,7.2,7.8,8.5]),moe=r.pick([0.3,0.4,0.5]);const lo=+(mean-moe).toFixed(1),hi=+(mean+moe).toFixed(1);
 const c=mc(r,`It is plausible that the mean sleep time of all students at the school is between ${lo} and ${hi} hours`,[`Every student at the school sleeps between ${lo} and ${hi} hours per night`,`Exactly ${fmt(mean)} hours is the mean sleep time of all students at the school`,`${fmt(moe*100)}% of the students in the sample sleep less than ${fmt(mean)} hours`]);
 return{text:`A random sample of students at a large school was asked how many hours they sleep on a school night. The sample mean was ${fmt(mean)} hours, with an associated margin of error of ${fmt(moe)} hours. Which of the following is the most appropriate conclusion?`,...c,
  viz:{type:'sample',N:2000,n:150,p:null,seed:r.ri(1,999),interval:[lo,hi,'hours']},
  steps:[{t:`A margin of error describes uncertainty about the population mean, not the spread of individual students.`,f:'random'},{t:`Plausible range for the true mean: ${fmt(mean)} ± ${fmt(moe)}, i.e. ${lo} to ${hi} hours.`,f:'interval'},{t:`The sample mean is only an estimate; the population mean could be anywhere in that interval, not "exactly ${fmt(mean)}".`,f:'interval'}]}}});
def({id:'p34',sk:'infer',dom:'psda',skill:'Inference · sample size and margin of error',fmt:'mc',gen(r){const n=r.pick([100,200,250]),p=r.pick([0.4,0.55,0.6]);
 const c=mc(r,`Selecting a larger random sample`,[`Selecting a smaller random sample`,`Surveying only voters who are easy to reach`,`Asking the question a second time to the same ${n} voters`]);
 return{text:`A polling organization selected a random sample of ${n} voters in a county and found that ${fmt(p*100)}% support a ballot measure, with a margin of error of ${n===100?'10':n===200?'7':'6'} percentage points. Which of the following would most likely decrease the margin of error?`,...c,
  viz:{type:'sample',N:5000,n:n*4,p,what:'support',seed:r.ri(1,999),interval:[+(p*100-(n===100?10:n===200?7:6)/2).toFixed(1),+(p*100+(n===100?10:n===200?7:6)/2).toFixed(1),'%'],note:'a bigger random sample → a narrower interval'},
  steps:[{t:`Margin of error shrinks as the random sample gets larger: more data, less uncertainty.`,f:'random'},{t:`The picture shows a sample four times as large; the interval around ${fmt(p*100)}% is about half as wide.`,f:'interval'},{t:`Non-random samples (easy-to-reach voters) add bias without reducing the margin of error; re-asking the same people adds no new information.`,f:'note'}]}}});
def({id:'p35',sk:'claims',dom:'psda',skill:'Evaluating statistical claims · generalizing from a random sample',fmt:'mc',gen(r){const pl=r.pick(['the students at Lincoln High School','the residents of Oak County','the members of a fitness club']),n=r.pick([100,150,200]);
 const c=mc(r,`The conclusion can be generalized to all ${pl}`,[`The conclusion can be generalized to all people in the state`,`The conclusion applies only to the ${n} people who were surveyed`,`No conclusion can be drawn because ${n} is too small a sample`]);
 return{text:`A researcher selected ${n} of ${pl} at random and asked whether they exercise at least three times per week. Of those selected, 58% said yes. Which of the following is the most appropriate conclusion about the population from which the sample was drawn?`,...c,
  viz:{type:'sample',N:3000,n,p:0.58,what:'exercise 3+ times/week',seed:r.ri(1,999),est:'random sample → generalizes to its population'},
  steps:[{t:`The sample was chosen at random from a specific population: ${pl}.`,f:'random'},{t:`Random selection makes the sample representative, so the 58% estimate generalizes to that whole population (with some margin of error).`,f:'estimate'},{t:`It does not extend to a broader group the sample wasn't drawn from, and ${n} random people is plenty to estimate a proportion.`,f:'estimate'}]}}});
def({id:'p36',sk:'claims',dom:'psda',skill:'Evaluating statistical claims · experiment vs. observation',fmt:'mc',gen(r){const n=r.pick([80,100,120]);
 const c=mc(r,`The new fertilizer causes tomato plants to grow taller than the standard fertilizer does, for plants like those in the study`,[`The new fertilizer causes all plants to grow taller than the standard fertilizer does`,`Taller plants are more likely to have been given the new fertilizer, but no cause-and-effect conclusion can be drawn`,`The difference in heights must be due to chance because the plants were assigned randomly`]);
 return{text:`A gardener has ${n} tomato plants of the same variety. She randomly assigns half of the plants to receive a new fertilizer and half to receive a standard fertilizer, keeping all other conditions the same. After eight weeks, the plants with the new fertilizer are, on average, significantly taller. Which conclusion is best supported by these results?`,...c,
  viz:{type:'sample',N:n,n:n/2,p:0.5,what:'random assignment → two groups',seed:r.ri(1,999),est:'random assignment → cause and effect'},
  steps:[{t:`Random assignment of treatments (not just random selection) is what allows a cause-and-effect conclusion.`,f:'random'},{t:`Only the fertilizer differed between the groups, so the height difference can be attributed to the fertilizer.`,f:'estimate'},{t:`The plants were not randomly selected from all plants everywhere, so the conclusion applies to plants like these, not "all plants".`,f:'estimate'}]}}});

/* ======== STATISTICS & DATA ANALYSIS (expanded) ======== */
def({id:'p37',sk:'one',dom:'psda',skill:'One-variable data · correcting a value changes the mean',fmt:'spr',difficulty:'Medium',gen(r){const n=r.pick([6,8,10]),oldMean=r.pick([68,72,75,80]),rise=r.pick([1,2]),recorded=r.pick([48,54,60,64]),correct=recorded+n*rise,newMean=oldMean+rise;
 return{text:`The mean of ${n} daily quality-control measurements was calculated as ${oldMean}. One measurement was recorded as ${recorded}, but the correct measurement was ${correct}. What is the correct mean of the ${n} measurements?`,ans:newMean,ansText:`${newMean}`,
  viz:{type:'pipeline',stages:[{label:'recorded total',value:`${n} × ${oldMean} = ${n*oldMean}`},{label:'correct total',value:`−${recorded} + ${correct}`},{label:'correct mean',value:`${newMean}`}],ops:['replace value',`÷ ${n}`]},
  steps:[{t:`The recorded total was ${n} × ${oldMean} = ${n*oldMean}.`,f:'s0'},{t:`Replace ${recorded} with ${correct}: the total increases by ${correct-recorded}, from ${n*oldMean} to ${n*oldMean+correct-recorded}.`,f:'s1'},{t:`Correct mean = ${n*oldMean+correct-recorded} ÷ ${n} = ${newMean}.`,f:'s2'}]}}});

def({id:'p38',sk:'one',dom:'psda',skill:'One-variable data · combined weighted mean',fmt:'spr',difficulty:'Hard',gen(r){const z=r.pick([{n1:12,a:72,n2:18,b:82},{n1:15,a:68,n2:25,b:80},{n1:20,a:74,n2:30,b:84},{n1:18,a:70,n2:12,b:85}]),total=z.n1*z.a+z.n2*z.b,ans=total/(z.n1+z.n2);
 return{text:`At a museum, ${z.n1} morning visitors spent an average of ${z.a} minutes inside, and ${z.n2} afternoon visitors spent an average of ${z.b} minutes inside. What was the mean visit time, in minutes, for all ${z.n1+z.n2} visitors?`,ans,ansText:fmt(ans),tol:.011,
  viz:{type:'bars',ymax:100,bars:[{label:`morning (${z.n1})`,value:z.a,color:C.signal},{label:`afternoon (${z.n2})`,value:z.b,color:C.orange}],line:{value:ans,label:`combined mean ${fmt(ans)}`},note:'group sizes determine the weights'},
  steps:[{t:`Morning total = ${z.n1} × ${z.a} = ${z.n1*z.a} visitor-minutes.`,f:0},{t:`Afternoon total = ${z.n2} × ${z.b} = ${z.n2*z.b} visitor-minutes.`,f:1},{t:`Combined mean = (${z.n1*z.a} + ${z.n2*z.b}) ÷ ${z.n1+z.n2} = ${fmt(ans)} minutes. Do not simply average ${z.a} and ${z.b} because the groups have different sizes.`,f:'mean'}]}}});

def({id:'p39',sk:'one',dom:'psda',skill:'One-variable data · missing value from a mean',fmt:'spr',difficulty:'Medium',gen(r){const n=6,mean=r.pick([28,32,36,40,45]),offsets=r.pick([[-8,-3,1,4,7],[-6,-2,3,5,9],[-9,-4,0,6,8]]),known=r.shuffle(offsets.map(x=>mean+x)),ans=n*mean-known.reduce((a,b)=>a+b,0),vals=[...known,ans];
 return{text:`A wildlife researcher recorded six turtle shell lengths, in centimeters. Five of the lengths were ${known.join(', ')}, and the sixth length was not shown. If the mean of all six lengths was ${mean} centimeters, what was the sixth length?`,ans,ansText:`${ans}`,
  viz:{type:'bars',ymax:Math.ceil(Math.max(...vals)*1.2/10)*10,bars:vals.map((x,i)=>({label:i<5?`known ${i+1}`:'missing',value:x,color:i<5?C.signal:C.check}))},
  steps:[{t:`A mean of ${mean} for 6 values requires a total of 6 × ${mean} = ${6*mean}.`,f:'mean'},{t:`The five known lengths total ${known.join(' + ')} = ${known.reduce((a,b)=>a+b,0)}.`,f:0},{t:`Missing length = ${6*mean} − ${known.reduce((a,b)=>a+b,0)} = ${ans} centimeters.`,f:5}]}}});

def({id:'p40',sk:'one',dom:'psda',skill:'One-variable data · median of an even-sized data set',fmt:'spr',difficulty:'Medium',gen(r){const base=r.pick([8,12,18]),off=r.pick([[0,1,2,3,3,4,5,6,7,8,9,11],[0,0,1,2,4,5,7,7,8,10,10,12],[0,2,2,3,4,6,7,9,9,10,11,13]]),vals=off.map(x=>base+x),ans=(vals[5]+vals[6])/2;
 return{text:`The dot plot shows the number of minutes required for each of 12 service calls at a repair center. What is the median service time, in minutes?`,ans,ansText:fmt(ans),tol:.011,
  viz:{type:'dotplot',vals,min:base,max:base+14,label:'service time (minutes)',mark:'median'},
  steps:[{t:`There are 12 values, so the median is halfway between the 6th and 7th values after ordering the data.`},{t:`The two middle values are ${vals[5]} and ${vals[6]}.`,f:'median'},{t:`Median = (${vals[5]} + ${vals[6]}) ÷ 2 = ${fmt(ans)} minutes.`,f:'median'}]}}});

def({id:'p41',sk:'one',dom:'psda',skill:'One-variable data · effect of correcting an outlier',fmt:'mc',difficulty:'Medium',gen(r){const base=r.pick([20,30,40]),vals=[base,base+2,base+3,base+4,base+5,base+6,base+8],old=base+12,correct=old+21,n=8,oldVals=[...vals,old],newVals=[...vals,correct],meanRise=(correct-old)/n;
 const c=mc(r,`The mean increases by ${fmt(meanRise)} and the median stays the same`,[`The median increases by ${fmt(meanRise)} and the mean stays the same`,`Both the mean and median increase by ${fmt(meanRise)}`,`Neither the mean nor the median changes`]);
 return{text:`Eight package weights were recorded. The greatest weight was entered as ${old} grams but should have been ${correct} grams. No other value changes. How do the corrected mean and median compare with the originally calculated mean and median?`,...c,
  viz:{type:'dotplot',sets:[{label:'recorded',vals:oldVals},{label:'corrected',vals:newVals}],min:base-2,max:correct+2,step:5,outNote:`mean +${fmt(meanRise)}; median unchanged`},
  steps:[{t:`The total increases by ${correct} − ${old} = ${correct-old}, so the mean increases by ${correct-old} ÷ ${n} = ${fmt(meanRise)}.`,f:'mean'},{t:`Only the greatest value changes. The two middle positions—and therefore the median—do not change.`,f:'median1'},{t:`The corrected mean increases by ${fmt(meanRise)}, while the median stays the same.`,f:'outlier'}]}}});

def({id:'p42',sk:'one',dom:'psda',skill:'One-variable data · adding a constant and standard deviation',fmt:'mc',difficulty:'Hard',gen(r){const m=r.pick([10,15,20]),shift=r.pick([5,8,12]),A=[m-3,m-2,m-1,m,m+1,m+2,m+3],B=A.map(x=>x+shift);
 const c=mc(r,`The mean of B is ${shift} greater than the mean of A, and the standard deviations are equal`,[`The means are equal, and the standard deviation of B is ${shift} greater`,`Both the mean and standard deviation of B are ${shift} greater`,`The mean and standard deviation of B are both ${shift} times those of A`]);
 return{text:`Data set B is created by adding ${shift} to every value in data set A. Which statement correctly compares the means and standard deviations of the two data sets?`,...c,
  viz:{type:'dotplot',sets:[{label:'Data set A',vals:A},{label:`Data set B = A + ${shift}`,vals:B}],min:m-5,max:m+shift+5,step:2},
  steps:[{t:`Adding ${shift} moves every value—and the center—${shift} units to the right. Thus mean(B) = mean(A) + ${shift}.`,f:'mean'},{t:`Every value stays the same distance from its own mean, so the spread does not change.`,f:'spread1'},{t:`Therefore the standard deviations are equal even though the means differ by ${shift}.`,f:'spread0'}]}}});

def({id:'p43',sk:'one',dom:'psda',skill:'One-variable data · scaling a standard deviation',fmt:'spr',difficulty:'Hard',gen(r){const sd=r.pick([0.4,0.6,0.8,1.2,1.5]),factor=10,ans=sd*factor;
 return{text:`The standard deviation of a set of plant heights is ${fmt(sd)} centimeters. The same heights are converted to millimeters by multiplying every value by ${factor}. What is the standard deviation, in millimeters, of the converted data?`,ans,ansText:fmt(ans),tol:.011,
  viz:{type:'pipeline',stages:[{label:'spread in cm',value:`SD = ${fmt(sd)} cm`},{label:'convert every value',value:`× ${factor}`},{label:'spread in mm',value:`SD = ${fmt(ans)} mm`}],ops:['scale data','scale spread']},
  steps:[{t:`Multiplying every data value by ${factor} multiplies every distance from the mean by ${factor}.`,f:'s0'},{t:`Standard deviation measures those distances, so it is multiplied by the same factor.`,f:'s1'},{t:`${fmt(sd)} × ${factor} = ${fmt(ans)} millimeters.`,f:'s2'}]}}});

def({id:'p44',sk:'one',dom:'psda',skill:'One-variable data · equal means and different standard deviations',fmt:'mc',difficulty:'Medium',gen(r){const m=r.pick([12,18,24]),A=[m-2,m-1,m,m,m+1,m+2],B=[m-6,m-3,m,m,m+3,m+6];
 const c=mc(r,`The two means are equal, and data set B has the greater standard deviation`,[`The two means are equal, and data set A has the greater standard deviation`,`Data set B has the greater mean, and the standard deviations are equal`,`Both the means and the standard deviations are equal`]);
 return{text:`The dot plots show delivery delays, in minutes, for two shipping routes. Which statement correctly compares the means and standard deviations of the two distributions?`,...c,
  viz:{type:'dotplot',sets:[{label:'Route A',vals:A},{label:'Route B',vals:B}],min:m-8,max:m+8,step:2},
  steps:[{t:`Both distributions balance around ${m}, so both means are ${m}.`,f:'mean'},{t:`Route A stays close to ${m}; Route B extends much farther on both sides.`,f:'spread0'},{t:`Greater distance from the mean means greater standard deviation, so Route B has the greater standard deviation.`,f:'spread1'}]}}});

def({id:'p45',sk:'one',dom:'psda',skill:'One-variable data · comparing medians and interquartile ranges',fmt:'mc',difficulty:'Hard',gen(r){const k=r.pick([0,5,10]),A={label:'Store A',min:35+k,q1:45+k,med:56+k,q3:69+k,max:82+k,color:C.signal},B={label:'Store B',min:48+k,q1:57+k,med:64+k,q3:71+k,max:80+k,color:C.orange};
 const c=mc(r,`Store B has the greater median, and Store A has the greater interquartile range`,[`Store A has the greater median, and Store B has the greater interquartile range`,`Store B has both the greater median and the greater interquartile range`,`Store A has both the greater median and the greater interquartile range`]);
 return{text:`The box plots summarize the amounts, in dollars, spent by customers at two stores. Which statement correctly compares the distributions?`,...c,
  viz:{type:'boxplot',sets:[A,B],min:30+k,max:90+k,unit:'dollars',compare:`medians: ${A.med} vs ${B.med}; IQRs: ${A.q3-A.q1} vs ${B.q3-B.q1}`},
  steps:[{t:`The median is the line inside each box: ${A.med} for Store A and ${B.med} for Store B. Store B has the greater median.`,f:'median1'},{t:`IQR = Q3 − Q1. Store A: ${A.q3} − ${A.q1} = ${A.q3-A.q1}; Store B: ${B.q3} − ${B.q1} = ${B.q3-B.q1}.`,f:'iqr0'},{t:`Store B has the greater median, while Store A has the greater interquartile range.`,f:'compare'}]}}});

def({id:'p46',sk:'one',dom:'psda',skill:'One-variable data · interquartile range from a box plot',fmt:'spr',difficulty:'Easy',gen(r){const q1=r.pick([18,24,30,36]),iqr=r.pick([12,16,20]),q3=q1+iqr,med=q1+Math.floor(iqr/2),s={label:'Commute times',min:q1-8,q1,med,q3,max:q3+10,color:C.signal};
 return{text:`A box plot summarizes the commute times, in minutes, for employees at a company. The first quartile is ${q1} minutes and the third quartile is ${q3} minutes. What is the interquartile range, in minutes?`,ans:iqr,ansText:`${iqr}`,
  viz:{type:'boxplot',sets:[s],min:q1-12,max:q3+14,unit:'minutes'},
  steps:[{t:`The interquartile range measures the width of the middle 50% of the data.`},{t:`IQR = Q3 − Q1 = ${q3} − ${q1}.`,f:'iqr'},{t:`The interquartile range is ${iqr} minutes. The whiskers are not used in this calculation.`,f:'iqr'}]}}});

def({id:'p47',sk:'one',dom:'psda',skill:'One-variable data · range after correcting the maximum',fmt:'spr',difficulty:'Medium',gen(r){const lo=r.pick([10,14,18]),vals=[lo,lo+2,lo+5,lo+7,lo+9,lo+12],wrong=lo+28,correct=lo+18,newVals=[...vals,correct],ans=correct-lo;
 return{text:`Seven rainfall measurements, in millimeters, were ${vals.join(', ')}, and ${wrong}. The value ${wrong} was a recording error and should have been ${correct}. What is the range of the corrected data set?`,ans,ansText:`${ans}`,
  viz:{type:'dotplot',vals:newVals,min:lo-2,max:wrong+2,step:5,label:'corrected rainfall (mm)'},
  steps:[{t:`Range = maximum − minimum.`},{t:`After the correction, the minimum is ${lo} and the maximum is ${correct}.`,f:'spread'},{t:`Corrected range = ${correct} − ${lo} = ${ans} millimeters.`,f:'spread'}]}}});

def({id:'p48',sk:'one',dom:'psda',skill:'One-variable data · choosing mean or median for a skewed distribution',fmt:'mc',difficulty:'Medium',gen(r){const base=r.pick([220,260,300]),vals=[base,base+15,base+25,base+35,base+45,base+60,base+75,base+90,base+650];
 const c=mc(r,`The median, because the unusually expensive home pulls the mean upward`,[`The mean, because the mean is always the best measure of a typical value`,`The mean, because the unusually expensive home does not affect it`,`The median, because the median includes the exact value of every home`]);
 return{text:`Nine homes in a neighborhood sold for prices represented in the dot plot, in thousands of dollars. One luxury home sold for much more than the other eight. Which measure better represents the price of a typical home in this neighborhood, and why?`,...c,
  viz:{type:'dotplot',vals,min:base-20,max:base+700,step:100,label:'sale price ($ thousands)',outNote:'high outlier pulls the mean upward'},
  steps:[{t:`The luxury-home price is a high outlier, far from the cluster of the other prices.`,f:'outlier'},{t:`The mean uses every price, so the outlier pulls the mean upward.`,f:'mean'},{t:`The median depends on the middle position and is resistant to the outlier, so it better represents a typical home here.`,f:'median'}]}}});

def({id:'p49',sk:'two',dom:'psda',skill:'Two-variable data · interpreting the sign of a residual',fmt:'mc',difficulty:'Medium',gen(r){const m=r.pick([3,4,5]),b=r.pick([20,30,40]),x=r.pick([4,6,8]),res=r.pick([5,7,9]),pred=m*x+b,actual=pred+res,pts=[[1,b+m+1],[2,b+2*m-2],[3,b+3*m+2],[x,actual],[9,b+9*m-1]];
 const c=mc(r,`The actual value is ${res} greater than the value predicted by the model`,[`The predicted value is ${res} greater than the actual value`,`The actual value is ${res} times the predicted value`,`The model's slope is ${res}`]);
 return{text:`A model predicts weekly attendance ${V('y')} at a community event from advertising hours ${V('x')} using ${V('y')} = ${m}${V('x')} + ${b}. For one week, ${V('x')} = ${x} and the residual was ${res}. What does this positive residual mean?`,...c,
  viz:{type:'scatter',pts,m,b,xmax:10,ymax:b+10*m+12,xlabel:'advertising hours',ylabel:'attendance',point:{x,y:pred,actual}},
  steps:[{t:`Residual = actual − predicted. A positive residual means the point is above the line.`,f:'point'},{t:`At ${V('x')} = ${x}, predicted attendance is ${m}(${x}) + ${b} = ${pred}.`,f:'point'},{t:`Actual attendance is ${pred} + ${res} = ${actual}, which is ${res} greater than predicted.`,f:'point'}]}}});

def({id:'p50',sk:'two',dom:'psda',skill:'Two-variable data · finding an actual value from a residual',fmt:'spr',difficulty:'Medium',gen(r){const m=r.pick([2,3,4]),b=r.pick([15,20,25]),x=r.pick([5,6,8]),res=r.pick([-7,-5,4,6]),pred=m*x+b,actual=pred+res,pts=[[1,b+m+2],[3,b+3*m-1],[x,actual],[9,b+9*m+2]];
 return{text:`A line of best fit predicts the number of calls ${V('y')} to a help desk from the hour ${V('x')} using ${V('y')} = ${m}${V('x')} + ${b}. At ${V('x')} = ${x}, the residual is ${res}. What is the actual number of calls at that hour?`,ans:actual,ansText:`${actual}`,
  viz:{type:'scatter',pts,m,b,xmax:10,ymax:b+10*m+10,xlabel:'hour',ylabel:'help-desk calls',point:{x,y:pred,actual}},
  steps:[{t:`Predicted value: ${m}(${x}) + ${b} = ${pred}.`,f:'point'},{t:`Residual = actual − predicted, so actual = predicted + residual.`,f:'point'},{t:`Actual = ${pred} + (${res}) = ${actual} calls.`,f:'point'}]}}});

def({id:'p51',sk:'two',dom:'psda',skill:'Two-variable data · finding a predicted value from a residual',fmt:'spr',difficulty:'Hard',gen(r){const x=r.pick([3,5,7]),actual=r.pick([42,48,55,62]),res=r.pick([-6,-4,5,8]),pred=actual-res,m=r.pick([3,4]),b=pred-m*x,pts=[[1,b+m+1],[x,actual],[8,b+8*m-2]];
 return{text:`For a delivery route, a linear model has a residual of ${res} minutes on a day when the actual delivery time was ${actual} minutes. What delivery time, in minutes, did the model predict for that day?`,ans:pred,ansText:`${pred}`,
  viz:{type:'scatter',pts,m,b,xmax:9,ymax:Math.max(actual,pred,b+9*m)+8,xlabel:'route index',ylabel:'delivery time (minutes)',point:{x,y:pred,actual}},
  steps:[{t:`Residual = actual − predicted.`},{t:`${res} = ${actual} − predicted, so predicted = ${actual} − (${res}).`,f:'point'},{t:`The model predicted ${pred} minutes.`,f:'point'}]}}});

def({id:'p52',sk:'two',dom:'psda',skill:'Two-variable data · smallest absolute residual',fmt:'mc',difficulty:'Medium',gen(r){const residuals=r.shuffle([8,-2,5,-6]),pred=[42,48,51,57],actual=pred.map((x,i)=>x+residuals[i]),best=residuals.reduce((k,x,i)=>Math.abs(x)<Math.abs(residuals[k])?i:k,0),labels=['Week 1','Week 2','Week 3','Week 4'];
 const c=mc(r,labels[best],labels.filter((_,i)=>i!==best));
 return{text:`A shipping model produced the predicted and actual package counts shown in the table.<table><tr><th></th>${labels.map(x=>`<th>${x}</th>`).join('')}</tr><tr><th>Predicted</th>${pred.map(x=>`<td>${x}</td>`).join('')}</tr><tr><th>Actual</th>${actual.map(x=>`<td>${x}</td>`).join('')}</tr></table>For which week is the model's prediction closest to the actual count?`,...c,
  viz:{type:'residuals',pts:residuals.map((y,i)=>[i+1,y]),labels,xmax:5,rmax:10,xlabel:'week',ylabel:'actual − predicted',point:best},
  steps:[{t:`Calculate residual = actual − predicted for each week: ${residuals.map((x,i)=>`${labels[i]}: ${x>0?'+':''}${x}`).join('; ')}.`,f:'zero'},{t:`"Closest" means the smallest absolute residual.`,f:'closest'},{t:`${labels[best]} has |residual| = ${Math.abs(residuals[best])}, the smallest of the four.`,f:'point'}]}}});

def({id:'p53',sk:'two',dom:'psda',skill:'Two-variable data · evaluating a linear model from residuals',fmt:'mc',difficulty:'Hard',gen(r){const k=r.pick([1,1.5,2]),raw=[1,-2,2,-1,0,1,-1,2,-2,1],pts=raw.map((y,i)=>[i+1,y*k]);
 const c=mc(r,`A linear model is reasonable because the residuals are scattered around zero without a clear pattern`,[`A linear model is unreasonable because some residuals are positive`,`An exponential model is required because the residuals cross zero`,`No model can be evaluated unless every residual equals zero`]);
 return{text:`The residual plot was created after a linear model was fitted to data relating a machine's age to its maintenance cost. Which conclusion is best supported by the residual plot?`,...c,
  viz:{type:'residuals',pts,xmax:11,rmax:5,xlabel:'machine age',ylabel:'cost residual',pattern:'random',note:'no systematic pattern around zero'},
  steps:[{t:`The zero line separates observations above and below the model's prediction.`,f:'zero'},{t:`The residuals alternate around zero with no curve or widening pattern.`,f:'pattern'},{t:`Random scatter around zero supports using a linear model. Residuals need not all equal zero.`,f:'pattern'}]}}});

def({id:'p54',sk:'two',dom:'psda',skill:'Two-variable data · recognizing curvature in a residual plot',fmt:'mc',difficulty:'Hard',gen(r){const scale=r.pick([1,1.5]),raw=[6,3,1,-1,-2,-1,1,3,6],pts=raw.map((y,i)=>[i+1,y*scale]);
 const c=mc(r,`The curved residual pattern indicates that a nonlinear model may fit better`,[`The linear model is ideal because positive and negative residuals both appear`,`The residual pattern proves that the variables have no relationship`,`The line should be kept because the largest residuals occur at the ends`]);
 return{text:`A researcher used a linear model for the relationship between the concentration of a solution and its reaction time. The residual plot is shown. Which conclusion is most appropriate?`,...c,
  viz:{type:'residuals',pts,xmax:10,rmax:10,xlabel:'concentration',ylabel:'time residual',pattern:'curve',curveA:.38*scale,center:5,curveC:-2*scale,note:'U-shaped residuals reveal missed curvature'},
  steps:[{t:`A useful linear model should leave residuals randomly scattered around zero.`,f:'zero'},{t:`Here the residuals are positive at both ends and negative in the middle: a clear U-shaped pattern.`,f:'pattern'},{t:`That structure remains unexplained by the line, so a nonlinear model may fit better.`,f:'pattern'}]}}});

def({id:'p55',sk:'two',dom:'psda',skill:'Two-variable data · comparing models by residual size',fmt:'mc',difficulty:'Hard',gen(r){const A=[2,-1,1,-2,0],B=[6,-5,7,-4,5],maeA=A.reduce((s,x)=>s+Math.abs(x),0)/A.length,maeB=B.reduce((s,x)=>s+Math.abs(x),0)/B.length;
 const c=mc(r,`Model A, because its residuals are closer to zero overall`,[`Model B, because its residuals have larger absolute values`,`Model A, because all of its residuals are positive`,`The models fit equally well because each has five residuals`]);
 return{text:`Two models were used to predict water use for the same five households. Model A produced residuals ${A.join(', ')}, and Model B produced residuals ${B.join(', ')}. Which model fits these observations better, and why?`,...c,
  viz:{type:'bars',ymax:7,bars:[{label:'Model A',value:maeA,color:C.signal},{label:'Model B',value:maeB,color:C.orange}],note:'mean absolute residual (smaller is better)'},
  steps:[{t:`Compare distance from zero, so use absolute residuals rather than allowing positive and negative errors to cancel.`},{t:`Model A mean absolute residual = (${A.map(Math.abs).join(' + ')}) ÷ 5 = ${fmt(maeA)}.`,f:0},{t:`Model B's is ${fmt(maeB)}, so Model A's predictions are closer overall.`,f:1}]}}});

def({id:'p56',sk:'two',dom:'psda',skill:'Two-variable data · overprediction and underprediction',fmt:'mc',difficulty:'Medium',gen(r){const m=r.pick([4,5,6]),b=r.pick([18,24,30]),x=r.pick([4,6,8]),d=r.pick([5,7,9]),pred=m*x+b,actual=pred-d,pts=[[1,b+m+1],[3,b+3*m-2],[x,actual],[9,b+9*m+1]];
 const c=mc(r,`The model overpredicts the actual value by ${d}`,[`The model underpredicts the actual value by ${d}`,`The actual value is ${d} times the predicted value`,`The residual is positive ${d}`]);
 return{text:`A line of best fit predicts weekly bicycle rentals from temperature. At a temperature represented by ${V('x')} = ${x}, the model predicts ${pred} rentals, but the actual number is ${actual}. Which statement is correct?`,...c,
  viz:{type:'scatter',pts,m,b,xmax:10,ymax:b+10*m+8,xlabel:'temperature index',ylabel:'bicycle rentals',point:{x,y:pred,actual}},
  steps:[{t:`The prediction ${pred} lies above the actual value ${actual}.`,f:'point'},{t:`Prediction − actual = ${pred} − ${actual} = ${d}.`,f:'point'},{t:`Therefore the model overpredicts by ${d}. Equivalently, the residual actual − predicted is −${d}.`,f:'point'}]}}});

def({id:'p57',sk:'two',dom:'psda',skill:'Two-variable data · limits of extrapolation',fmt:'mc',difficulty:'Medium',gen(r){const m=r.pick([2,3,4]),b=r.pick([10,15,20]),rr=rng(r.ri(1,1e9)),pts=[];for(let x=1;x<=8;x++)pts.push([x,b+m*x+rr.ri(-3,3)]);const far=25,pred=b+m*far;
 const c=mc(r,`The prediction is an extrapolation far outside the observed range, so the relationship may not continue`,[`The prediction is reliable because every line can be extended indefinitely`,`The prediction is unreliable only because ${far} is not one of the original data values`,`The prediction must equal the largest observed value`]);
 return{text:`A linear model based on data collected for advertising budgets from 1 to 8 thousand dollars is used to predict sales for a budget of ${far} thousand dollars. Why should this prediction be treated cautiously?`,...c,
  viz:{type:'scatter',pts,m,b,xmax:far,ymax:pred+12,xlabel:'advertising budget ($ thousands)',ylabel:'sales index',point:{x:far,y:pred}},
  steps:[{t:`All observed inputs lie between 1 and 8; the model was supported only in that interval.`},{t:`The input ${far} is far outside the observed range, so using the line there is extrapolation.`,f:'point'},{t:`The relationship may change beyond the measured range, making the prediction less reliable.`,f:'point'}]}}});

def({id:'p58',sk:'two',dom:'psda',skill:'Two-variable data · greatest underprediction from residuals',fmt:'mc',difficulty:'Medium',gen(r){const residuals=r.shuffle([-5,3,8,-2]),labels=['Monday','Tuesday','Wednesday','Thursday'],best=residuals.indexOf(Math.max(...residuals));const c=mc(r,labels[best],labels.filter((_,i)=>i!==best));
 return{text:`A restaurant used a model to predict the number of dinner orders on four days. The residuals, calculated as actual minus predicted, are shown in the residual plot. On which day did the model underestimate the actual number of orders by the greatest amount?`,...c,
  viz:{type:'residuals',pts:residuals.map((y,i)=>[i+1,y]),labels,xmax:5,rmax:10,xlabel:'day',ylabel:'order residual',point:best},
  steps:[{t:`Underprediction means actual > predicted, so look for a positive residual.`,f:'zero'},{t:`The greatest underestimate corresponds to the largest positive residual.`,f:'magnitude'},{t:`${labels[best]} has residual +${residuals[best]}, so the model underestimated by ${residuals[best]} orders.`,f:'point'}]}}});

def({id:'p59',sk:'infer',dom:'psda',skill:'Inference · sample mean as an estimate of a population mean',fmt:'spr',difficulty:'Easy',gen(r){const n=r.pick([60,80,100,120]),mean=r.pick([24,28,32,36]),moe=r.pick([2,3]);
 return{text:`A transit agency randomly selected ${n} weekday riders and found that their mean commute time was ${mean} minutes. Based on this sample, what is the best point estimate, in minutes, of the mean commute time for all weekday riders?`,ans:mean,ansText:`${mean}`,
  viz:{type:'sample',N:5000,n,p:null,seed:r.ri(1,999),interval:[mean-moe,mean+moe,'minutes'],est:`sample mean ${mean} → estimate population mean ${mean}`},
  steps:[{t:`A random sample can be used to estimate the population from which it was selected.`,f:'random'},{t:`The standard point estimate of a population mean is the sample mean.`,f:'estimate'},{t:`Therefore the best point estimate is ${mean} minutes. An interval would describe the uncertainty around that estimate.`,f:'interval'}]}}});

def({id:'p60',sk:'infer',dom:'psda',skill:'Inference · sample size and variability of a sample mean',fmt:'mc',difficulty:'Medium',gen(r){const small=r.pick([40,50,60]),large=small*8;
 const c=mc(r,`The mean from the sample of ${large}, because means from larger random samples tend to vary less`,[`The mean from the sample of ${small}, because smaller samples always match the population more closely`,`Both sample means must be equally close because both samples are random`,`Neither sample mean can estimate the population mean`]);
 return{text:`Two researchers independently take random samples from the same large population. One sample contains ${small} people and the other contains ${large} people. Which sample mean would generally be expected to be the more stable estimate of the population mean, and why?`,...c,
  viz:{type:'sample',N:10000,n:large,p:.55,what:'included in larger sample',seed:r.ri(1,999),est:`n = ${large} → less sampling variability`,note:'larger random samples give more stable estimates'},
  steps:[{t:`Both samples are random, so neither has a built-in selection advantage.`,f:'random'},{t:`Larger random samples average over more observations and tend to fluctuate less from sample to sample.`,f:'note'},{t:`Thus the mean from the sample of ${large} is generally the more stable estimate.`,f:'estimate'}]}}});

/* ======== UNIT CONVERSION WORD PROBLEMS (expanded) ======== */
def({id:'p61',sk:'ratio',dom:'psda',skill:'Units · converting minutes to hours in a distance model',fmt:'spr',difficulty:'Easy',gen(r){const z=r.pick([{speed:48,min:45},{speed:60,min:90},{speed:72,min:150},{speed:80,min:135}]),hours=z.min/60,ans=z.speed*hours;
 return{text:`A shuttle travels at a constant speed of ${z.speed} miles per hour for ${z.min} minutes. How many miles does the shuttle travel?`,ans,ansText:fmt(ans),
  viz:{type:'pipeline',stages:[{label:'travel time',value:`${z.min} min`},{label:'time in hours',value:`${fmt(hours)} hr`},{label:'distance',value:`${fmt(ans)} mi`}],ops:[EQ(`\\div 60`),EQ(`\\times ${z.speed}`)]},
  steps:[{t:`Convert minutes to hours: ${EQ(`${z.min}\\text{ min}\\times\\frac{1\\text{ hr}}{60\\text{ min}}=${fmt(hours)}\\text{ hr}`)}.`,f:'s1'},{t:`Use ${EQ(`d=rt`)} with compatible units.`,f:'s1'},{t:`${EQ(`d=${z.speed}\\left( ${fmt(hours)}\\right)=${fmt(ans)}\\text{ miles}`)}.`,f:'s2'}]}}});

def({id:'p62',sk:'ratio',dom:'psda',skill:'Units · converting a per-second rate to a multi-hour total',fmt:'mc',difficulty:'Medium',gen(r){const rate=r.pick([3,5,8]),hours=r.pick([2,3,4]),perMin=rate*60,ans=rate*3600*hours;
 const c=mc(r,cm(ans),[cm(rate*60*hours),cm(rate*3600),cm(rate*hours)]);
 return{text:`A bottling machine fills ${rate} bottles every second. At this constant rate, how many bottles will it fill in ${hours} hours?`,...c,
  viz:{type:'pipeline',stages:[{label:'per second',value:`${rate} bottles`},{label:'per minute',value:`${cm(perMin)}`},{label:`in ${hours} hours`,value:cm(ans)}],ops:[EQ(`\\times 60`),EQ(`\\times 60\\times ${hours}`)]},
  steps:[{t:`Convert the rate to bottles per minute: ${EQ(`${rate}\\times 60=${perMin}`)}.`,f:'s1'},{t:`There are ${EQ(`60\\times ${hours}=${60*hours}`)} minutes in ${hours} hours.`,f:'s1'},{t:`${EQ(`${perMin}\\times ${60*hours}=${cm(ans)}`)} bottles.`,f:'s2'}]}}});

def({id:'p63',sk:'ratio',dom:'psda',skill:'Units · converting running pace to speed',fmt:'spr',difficulty:'Medium',gen(r){const pace=r.pick([8,10,12,15]),ans=60/pace;
 return{text:`A runner maintains a pace of ${pace} minutes per mile. At this pace, what is the runner's speed, in miles per hour?`,ans,ansText:fmt(ans),tol:.011,
  viz:{type:'pipeline',stages:[{label:'pace',value:`${pace} min/mi`},{label:'miles in 60 min',value:EQ(`\\frac{60}{${pace}}`)},{label:'speed',value:`${fmt(ans)} mi/hr`}],ops:['use 60 min',EQ(`60\\div ${pace}`)]},
  steps:[{t:`One hour contains 60 minutes.`,f:'s0'},{t:`At ${pace} minutes per mile, the number of miles in 60 minutes is ${EQ(`\\frac{60\\text{ min}}{${pace}\\text{ min/mi}}`)}.`,f:'s1'},{t:`${EQ(`60\\div ${pace}=${fmt(ans)}`)}, so the speed is ${fmt(ans)} miles per hour.`,f:'s2'}]}}});

def({id:'p64',sk:'ratio',dom:'psda',skill:'Units · liters per minute to cubic meters',fmt:'spr',difficulty:'Hard',gen(r){const z=r.pick([{rate:25,h:2},{rate:40,h:3},{rate:50,h:4},{rate:75,h:2}]),minutes=60*z.h,liters=z.rate*minutes,ans=liters/1000;
 return{text:`A pump moves water at ${z.rate} liters per minute for ${z.h} hours. Given that 1 cubic meter equals 1,000 liters, how many cubic meters of water does the pump move?`,ans,ansText:fmt(ans),tol:.011,
  viz:{type:'pipeline',stages:[{label:'operating time',value:`${minutes} min`},{label:'water moved',value:`${cm(liters)} L`},{label:'cubic meters',value:`${fmt(ans)} m³`}],ops:[EQ(`\\times ${z.rate}`),EQ(`\\div 1000`)]},
  steps:[{t:`Convert the time: ${EQ(`${z.h}\\text{ hr}\\times 60=${minutes}\\text{ min}`)}.`,f:'s0'},{t:`Water moved: ${EQ(`${z.rate}\\text{ L/min}\\times ${minutes}\\text{ min}=${cm(liters)}\\text{ L}`)}.`,f:'s1'},{t:`Convert liters to cubic meters: ${EQ(`${cm(liters)}\\div 1000=${fmt(ans)}\\text{ m}^3`)}.`,f:'s2'}]}}});

def({id:'p65',sk:'ratio',dom:'psda',skill:'Units · converting square feet to square yards',fmt:'mc',difficulty:'Medium',gen(r){const z=r.pick([{l:18,w:12},{l:21,w:15},{l:24,w:18},{l:30,w:21}]),sqft=z.l*z.w,ans=sqft/9;
 const c=mc(r,fmt(ans),[fmt(sqft),fmt(sqft/3),fmt((z.l+z.w)/3)]);
 return{text:`A rectangular event floor is ${z.l} feet long and ${z.w} feet wide. Since 1 square yard equals 9 square feet, what is the area of the floor in square yards?`,...c,
  viz:{type:'pipeline',stages:[{label:'dimensions',value:`${z.l} ft × ${z.w} ft`},{label:'area',value:`${sqft} ft²`},{label:'square yards',value:`${fmt(ans)} yd²`}],ops:[EQ(`${z.l}\\times ${z.w}`),EQ(`\\div 9`)]},
  steps:[{t:`Find area first: ${EQ(`${z.l}\\text{ ft}\\times ${z.w}\\text{ ft}=${sqft}\\text{ ft}^2`)}.`,f:'s1'},{t:`Because ${EQ(`1\\text{ yd}^2=9\\text{ ft}^2`)}, divide the square-foot area by 9.`,f:'s1'},{t:`${EQ(`${sqft}\\div 9=${fmt(ans)}\\text{ yd}^2`)}. Squaring the linear conversion is why the factor is 9, not 3.`,f:'s2'}]}}});

def({id:'p66',sk:'ratio',dom:'psda',skill:'Units · area coverage and liquid volume',fmt:'spr',difficulty:'Hard',gen(r){const coverage=r.pick([300,350,400]),gallons=r.pick([3,4,5]),area=coverage*gallons,ans=gallons*4;
 return{text:`A paint covers ${coverage} square feet per gallon. A mural has an area of ${cm(area)} square feet. If 1 gallon is approximately 4 liters, approximately how many liters of paint are needed for one coat?`,ans,ansText:`${ans}`,
  viz:{type:'pipeline',stages:[{label:'mural area',value:`${cm(area)} ft²`},{label:'paint needed',value:`${gallons} gal`},{label:'metric volume',value:`${ans} L`}],ops:[EQ(`\\div ${coverage}`),EQ(`\\times 4`)]},
  steps:[{t:`Gallons needed: ${EQ(`${cm(area)}\\text{ ft}^2\\div ${coverage}\\text{ ft}^2/\\text{gal}=${gallons}\\text{ gal}`)}.`,f:'s1'},{t:`The area units cancel, leaving gallons.`,f:'s1'},{t:`Convert gallons to liters: ${EQ(`${gallons}\\times 4=${ans}\\text{ L}`)}.`,f:'s2'}]}}});

def({id:'p67',sk:'ratio',dom:'psda',skill:'Units · density, volume, and mass conversion',fmt:'mc',difficulty:'Hard',gen(r){const density=r.pick([2.5,4,7.5]),volume=r.pick([200,400,600]),grams=density*volume,ans=grams/1000;
 const c=mc(r,fmt(ans),[fmt(grams),fmt(volume/density),fmt(ans*100)]);
 return{text:`A material has a density of ${fmt(density)} grams per cubic centimeter. A sample has a volume of ${volume} cubic centimeters. What is the mass of the sample in kilograms?`,...c,
  viz:{type:'pipeline',stages:[{label:'density × volume',value:`${fmt(density)} × ${volume}`},{label:'mass',value:`${cm(grams)} g`},{label:'kilograms',value:`${fmt(ans)} kg`}],ops:[EQ(`\\text{g/cm}^3\\times\\text{cm}^3`),EQ(`\\div 1000`)]},
  steps:[{t:`Mass = density × volume: ${EQ(`${fmt(density)}\\text{ g/cm}^3\\times ${volume}\\text{ cm}^3=${cm(grams)}\\text{ g}`)}.`,f:'s1'},{t:`The cubic-centimeter units cancel.`,f:'s1'},{t:`Since ${EQ(`1000\\text{ g}=1\\text{ kg}`)}, ${EQ(`${cm(grams)}\\div 1000=${fmt(ans)}\\text{ kg}`)}.`,f:'s2'}]}}});

def({id:'p68',sk:'ratio',dom:'psda',skill:'Units · concentration with metric conversions',fmt:'spr',difficulty:'Hard',gen(r){const c=r.pick([2.4,3.2,4.5,6]),mL=r.pick([200,250,400]),grams=c*mL/1000,ans=grams*1000;
 return{text:`A laboratory solution contains ${fmt(c)} grams of a dissolved substance per liter. How many milligrams of the substance are in ${mL} milliliters of the solution?`,ans,ansText:fmt(ans),tol:.011,
  viz:{type:'pipeline',stages:[{label:'sample volume',value:`${mL} mL = ${fmt(mL/1000)} L`},{label:'substance',value:`${fmt(grams)} g`},{label:'milligrams',value:`${fmt(ans)} mg`}],ops:[EQ(`\\times ${fmt(c)}\\text{ g/L}`),EQ(`\\times 1000`)]},
  steps:[{t:`Convert the sample volume: ${EQ(`${mL}\\text{ mL}\\times\\frac{1\\text{ L}}{1000\\text{ mL}}=${fmt(mL/1000)}\\text{ L}`)}.`,f:'s0'},{t:`Substance mass: ${EQ(`${fmt(mL/1000)}\\text{ L}\\times ${fmt(c)}\\text{ g/L}=${fmt(grams)}\\text{ g}`)}.`,f:'s1'},{t:`Convert grams to milligrams: ${EQ(`${fmt(grams)}\\times 1000=${fmt(ans)}\\text{ mg}`)}.`,f:'s2'}]}}});

def({id:'p69',sk:'ratio',dom:'psda',skill:'Units · kilowatts, time, and electricity cost',fmt:'mc',difficulty:'Hard',gen(r){const power=r.pick([1.5,2,2.5]),minutes=r.pick([120,180,240]),rate=r.pick([0.16,0.18,0.22]),hours=minutes/60,energy=power*hours,cost=+(energy*rate).toFixed(2);
 const c=mc(r,money(cost),[money(energy),money(power*minutes*rate),money(cost/60)]);
 return{text:`An appliance uses ${fmt(power)} kilowatts of power and runs for ${minutes} minutes. Electricity costs ${money(rate)} per kilowatt-hour. What is the cost of operating the appliance for this time?`,...c,
  viz:{type:'pipeline',stages:[{label:'power and time',value:`${fmt(power)} kW × ${fmt(hours)} hr`},{label:'energy',value:`${fmt(energy)} kWh`},{label:'cost',value:money(cost)}],ops:['multiply',EQ(`\\times \\$${fmt(rate)}/\\text{kWh}`)]},
  steps:[{t:`Convert time to hours: ${EQ(`${minutes}\\div 60=${fmt(hours)}\\text{ hr}`)}.`,f:'s0'},{t:`Energy = power × time: ${EQ(`${fmt(power)}\\text{ kW}\\times ${fmt(hours)}\\text{ hr}=${fmt(energy)}\\text{ kWh}`)}.`,f:'s1'},{t:`Cost = ${EQ(`${fmt(energy)}\\times \\$${fmt(rate)}=\\$${fmt(cost,2)}`)}.`,f:'s2'}]}}});

def({id:'p70',sk:'ratio',dom:'psda',skill:'Units · map scale with centimeters and inches',fmt:'spr',difficulty:'Hard',gen(r){const cmLen=r.pick([5.08,7.62,10.16,12.7]),inches=cmLen/2.54,scale=r.pick([15,20,25]),ans=inches*scale;
 return{text:`On a map, 1 inch represents ${scale} miles. Two cities are ${fmt(cmLen)} centimeters apart on the map. Given that 1 inch equals 2.54 centimeters, how many miles apart are the cities?`,ans,ansText:fmt(ans),tol:.011,
  viz:{type:'pipeline',stages:[{label:'map distance',value:`${fmt(cmLen)} cm`},{label:'inches',value:`${fmt(inches)} in`},{label:'actual distance',value:`${fmt(ans)} mi`}],ops:[EQ(`\\div 2.54`),EQ(`\\times ${scale}`)]},
  steps:[{t:`Convert the map distance: ${EQ(`${fmt(cmLen)}\\text{ cm}\\div 2.54=${fmt(inches)}\\text{ in}`)}.`,f:'s1'},{t:`Each map inch represents ${scale} actual miles.`,f:'s1'},{t:`${EQ(`${fmt(inches)}\\times ${scale}=${fmt(ans)}\\text{ miles}`)}.`,f:'s2'}]}}});

def({id:'p71',sk:'ratio',dom:'psda',skill:'Units · temperature conversion with a formula',fmt:'mc',difficulty:'Medium',gen(r){const Cc=r.pick([10,20,25,30,35]),F=9*Cc/5+32;const c=mc(r,`${Cc}°C`,[`${F-32}°C`,`${fmt(F*5/9)}°C`,`${F+32}°C`]);
 return{text:`A weather station reports a temperature of ${F}°F. The conversion formula is ${EQ(`C=\\frac{5}{9}(F-32)`)}. What is the temperature in degrees Celsius?`,...c,
  viz:{type:'pipeline',stages:[{label:'Fahrenheit',value:`${F}°F`},{label:'subtract 32',value:`${F-32}`},{label:'multiply by 5/9',value:`${Cc}°C`}],ops:[EQ(`-32`),EQ(`\\times\\frac{5}{9}`)]},
  steps:[{t:`Substitute ${EQ(`F=${F}`)} into ${EQ(`C=\\frac{5}{9}(F-32)`)}.`,f:'s0'},{t:`${EQ(`F-32=${F}-32=${F-32}`)}.`,f:'s1'},{t:`${EQ(`C=\\frac{5}{9}(${F-32})=${Cc}^\\circ\\text{C}`)}.`,f:'s2'}]}}});

def({id:'p72',sk:'ratio',dom:'psda',skill:'Units · miles per hour to feet per second',fmt:'mc',difficulty:'Hard',gen(r){const mph=r.pick([45,60,75,90]),ans=mph*5280/3600;const c=mc(r,fmt(ans),[fmt(mph*5280),fmt(mph/60),fmt(mph*60)]);
 return{text:`A vehicle travels at ${mph} miles per hour. Given that 1 mile equals 5,280 feet and 1 hour equals 3,600 seconds, what is its speed in feet per second?`,...c,
  viz:{type:'pipeline',stages:[{label:'speed',value:`${mph} mi/hr`},{label:'feet per hour',value:`${cm(mph*5280)}`},{label:'feet per second',value:fmt(ans)}],ops:[EQ(`\\times 5280`),EQ(`\\div 3600`)]},
  steps:[{t:`Use conversion factors that cancel miles and hours: ${EQ(`${mph}\\frac{\\text{mi}}{\\text{hr}}\\times\\frac{5280\\text{ ft}}{1\\text{ mi}}\\times\\frac{1\\text{ hr}}{3600\\text{ s}}`)}.`,f:'s0'},{t:`This gives ${EQ(`\\frac{${mph}\\times5280}{3600}`)} feet per second.`,f:'s1'},{t:`${EQ(`\\frac{${mph}\\times5280}{3600}=${fmt(ans)}\\text{ ft/s}`)}.`,f:'s2'}]}}});

def({id:'p73',sk:'ratio',dom:'psda',skill:'Units · cubic inches to cubic feet',fmt:'spr',difficulty:'Hard',gen(r){const z=r.pick([{l:24,w:18,h:12},{l:36,w:24,h:12},{l:30,w:24,h:18},{l:48,w:18,h:12}]),cubeIn=z.l*z.w*z.h,ans=cubeIn/1728;
 return{text:`A rectangular storage bin measures ${z.l} inches by ${z.w} inches by ${z.h} inches. Since 1 cubic foot equals 1,728 cubic inches, what is the volume of the bin in cubic feet?`,ans,ansText:fmt(ans),tol:.011,
  viz:{type:'pipeline',stages:[{label:'dimensions',value:`${z.l} × ${z.w} × ${z.h} in`},{label:'volume',value:`${cm(cubeIn)} in³`},{label:'cubic feet',value:`${fmt(ans)} ft³`}],ops:['multiply',EQ(`\\div 1728`)]},
  steps:[{t:`Volume = ${EQ(`${z.l}\\times ${z.w}\\times ${z.h}=${cm(cubeIn)}\\text{ in}^3`)}.`,f:'s1'},{t:`A cubic-foot conversion uses ${EQ(`12^3=1728`)} because all three dimensions are converted.`,f:'s1'},{t:`${EQ(`${cm(cubeIn)}\\div 1728=${fmt(ans)}\\text{ ft}^3`)}.`,f:'s2'}]}}});

def({id:'p74',sk:'ratio',dom:'psda',skill:'Units · pounds, ounces, and equal portions',fmt:'mc',difficulty:'Medium',gen(r){const pounds=r.pick([2.5,3,4.5,5]),ounces=pounds*16,portion=r.pick([4,8]),ans=ounces/portion;const c=mc(r,fmt(ans),[fmt(pounds),fmt(ounces),fmt(pounds/portion)]);
 return{text:`A café has ${fmt(pounds)} pounds of coffee beans. It packages the beans into portions of ${portion} ounces each. Given that 1 pound equals 16 ounces, how many complete portions can the café make?`,...c,
  viz:{type:'pipeline',stages:[{label:'coffee beans',value:`${fmt(pounds)} lb`},{label:'convert',value:`${fmt(ounces)} oz`},{label:'portions',value:fmt(ans)}],ops:[EQ(`\\times 16`),EQ(`\\div ${portion}`)]},
  steps:[{t:`Convert pounds to ounces: ${EQ(`${fmt(pounds)}\\times16=${fmt(ounces)}\\text{ oz}`)}.`,f:'s1'},{t:`Each portion uses ${portion} ounces.`,f:'s1'},{t:`Number of portions = ${EQ(`${fmt(ounces)}\\div ${portion}=${fmt(ans)}`)}.`,f:'s2'}]}}});

def({id:'p75',sk:'ratio',dom:'psda',skill:'Units · kilometers per liter to miles per gallon',fmt:'spr',difficulty:'Hard',gen(r){const rate=r.pick([12,14,16,18]),ans=rate*4/1.6;
 return{text:`A car travels ${rate} kilometers per liter of fuel. Use the approximations 1 gallon = 4 liters and 1 mile = 1.6 kilometers. What is the car's fuel efficiency in miles per gallon?`,ans,ansText:fmt(ans),tol:.011,
  viz:{type:'pipeline',stages:[{label:'fuel efficiency',value:`${rate} km/L`},{label:'per gallon',value:`${rate*4} km/gal`},{label:'miles per gallon',value:`${fmt(ans)} mi/gal`}],ops:[EQ(`\\times4`),EQ(`\\div1.6`)]},
  steps:[{t:`One gallon contains 4 liters, so ${EQ(`${rate}\\text{ km/L}\\times4\\text{ L/gal}=${rate*4}\\text{ km/gal}`)}.`,f:'s1'},{t:`Convert kilometers to miles by dividing by 1.6.`,f:'s1'},{t:`${EQ(`${rate*4}\\div1.6=${fmt(ans)}\\text{ miles per gallon}`)}.`,f:'s2'}]}}});

def({id:'p76',sk:'ratio',dom:'psda',skill:'Units · grams per item to kilograms for a shipment',fmt:'mc',difficulty:'Medium',gen(r){const grams=r.pick([4,5,6,8]),sheets=r.pick([500,1000,2500]),total=grams*sheets,ans=total/1000;const c=mc(r,fmt(ans),[fmt(total),fmt(total/100),fmt(sheets/1000)]);
 return{text:`Each sheet in a paper shipment has a mass of ${grams} grams. The shipment contains ${cm(sheets)} sheets. What is the total mass of the paper in kilograms?`,...c,
  viz:{type:'pipeline',stages:[{label:'one sheet',value:`${grams} g`},{label:`${cm(sheets)} sheets`,value:`${cm(total)} g`},{label:'kilograms',value:`${fmt(ans)} kg`}],ops:[EQ(`\\times ${cm(sheets)}`),EQ(`\\div1000`)]},
  steps:[{t:`Total grams = ${EQ(`${grams}\\text{ g/sheet}\\times ${cm(sheets)}\\text{ sheets}=${cm(total)}\\text{ g}`)}.`,f:'s1'},{t:`The sheet units cancel.`,f:'s1'},{t:`Convert grams to kilograms: ${EQ(`${cm(total)}\\div1000=${fmt(ans)}\\text{ kg}`)}.`,f:'s2'}]}}});

/* ======== ADVANCED MATH (extended) ======== */
def({id:'m6',sk:'equiv',dom:'adv',skill:'Equivalent expressions · rewriting a revenue expression',fmt:'mc',gen(r){const pmax=r.pick([40,50,60,80]),k=r.pick([2,3,4]);const A=pmax*k;
 const c=mc(r,`${V('R')} = ${k}${V('p')}(${pmax} − ${V('p')})`,[`${V('R')} = ${k}${V('p')}(${V('p')} − ${pmax})`,`${V('R')} = ${A}${V('p')}(1 − ${V('p')})`,`${V('R')} = (${A} − ${V('p')})(${k} + ${V('p')})`]);
 return{text:`A food truck sells ${A} − ${k}${V('p')} sandwiches per day when the price of a sandwich is ${V('p')} dollars. Its daily revenue ${V('R')}, in dollars, is ${V('R')} = ${V('p')}(${A} − ${k}${V('p')}). Which of the following is an equivalent form of ${V('R')} that shows the price at which revenue is zero other than ${V('p')} = 0?`,...c,
  viz:{type:'parabola',a:-k,b:A,c:0,xs:'p',ys:'R',xu:'$',yu:'$',xlabel:'price p ($)',ylabel:'revenue R ($)',yname:'revenue',landLabel:`R = 0 at p = ${pmax}`,startLabel:'R = 0 at p = 0'},
  steps:[{t:`Factor the common ${k} out of the parentheses: ${A} − ${k}${V('p')} = ${k}(${pmax} − ${V('p')}).`,f:'start'},{t:`So ${V('R')} = ${k}${V('p')}(${pmax} − ${V('p')}). The factor (${pmax} − ${V('p')}) is zero when ${V('p')} = ${pmax}: no one buys at that price.`,f:'land'},{t:`Revenue is maximized halfway between the zeros, at ${V('p')} = ${pmax/2}.`,f:'vertex'}]}}});
def({id:'m7',sk:'nonlin',dom:'adv',skill:'Nonlinear equations · consecutive integers with a given product',fmt:'spr',gen(r){const n=r.ri(6,14),prod=n*(n+1);
 return{text:`The product of two consecutive positive integers is ${prod}. What is the smaller of the two integers?`,ans:n,ansText:`${n}`,
  viz:{type:'shape',kind:'rect',w:n+1,h:n,unit:'',mode:'area',wl:'n + 1',hl:'n'},
  steps:[{t:`Call the integers ${V('n')} and ${V('n')} + 1. Their product is like the area of an ${V('n')} by (${V('n')} + 1) rectangle: ${V('n')}(${V('n')} + 1) = ${prod}.`,f:'area'},{t:`${V('n')}² + ${V('n')} − ${prod} = 0 factors as (${V('n')} − ${n})(${V('n')} + ${n+1}) = 0.`},{t:`${V('n')} = ${n} (the negative root is rejected). Check: ${n} × ${n+1} = ${prod}.`,f:'area'}]}}});
def({id:'m8',sk:'nonlin',dom:'adv',skill:'Nonlinear equations · when a projectile hits the ground',fmt:'spr',gen(r){const t1=r.pick([3,4,5,6]),mm=r.pick([1,2]),h0=16*t1*mm,v=16*(t1-mm);
 return{text:`A rock is thrown upward from the edge of a cliff. Its height ${V('h')}, in feet, above the ground ${V('t')} seconds after it is thrown is ${V('h')} = −16${SUP(V('t'),2)} + ${v}${V('t')} + ${h0}. How many seconds after it is thrown does the rock hit the ground?`,ans:t1,ansText:`${t1}`,
  viz:{type:'parabola',a:-16,b:v,c:h0},
  steps:[{t:`"Hits the ground" means ${V('h')} = 0: −16${SUP(V('t'),2)} + ${v}${V('t')} + ${h0} = 0.`,f:'start'},{t:`Divide by −16: ${SUP(V('t'),2)} − ${v/16}${V('t')} − ${h0/16} = 0, which factors as (${V('t')} − ${t1})(${V('t')} + ${mm}) = 0.`,f:'vertex'},{t:`${V('t')} = ${t1} seconds (time can't be negative).`,f:'land'}]}}});
def({id:'m9',sk:'nonlin',dom:'adv',skill:'Nonlinear equations · perimeter and area together',fmt:'spr',gen(r){const w=r.pick([10,15,20,25]),L=w+r.pick([10,20,30]);const P=2*(w+L),A=w*L;
 return{text:`A rectangular pen is enclosed by ${P} feet of fencing and has an area of ${cm(A)} square feet. What is the length, in feet, of the shorter side of the pen?`,ans:w,ansText:`${w}`,
  viz:{type:'shape',kind:'rect',w:L,h:w,unit:'ft',mode:'area'},
  steps:[{t:`Perimeter: 2${V('w')} + 2${V('l')} = ${P}, so ${V('l')} = ${P/2} − ${V('w')}.`,f:'area'},{t:`Area: ${V('w')}(${P/2} − ${V('w')}) = ${cm(A)} → ${V('w')}² − ${P/2}${V('w')} + ${cm(A)} = 0 → (${V('w')} − ${w})(${V('w')} − ${L}) = 0.`},{t:`The two roots are the two sides: ${w} and ${L}. The shorter side is ${w} ft.`,f:'area'}]}}});
def({id:'m10',sk:'nonlin',dom:'adv',skill:'Rational equations · working together',fmt:'spr',gen(r){const a=r.pick([3,4]),b=r.pick([6,12]);const T=a*b/(a+b);
 return{text:`Working alone, Maya can paint a room in ${a} hours. Working alone, Leo can paint the same room in ${b} hours. If they work together at these rates, how many hours will it take them to paint the room?`,ans:T,ansText:fmt(T),
  viz:{type:'motion',lanes:true,len:100,unit:'%',tunit:'h',T,movers:[{label:`Maya ${fmt(100/a,1)}%/h`,start:0,speed:100/a,dir:1,color:C.signal},{label:`Leo ${fmt(100/b,1)}%/h`,start:0,speed:100/b,dir:1,color:C.orange}]},
  steps:[{t:`Rates: Maya paints 1/${a} of the room per hour, Leo 1/${b}.`,f:'rate'},{t:`Together: 1/${a} + 1/${b} = ${frac(a+b,a*b)} of the room per hour.`,f:'total'},{t:`Time = 1 ÷ ${frac(a+b,a*b)} = ${frac(a*b,a+b)} = ${fmt(T)} hours. Not the average of ${a} and ${b}.`,f:'total'}]}}});
def({id:'m11',sk:'nonlin',dom:'adv',skill:'Radical equations · edge of a cube from its volume',fmt:'spr',gen(r){const e=r.pick([4,5,6,7,8,9]),Vv=e*e*e;
 return{text:`A storage container is shaped like a cube. The volume of the container is ${cm(Vv)} cubic inches. What is the length, in inches, of one edge of the container?`,ans:e,ansText:`${e}`,
  viz:{type:'shape',kind:'box',l:e,w:e,h:e,unit:'in'},
  steps:[{t:`Volume of a cube = edge³: ${V('s')}³ = ${cm(Vv)}.`,f:'vol'},{t:`Take the cube root: ${V('s')} = ∛${cm(Vv)}.`,f:'base'},{t:`${e}³ = ${e} × ${e} × ${e} = ${cm(Vv)}, so the edge is ${e} inches.`,f:'vol'}]}}});
def({id:'m12',sk:'nonf',dom:'adv',skill:'Exponential decay · half-life',fmt:'spr',gen(r){const A0=r.pick([80,120,160,200]),hl=r.pick([4,6,8]),n=r.pick([3,4]);const ans=A0/Math.pow(2,n);
 return{text:`A patient takes ${A0} milligrams of a medication. The amount of the medication in the patient's bloodstream decreases by half every ${hl} hours. How many milligrams of the medication remain in the bloodstream ${hl*n} hours after it is taken?`,ans,ansText:fmt(ans),
  viz:{type:'growth',a:A0,base:0.5,k:1/hl,T:hl*n,period:hl,perLabel:`${hl} hours`,xlabel:'hours',ylabel:'mg',fmt:v=>fmt(v,1)},
  steps:[{t:`Every ${hl} hours the amount is multiplied by ½.`,f:'factor'},{t:`${hl*n} hours contains ${hl*n}/${hl} = ${n} half-lives, so multiply by ½ ${n} times: ${A0}·(½)${SUP('',n)}.`,f:'factor'},{t:`${A0} ÷ ${Math.pow(2,n)} = ${fmt(ans)} mg.`,f:'end'}]}}});
def({id:'m13',sk:'nonf',dom:'adv',skill:'Exponential models · interpreting the growth factor',fmt:'mc',gen(r){const P0=r.pick([3000,5000,8000]),p=r.pick([3,4,5,6]);
 const c=mc(r,`The population increases by ${p}% each year`,[`The population increases by ${cm(P0*p/100)} people each year`,`The population increases by ${fmt(1+p/100)}% each year`,`The population is ${fmt(1+p/100)} times its original size after 1 year and stays constant`]);
 return{text:`The population of a town ${V('t')} years after 2020 is modeled by ${V('P')}(${V('t')}) = ${cm(P0)}${SUP(`(${fmt(1+p/100)})`,V('t'))}. Which of the following is the best interpretation of the number ${fmt(1+p/100)} in this model?`,...c,
  viz:{type:'growth',a:P0,base:1+p/100,k:1,T:10,period:2,perLabel:'2 years',xlabel:'years after 2020',ylabel:'population',fmt:v=>cm(Math.round(v))},
  steps:[{t:`Each year the population is multiplied by ${fmt(1+p/100)} = 1 + ${fmt(p/100)}.`,f:'factor'},{t:`Multiplying by 1 + ${fmt(p/100)} adds ${p}% of the current value: a ${p}% increase per year.`,f:'factor'},{t:`The number of people added grows each year (${cm(P0*p/100)} the first year, more later), so it is not a fixed number of people.`,f:'end'}]}}});
def({id:'m14',sk:'nonf',dom:'adv',skill:'Quadratic functions · price that maximizes revenue',fmt:'spr',gen(r){const pm=r.pick([20,25,30,40]),k=r.pick([2,3,4]);const b=2*k*pm;
 return{text:`A theater estimates that its revenue ${V('R')}, in dollars, from a show is given by ${V('R')}(${V('p')}) = −${k}${SUP(V('p'),2)} + ${b}${V('p')}, where ${V('p')} is the ticket price in dollars. What ticket price, in dollars, will produce the maximum revenue?`,ans:pm,ansText:`${pm}`,
  viz:{type:'parabola',a:-k,b,c:0,xs:'p',ys:'R',xu:'$',yu:'$',xlabel:'ticket price p ($)',ylabel:'revenue R ($)',yname:'revenue'},
  steps:[{t:`Revenue is a downward parabola in ${V('p')}: zero at ${V('p')} = 0 and at ${V('p')} = ${2*pm}, highest in between.`,f:'land'},{t:`The vertex is at ${V('p')} = −${V('b')}/(2${V('a')}) = −${b}/(2·(−${k})) = ${pm}.`,f:'vertex'},{t:`Ticket price $${pm} gives the maximum revenue, ${V('R')}(${pm}) = $${cm(k*pm*pm)}.`,f:'vertex'}]}}});
def({id:'m15',sk:'nonf',dom:'adv',skill:'Exponential vs. linear · comparing two savings plans',fmt:'mc',gen(r){const P=r.pick([1000,2000]),rt=r.pick([5,6,8]),add=r.pick([60,80,100]),T=r.pick([10,12,15]);const e=P*Math.pow(1+rt/100,T),l=P+add*T;const expWins=e>l;
 const c=mc(r,`${expWins?'Account A':'Account B'}, by about ${money(Math.abs(e-l))}`,[`${expWins?'Account B':'Account A'}, by about ${money(Math.abs(e-l))}`,`The two accounts will have the same balance`,`${expWins?'Account A':'Account B'}, by about ${money(Math.abs(e-l)/2)}`]);
 return{text:`Account A starts with ${money(P)} and grows by ${rt}% per year, compounded annually. Account B starts with ${money(P)} and has ${money(add)} added to it at the end of each year, with no interest. Which account will have the greater balance after ${T} years, and by about how much?`,...c,
  viz:{type:'growth',a:P,base:1+rt/100,k:1,T,period:Math.round(T/5),perLabel:'year',xlabel:'years',ylabel:'balance ($)',line:{m:add,b:P,label:'Account B (linear)'},fmt:v=>'$'+cm(Math.round(v))},
  steps:[{t:`Account A is exponential: ${cm(P)}·${SUP(fmt(1+rt/100),T)} ≈ ${money(e)}.`,f:'end'},{t:`Account B is linear: ${cm(P)} + ${add} × ${T} = ${money(l)}.`,f:'compare'},{t:`Difference ≈ ${money(Math.abs(e-l))} in favor of ${expWins?'Account A':'Account B'}. ${expWins?'Over long periods, compounding eventually beats any fixed deposit.':'Early on, a large fixed deposit can stay ahead of a small percentage.'}`,f:'compare'}]}}});
def({id:'m16',sk:'nonlin',dom:'adv',skill:'Quadratic equations · a uniform border around a rectangle',fmt:'spr',gen(r){const w=r.pick([4,5,6]),L=w+r.pick([2,3,4]),x=r.pick([1,2]);const A=(w+2*x)*(L+2*x);
 return{text:`A rectangular photo is ${w} inches by ${L} inches. It is surrounded by a frame of uniform width ${V('x')} inches. The total area of the photo and frame together is ${A} square inches. What is the width ${V('x')} of the frame, in inches?`,ans:x,ansText:`${x}`,
  viz:{type:'shape',kind:'rect',w:L+2*x,h:w+2*x,unit:'in',mode:'area',wl:`${L} + 2x`,hl:`${w} + 2x`},
  steps:[{t:`The frame adds ${V('x')} on every side, so the outer dimensions are (${L} + 2${V('x')}) by (${w} + 2${V('x')}).`,f:'area'},{t:`(${L} + 2${V('x')})(${w} + 2${V('x')}) = ${A} → 4${V('x')}² + ${2*(L+w)}${V('x')} + ${L*w} = ${A} → 4${V('x')}² + ${2*(L+w)}${V('x')} − ${A-L*w} = 0.`},{t:`Divide by 4: ${V('x')}² + ${(L+w)/2}${V('x')} − ${(A-L*w)/4} = 0 → (${V('x')} − ${x})(${V('x')} + ${x+(L+w)/2}) = 0, so ${V('x')} = ${x} inch${x>1?'es':''}.`,f:'area'}]}}});

/* ======== GEOMETRY & TRIGONOMETRY (extended) ======== */
def({id:'g7',sk:'area',dom:'geo',skill:'Volume · rectangular box',fmt:'spr',gen(r){const l=r.ri(8,20),w=r.ri(5,12),h=r.ri(4,10),Vv=l*w*h;
 return{text:`A shipping box is shaped like a rectangular prism ${l} inches long, ${w} inches wide, and ${h} inches tall. What is the volume of the box, in cubic inches?`,ans:Vv,ansText:cm(Vv),
  viz:{type:'shape',kind:'box',l,w,h,unit:'in'},
  steps:[{t:`Volume of a rectangular prism = length × width × height.`,f:'base'},{t:`Base area first: ${l} × ${w} = ${l*w} square inches.`,f:'base'},{t:`Stack ${h} inches of that base: ${l*w} × ${h} = ${cm(Vv)} cubic inches.`,f:'vol'}]}}});
def({id:'g8',sk:'area',dom:'geo',skill:'Area · composite (L-shaped) floor',fmt:'spr',gen(r){const ow=r.ri(12,20),oh=r.ri(10,16),cw=r.ri(4,ow-6),chh=r.ri(3,oh-4),cost=r.pick([2,3,4,5]);const A=ow*oh-cw*(oh-chh);
 return{text:`The floor plan of an L-shaped room is shown, with dimensions in feet. The room is ${ow} feet wide and ${oh} feet long, with a ${cw}-foot by ${oh-chh}-foot rectangular section missing from one corner. Carpet costs ${money(cost)} per square foot. What is the cost, in dollars, to carpet the entire room? (Disregard the $ sign when entering your answer.)`,ans:A*cost,ansText:cm(A*cost),
  viz:{type:'shape',kind:'lshape',ow,oh,cw,chh,unit:'ft'},
  steps:[{t:`Split the L into two rectangles along the dashed line.`,f:'split'},{t:`Top: ${ow} × ${chh} = ${ow*chh} ft². Bottom: ${ow-cw} × ${oh-chh} = ${(ow-cw)*(oh-chh)} ft². Total area = ${A} ft².`,f:'area'},{t:`(Or: full ${ow} × ${oh} = ${ow*oh} minus the missing ${cw} × ${oh-chh} = ${cw*(oh-chh)}.) Cost = ${A} × ${money(cost)} = ${money(A*cost)}.`,f:'area'}]}}});
def({id:'g9',sk:'area',dom:'geo',skill:'Area · triangle',fmt:'spr',gen(r){const b=r.pick([8,10,12,14,16]),h=r.pick([6,9,10,15]);const A=b*h/2;
 return{text:`A triangular sail on a small boat has a base of ${b} feet and a height of ${h} feet. What is the area of the sail, in square feet?`,ans:A,ansText:fmt(A),
  viz:{type:'shape',kind:'tri',legs:[b,h],hyp:+Math.hypot(b,h).toFixed(1),unit:'ft',area:true,cl:''},
  steps:[{t:`Area of a triangle = ½ × base × height. The height must be perpendicular to the base.`,f:'leg'},{t:`½ × ${b} × ${h} = ${fmt(A)} square feet.`,f:'area'},{t:`A triangle is half of the ${b} × ${h} rectangle around it, which is why the ½ appears.`,f:'area'}]}}});
def({id:'g10',sk:'area',dom:'geo',skill:'Volume · cone',fmt:'mc',gen(r){const rr=r.pick([3,4,6]),h=r.pick([6,9,12]);const N=rr*rr*h/3;
 const c=mc(r,`${fmt(N)}π`,[`${rr*rr*h}π`,`${fmt(rr*h/3)}π`,`${2*rr*h}π`,`${fmt(rr*rr*h/2)}π`,`${fmt(3*N)}π`]);
 return{text:`A conical paper cup has a radius of ${rr} centimeters and a height of ${h} centimeters. What is the volume of the cup, in cubic centimeters?`,...c,
  viz:{type:'shape',kind:'cone',r:rr,h,unit:'cm'},
  steps:[{t:`Volume of a cone = ⅓ × (base area) × height. The base is a circle of radius ${rr}: area ${rr*rr}π.`,f:'base'},{t:`⅓ × ${rr*rr}π × ${h} = ${fmt(N)}π cubic centimeters.`,f:'vol'},{t:`A cone holds exactly one third of the cylinder with the same base and height (${rr*rr*h}π), which is the usual trap answer.`,f:'third'}]}}});
def({id:'g11',sk:'area',dom:'geo',skill:'Area · effect of scaling the dimensions',fmt:'mc',gen(r){const k=r.pick([2,3,4]),w=r.pick([3,4,5]),h=r.pick([2,3]);
 const c=mc(r,`${k*k} times the area of the original`,[`${k} times the area of the original`,`${2*k} times the area of the original`,`${k*k*k} times the area of the original`,`${k+1} times the area of the original`]);
 return{text:`A photograph measures ${w} inches by ${h} inches. An enlargement is made in which both the length and the width are multiplied by ${k}. How does the area of the enlargement compare with the area of the original photograph?`,...c,
  viz:{type:'shape',kind:'rect',w:w*k,h:h*k,unit:'in',mode:'area',wl:`${w} × ${k} = ${w*k} in`,hl:`${h} × ${k} = ${h*k} in`},
  steps:[{t:`Original area: ${w} × ${h} = ${w*h} in².`,f:'area'},{t:`New area: (${k}·${w}) × (${k}·${h}) = ${k}² × (${w} × ${h}) = ${k*k} × ${w*h} = ${w*h*k*k} in².`,f:'area'},{t:`Scaling every length by ${k} scales area by ${k}² = ${k*k} (and volume by ${k}³).`,f:'area'}]}}});
def({id:'g12',sk:'area',dom:'geo',skill:'Volume with unit conversion · filling a pool',fmt:'spr',gen(r){const l=r.pick([20,25,30]),w=r.pick([10,12,15]),d=r.pick([4,5]),g=7.5;const cu=l*w*d,gal=cu*g;
 return{text:`A rectangular swimming pool is ${l} feet long, ${w} feet wide, and ${d} feet deep. One cubic foot holds approximately 7.5 gallons of water. Approximately how many gallons of water are needed to fill the pool completely?`,ans:gal,ansText:cm(gal),tol:gal*0.005,
  viz:{type:'pipeline',stages:[{label:'dimensions',value:`${l}×${w}×${d} ft`},{label:'volume',value:`${cm(cu)} ft³`},{label:'water',value:`${cm(gal)} gal`}],ops:['multiply','× 7.5 gal/ft³']},
  steps:[{t:`Volume in cubic feet: ${l} × ${w} × ${d} = ${cm(cu)} ft³.`,f:'s1'},{t:`Convert with the given rate: ${cm(cu)} ft³ × 7.5 gal/ft³.`,f:'s2'},{t:`≈ ${cm(gal)} gallons.`,f:'s2'}]}}});
def({id:'g13',sk:'lines',dom:'geo',skill:'Triangles · angle sum',fmt:'spr',gen(r){let A=r.ri(30,70),B=r.ri(25,60),Cc=180-A-B;while(Cc<25){A=r.ri(30,70);B=r.ri(25,60);Cc=180-A-B}
 return{text:`In a triangular garden bed, one angle measures ${A}° and another measures ${B}°. What is the measure, in degrees, of the third angle?`,ans:Cc,ansText:`${Cc}`,
  viz:{type:'angles',kind:'tri',angles:[A,B,Cc],labels:[`${A}°`,`${B}°`,'?']},
  steps:[{t:`The angles of any triangle add to 180°.`,f:'sum'},{t:`${A} + ${B} = ${A+B}.`,f:'A'},{t:`Third angle = 180 − ${A+B} = ${Cc}°.`,f:'C'}]}}});
def({id:'g14',sk:'lines',dom:'geo',skill:'Parallel lines · angles formed by a transversal',fmt:'spr',gen(r){const a=r.pick([35,40,48,55,62,70,115,125]);const ask=r.pick([2,3]);const ans=ask===2?a:180-a;
 return{text:`Two parallel streets are crossed by a straight avenue. At the first intersection, one of the angles between the avenue and the street measures ${a}°. What is the measure, in degrees, of the angle marked "?" at the second intersection?`,ans,ansText:`${ans}`,
  viz:{type:'angles',kind:'parallel',angle:a,show:[0,ask],ask},
  steps:[{t:`The two streets are parallel, so the avenue makes the same angles with both of them.`,f:'corr'},{t:ask===2?`The marked angle is in the corresponding position to the ${a}° angle (same side of the avenue, same side of each street), so it equals ${a}°.`:`The corresponding angle at the second intersection is ${a}°; the marked angle is next to it on a straight line.`,f:'a'+ask},{t:ask===2?`Answer: ${a}°.`:`180 − ${a} = ${ans}°.`,f:ask===2?'corr':'supp'}]}}});
def({id:'g15',sk:'lines',dom:'geo',skill:'Isosceles triangle · finding the base angles',fmt:'spr',gen(r){const top=r.pick([20,30,40,50,70,100]);const base=(180-top)/2;
 return{text:`A roof truss is shaped like an isosceles triangle. The angle at the peak of the roof measures ${top}°. What is the measure, in degrees, of each of the two equal base angles?`,ans:base,ansText:`${base}`,
  viz:{type:'angles',kind:'tri',angles:[base,base,top],labels:['?','?',`${top}°`]},
  steps:[{t:`In an isosceles triangle the two base angles are equal; call each ${V('x')}.`,f:'A'},{t:`${V('x')} + ${V('x')} + ${top} = 180, so 2${V('x')} = ${180-top}.`,f:'sum'},{t:`${V('x')} = ${base}°.`,f:'B'}]}}});
def({id:'g16',sk:'lines',dom:'geo',skill:'Triangles · exterior angle',fmt:'spr',gen(r){let A=r.ri(35,70),Cc=r.ri(30,60),B=180-A-Cc;while(B<25){A=r.ri(35,70);Cc=r.ri(30,60);B=180-A-Cc}
 return{text:`A ramp meets a wall so that one side of the triangle formed is extended past a vertex, creating an exterior angle. Two of the triangle's interior angles measure ${A}° and ${Cc}°, and the exterior angle is at the third vertex. What is the measure, in degrees, of the exterior angle?`,ans:A+Cc,ansText:`${A+Cc}`,
  viz:{type:'angles',kind:'ext',angles:[A,B,Cc],labels:[`${A}°`,`${B}°`,`${Cc}°`],extLabel:'?'},
  steps:[{t:`The exterior angle and the interior angle at that vertex form a straight line: they add to 180°.`,f:'B'},{t:`Interior angle at that vertex: 180 − ${A} − ${Cc} = ${B}°. Exterior = 180 − ${B} = ${A+Cc}°.`,f:'E'},{t:`Shortcut: an exterior angle equals the sum of the two remote interior angles, ${A} + ${Cc} = ${A+Cc}°.`,f:'ext'}]}}});
def({id:'g17',sk:'trig',dom:'geo',skill:'Right-triangle trigonometry · angle of elevation (tangent)',fmt:'mc',gen(r){const d=r.pick([40,50,60,80,100]),ang=r.pick([25,30,35,40,50]);const rad=ang*Math.PI/180,h=d*Math.tan(rad);
 const c=mc(r,`${d} tan ${ang}°`,[`${d} sin ${ang}°`,`${d} cos ${ang}°`,`${FR(d,'tan '+ang+'°')}`]);
 return{text:`From a point on level ground ${d} feet from the base of a building, the angle of elevation to the top of the building is ${ang}°. Which expression gives the height of the building, in feet?`,...c,
  viz:{type:'shape',kind:'tri',legs:[d,+h.toFixed(2)],hyp:+Math.hypot(d,h).toFixed(1),unit:'ft',angle:ang,al:`${d} ft`,bl:'height = ?',cl:'',angNote:`tan ${ang}° = opposite / adjacent = height / ${d}`,legNote:`height = ${d} tan ${ang}° ≈ ${fmt(h,1)} ft`},
  steps:[{t:`The ground distance (${d} ft) is adjacent to the angle; the height is opposite it. The hypotenuse isn't given, so use tangent.`,f:'angle'},{t:`TOA: tan ${ang}° = height ÷ ${d}.`,f:'angle'},{t:`Height = ${d} tan ${ang}° ≈ ${fmt(h,1)} feet.`,f:'leg2'}]}}});
def({id:'g18',sk:'trig',dom:'geo',skill:'Special right triangles · diagonal of a square',fmt:'mc',gen(r){const s=r.pick([20,30,40,50,60]);
 const c=mc(r,`${s}√2`,[`${s}√3`,`${2*s}`,`${s/2}√2`]);
 return{text:`A square courtyard has sides of length ${s} meters. A walkway runs diagonally from one corner of the courtyard to the opposite corner. What is the length of the walkway, in meters?`,...c,
  viz:{type:'shape',kind:'tri',legs:[s,s],hyp:+(s*Math.SQRT2).toFixed(2),unit:'m',angle:45,al:`${s} m`,bl:`${s} m`,cl:`${s}√2 m`,angNote:'45-45-90 triangle: legs equal, hypotenuse = leg × √2',legNote:`${s}² + ${s}² = ${2*s*s}`},
  steps:[{t:`The diagonal splits the square into two right triangles with legs ${s} and ${s}.`,f:'leg'},{t:`Pythagorean theorem: ${s}² + ${s}² = ${2*s*s}, so the diagonal is √${2*s*s} = ${s}√2.`,f:'leg2'},{t:`Every 45-45-90 triangle has hypotenuse = leg × √2 ≈ ${fmt(s*Math.SQRT2,1)} m here.`,f:'angle'}]}}});
def({id:'g19',sk:'trig',dom:'geo',skill:'Right-triangle trigonometry · cosine (adjacent side)',fmt:'spr',gen(r){const L=r.pick([20,30,40,50]),ang=r.pick([60]);const d=L*Math.cos(Math.PI/3),h=L*Math.sin(Math.PI/3);
 return{text:`A ${L}-foot guy wire is attached to the top of a vertical pole and anchored to level ground, making a ${ang}° angle with the ground. How many feet from the base of the pole is the wire anchored?`,ans:d,ansText:fmt(d),
  viz:{type:'shape',kind:'tri',legs:[+d.toFixed(2),+h.toFixed(2)],hyp:L,unit:'ft',angle:ang,al:'? ft',bl:`${fmt(h,1)} ft`,cl:`${L} ft`,angNote:`cos ${ang}° = adjacent / hypotenuse = d / ${L}`,hypNote:`the wire is the hypotenuse: ${L} ft`},
  steps:[{t:`The wire is the hypotenuse (${L} ft); the ground distance is adjacent to the ${ang}° angle.`,f:'hyp'},{t:`CAH: cos ${ang}° = d ÷ ${L}, and cos 60° = ½.`,f:'angle'},{t:`d = ${L} × ½ = ${fmt(d)} feet.`,f:'leg'}]}}});
def({id:'g20',sk:'circ',dom:'geo',skill:'Circles · arc length',fmt:'mc',gen(r){const rr=r.pick([6,8,9,12,18]),ang=r.pick([60,90,120,150]);const arc=2*rr*ang/360;
 const c=mc(r,`${fmt(arc)}π`,[`${fmt(rr*rr*ang/360)}π`,`${2*rr}π`,`${fmt(arc*2)}π`,`${fmt(rr*ang/360)}π`,`${fmt(arc/2)}π`]);
 return{text:`A circular pizza has a radius of ${rr} inches. A slice is cut with a central angle of ${ang}°. What is the length, in inches, of the curved crust edge of the slice?`,...c,
  viz:{type:'shape',kind:'sector',r:rr,angle:ang,unit:'in'},
  steps:[{t:`The whole crust (circumference) is 2π(${rr}) = ${2*rr}π inches.`,f:'arc'},{t:`The slice is ${ang}/360 = ${frac(ang,360)} of the circle.`,f:'frac'},{t:`Arc length = ${frac(ang,360)} × ${2*rr}π = ${fmt(arc)}π inches.`,f:'arc'}]}}});
def({id:'g21',sk:'circ',dom:'geo',skill:'Circles · sector area',fmt:'mc',gen(r){const rr=r.pick([6,9,12,15,18]),ang=r.pick([60,90,120,240]);const A=rr*rr*ang/360;
 const c=mc(r,`${fmt(A)}π`,[`${fmt(2*rr*ang/360)}π`,`${rr*rr}π`,`${fmt(A/2)}π`]);
 return{text:`A lawn sprinkler sprays water in a circular sector with a radius of ${rr} feet and a central angle of ${ang}°. What is the area, in square feet, of the lawn that the sprinkler waters?`,...c,
  viz:{type:'shape',kind:'sector',r:rr,angle:ang,unit:'ft'},
  steps:[{t:`Area of the full circle: π(${rr})² = ${rr*rr}π ft².`,f:'area'},{t:`The sector is ${ang}/360 = ${frac(ang,360)} of the circle.`,f:'frac'},{t:`Sector area = ${frac(ang,360)} × ${rr*rr}π = ${fmt(A)}π ft². (Arc length would be ${fmt(2*rr*ang/360)}π, a length not an area.)`,f:'area'}]}}});
def({id:'g22',sk:'circ',dom:'geo',skill:'Circles · area from a diameter',fmt:'mc',gen(r){const d=r.pick([10,12,14,16,20]);const rr=d/2;
 const c=mc(r,`${rr*rr}π`,[`${d*d}π`,`${d}π`,`${rr}π`,`${4*rr}π`]);
 return{text:`A circular fountain has a diameter of ${d} meters. What is the area, in square meters, of the base of the fountain?`,...c,
  viz:{type:'shape',kind:'sector',r:rr,angle:360,unit:'m'},
  steps:[{t:`The diameter is ${d} m, so the radius is half of that: ${rr} m. Using ${d} as the radius is the classic error.`,f:'frac'},{t:`Area = π${SUP(V('r'),2)} = π(${rr})² = ${rr*rr}π.`,f:'area'},{t:`≈ ${fmt(rr*rr*Math.PI,1)} square meters.`,f:'area'}]}}});

/* ============================== 3. BLUEPRINT GAP EXTENSION ============================== */
/* Original SAT-style items. These add advanced representations and subtypes absent from the first 100. */

def({id:'a27',sk:'lin2',dom:'alg',skill:'Linear equations in two variables · solving a formula for a variable',fmt:'mc',difficulty:'Hard',gen(r){const fee=r.pick([8,12,15,20]),rate=r.pick([3,4,5,6]);
 const correct=FR(`${V('C')} − ${fee}`,rate),c=mc(r,correct,[FR(`${V('C')} + ${fee}`,rate),`${rate}(${V('C')} − ${fee})`,FR(V('C'),`${rate} − ${fee}`)]);
 return{text:`A delivery company charges a fixed service fee of $${fee} plus $${rate} for each package. The total charge ${V('C')}, in dollars, for delivering ${V('n')} packages is ${V('C')} = ${rate}${V('n')} + ${fee}. Which expression gives ${V('n')} in terms of ${V('C')}?`,...c,
  viz:{type:'balance',left:`C = ${rate}n + ${fee}`,right:`C − ${fee} = ${rate}n`,operation:`subtract ${fee}, then divide by ${rate}`,result:`n = (C − ${fee})/${rate}`},
  steps:[{t:`Undo the fixed fee first: ${V('C')} − ${fee} = ${rate}${V('n')}.`,f:'right'},{t:`Divide both sides by the per-package rate ${rate}: ${V('n')} = ${FR(`${V('C')} − ${fee}`,rate)}.`,f:'result'},{t:`Check the units: dollars divided by dollars per package leaves packages.`,f:'result'}]}}});

def({id:'a28',sk:'sys',dom:'alg',skill:'Systems of linear equations · infinitely many solutions',fmt:'mc',difficulty:'Hard',gen(r){const rate=r.pick([4,5,6,8]),fee=r.pick([10,15,20,25]);
 const c=mc(r,`${rate}`,[`${fee}`,`${rate+fee}`,`${Math.max(1,rate-1)}`]);
 return{text:`Plan A for a bike rental costs $${fee} plus $${rate} per hour. Plan B costs $${fee} plus $${V('k')} per hour. For what value of ${V('k')} will the two plans have the same cost for every possible number of rental hours?`,...c,
  viz:{type:'linegraph',xmax:8,ymax:fee+rate*8+10,xlabel:'hours',ylabel:'cost ($)',lines:[{m:rate,b:fee,color:C.signal,label:'Plan A'},{m:rate,b:fee,color:C.orange,label:'Plan B'}],point:{x:5,y:fee+5*rate,label:'same line'}},
  steps:[{t:`For the plans to match for every number of hours, their graphs must be the same line—not merely cross once.`,f:'intersect'},{t:`The fixed fees already match at $${fee}. Their hourly rates must also match, so ${V('k')} = ${rate}.`,f:'slope'},{t:`Then both rules are ${V('C')} = ${rate}${V('h')} + ${fee}, giving infinitely many solutions.`,f:'intercept'}]}}});

def({id:'a29',sk:'sys',dom:'alg',skill:'Systems of linear equations · no solution',fmt:'mc',difficulty:'Medium',gen(r){const rate=r.pick([3,4,6,8]),f1=r.pick([10,15,20]),f2=f1+r.pick([5,8,10]);
 const correct='The plans never cost the same because they have equal hourly rates and different fixed fees';const c=mc(r,correct,[`The plans cost the same after ${fmt((f2-f1)/rate)} hours`,'The plans cost the same for every number of hours','The plans cost the same only when the number of hours is 0']);
 return{text:`Gym Plan A charges a $${f1} enrollment fee plus $${rate} per visit. Plan B charges a $${f2} enrollment fee plus $${rate} per visit. Which statement about the two plans is true?`,...c,
  viz:{type:'linegraph',xmax:10,ymax:f2+rate*10+5,xlabel:'visits',ylabel:'total cost ($)',lines:[{m:rate,b:f1,color:C.signal,label:'Plan A'},{m:rate,b:f2,color:C.orange,label:'Plan B'}]},
  steps:[{t:`Both cost lines have slope ${rate}, so they rise at the same rate and are parallel.`,f:'slope'},{t:`Their ${V('y')}-intercepts are different: $${f1} and $${f2}. Parallel distinct lines never intersect.`,f:'intercept'},{t:`Therefore the system has no solution: there is no visit count for which the costs match.`,f:'intersect'}]}}});

def({id:'a30',sk:'lin1',dom:'alg',skill:'Linear equations in one variable · unknown coefficient for an identity',fmt:'spr',difficulty:'Hard',gen(r){const k=r.pick([2,3,4,5,6]),add=r.pick([2,3,4]);const constant=k*add;
 return{text:`Two calibration teams write the same sensor output in different forms. One team writes ${V('k')}(${V('x')} + ${add}), and the other writes ${k}${V('x')} + ${constant}. If the expressions are equal for every value of ${V('x')}, what is the value of ${V('k')}?`,ans:k,ansText:`${k}`,
  viz:{type:'balance',left:`k(x + ${add})`,right:`${k}x + ${constant}`,operation:'match the coefficient of x and the constant term',result:`k = ${k};  ${add}k = ${constant}`},
  steps:[{t:`Distribute on the left: ${V('k')}(${V('x')} + ${add}) = ${V('k')}${V('x')} + ${add}${V('k')}.`,f:'left'},{t:`For the expressions to agree for every ${V('x')}, corresponding coefficients must match. The coefficient of ${V('x')} gives ${V('k')} = ${k}.`,f:'right'},{t:`The constant check agrees: ${add}(${k}) = ${constant}.`,f:'result'}]}}});

def({id:'a31',sk:'sys',dom:'alg',skill:'Systems of linear equations · interpreting an intersection',fmt:'mc',difficulty:'Medium',gen(r){const r1=r.pick([2,3,4]),r2=r1+r.pick([2,3]),f1=r.pick([20,24,30]),x=r.pick([4,5,6]),f2=f1-(r2-r1)*x,y=f1+r1*x;
 const correct=`After ${x} uses, both plans cost $${y}`;const c=mc(r,correct,[`Plan A always costs $${y} more than Plan B`,`The combined cost of both plans is $${y} after ${x} uses`,`Plan A costs $${x} per use and Plan B costs $${y} per use`]);
 return{text:`Two equipment-rental plans are represented by lines on a graph of total cost versus number of uses. The lines intersect at (${x}, ${y}). Which statement best interprets this point in context?`,...c,
  viz:{type:'linegraph',xmax:10,ymax:Math.max(f1+r1*10,f2+r2*10)+8,xlabel:'number of uses',ylabel:'total cost ($)',lines:[{m:r1,b:f1,color:C.signal,label:'Plan A'},{m:r2,b:f2,color:C.orange,label:'Plan B'}],point:{x,y,label:`(${x}, ${y})`}},
  steps:[{t:`At an intersection, the two models have the same input and the same output.`,f:'intersect'},{t:`The input ${x} represents ${x} uses; the output ${y} represents a total cost of $${y}.`,f:'point'},{t:`So after ${x} uses, both plans cost $${y}.`,f:'point'}]}}});

def({id:'a32',sk:'ineq',dom:'alg',skill:'Linear inequalities · minimum integer that satisfies a requirement',fmt:'spr',difficulty:'Medium',gen(r){const per=r.pick([2,3,4,5]),base=r.pick([8,10,12]),n=r.ri(5,12),goal=base+per*n-r.ri(0,per-1);const ans=Math.ceil((goal-base)/per);
 return{text:`A service club has already completed ${base} volunteer hours. Each remaining member will complete ${per} additional hours. What is the least number of remaining members needed for the club to complete at least ${goal} hours in total?`,ans,ansText:`${ans}`,
  viz:{type:'numberline',min:0,max:Math.max(ans+5,12),bound:(goal-base)/per,dir:'ge',inclusive:true,label:'members',ans,unit:'whole members',intLabel:`least whole number: ${ans}`},
  steps:[{t:`Let ${V('m')} be the number of remaining members. “At least” means ${base} + ${per}${V('m')} ≥ ${goal}.`,f:'result'},{t:`Subtract ${base}: ${per}${V('m')} ≥ ${goal-base}. Then divide by ${per}: ${V('m')} ≥ ${fmt((goal-base)/per,2)}.`,f:'result'},{t:`A fraction of a member is impossible, so round up to the least whole number: ${ans}.`,f:'int'}]}}});

def({id:'m17',sk:'equiv',dom:'adv',skill:'Equivalent expressions · factoring a common factor',fmt:'mc',difficulty:'Medium',gen(r){const w=r.pick([3,4,5,6]),a=r.pick([2,3,4]),b=r.pick([5,6,7]);
 const correct=`${w}(${V('x')} + ${a+b})`,c=mc(r,correct,[`${w}${V('x')} + ${a+b}`,`${w}(${V('x')} + ${a*b})`,`${w*w}(${V('x')} + ${a+b})`]);
 return{text:`The area of a banner is modeled by ${w}${V('x')} + ${w*a} + ${w*b} square feet. Which equivalent expression best reveals the common width of the banner?`,...c,
  viz:{type:'shape',kind:'rect',w:a+b+6,h:w,unit:'ft',mode:'area',wl:`x + ${a+b}`,hl:`${w}`},
  steps:[{t:`Every term contains the common factor ${w}: ${w}${V('x')} + ${w}(${a}) + ${w}(${b}).`,f:'area'},{t:`Factor out ${w}: ${w}(${V('x')} + ${a} + ${b}).`,f:'area'},{t:`Combine the constants inside: ${w}(${V('x')} + ${a+b}).`,f:'area'}]}}});

def({id:'m18',sk:'equiv',dom:'adv',skill:'Equivalent expressions · expanding a product of binomials',fmt:'mc',difficulty:'Medium',gen(r){const a=r.pick([2,3,4,5]),b=r.pick([6,7,8]);
 const correct=`${SUP(V('x'),2)} + ${a+b}${V('x')} + ${a*b}`,c=mc(r,correct,[`${SUP(V('x'),2)} + ${a*b}`,`${SUP(V('x'),2)} + ${a*b}${V('x')} + ${a+b}`,`${SUP(V('x'),2)} + ${b-a}${V('x')} + ${a*b}`]);
 return{text:`A rectangular habitat has side lengths (${V('x')} + ${a}) meters and (${V('x')} + ${b}) meters. Which expression is equivalent to the area of the habitat?`,...c,
  viz:{type:'balance',left:`(x + ${a})(x + ${b})`,right:`x² + ${a+b}x + ${a*b}`,operation:'multiply each term in one binomial by each term in the other',result:`area = x² + ${a+b}x + ${a*b}`},
  steps:[{t:`Multiply: (${V('x')} + ${a})(${V('x')} + ${b}) = ${SUP(V('x'),2)} + ${b}${V('x')} + ${a}${V('x')} + ${a*b}.`,f:'left'},{t:`Combine the two middle terms: ${b}${V('x')} + ${a}${V('x')} = ${a+b}${V('x')}.`,f:'right'},{t:`The equivalent area expression is ${SUP(V('x'),2)} + ${a+b}${V('x')} + ${a*b}.`,f:'result'}]}}});

def({id:'m19',sk:'nonlin',dom:'adv',skill:'Absolute value equations · tolerance around a target',fmt:'mc',difficulty:'Medium',gen(r){const target=r.pick([68,70,72,75]),tol=r.pick([2,3,4]);
 const correct=`From ${target-tol}°F through ${target+tol}°F, inclusive`,c=mc(r,correct,[`From ${tol}°F through ${target}°F, inclusive`,`Temperatures below ${target-tol}°F or above ${target+tol}°F`,`Only ${target+tol}°F`]);
 return{text:`A laboratory chamber passes inspection when its temperature ${V('T')} is no more than ${tol}°F from the target temperature of ${target}°F. Which set of temperatures passes inspection?`,...c,
  viz:{type:'balance',left:`|T − ${target}| ≤ ${tol}`,right:`−${tol} ≤ T − ${target} ≤ ${tol}`,operation:`add ${target} to all three parts`,result:`${target-tol} ≤ T ≤ ${target+tol}`,trap:'distance from a target creates two boundary values'},
  steps:[{t:`Distance from ${target} is represented by |${V('T')} − ${target}|. “No more than ${tol}” gives |${V('T')} − ${target}| ≤ ${tol}.`,f:'left'},{t:`Rewrite as a compound inequality: −${tol} ≤ ${V('T')} − ${target} ≤ ${tol}.`,f:'right'},{t:`Add ${target}: ${target-tol} ≤ ${V('T')} ≤ ${target+tol}. Both endpoints are included.`,f:'result'}]}}});

def({id:'m20',sk:'nonlin',dom:'adv',skill:'Radical equations · solving a square-root model',fmt:'spr',difficulty:'Medium',gen(r){const t=r.pick([2,3,4,5,6]),d=16*t*t;
 return{text:`Ignoring air resistance, the time ${V('t')}, in seconds, for an object to fall ${V('d')} feet is modeled by ${V('t')} = ${FR(`√${V('d')}`,4)}. How many seconds will it take an object to fall ${d} feet?`,ans:t,ansText:`${t}`,
  viz:{type:'pipeline',stages:[{label:'distance',value:`${d} ft`},{label:'square root',value:`√${d} = ${4*t}`},{label:'divide by 4',value:`${t} s`}],ops:['take √','÷ 4']},
  steps:[{t:`Substitute ${V('d')} = ${d}: ${V('t')} = ${FR(`√${d}`,4)}.`,f:'s0'},{t:`Because ${d} = ${4*t}², √${d} = ${4*t}.`,f:'s1'},{t:`${V('t')} = ${4*t} ÷ 4 = ${t} seconds.`,f:'s2'}]}}});

def({id:'m21',sk:'nonlin',dom:'adv',skill:'Rational equations · finding an unknown work rate',fmt:'spr',difficulty:'Hard',gen(r){const a=r.pick([4,8,12]),b=a*3,T=a*b/(a+b);
 return{text:`Pump A can empty a tank by itself in ${a} hours. When Pump A and Pump B work together, they can empty the tank in ${fmt(T)} hours. How many hours would Pump B take to empty the tank by itself?`,ans:b,ansText:`${b}`,
  viz:{type:'motion',lanes:true,len:a*b,unit:'work units',tunit:'hr',T,movers:[{label:`A: ${b} units/hr`,start:0,speed:b,dir:1,color:C.signal},{label:`B: ${a} units/hr`,start:0,speed:a,dir:1,color:C.orange}]},
  steps:[{t:`Use fractions of one tank per hour: ${FR(1,a)} + ${FR(1,V('b'))} = ${FR(1,fmt(T))}.`,f:'rate'},{t:`The together rate is ${FR(1,fmt(T))}; subtract Pump A's rate: ${FR(1,V('b'))} = ${FR(1,fmt(T))} − ${FR(1,a)} = ${FR(1,b)}.`,f:'total'},{t:`Therefore Pump B alone takes ${b} hours.`,f:'total'}]}}});

def({id:'m22',sk:'nonf',dom:'adv',skill:'Quadratic functions · interpreting a positive zero',fmt:'mc',difficulty:'Medium',gen(r){const root=r.pick([5,6,8,10]),peak=root/2,A=r.pick([80,120,160]);const k=A/(peak*peak);
 const correct=`The project breaks even ${root} months after launch`,c=mc(r,correct,[`The project earns $${root} thousand each month`,`The maximum profit is reached after ${root} months`,`The initial cost of the project is $${root} thousand`]);
 return{text:`A startup models the cumulative profit ${V('P')}, in thousands of dollars, from a project by a downward-opening quadratic. The graph crosses the time axis at ${V('t')} = 0 and ${V('t')} = ${root}. What does the positive zero ${root} represent?`,...c,
  viz:{type:'parabola',a:-k,b:k*root,c:0,xmax:root,xlabel:'months after launch',ylabel:'profit ($ thousands)',xu:'months',yu:'thousand $',landLabel:`P = 0 again at t = ${root} months`},
  steps:[{t:`A zero of the profit function is a time when ${V('P')} = 0.`,f:'land'},{t:`Profit equal to zero means revenue and cost are equal—the project breaks even.`,f:'land'},{t:`Thus ${V('t')} = ${root} means the project breaks even ${root} months after launch.`,f:'land'}]}}});

def({id:'m23',sk:'nonlin',dom:'adv',skill:'Systems of equations · one linear and one quadratic model',fmt:'spr',difficulty:'Hard',gen(r){const u=r.pick([2,3]),v=u+r.pick([3,4]),m=u+v,q=-u*v,y=v*v;
 return{text:`Two engineering models predict the same output when ${V('y')} = ${SUP(V('x'),2)} and ${V('y')} = ${m}${V('x')} − ${u*v}. What is the greater ${V('x')}-value at which the models predict the same output?`,ans:v,ansText:`${v}`,
  viz:{type:'systemgraph',xmin:0,xmax:v+2,ymin:-u*v-2,ymax:(v+2)*(v+2)+4,a:1,b:0,c:0,m,q,points:[[u,u*u,`x = ${u}`],[v,y,`x = ${v}`]],curveLabel:'y = x²',lineLabel:`y = ${m}x − ${u*v}`},
  steps:[{t:`Set the outputs equal: ${SUP(V('x'),2)} = ${m}${V('x')} − ${u*v}.`,f:'intersect'},{t:`Move all terms to one side: ${SUP(V('x'),2)} − ${m}${V('x')} + ${u*v} = 0 = (${V('x')} − ${u})(${V('x')} − ${v}).`,f:'intersect'},{t:`The intersection inputs are ${u} and ${v}; the greater value is ${v}.`,f:'intersect'}]}}});

def({id:'m24',sk:'nonf',dom:'adv',skill:'Quadratic functions · selecting vertex form from a context',fmt:'mc',difficulty:'Hard',gen(r){const h=r.pick([3,4,5]),k=r.pick([18,24,30]),a=r.pick([1,2]);
 const correct=`${V('y')} = −${a}(${V('x')} − ${h})² + ${k}`,c=mc(r,correct,[`${V('y')} = −${a}(${V('x')} + ${h})² + ${k}`,`${V('y')} = ${a}(${V('x')} − ${h})² + ${k}`,`${V('y')} = −${a}(${V('x')} − ${k})² + ${h}`]);
 return{text:`The arch of a pedestrian bridge is modeled by a parabola whose maximum point is (${h}, ${k}). The parabola opens downward and has vertical scale factor ${a}. Which equation models the arch?`,...c,
  viz:{type:'parabola',a:-a,b:2*a*h,c:k-a*h*h,xmax:2*h,xlabel:'horizontal position',ylabel:'height',vtxLabel:`maximum at (${h}, ${k})`},
  steps:[{t:`Vertex form is ${V('y')} = ${V('a')}(${V('x')} − ${V('h')})² + ${V('k')}, with vertex (${V('h')}, ${V('k')}).`,f:'vertex'},{t:`The vertex (${h}, ${k}) gives (${V('x')} − ${h})² + ${k}.`,f:'vertex'},{t:`Opening downward makes the coefficient negative, and the scale factor is ${a}: ${V('y')} = −${a}(${V('x')} − ${h})² + ${k}.`,f:'vertex'}]}}});

def({id:'m25',sk:'nonf',dom:'adv',skill:'Exponential functions · interpreting a growth factor as a percent',fmt:'spr',difficulty:'Medium',gen(r){const pct=r.pick([3,4,5,6,8,12]),base=1+pct/100,N=r.pick([500,800,1200]);
 return{text:`A wildlife population is modeled by ${V('P')} = ${N}(${fmt(base,2)})${SUP('',V('t'))}, where ${V('t')} is the number of years after a survey. By what percent does the model predict the population will increase each year?`,ans:pct,ansText:`${pct}`,
  viz:{type:'growth',a:N,base,k:1,T:5,period:1,perLabel:'year',xlabel:'years',ylabel:'population'},
  steps:[{t:`An exponential growth model has factor 1 + ${V('r')}. Here 1 + ${V('r')} = ${fmt(base,2)}.`,f:'factor'},{t:`Subtract 1: ${V('r')} = ${fmt(base,2)} − 1 = ${fmt(pct/100,2)}.`,f:'factor'},{t:`Convert the decimal to a percent: ${fmt(pct/100,2)} × 100 = ${pct}%.`,f:'end'}]}}});

def({id:'m26',sk:'nonlin',dom:'adv',skill:'Exponential equations · solving for time using common powers',fmt:'spr',difficulty:'Medium',gen(r){const N=r.pick([150,200,300]),per=r.pick([2,3,4]),n=r.pick([3,4,5]),T=per*n,target=N*Math.pow(2,n);
 return{text:`A culture begins with ${N} cells and doubles every ${per} hours. After how many hours will the culture contain ${cm(target)} cells?`,ans:T,ansText:`${T}`,
  viz:{type:'growth',a:N,base:2,k:1/per,T,period:per,perLabel:`${per} hours`,xlabel:'hours',ylabel:'cells'},
  steps:[{t:`Model the culture by ${V('P')} = ${N}·2${SUP('',`${V('t')}/${per}`)}.`,f:'start'},{t:`Set ${N}·2${SUP('',`${V('t')}/${per}`)} = ${target}. Divide by ${N}: 2${SUP('',`${V('t')}/${per}`)} = ${Math.pow(2,n)} = 2${SUP('',n)}.`,f:'factor'},{t:`Equal bases have equal exponents: ${V('t')}/${per} = ${n}, so ${V('t')} = ${T} hours.`,f:'end'}]}}});

def({id:'m27',sk:'nonf',dom:'adv',skill:'Quadratic functions · finding an unknown coefficient from a point',fmt:'spr',difficulty:'Hard',gen(r){const k=r.pick([1,2,3]),b=r.pick([8,10,12]),c=r.pick([2,4,6]),x=r.pick([1,2]),y=-k*x*x+b*x+c;
 return{text:`The height of a model rocket is given by ${V('h')}(${V('t')}) = −${V('k')}${SUP(V('t'),2)} + ${b}${V('t')} + ${c}. If the rocket is ${y} meters high at ${V('t')} = ${x} seconds, what is the value of ${V('k')}?`,ans:k,ansText:`${k}`,
  viz:{type:'parabola',a:-k,b,c,xmax:Math.ceil((b+Math.sqrt(b*b+4*k*c))/(2*k)),xlabel:'time (seconds)',ylabel:'height (meters)',yu:'m'},
  steps:[{t:`Substitute the point (${x}, ${y}): ${y} = −${V('k')}(${x})² + ${b}(${x}) + ${c}.`,f:'start'},{t:`Simplify: ${y} = −${x*x}${V('k')} + ${b*x+c}, so ${x*x}${V('k')} = ${b*x+c-y}.`,f:'vertex'},{t:`${V('k')} = ${b*x+c-y} ÷ ${x*x} = ${k}.`,f:'vertex'}]}}});

def({id:'m28',sk:'equiv',dom:'adv',skill:'Equivalent expressions · rational exponents in a volume model',fmt:'mc',difficulty:'Hard',gen(r){const side=r.pick([3,4,5,6]),vol=side*side*side;
 const correct=`6${SUP(V('V'),'2/3')}`,c=mc(r,correct,[`6${SUP(V('V'),'1/3')}`,`${SUP(`(6${V('V')})`,'2/3')}`,`${SUP(V('V'),'2')}/3`]);
 return{text:`A cube has volume ${V('V')} cubic units. Which expression gives the surface area of the cube in terms of ${V('V')}?`,...c,
  viz:{type:'shape',kind:'box',l:side,w:side,h:side,unit:'unit'},
  steps:[{t:`If the side length is ${V('s')}, then ${V('V')} = ${SUP(V('s'),3)}, so ${V('s')} = ${SUP(V('V'),'1/3')}.`,f:'base'},{t:`A cube has 6 square faces, each with area ${SUP(V('s'),2)}. Thus surface area = 6${SUP(V('s'),2)}.`,f:'base'},{t:`Substitute ${V('s')} = ${SUP(V('V'),'1/3')}: 6(${SUP(V('V'),'1/3')})² = 6${SUP(V('V'),'2/3')}. Example check: ${V('V')} = ${vol} gives 6(${side}²) = ${6*side*side}.`,f:'vol'}]}}});

def({id:'m29',sk:'nonf',dom:'adv',skill:'Polynomial functions · zeros from factored form',fmt:'mc',difficulty:'Medium',gen(r){const a=r.pick([2,3,4]),b=a+r.pick([3,4,5]);
 const correct=`${a} and ${b}`,c=mc(r,correct,[`${-a} and ${-b}`,`${a+b} and ${a*b}`,`${b-a} and ${a+b}`]);
 return{text:`A company's weekly profit model is ${V('P')}(${V('x')}) = −(${V('x')} − ${a})(${V('x')} − ${b}), where ${V('x')} is the number of hundreds of units sold. At which values of ${V('x')} does the model predict the company breaks even?`,...c,
  viz:{type:'systemgraph',xmin:0,xmax:b+2,ymin:-8,ymax:Math.ceil(Math.pow(b-a,2)/4)+5,a:-1,b:a+b,c:-a*b,m:0,q:0,points:[[a,0,`x = ${a}`],[b,0,`x = ${b}`]],curveLabel:'profit',lineLabel:'break-even: P = 0'},
  steps:[{t:`Break-even means profit equals zero: −(${V('x')} − ${a})(${V('x')} − ${b}) = 0.`,f:'intersect'},{t:`A product is zero when at least one factor is zero: ${V('x')} − ${a} = 0 or ${V('x')} − ${b} = 0.`,f:'intersect'},{t:`Therefore ${V('x')} = ${a} or ${V('x')} = ${b}.`,f:'intersect'}]}}});

def({id:'g23',sk:'circ',dom:'geo',skill:'Circles in the coordinate plane · center and radius from an equation',fmt:'mc',difficulty:'Hard',gen(r){const h=r.pick([-4,-3,-2,2,3,4]),k=r.pick([-3,-2,2,3]),rad=r.pick([3,4,5]);
 const hs=h>=0?`− ${h}`:`+ ${-h}`,ks=k>=0?`− ${k}`:`+ ${-k}`;const correct=`Center (${h}, ${k}) and radius ${rad}`,c=mc(r,correct,[`Center (${-h}, ${-k}) and radius ${rad}`,`Center (${h}, ${k}) and radius ${rad*rad}`,`Center (${-h}, ${-k}) and radius ${rad*rad}`]);
 return{text:`A circular sensor range in the ${V('xy')}-plane is modeled by (${V('x')} ${hs})² + (${V('y')} ${ks})² = ${rad*rad}. What are the center and radius of the circle?`,...c,
  viz:{type:'circleplane',h,k,r:rad},
  steps:[{t:`Standard form is (${V('x')} − ${V('h')})² + (${V('y')} − ${V('k')})² = ${SUP(V('r'),2)}.`,f:'center'},{t:`Read the signs inside the parentheses carefully: the center is (${h}, ${k}).`,f:'center'},{t:`${SUP(V('r'),2)} = ${rad*rad}, so the radius is √${rad*rad} = ${rad}, not ${rad*rad}.`,f:'radius'}]}}});


const hash=s=>{let h=2166136261;for(const ch of s)h=Math.imul(h^ch.charCodeAt(0),16777619);return h>>>0};
function text(s){return String(s??'').replace(TEX_SEQ_RE,m=>{let lead=(m.match(/^\s*/)||[''])[0],tail=(m.match(/\s*$/)||[''])[0],z=m.trim();while(/^[,.;:]/.test(z)){lead+=z[0];z=z.slice(1)}while(/[,.;:]$/.test(z)){tail=z.slice(-1)+tail;z=z.slice(0,-1)}return lead+'$'+texNormalize(texOf(z)).replace(/\\mathit\{([^{}]*)\}/g,'{$1}').replace(/\$/g,'')+'$'+tail;}).replace(/<[^>]*>/g,'');}
function raw(id,seed){const p=P.find(x=>x.id===id);if(!p||!Number.isInteger(seed)||seed<0||seed>4294967295)throw Error('Invalid WordLab problem reference.');return p.gen(rng(seed));}
function make(id,seed=hash(id)){const p=P.find(x=>x.id===id),g=raw(id,seed);let v=null;let prompt=g.text.replace(/<table>[\s\S]*?<\/table>/g,html=>{const rows=[...html.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map(m=>[...m[1].matchAll(/<t[dh]>([\s\S]*?)<\/t[dh]>/g)].map(x=>text(x[1])));v={type:'table',headers:rows[0],rows:rows.slice(1)};return '\n';});
 if(!v&&(/dot plot|box plot|residual plot|scatterplot|floor plan.*shown|represented by lines|graph crosses/.test(prompt)))v={type:'wordlab',family:id,seed};
 const peers=P.filter(x=>x.sk===p.sk),diff=p.difficulty||['Easy','Medium','Medium','Hard'][peers.findIndex(x=>x.id===id)%4];
 return {id:'wl-'+id+'-'+seed,parentTestId:'word-problems',skill:SKILLS.find(k=>k.id===p.sk).name,topic:p.skill,domain:{alg:'Algebra',psda:'Data',adv:'Advanced',geo:'Geometry'}[p.dom],level:{Easy:'Easy',Medium:'Hard',Hard:'Harder'}[diff],prompt:text(prompt),choices:g.choices?.map(text),answer:String(g.ans),tolerance:g.tol??Math.max(.011,Math.abs(Number(g.ans))*.002),steps:g.steps.map(x=>text(x.t)),visual:v,wordlab:{family:id,seed},source:'WordLab',skillId:p.sk};
}
function context(canvas){const ctx=canvas.getContext('2d');return new Proxy(ctx,{get(t,k){const v=t[k];return typeof v==='function'?v.bind(t):v;},set(t,k,v){t[k]=(k==='fillStyle'||k==='strokeStyle')?TC(v):v;return true;}});}
function draw(canvas,id,seed,t=1,focus=null,question=false){const g=raw(id,seed),v={...g.viz};if(question){delete v.point;delete v.mark;delete v.compare;t=1;}const ctx=context(canvas);ctx.clearRect(0,0,640,340);ctx.fillStyle='white';ctx.fillRect(0,0,640,340);R[v.type]({ctx,W:640,H:340},v,t,focus);}
function stimulus(v){const data=raw(v.family,v.seed);const canvas=document.createElement('canvas');canvas.width=640;canvas.height=340;draw(canvas,v.family,v.seed,1,null,true);return '<img class="chart" style="max-width:640px" alt="Word problem data diagram" src="'+canvas.toDataURL('image/png')+'">'+(data.viz.labels?'<p class="mini muted">'+data.viz.labels.map((x,i)=>(i+1)+': '+escMath(x)).join(' · ')+'</p>':'');}
return {make,raw,draw,stimulus,skills:SKILLS,domains:DOMAINS,families:P.map(({id,sk,dom,skill})=>({id,sk,dom,skill})),bank:()=>P.map(p=>make(p.id))};

})();
