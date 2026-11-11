const KEY="eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqb3N1YW50b25zYW56QGdtYWlsLmNvbSIsImp0aSI6IjQ1NTBkNDZmLTU1OGQtNDJhNi05NDE2LWIxNmY1NmE3MzZmNyIsImV4cCI6MTgwMzAzMjAxOSwiaXNzIjoiQUVNRVQiLCJpYXQiOjE3OTQzOTIwMTksInVzZXJJZCI6IjQ1NTBkNDZmLTU1OGQtNDJhNi05NDE2LWIxNmY1NmE3MzZmNyIsInJvbGUiOiIifQ.Bv9y6j-0PmfMMpQvubiJ211MMH0CZuamfGL3VoazCZM";
const DEFAULTS=[
 {n:"Villanañe",lat:42.8060,lon:-3.1370,mn:"Valdegovía"},
 {n:"Colegio San Gabriel, Zuera",lat:41.8667,lon:-0.7833,mn:"Zuera"},
 {n:"Vitoria-Gasteiz",lat:42.8467,lon:-2.6716,mn:"Vitoria"},
 {n:"Daimiel",lat:39.0687,lon:-3.6120,mn:"Daimiel"}];
const SRC=[{id:"ecmwf_ifs025",n:"ECMWF",c:"--c0"},{id:"icon_seamless",n:"ICON",c:"--c1"},{id:"aemet",n:"AEMET",c:"--c2"},{id:"wn",n:"WeatherNext 2",c:"--c3"}];
const VIEWS=[["dia","Día por horas","Día"],["sem","Semana","Semana"],["det","Detalle","Detalle"]];
const VI={
 dia:"<svg class=\"ti\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"4.2\"/><path d=\"M12 2.6v2.1M12 19.3v2.1M2.6 12h2.1M19.3 12h2.1M5.4 5.4l1.5 1.5M17.1 17.1l1.5 1.5M5.4 18.6l1.5-1.5M17.1 6.9l1.5-1.5\"/></svg>",
 sem:"<svg class=\"ti\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><rect x=\"3.6\" y=\"5.2\" width=\"16.8\" height=\"15\" rx=\"2.6\"/><path d=\"M8.2 2.8v4M15.8 2.8v4M3.6 10.2h16.8\"/></svg>",
 det:"<svg class=\"ti\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M4 7.5h16M4 12h16M4 16.5h16\"/><circle cx=\"9\" cy=\"7.5\" r=\"1.7\" fill=\"currentColor\" stroke=\"none\"/><circle cx=\"15\" cy=\"12\" r=\"1.7\" fill=\"currentColor\" stroke=\"none\"/><circle cx=\"10.5\" cy=\"16.5\" r=\"1.7\" fill=\"currentColor\" stroke=\"none\"/></svg>"};
const MODELS=[["ecmwf_ifs025","ECMWF"],["icon_seamless","ICON"],["meteofrance_seamless","Météo-France"],["best_match","Mejor modelo"]];
const ls={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
let CITIES=ls.get("t.places",null)||JSON.parse(JSON.stringify(DEFAULTS));
const savePlaces=()=>{ls.set("t.places",CITIES);ls.set("t.city",st.city)};
const st={city:Math.min(ls.get("t.city",0),CITIES.length-1),view:ls.get("t.view","dia"),day:0,model:"ecmwf_ifs025"};
const $=id=>document.getElementById(id);
const narrowMq=matchMedia("(max-width:759px)");
const narrow=()=>narrowMq.matches;
const sn=s=>s.n.replace("WeatherNext 2","WN2").replace("Météo-France","M-France");
const j=async(u,o)=>{const c=new AbortController(),t=setTimeout(()=>c.abort(),15000);try{const r=await fetch(u,{...o,signal:c.signal});if(!r.ok)throw new Error("HTTP "+r.status);return await r.json()}finally{clearTimeout(t)}};
const q=(a,p)=>{a=a.filter(v=>v!=null).sort((x,y)=>x-y);if(!a.length)return null;const i=(a.length-1)*p,l=Math.floor(i);return a[l]+(a[Math.ceil(i)]-a[l])*(i-l)};
const T=v=>v==null?"–":Math.round(v)+"°",R=v=>v==null?"–":(v<0.05?"0":v.toFixed(1)),N=(v,u="")=>v==null?"–":Math.round(v)+u;
const dl=d=>new Date(d+"T12:00").toLocaleDateString("es-ES",{weekday:"short",day:"numeric",month:"short"});

const nz=x=>x.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
async function aemetMun(c,g){
 let m=ls.get("t.muns",null);
 if(!m){const r=await g("maestro/municipios");m=r.map(x=>[x.id.replace(/^id/,""),+x.latitud_dec,+x.longitud_dec,x.nombre]).filter(x=>x[1]===x[1]&&x[2]===x[2]);ls.set("t.muns",m)}
 let f=null;
 if(c.mn){const h=nz(c.mn).split("/")[0].trim();f=m.find(x=>nz(x[3]).split("/")[0].trim()===h)||m.find(x=>nz(x[3]).includes(h))}
 if(!f){let bd=1e9;for(const x of m){const d=(x[1]-c.lat)**2+((x[2]-c.lon)*Math.cos(c.lat*Math.PI/180))**2;if(d<bd){bd=d;f=x}}}
 c.ae=f[0];c.aen=f[3];
}
async function aemet(c){
 const key=KEY;
 const g=async p=>{const r=await j("https://opendata.aemet.es/opendata/api/"+p,{headers:{api_key:key}});if(!r.datos)throw new Error("AEMET: "+(r.descripcion||"respuesta inesperada"));return j(r.datos)};
 try{
  if(!c.ae){await aemetMun(c,g);ls.set("t.places",CITIES)}
  const [h,d]=await Promise.all([g("prediccion/especifica/municipio/horaria/"+c.ae),g("prediccion/especifica/municipio/diaria/"+c.ae)]);
  const hm={},ad={};
  for(const x of h[0].prediccion.dia){const f=x.fecha.slice(0,10),k=p=>f+"T"+String(p).padStart(2,"0")+":00";
   (x.temperatura||[]).forEach(o=>(hm[k(o.periodo)]=hm[k(o.periodo)]||{}).t=+o.value);
   (x.precipitacion||[]).forEach(o=>(hm[k(o.periodo)]=hm[k(o.periodo)]||{}).p=+o.value)}
  for(const x of d[0].prediccion.dia){const pr=(x.probPrecipitacion||[]).map(o=>+o.value);
   ad[x.fecha.slice(0,10)]={mx:x.temperatura.maxima,mn:x.temperatura.minima,pr:pr.length?Math.max(...pr):null,sk:((x.estadoCielo||[]).find(o=>o.periodo==="00-24")||(x.estadoCielo||[]).find(o=>o.descripcion)||{}).descripcion||""}}
  return{hm,ad};
 }catch(e){if(e instanceof TypeError)throw new Error("AEMET: el navegador no ha podido consultarla (clave incorrecta o bloqueo CORS).");throw e}
}

async function load(c){
 const ck="t.cache2."+c.n,ca=ls.get(ck,null);
 if(ca&&Date.now()-ca.t<18e5)return ca.d;
 const qs=`latitude=${c.lat}&longitude=${c.lon}&hourly=temperature_2m,precipitation&timezone=Europe%2FMadrid&forecast_days=7`,notes=[];
 const [om,wn,ae]=await Promise.all([
  j("https://api.open-meteo.com/v1/forecast?"+qs.replace("precipitation&","precipitation,precipitation_probability,weather_code&")+"&models=ecmwf_ifs025,icon_seamless").catch(()=>{notes.push("Open-Meteo no responde.");return null}),
  j("https://ensemble-api.open-meteo.com/v1/ensemble?"+qs+"&models=google_weathernext2_ensemble").catch(()=>{notes.push("WeatherNext 2 no está disponible ahora.");return null}),
  aemet(c).catch(e=>{notes.push(e.message);return null})]);
 const times=(om||wn||{hourly:null}).hourly&&(om||wn).hourly.time;
 if(!times)throw new Error("No se han podido obtener datos. Inténtalo de nuevo en unos minutos.");
 const D={times,s:{},ad:ae&&ae.ad,notes};
 if(om)for(const s of SRC.slice(0,2))D.s[s.id]={t:om.hourly["temperature_2m_"+s.id],p:om.hourly["precipitation_"+s.id],c:om.hourly["weather_code_"+s.id],pp:om.hourly["precipitation_probability_"+s.id]};
 if(wn){const ks=re=>Object.keys(wn.hourly).filter(k=>re.test(k)),kt=ks(/^temperature_2m/),kp=ks(/^precipitation/),ix={};
  wn.hourly.time.forEach((t,i)=>ix[t]=i);
  const col=(keys,i)=>i==null?[]:keys.map(k=>wn.hourly[k][i]);
  const S={t:[],lo:[],hi:[],p:[],pp:[]};
  times.forEach(t=>{const a=col(kt,ix[t]),b=col(kp,ix[t]);S.t.push(q(a,.5));S.lo.push(q(a,.1));S.hi.push(q(a,.9));S.p.push(q(b,.5));const bv=b.filter(v=>v!=null);S.pp.push(bv.length?100*bv.filter(v=>v>=0.1).length/bv.length:null)});
  D.s.wn=S}
 if(ae)D.s.aemet={t:times.map(t=>ae.hm[t]?.t??null),p:times.map(t=>ae.hm[t]?.p??null)};
 ls.set(ck,{t:Date.now(),d:D});return D;
}

const active=D=>SRC.filter(s=>D.s[s.id]||(s.id==="aemet"&&D.ad));
const gs=(D,id)=>D.s[id]||{t:[],p:[]};
function days(D){
 return [...new Set(D.times.map(x=>x.slice(0,10)))].map(d=>{
  const ix=D.times.map((x,i)=>x.startsWith(d)?i:-1).filter(i=>i>=0),o={d,ix};
  for(const s of SRC){const S=D.s[s.id];if(!S)continue;
   const t=ix.map(i=>S.t[i]).filter(v=>v!=null),p=ix.map(i=>S.p[i]).filter(v=>v!=null);
   o[s.id]=t.length?{mx:Math.max(...t),mn:Math.min(...t),r:p.length?p.reduce((a,b)=>a+b,0):null,h:t.indexOf(Math.max(...t)),pm:(pp=>pp.length?Math.max(...pp):null)(ix.map(i=>(S.pp||[])[i]).filter(v=>v!=null)),k:dk(D,S.c,ix)}:null}
  const a=D.ad&&D.ad[d];if(a)o.aemet={mx:a.mx,mn:a.mn,pr:a.pr,r:null,k:sk(a.sk)};
  return o});
}
const KN={sun:"Despejado",part:"Intervalos nubosos",cloud:"Nuboso",fog:"Niebla",rain:"Lluvia",snow:"Nieve",storm:"Tormenta"};
const CL='<path d="M7 14h10a3.5 3.5 0 0 0 .4-7A5 5 0 0 0 7 7.5 3.3 3.3 0 0 0 7 14z"/>';
const P={sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
part:'<circle cx="8" cy="8" r="2.8"/><path d="M8 2v1.2M2 8h1.2M3.8 3.8l.9.9M12.2 3.8l-.9.9"/><path d="M9 19h8a3.5 3.5 0 0 0 .4-7A4.8 4.8 0 0 0 9 11.5 3.8 3.8 0 0 0 9 19z"/>',
cloud:'<path d="M7 18h10a4 4 0 0 0 .5-8A5.5 5.5 0 0 0 7 9.5 4.3 4.3 0 0 0 7 18z"/>',
rain:CL+'<path d="M8 17l-1 3M12 17l-1 3M16 17l-1 3"/>',
storm:CL+'<path d="M12.5 14l-2.5 4h3l-2 4"/>',
snow:CL+'<path d="M8 18v.01M12 18v.01M16 18v.01M10 21v.01M14 21v.01" stroke-width="2.4"/>',
fog:'<path d="M4 8h16M6 12h14M4 16h16M8 20h10"/>'};
const ic=k=>k?`<svg class="ic" viewBox="0 0 24 24" role="img" aria-label="${KN[k]}"><title>${KN[k]}</title>${P[k]}</svg>`:'<span class="mut">–</span>';
const wk=c=>c==null?null:c===0?"sun":c<=2?"part":c===3?"cloud":c<=48?"fog":c<=67?"rain":c<=77?"snow":c<=82?"rain":c<=86?"snow":"storm";
const sk=x=>{if(!x)return null;x=nz(x);return/tormenta/.test(x)?"storm":/nieve/.test(x)?"snow":/lluvia|llovizna/.test(x)?"rain":/niebla|bruma/.test(x)?"fog":/despejado/.test(x)?"sun":/poco nuboso|intervalos/.test(x)?"part":/nuboso|cubierto/.test(x)?"cloud":null};
const dk=(D,C,ix)=>{if(!C)return null;const n={};ix.forEach(i=>{const h=+D.times[i].slice(11,13),k=wk(C[i]);if(k&&h>=7&&h<=22)n[k]=(n[k]||0)+1});
 const pr=(n.rain||0)+(n.snow||0)+(n.storm||0),pk=n.storm?"storm":n.snow?"snow":"rain";
 if(pr>=3)return pk;let b=null;for(const k of["sun","part","cloud","fog"])if(n[k]&&(!b||n[k]>n[b]))b=k;return b||(pr?pk:null)};
const sky=(D,i)=>wk(D.s.icon_seamless?.c?.[i]??D.s.ecmwf_ifs025?.c?.[i]);
const th=(a,extra="")=>a.map(s=>`<th><span class="dot" style="background:var(${s.c})"></span>${s.n}</th>`).join("")+extra;
const range=(a)=>{a=a.filter(v=>v!=null);return a.length?[Math.min(...a),Math.max(...a)]:[null,null]};

/* --- globos con el dato exacto al tocar o pasar por encima --- */
const TIPS={};let TIPN=0,TIP_FIJO=null;
function chartBox(svg,tips,geo){const id="t"+(++TIPN);TIPS[id]={tips,geo};return `<div class="chartbox" data-tip="${id}">${svg}<div class="tip" hidden></div></div>`}
function pintarTip(box,i,ev){
 const T=TIPS[box.dataset.tip];if(!T)return;const p=T.tips[i];if(!p)return;
 const svg=box.querySelector("svg"),tip=box.querySelector(".tip"),gu=svg.querySelector(".guide");
 const r=svg.getBoundingClientRect();
 if(gu){gu.setAttribute("x1",T.geo.xs[i]);gu.setAttribute("x2",T.geo.xs[i]);gu.style.visibility="visible"}
 tip.innerHTML=`<b>${p.h}</b>`+p.rows.map(x=>`<span class="tr"><i style="background:var(${x.c})"></i>${x.n}<em>${x.v}</em></span>`).join("");
 tip.hidden=false;
 const esc=r.width/T.geo.W,an=tip.offsetWidth,al=tip.offsetHeight,x0=T.geo.xs[i]*esc;
 tip.style.left=Math.max(an/2+1,Math.min(r.width-an/2-1,x0))+"px";
 const ref=ev&&ev.clientY?ev.clientY-r.top:r.height/3;
 tip.style.top=Math.max(al+6,Math.min(r.height-4,ref-10))+"px";
}
function ocultarTip(box){
 if(!box)return;const t=box.querySelector(".tip"),g=box.querySelector("svg .guide");
 if(t)t.hidden=true;if(g)g.style.visibility="hidden";if(TIP_FIJO===box)TIP_FIJO=null;
}
function wiringTips(){
 document.querySelectorAll(".chartbox").forEach(box=>{
  const T=TIPS[box.dataset.tip];if(!T)return;
  const svg=box.querySelector("svg");
  const idx=ev=>{const r=svg.getBoundingClientRect(),u=(ev.clientX-r.left)*(T.geo.W/r.width);let bi=0,bd=1e9;
   T.geo.xs.forEach((v,k)=>{const d=Math.abs(v-u);if(d<bd){bd=d;bi=k}});return bi};
  box.onpointerdown=ev=>{TIP_FIJO=box;pintarTip(box,idx(ev),ev)};
  box.onpointermove=ev=>{if(ev.pointerType==="mouse"||ev.buttons)pintarTip(box,idx(ev),ev)};
  box.onpointerleave=()=>{if(TIP_FIJO!==box)ocultarTip(box)};
 });
}
document.addEventListener("pointerdown",e=>{if(!e.target.closest(".chartbox"))document.querySelectorAll(".chartbox").forEach(b=>ocultarTip(b))});

function chart(D,d,act){
 const W=narrow()?392:720,H=narrow()?210:230,L=narrow()?30:36,Rr=10,Tp=10,B=24,ix=d.ix,vals=[];
 act.forEach(s=>{const S=gs(D,s.id);ix.forEach(i=>{vals.push(S.t[i]);if(s.id==="wn"){vals.push(S.lo[i],S.hi[i])}})});
 let [lo,hi]=range(vals);if(lo==null)return"";
 const step=Math.max(1,Math.ceil((hi-lo)/4));lo=Math.floor(lo/step)*step-0;hi=Math.ceil(hi/step)*step;if(hi===lo)hi=lo+step;
 const x=k=>L+(W-L-Rr)*k/(ix.length-1),y=v=>Tp+(H-Tp-B)*(1-(v-lo)/(hi-lo));
 let g="";
 for(let v=lo;v<=hi;v+=step)g+=`<line x1="${L}" x2="${W-Rr}" y1="${y(v)}" y2="${y(v)}" style="stroke:var(--rule)"/><text x="${L-6}" y="${y(v)+4}" text-anchor="end" font-size="${narrow()?13:11}" style="fill:var(--mut)">${v}°</text>`;
 ix.forEach((i,k)=>{if(k%(narrow()?6:3)===0)g+=`<text x="${x(k)}" y="${H-6}" text-anchor="middle" font-size="${narrow()?13:11}" style="fill:var(--mut)">${D.times[i].slice(11,13)}</text>`});
 const wn=D.s.wn;
 if(wn&&act.some(s=>s.id==="wn")){const up=[],dn=[];ix.forEach((i,k)=>{if(wn.hi[i]!=null){up.push(`${x(k)},${y(wn.hi[i])}`);dn.unshift(`${x(k)},${y(wn.lo[i])}`)}});
  if(up.length)g+=`<polygon points="${up.concat(dn).join(" ")}" style="fill:var(--c3);opacity:.16"/>`}
 act.forEach(s=>{const S=gs(D,s.id);let p="",on=false;
  ix.forEach((i,k)=>{const v=S.t[i];if(v==null){on=false;return}p+=(on?"L":"M")+x(k).toFixed(1)+","+y(v).toFixed(1);on=true});
  if(p)g+=`<path d="${p}" fill="none" stroke-width="1.4" stroke-linejoin="round" style="stroke:var(${s.c});opacity:.45"/>`});
 const tM=ix.map(i=>avg(act.map(s=>gs(D,s.id).t[i]))),pM=mpath(tM,x,y);
 if(pM)g+=`<path d="${pM}" fill="none" stroke-width="2.4" stroke-linejoin="round" style="stroke:var(--ink)"/>`;
 g+=`<line class="guide" x1="0" x2="0" y1="${Tp}" y2="${H-B}" style="stroke:var(--acc);stroke-width:1.5;stroke-dasharray:4 3;visibility:hidden"/>`;
 const tips=ix.map((i,k)=>({h:D.times[i].slice(11,16),rows:[{c:"--ink",n:"Media",v:T(tM[k])}]
  .concat(act.map(s=>({c:s.c,n:sn(s),v:T(gs(D,s.id).t[i])})).filter(r=>r.v!=="–"))}));
 const svg=chartBox(`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Temperatura por horas">${g}</svg>`,tips,{W,xs:ix.map((_,k)=>x(k))});
 return svg+`<div class="leg"><span><span class="dot" style="background:var(--ink)"></span>Media de las fuentes</span>${act.map(s=>`<span><span class="dot" style="background:var(${s.c});opacity:.55"></span>${s.n}${s.id==="wn"?" (banda: 80 % de los escenarios)":""}</span>`).join("")}</div>`;
}

const avg=a=>{a=a.filter(v=>v!=null);return a.length?a.reduce((x,y)=>x+y,0)/a.length:null};
const nstep=v=>{const c=[.05,.1,.2,.25,.5,1,2,5,10,20,50];return c.find(x=>x>=v)||100};
const mpath=(vals,px,py)=>{let p="",on=false;
 vals.forEach((v,k)=>{if(v==null){on=false;return}p+=(on?"L":"M")+px(k).toFixed(1)+","+py(v).toFixed(1);on=true});return p};
const mmTxt=v=>v<10?(Math.round(v*10)%10?v.toFixed(1):String(Math.round(v))):String(Math.round(v));

function rainChart(D,d,act){
 const ix=d.ix;if(ix.length<2)return"";
 const ppS=act.filter(s=>(gs(D,s.id).pp||[]).some(v=>v!=null));
 const mmS=act.filter(s=>(gs(D,s.id).p||[]).some(v=>v!=null));
 if(!ppS.length&&!mmS.length)return"";
 const ppM=ix.map(i=>avg(ppS.map(s=>(gs(D,s.id).pp||[])[i])));
 const mmM=ix.map(i=>avg(mmS.map(s=>gs(D,s.id).p[i])));
 const mx=Math.max(0,...mmM.filter(v=>v!=null));
 const step=nstep(mx>0?mx/3:1),top=Math.max(step,Math.ceil((mx*1.08||step)/step)*step);
 const W=narrow()?392:720,L=narrow()?30:42,Rr=12,PT=22,PH=88,MB=PT+PH+38,PB0=MB+10,PBH=92,H=PB0+PBH+24;
 const fs=narrow()?13:11;
 const x=k=>L+(W-L-Rr)*k/(ix.length-1),span=(W-L-Rr)/(ix.length-1);
 const yP=v=>PT+PH*(1-v/100),yM=v=>PB0+PBH*(1-v/top);
 let g="";
 [0,25,50,75,100].forEach(v=>{g+=`<line x1="${L}" x2="${W-Rr}" y1="${yP(v)}" y2="${yP(v)}" style="stroke:var(--rule)"/>`});
 [0,50,100].forEach(v=>{g+=`<text x="${L-6}" y="${yP(v)+4}" text-anchor="end" font-size="${fs}" style="fill:var(--mut)">${v}</text>`});
 for(let v=0;v<=top+1e-9;v+=step){g+=`<line x1="${L}" x2="${W-Rr}" y1="${yM(v)}" y2="${yM(v)}" style="stroke:var(--rule)"/><text x="${L-6}" y="${yM(v)+4}" text-anchor="end" font-size="${fs}" style="fill:var(--mut)">${mmTxt(v)}</text>`}
 ix.forEach((i,k)=>{if(k%(narrow()?6:3)===0){g+=`<line x1="${x(k).toFixed(1)}" x2="${x(k).toFixed(1)}" y1="${PT}" y2="${PB0+PBH}" style="stroke:var(--rule);opacity:.6"/>`+`<text x="${x(k)}" y="${H-6}" text-anchor="middle" font-size="${fs}" style="fill:var(--mut)">${D.times[i].slice(11,13)}</text>`}});
 g+=`<text x="${L}" y="${PT-8}" font-size="${fs}" style="fill:var(--mut)">Probabilidad de lluvia, %</text>`;
 g+=`<text x="${L}" y="${MB}" font-size="${fs}" style="fill:var(--mut)">Agua prevista, mm</text>`;
 const bw=Math.max(3,Math.min(16,span*.55));
 mmM.forEach((v,k)=>{if(v==null||v<=0)return;const hh=Math.max(2,PB0+PBH-yM(v));
  g+=`<rect x="${(x(k)-bw/2).toFixed(1)}" y="${(PB0+PBH-hh).toFixed(1)}" width="${bw.toFixed(2)}" height="${hh.toFixed(1)}" rx="1.5" style="fill:var(--acc);opacity:.5"/>`});
 ppS.forEach(s=>{const p=mpath(ix.map(i=>(gs(D,s.id).pp||[])[i]),x,yP);
  if(p)g+=`<path d="${p}" fill="none" stroke-width="1.2" stroke-linejoin="round" style="stroke:var(${s.c});opacity:.38"/>`});
 const pm=mpath(ppM,x,yP);
 if(pm)g+=`<path d="${pm}" fill="none" stroke-width="2.8" stroke-linejoin="round" style="stroke:var(--ink)"/>`;
 const tips=ix.map((i,k)=>({h:D.times[i].slice(11,16),rows:[{c:"--ink",n:"Media",v:`${ppM[k]!=null?Math.round(ppM[k])+" %":"–"} · ${mmM[k]!=null?R(mmM[k])+" mm":"–"}`}]
  .concat([...new Set([...ppS,...mmS])].map(s=>{const pp=(gs(D,s.id).pp||[])[i],p=gs(D,s.id).p[i];
   return {c:s.c,n:sn(s),v:`${pp!=null?Math.round(pp)+" %":"–"} · ${p!=null?R(p)+" mm":"–"}`}}))}));
 const lg=`<span><span class="dot" style="background:var(--ink)"></span>Media: probabilidad</span><span><span class="dot" style="background:var(--acc);opacity:.6"></span>Media: agua (barras)</span>`+ppS.map(s=>`<span><span class="dot" style="background:var(${s.c});opacity:.55"></span>${s.n}</span>`).join("");
 return chartBox(`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Probabilidad y cantidad de lluvia por horas">${g}<line class="guide" x1="0" x2="0" y1="${PT}" y2="${PB0+PBH}" style="stroke:var(--acc);stroke-width:1.5;stroke-dasharray:4 3;visibility:hidden"/></svg>`,tips,{W,xs:ix.map((_,k)=>x(k))})+`<div class="leg">${lg}</div>`;
}

function vDia(D){
 const ds=days(D),act=active(D);if(st.day>=ds.length)st.day=0;const d=ds[st.day];
 const mx=range(act.map(s=>d[s.id]?.mx)),mn=range(act.map(s=>d[s.id]?.mn));
 const sel=`<div class="row"><label for="dsel">Día</label><select id="dsel">${ds.map((x,i)=>`<option value="${i}"${i===st.day?" selected":""}>${i===0?"Hoy, ":i===1?"Mañana, ":""}${dl(x.d)}</option>`).join("")}</select></div>`;
 const sum=mx[0]==null?"":`<p>La máxima prevista va de ${T(mx[0])} a ${T(mx[1])} y la mínima de ${T(mn[0])} a ${T(mn[1])}${mx[1]-mx[0]>=3?"; las fuentes discrepan en la máxima por "+Math.round(mx[1]-mx[0])+" grados":"; las fuentes coinciden bastante"}.</p>`;
 const rs=narrow()
  ?`<div class="list">${act.map(s=>{const o=d[s.id];const pr=o?.pm!=null?Math.round(o.pm)+" %":o?.pr!=null?o.pr+" %":"–";
     return`<div class="srcrow"><span class="nm"><span class="dot" style="background:var(${s.c})"></span>${s.n}</span><span class="sky">${ic(o?.k)}</span><span class="vals"><b>${T(o?.mx)}</b> <span class="mut">/ ${T(o?.mn)}</span></span><span class="vals mut">${o?.r!=null?R(o.r)+" mm":"–"} · ${pr}</span></div>`}).join("")}</div>`
  :`<div class="wrap"><table><thead><tr><th>Fuente</th><th>Cielo</th><th>Máxima</th><th>Mínima</th><th>Lluvia</th><th>Prob. de lluvia (máx.)</th></tr></thead><tbody>${act.map(s=>{const o=d[s.id];return`<tr><td><span class="dot" style="background:var(${s.c})"></span>${s.n}</td><td>${ic(o?.k)}</td><td>${T(o?.mx)}</td><td>${T(o?.mn)}</td><td>${o?.r!=null?R(o.r)+" mm":"–"}</td><td>${o?.pm!=null?Math.round(o.pm)+" %":o?.pr!=null?o.pr+" %":"–"}</td></tr>`}).join("")}</tbody></table></div>`;
 const nowK=new Date().toLocaleString("sv-SE",{timeZone:"Europe/Madrid"}).slice(0,13).replace(" ","T");
 const hrs=narrow()
  ?`<p class="mut tiny">Cada celda: temperatura y, debajo, lluvia (mm · probabilidad).</p><div class="wrap"><table class="compact"><thead><tr><th>Hora</th>${act.map(s=>`<th><span class="dot" style="background:var(${s.c})"></span>${sn(s)}</th>`).join("")}</tr></thead><tbody>${d.ix.map(i=>`<tr${D.times[i].slice(0,13)===nowK?' class="now"':""}><td>${D.times[i].slice(11,16)} ${ic(sky(D,i))}</td>${act.map(s=>{const S=gs(D,s.id),pp=S.pp?.[i];return`<td><b>${T(S.t[i])}</b><span class="rain2">${R(S.p[i])}${pp!=null?" · "+Math.round(pp)+" %":""}</span></td>`}).join("")}</tr>`).join("")}</tbody></table></div>`
  :`<div class="wrap"><table><thead><tr><th rowspan="2">Hora</th><th rowspan="2">Cielo</th><th class="grp" colspan="${act.length}">Temperatura</th><th class="grp" colspan="${act.length}">Lluvia (mm · prob.)</th></tr><tr>${th(act)}${th(act)}</tr></thead><tbody>${d.ix.map(i=>`<tr${D.times[i].slice(0,13)===nowK?' class="now"':""}><td>${D.times[i].slice(11,16)}</td><td>${ic(sky(D,i))}</td>${act.map(s=>`<td>${T(gs(D,s.id).t[i])}</td>`).join("")}${act.map(s=>{const S=gs(D,s.id),pp=S.pp?.[i];return`<td>${R(S.p[i])}${pp!=null?' <span class="mut">· '+Math.round(pp)+' %</span>':""}</td>`}).join("")}</tr>`).join("")}</tbody></table></div>`;
 return sel+`<h2>Resumen</h2>${sum}${rs}<h2>Temperatura hora a hora</h2>${chart(D,d,act)}<h2>Tabla horaria</h2>${hrs}<h2>Lluvia hora a hora</h2>${rainChart(D,d,act)}`;
}

function vSem(D){
 const ds=days(D),act=active(D);
 if(narrow()){
  const cards=ds.map((d,i)=>{const mxr=range(act.map(s=>d[s.id]?.mx));
   return`<div class="daycard"><div class="dch"><b>${i===0?"Hoy":dl(d.d)}</b>${mxr[0]==null?"":`<span class="mut">máx. ${Math.round(mxr[1]-mxr[0])}° de diferencia</span>`}</div>${act.map(s=>{const o=d[s.id],pr=o?.pm??o?.pr;
    return`<div class="srcrow"><span class="nm"><span class="dot" style="background:var(${s.c})"></span>${sn(s)}</span><span class="sky">${ic(o?.k)}</span><span class="vals"><b>${T(o?.mx)}</b> <span class="mut">/ ${T(o?.mn)}</span></span><span class="vals mut">${o?.r!=null?R(o.r)+" mm":"–"} · ${pr!=null?Math.round(pr)+" %":"–"}</span></div>`}).join("")}</div>`}).join("");
  return`<h2>Próximos siete días</h2><div class="list">${cards}</div>`;
 }
 const body=ds.map((d,i)=>{const mxr=range(act.map(s=>d[s.id]?.mx));
  return`<tr><td>${i===0?"Hoy":dl(d.d)}</td>${act.map(s=>{const o=d[s.id];return`<td>${o?(o.k?ic(o.k)+" ":"")+T(o.mx)+" <span class='mut'>/ "+T(o.mn)+"</span>":"–"}</td>`}).join("")}${act.map(s=>{const o=d[s.id];return`<td>${o?[o.r!=null?R(o.r)+" mm":null,(o.pm??o.pr)!=null?Math.round(o.pm??o.pr)+" %":null].filter(Boolean).join(" · ")||"–":"–"}</td>`}).join("")}<td>${mxr[0]==null?"–":Math.round(mxr[1]-mxr[0])+"°"}</td></tr>`}).join("");
 return`<h2>Próximos siete días</h2><div class="wrap"><table><thead><tr><th rowspan="2">Día</th><th class="grp" colspan="${act.length}">Máxima / mínima</th><th class="grp" colspan="${act.length}">Lluvia (mm · prob. máx.)</th><th rowspan="2">Diferencia en máxima</th></tr><tr>${th(act)}${th(act)}</tr></thead><tbody>${body}</tbody></table></div>`;
}

const detCache={};
async function vDet(c){
 const m=st.model,k=c.n+m;
 if(!detCache[k]){const v="temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,cloud_cover,wind_speed_10m,wind_gusts_10m,pressure_msl,weather_code,precipitation_probability";
  try{detCache[k]=await j(`https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lon}&hourly=${v}&models=${m}&timezone=Europe%2FMadrid&forecast_days=3`)}
  catch(e){throw new Error("Sin conexión: la vista Detalle necesita descargar datos del modelo. Prueba la vista Día, que funciona con la copia guardada.")}}
 const h=detCache[k].hourly;const nr=narrow();let last="",rows="";
 h.time.forEach((t,i)=>{const d=t.slice(0,10);if(d!==last){last=d;rows+=`<tr class="dh"><td colspan="${nr?6:11}">${dl(d)}</td></tr>`}
  rows+= nr
   ?`<tr><td>${t.slice(11,16)} ${ic(wk(h.weather_code?.[i]))}</td><td><b>${T(h.temperature_2m[i])}</b><span class="rain2">${T(h.apparent_temperature[i])}</span></td><td><b>${R(h.precipitation[i])}</b><span class="rain2">${N(h.precipitation_probability?.[i]," %")}</span></td><td><b>${N(h.wind_speed_10m[i])}</b><span class="rain2">${N(h.wind_gusts_10m[i])}</span></td><td><b>${N(h.relative_humidity_2m[i]," %")}</b><span class="rain2">${N(h.cloud_cover[i]," %")}</span></td><td>${N(h.pressure_msl[i])}</td></tr>`
   :`<tr><td>${t.slice(11,16)}</td><td>${ic(wk(h.weather_code?.[i]))}</td><td>${T(h.temperature_2m[i])}</td><td>${T(h.apparent_temperature[i])}</td><td>${N(h.relative_humidity_2m[i]," %")}</td><td>${R(h.precipitation[i])}</td><td>${N(h.precipitation_probability?.[i]," %")}</td><td>${N(h.cloud_cover[i]," %")}</td><td>${N(h.wind_speed_10m[i])}</td><td>${N(h.wind_gusts_10m[i])}</td><td>${N(h.pressure_msl[i])}</td></tr>`});
 const head=nr
  ?`<tr><th>Hora</th><th>Temp.</th><th>Lluvia</th><th>Viento</th><th>Hum.</th><th>Presión</th></tr>`
  :`<tr><th>Hora</th><th>Cielo</th><th>Temp.</th><th>Sensación</th><th>Humedad</th><th>Lluvia mm</th><th>Prob. lluvia</th><th>Nubes</th><th>Viento km/h</th><th>Rachas km/h</th><th>Presión hPa</th></tr>`;
 return`<div class="row"><label for="msel">Modelo</label><select id="msel">${MODELS.map(([v,n])=>`<option value="${v}"${v===m?" selected":""}>${n}</option>`).join("")}</select></div><p class="mut${nr?" tiny":""}">Tres días hora a hora con todas las variables. AEMET y WeatherNext 2 no se incluyen aquí porque no ofrecen estas variables.${nr?" Cada celda: valor principal y, debajo, el secundario (sensación, probabilidad, rachas, nubes).":""}</p><div class="wrap"><table class="${nr?"compact":"wide"}"><thead>${head}</thead><tbody>${rows}</tbody></table></div>`;
}

function renderPlaces(){
 $("plist").innerHTML=`<ul>${CITIES.map((c,i)=>`<li>${c.n}<button data-rm="${i}" aria-label="Quitar ${c.n}">Quitar</button></li>`).join("")}</ul>`;
}
let found=[];
async function find(){
 const v=$("q").value.trim();if(!v)return;$("pres").innerHTML='<p class="msg">Buscando…</p>';
 try{found=await j("https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=5&accept-language=es&q="+encodeURIComponent(v));
  $("pres").innerHTML=found.length?`<ul>${found.map((r,i)=>`<li>${r.display_name}<button data-add="${i}">Añadir</button></li>`).join("")}</ul>`:'<p class="msg">Sin resultados.</p>'}
 catch(e){$("pres").innerHTML='<p class="msg err">La búsqueda de lugares no está disponible ahora.</p>'}
}
async function render(){
 for(const k in TIPS)delete TIPS[k];TIPN=0;TIP_FIJO=null;
 renderPlaces();
 $("cities").innerHTML=CITIES.map((c,i)=>`<button data-c="${i}" aria-pressed="${i===st.city}">${c.n}</button>`).join("");
 $("views").innerHTML=VIEWS.map(([v,n,s])=>`<button data-v="${v}" aria-pressed="${v===st.view}" aria-label="${n}">${VI[v]}<span>${s}</span></button>`).join("");
 const c=CITIES[st.city],out=$("out");out.innerHTML='<p class="msg">Cargando previsión…</p>';
 try{
  const D=await load(c);if(c!==CITIES[st.city])return;
  $("notes").innerHTML=D.notes.map(n=>`<span class="err">${n}</span>`).join("<br>")+(c.aen?`<span class="mut">AEMET usa el municipio de ${c.aen}.</span>`:"");
  out.innerHTML=st.view==="dia"?vDia(D):st.view==="sem"?vSem(D):await vDet(c);
  wiringTips();
  const ds=$("dsel");if(ds)ds.onchange=()=>{st.day=+ds.value;render()};
  const ms=$("msel");if(ms)ms.onchange=()=>{st.model=ms.value;render()};
 }catch(e){out.innerHTML=`<p class="msg err">${e.message}</p>`}
}
document.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;
 if(b.dataset.c!=null){st.city=+b.dataset.c;st.day=0;savePlaces();render();window.scrollTo(0,0)}
 else if(b.dataset.v){st.view=b.dataset.v;ls.set("t.view",st.view);render();window.scrollTo(0,0)}
 else if(b.dataset.add!=null){
  if(CITIES.length>=6){$("pres").innerHTML='<p class="msg err">Hay seis lugares como máximo: quita alguno antes de añadir otro.</p>';return}
  const r=found[+b.dataset.add],a=r.address||{};
  CITIES.push({n:r.name||r.display_name.split(",")[0],lat:+r.lat,lon:+r.lon,mn:a.municipality||a.city||a.town||a.village||""});
  st.city=CITIES.length-1;st.day=0;savePlaces();$("pres").innerHTML="";render()}
 else if(b.dataset.rm!=null){if(CITIES.length<2)return;CITIES.splice(+b.dataset.rm,1);st.city=Math.min(st.city,CITIES.length-1);st.day=0;savePlaces();render()}
 else if(b.id==="find")find();
 else if(b.id==="reset"){CITIES=JSON.parse(JSON.stringify(DEFAULTS));st.city=0;st.day=0;savePlaces();render()}
});
$("q").addEventListener("keydown",e=>{if(e.key==="Enter")find()});
narrowMq.addEventListener("change",()=>render());
if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});
render();
