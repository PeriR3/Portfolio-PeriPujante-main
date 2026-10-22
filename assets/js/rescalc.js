// Developed by SK
// Date: 2026.10.22
// Website: https://www.skrript.es
// Github: https://github.com/JuanSKr

/*  DOCUMENTATION
Resolution calculator for graphic arts (rescalc.html and es/rescalc_es.html):
document, scan and imagesetter resolution for continuous-tone originals, and scan
resolution for line originals. Texts are picked from <html lang>, so the same
script serves both languages.

- Formula notes are written in a tiny markup (see renderNotes) and shown as an
  animated step-by-step timeline.
- Once a result has been calculated it stays in sync: changing the paper or the
  sizes recalculates it automatically.
- The paper <select> is replaced visually by a custom dropdown; the native select
  is kept as the source of truth.
DOCUMENTATION */

(function() {
const ST=[300,600,1200,1800,2400,3600,4800], LIM=1200, S={}, AUTO=new Set();
const $=id=>document.getElementById(id);
const ES=document.documentElement.lang==='es';
const DEC=ES?',':'.';
const f4=v=>String(+v.toFixed(4)).replace('.',DEC), f2=v=>String(+v.toFixed(2)).replace('.',DEC);
const FC_HIGH=1.8;
const fcOf=l=>l<=133?2:FC_HIGH;
const aprox=r=>ST.find(e=>r<=e)||ST[ST.length-1];

/* Notes markup, one item per line:
   # Section          ## n · Step title       = [Label |] formula
   - term :: text     + data :: value         * bullet
   ~ condition → conclusion                   > side note
   ! warning          % unit [picked value]   ^ text :: exact :: text :: rounded
   anything else: paragraph */
const TX = ES ? {
lpi:'lpp', ppi:'ppp', dpi:'ppp', formula:'Fórmula',
sizes:{orig:'Original',rep:'Reproducción',w:'Ancho',h:'Alto',hint:'Usa la misma unidad (cm, mm, pulgadas…) en los cuatro campos.'},
names:{lp:'Lineatura',ao:'Ancho original',ho:'Alto original',ar:'Ancho de reproducción',hr:'Alto de reproducción',sal:'Resolución de salida'},
err:{empty:n=>'Introduce un valor en «'+n+'».',nan:n=>'«'+n+'» no es un número válido.',pos:n=>'«'+n+'» debe ser un número mayor que 0.',lin:'Escoja una lineatura correcta (entre 1 y 200 lpp).'},
res:{doc:'Resolución del documento',esc:'Resolución de escaneado',fil:'Resolución de filmación',lin:'Resolución de escaneado'},
fcv:(fc,low)=>'f(c) = '+fc+(low?'  (lineatura ≤ 133 lpp)':'  (lineatura > 133 lpp)'),
teo:{
doc:`# Qué se calcula
La resolución (en ppp, píxeles por pulgada) que debe tener la imagen digital a su tamaño final de impresión para que la trama se reproduzca con calidad.
# Fórmula
= Resolución del documento = Lineatura × f(c)
# Donde
- Lineatura (lpp) :: líneas de trama por pulgada. Depende del papel y del sistema de impresión.
- f(c) :: factor de calidad.
* lineatura ≤ 133 lpp → f(c) = 2
* lineatura > 133 lpp → f(c) = 1,8
> Pulsa «Calcular» para ver el desarrollo paso a paso.`,
esc:`# Qué se calcula
La resolución a la que hay que configurar el escáner. Se escanea el ORIGINAL, pero la imagen se imprimirá a otro tamaño; si se amplía, el escáner debe capturar más píxeles por pulgada del original.
# Fórmulas
= f(r) = tamaño de reproducción ÷ tamaño original
> Se usa el mayor de ancho y alto.
= Resolución de escaneado = Lineatura × f(r) × f(c)
# Donde
- f(r) :: factor de reproducción (escala de ampliación o reducción).
- f(c) :: factor de calidad (2 si la lineatura es ≤ 133 lpp; 1,8 si es mayor).
> Los tamaños pueden ir en cualquier unidad siempre que sea la misma en los cuatro campos.`,
fil:`# Qué se calcula
La resolución de la filmadora (ppp) necesaria para reproducir la lineatura elegida con 256 niveles de gris.
# Fórmula
= Resolución de filmación = 16 × Lineatura
# Por qué 16
Cada punto de trama se forma con una celda de (resolución ÷ lineatura)² puntos de la filmadora. Con una celda de 16 × 16 = 256 puntos se obtienen 256 niveles de gris.
# Ajuste
El resultado se aproxima al siguiente valor estándar de filmadora:
% ppp`,
lin:`# Qué se calcula
La resolución de escaneado de un original de LÍNEA (trazo, sin grises: texto, logotipos, dibujos a plumilla). No depende de la lineatura, sino de la resolución del dispositivo de salida.
# Fórmulas
= f(r) = tamaño de reproducción ÷ tamaño original
> Se usa el mayor de ancho y alto.
= Resolución de escaneado = Resolución de salida × f(r)
# Límite
Si el resultado es ≥ 1200 ppp se limita a 1200 ppp.
> El ojo humano no diferencia más allá de 1200 ppp en originales de línea, así que limitarlo ahorra tiempo de escaneado y tamaño de archivo.`},
repro:(ao,ho,ar,hr,fa,fh,f)=>`= Fórmula | f(r) = tamaño de reproducción ÷ tamaño original
= f(r) ancho = ${f4(ar)} ÷ ${f4(ao)} = ${f4(fa)}
${TX.apx(ar/ao,fa)}
= f(r) alto = ${f4(hr)} ÷ ${f4(ho)} = ${f4(fh)}
${TX.apx(hr/ho,fh)}
~ Se toma el mayor de los dos → f(r) = ${f4(f)}
> Así la dimensión que más se amplía conserva resolución suficiente.`,
steps:{
doc:(l,fc,doc,raw)=>`## 1 · Lineatura del papel
+ Lineatura :: ${f4(l)} lpp
## 2 · Factor de calidad f(c)
* lineatura ≤ 133 lpp → f(c) = 2
* lineatura > 133 lpp → f(c) = 1,8
~ Como ${f4(l)} ${l<=133?'≤':'>'} 133 → f(c) = ${f4(fc)}
## 3 · Resolución del documento
= Fórmula | Resolución documento = Lineatura × f(c)
= Resolución documento = ${f4(l)} × ${f4(fc)} = ${doc} ppp`+TX_rnd(raw,doc),
esc:(l,fc,r,esc,raw)=>`## 1 · Factor de reproducción f(r)
${r.t}
## 2 · Factor de calidad f(c)
~ Lineatura ${f4(l)} lpp ${l<=133?'≤':'>'} 133 → f(c) = ${f4(fc)}
## 3 · Resolución de escaneado
= Fórmula | Resolución escaneado = Lineatura × f(r) × f(c)
= Resolución escaneado = ${f4(l)} × ${f4(r.f)} × ${f4(fc)} = ${esc} ppp`+TX_rnd(raw,esc),
fil:(l,b,a)=>`## 1 · Lineatura del papel
+ Lineatura :: ${f4(l)} lpp
## 2 · Resolución teórica
= Fórmula | Resolución filmación = 16 × Lineatura
= 16 × ${f4(l)} = ${f2(b)} ppp
> Celda de 16 × 16 = 256 puntos → 256 niveles de gris.
## 3 · Aproximación al valor estándar de filmadora
% ppp ${a}
~ Primer valor estándar ≥ ${f2(b)} → ${a} ppp`+
 (b>ST[ST.length-1]?'\n! AVISO: la resolución teórica supera 4800 ppp, el máximo estándar considerado.':''),
lin:(r,s,b,lim,raw)=>`## 1 · Factor de reproducción f(r)
${r.t}
## 2 · Resolución del dispositivo de salida
+ Resolución de salida :: ${f2(s)} ppp
## 3 · Resolución de escaneado
= Fórmula | Resolución escaneado = Resolución de salida × f(r)
= Resolución escaneado = ${f2(s)} × ${f4(r.f)} = ${b} ppp${TX_rnd(raw,b)}
## 4 · Límite para originales de línea
Si el resultado es ≥ ${LIM} ppp se limita a ${LIM} ppp.
> El ojo humano no diferencia más allá de ${LIM} ppp en originales de línea, así que limitarlo ahorra tiempo de escaneado y tamaño de archivo.
~ ${f2(b)} ${lim?'≥':'<'} ${LIM} → ${lim?'resultado final = '+LIM+' ppp':'sin límite; resultado final = '+f2(b)+' ppp'}`},
rnd:(raw,res)=>Math.abs(raw-res)<1e-9?'':`
^ El resultado real era :: ${f2(raw)} ppp :: lo hemos aproximado a :: ${res} ppp`,
apx:(raw,v)=>Math.abs(raw-v)<1e-9?'':`^ Valor real :: ${f4(raw)} :: aproximado a un decimal :: ${f4(v)}`,
pending:'— (aún no calculada)',
resumen:(l,fc,fr,d)=>`# Datos
+ Lineatura utilizada :: ${l}
+ Factor de calidad f(c) :: ${fc}
+ Factor de reproducción f(r) :: ${fr}
# Resultados
+ Resolución del documento :: ${d(S.doc)}
+ Resolución de escaneado :: ${d(S.esc)}
+ Resolución de filmación :: ${d(S.fil)}
# Fórmulas de referencia
= Documento = Lineatura × f(c)
= Escaneado = Lineatura × f(r) × f(c)
= Filmación = 16 × Lineatura
> La filmación se ajusta al siguiente valor estándar.`
} : {
lpi:'lpi', ppi:'ppi', dpi:'dpi', formula:'Formula',
sizes:{orig:'Original',rep:'Reproduction',w:'Width',h:'Height',hint:'Use the same unit (cm, mm, inches…) in all four fields.'},
names:{lp:'Screen ruling',ao:'Original width',ho:'Original height',ar:'Reproduction width',hr:'Reproduction height',sal:'Output resolution'},
err:{empty:n=>'Enter a value in “'+n+'”.',nan:n=>'“'+n+'” is not a valid number.',pos:n=>'“'+n+'” must be a number greater than 0.',lin:'Choose a valid screen ruling (between 1 and 200 lpi).'},
res:{doc:'Document resolution',esc:'Scan resolution',fil:'Imagesetter resolution',lin:'Scan resolution'},
fcv:(fc,low)=>'f(c) = '+fc+(low?'  (screen ruling ≤ 133 lpi)':'  (screen ruling > 133 lpi)'),
teo:{
doc:`# What is calculated
The resolution (in ppi, pixels per inch) the digital image needs at its final print size so the halftone screen is reproduced with quality.
# Formula
= Document resolution = Screen ruling × f(c)
# Where
- Screen ruling (lpi) :: halftone lines per inch. Depends on the paper and the printing process.
- f(c) :: quality factor.
* screen ruling ≤ 133 lpi → f(c) = 2
* screen ruling > 133 lpi → f(c) = 1.8
> Press “Calculate” to see the step-by-step working.`,
esc:`# What is calculated
The resolution to set on the scanner. The ORIGINAL is scanned, but the image will be printed at a different size; if it is enlarged, the scanner has to capture more pixels per inch from the original.
# Formulas
= f(r) = reproduction size ÷ original size
> The larger of width and height is used.
= Scan resolution = Screen ruling × f(r) × f(c)
# Where
- f(r) :: reproduction factor (enlargement or reduction scale).
- f(c) :: quality factor (2 if the screen ruling is ≤ 133 lpi; 1.8 if higher).
> Sizes can be in any unit as long as all four fields use the same one.`,
fil:`# What is calculated
The imagesetter resolution (dpi) needed to reproduce the chosen screen ruling with 256 grey levels.
# Formula
= Imagesetter resolution = 16 × Screen ruling
# Why 16
Each halftone dot is built from a cell of (resolution ÷ screen ruling)² imagesetter dots. A 16 × 16 = 256-dot cell gives 256 grey levels.
# Adjustment
The result is rounded up to the next standard imagesetter value:
% dpi`,
lin:`# What is calculated
The scan resolution of a LINE original (line art with no greys: text, logos, pen drawings). It does not depend on the screen ruling but on the resolution of the output device.
# Formulas
= f(r) = reproduction size ÷ original size
> The larger of width and height is used.
= Scan resolution = Output resolution × f(r)
# Limit
If the result is ≥ 1200 ppi it is capped at 1200 ppi.
> The human eye cannot tell the difference beyond 1200 ppi in line originals, so capping it saves scanning time and file size.`},
repro:(ao,ho,ar,hr,fa,fh,f)=>`= Formula | f(r) = reproduction size ÷ original size
= f(r) width = ${f4(ar)} ÷ ${f4(ao)} = ${f4(fa)}
${TX.apx(ar/ao,fa)}
= f(r) height = ${f4(hr)} ÷ ${f4(ho)} = ${f4(fh)}
${TX.apx(hr/ho,fh)}
~ The larger of the two is used → f(r) = ${f4(f)}
> So the most enlarged dimension keeps enough resolution.`,
steps:{
doc:(l,fc,doc,raw)=>`## 1 · Paper screen ruling
+ Screen ruling :: ${f4(l)} lpi
## 2 · Quality factor f(c)
* screen ruling ≤ 133 lpi → f(c) = 2
* screen ruling > 133 lpi → f(c) = 1.8
~ Since ${f4(l)} ${l<=133?'≤':'>'} 133 → f(c) = ${f4(fc)}
## 3 · Document resolution
= Formula | Document resolution = Screen ruling × f(c)
= Document resolution = ${f4(l)} × ${f4(fc)} = ${doc} ppi`+TX_rnd(raw,doc),
esc:(l,fc,r,esc,raw)=>`## 1 · Reproduction factor f(r)
${r.t}
## 2 · Quality factor f(c)
~ Screen ruling ${f4(l)} lpi ${l<=133?'≤':'>'} 133 → f(c) = ${f4(fc)}
## 3 · Scan resolution
= Formula | Scan resolution = Screen ruling × f(r) × f(c)
= Scan resolution = ${f4(l)} × ${f4(r.f)} × ${f4(fc)} = ${esc} ppi`+TX_rnd(raw,esc),
fil:(l,b,a)=>`## 1 · Paper screen ruling
+ Screen ruling :: ${f4(l)} lpi
## 2 · Theoretical resolution
= Formula | Imagesetter resolution = 16 × Screen ruling
= 16 × ${f4(l)} = ${f2(b)} dpi
> 16 × 16 = 256-dot cell → 256 grey levels.
## 3 · Rounding to a standard imagesetter value
% dpi ${a}
~ First standard value ≥ ${f2(b)} → ${a} dpi`+
 (b>ST[ST.length-1]?'\n! WARNING: the theoretical resolution exceeds 4800 dpi, the highest standard value considered.':''),
lin:(r,s,b,lim,raw)=>`## 1 · Reproduction factor f(r)
${r.t}
## 2 · Output device resolution
+ Output resolution :: ${f2(s)} dpi
## 3 · Scan resolution
= Formula | Scan resolution = Output resolution × f(r)
= Scan resolution = ${f2(s)} × ${f4(r.f)} = ${b} ppi${TX_rnd(raw,b)}
## 4 · Limit for line originals
If the result is ≥ ${LIM} ppi it is capped at ${LIM} ppi.
> The human eye cannot tell the difference beyond ${LIM} ppi in line originals, so capping it saves scanning time and file size.
~ ${f2(b)} ${lim?'≥':'<'} ${LIM} → ${lim?'final result = '+LIM+' ppi':'no cap needed; final result = '+f2(b)+' ppi'}`},
rnd:(raw,res)=>Math.abs(raw-res)<1e-9?'':`
^ The exact result was :: ${f2(raw)} ppi :: we rounded it to :: ${res} ppi`,
apx:(raw,v)=>Math.abs(raw-v)<1e-9?'':`^ Exact value :: ${f4(raw)} :: rounded to one decimal :: ${f4(v)}`,
pending:'— (not calculated yet)',
resumen:(l,fc,fr,d)=>`# Data
+ Screen ruling used :: ${l}
+ Quality factor f(c) :: ${fc}
+ Reproduction factor f(r) :: ${fr}
# Results
+ Document resolution :: ${d(S.doc,' ppi')}
+ Scan resolution :: ${d(S.esc,' ppi')}
+ Imagesetter resolution :: ${d(S.fil,' dpi')}
# Reference formulas
= Document = Screen ruling × f(c)
= Scan = Screen ruling × f(r) × f(c)
= Imagesetter = 16 × Screen ruling
> The imagesetter value is rounded up to the next standard value.`
};
const TX_rnd=(raw,res)=>TX.rnd(raw,res);
const UNIT={doc:TX.ppi,esc:TX.ppi,fil:TX.dpi,lin:TX.ppi};

/* ---------- Notes renderer (animated timeline) ---------- */
function node(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e}
const OPS=/([×÷=≤≥<>→])/;
function expr(text,cls='rc-n-expr'){const s=node('span',cls);
 text.split(OPS).forEach(p=>{if(p)s.append(p.length===1&&OPS.test(p)?node('span','rc-n-op',p):document.createTextNode(p))});return s}
const isValue=t=>/^[—\-]?\s*[\d.,]+( \S+)?$/.test(t.trim());

function renderNotes(box,src){
 box.innerHTML='';box.classList.remove('is-run');void box.offsetWidth;box.classList.add('is-run');
 let n=0,parent=box,list=null,para=null,step=null;
 const put=(e,into=parent)=>{e.style.setProperty('--n',n++);into.append(e);list=null;para=null;return e};
 src.split('\n').forEach(raw=>{
  const line=raw.trim();if(!line)return;
  const m=line.match(/^(##|#|=|-|\+|\*|~|>|!|%|\^)\s+(.*)$/),k=m?m[1]:'',t=m?m[2]:line;
  if(k==='#'){step=null;parent=box;put(node('h4','rc-n-h',t));return}
  if(k==='##'){const [num,...title]=t.split(' · ');
   step=put(node('section','rc-step'),box);parent=box;
   const badge=node('span','rc-step-num',num),body=node('div','rc-step-body');
   body.append(node('h4','rc-step-title',title.join(' · ')));step.append(badge,body);parent=body;return}
  if(k==='='){const e=node('div','rc-n-formula');let body=t;
   const bar=t.indexOf(' | ');if(bar>=0){e.append(node('span','rc-n-flabel',t.slice(0,bar)));body=t.slice(bar+3)}
   const i=body.lastIndexOf(' = '),last=i>=0?body.slice(i+3):'';
   if(i>=0&&isValue(last)){e.append(expr(body.slice(0,i+3)),node('strong','rc-n-result',last));e.classList.add('has-result')}
   else e.append(expr(body));
   put(e);return}
  if(k==='-'||k==='+'){const [a,b='']=t.split(' :: '),e=node('div',k==='-'?'rc-n-def':'rc-n-kv');
   const v=node(k==='-'?'span':'strong','rc-n-val',b);if(b.startsWith('—'))v.classList.add('is-empty');
   e.append(node('span','rc-n-term',a),v);put(e);return}
  if(k==='*'){if(!list){list=put(node('ul','rc-n-list'))}
   const li=node('li');li.append(expr(t));li.style.setProperty('--n',n++);list.append(li);return}
  if(k==='~'){const i=t.lastIndexOf('→'),e=node('div','rc-n-decision'),d=node('span','rc-n-dtext');
   d.append(expr(i>=0?t.slice(0,i):t));
   if(i>=0)d.append(node('span','rc-n-op rc-n-arrow','→'),expr(t.slice(i+1).trim(),'rc-n-conclusion'));
   e.append(node('span','rc-n-check','✓'),d);put(e);return}
  if(k==='>'){put(node('p','rc-n-note',t));return}
  if(k==='!'){put(node('p','rc-n-warn',t));return}
  if(k==='^'){const [a,real,b,rounded]=t.split(' :: '),e=node('div','rc-n-approx');
   const body=node('span','rc-n-approx-body');
   body.append(a+' ',node('span','rc-n-approx-real',real),' '+b+' ',node('strong','rc-n-approx-val',rounded));
   e.append(node('span','rc-n-approx-icon','≈'),body);
   put(e);return}
  if(k==='%'){const [unit,picked]=t.split(' '),e=node('div','rc-n-values');
   ST.forEach((v,j)=>{const c=node('span','rc-n-value',String(v));c.style.setProperty('--k',j);
    if(picked&&v===+picked)c.classList.add('is-picked');else if(picked&&v<+picked)c.classList.add('is-passed');e.append(c)});
   e.append(node('span','rc-n-unit',unit));put(e);return}
  if(para){para.append(' '+line);return}
  para=put(node('p','rc-n-p',line));para=parent.lastElementChild});
}

/* ---------- Size fields (original and reproduction) ---------- */
document.querySelectorAll('.sz').forEach(d=>{const p=d.dataset.p,z=TX.sizes;
 d.innerHTML=`<div class="rc-sizes">
  <fieldset class="rc-size"><legend>${z.orig}</legend>
   <label class="rc-field">${z.w}<input id="${p}ao" inputmode="decimal" autocomplete="off"></label>
   <label class="rc-field">${z.h}<input id="${p}ho" inputmode="decimal" autocomplete="off"></label></fieldset>
  <fieldset class="rc-size"><legend>${z.rep}</legend>
   <label class="rc-field">${z.w}<input id="${p}ar" inputmode="decimal" autocomplete="off"></label>
   <label class="rc-field">${z.h}<input id="${p}hr" inputmode="decimal" autocomplete="off"></label></fieldset>
 </div>
 <p class="rc-hint">${z.hint}</p>`});
for(const k in TX.teo)renderNotes($('n-'+k),TX.teo[k]);

/* ---------- Reading and validation ---------- */
// Accepts both decimal separators: 21.7 and 21,7 (and ,5 / .5)
function num(id,nombre){
 const t=$(id).value.trim();
 if(!t)throw Error(TX.err.empty(nombre));
 if(!/^(\d+([.,]\d*)?|[.,]\d+)$/.test(t))throw Error(TX.err.nan(nombre));
 const v=Number(t.replace(',','.'));
 if(!isFinite(v))throw Error(TX.err.nan(nombre));
 if(!(v>0))throw Error(TX.err.pos(nombre));
 return v}
function lin(){const v=+$('pap').value, l=v>0?v:num('lp',TX.names.lp);
 if(l>200)throw Error(TX.err.lin);return l}

// One decimal place; tiny factors keep one significant digit instead of becoming 0
const r1=v=>Math.round(v*10)/10||+v.toPrecision(1);
function repro(p){const n=TX.names;
 const ao=num(p+'ao',n.ao),ho=num(p+'ho',n.ho),
       ar=num(p+'ar',n.ar),hr=num(p+'hr',n.hr),
       fa=r1(ar/ao),fh=r1(hr/ho),f=Math.max(fa,fh);
 return{f,t:TX.repro(ao,ho,ar,hr,fa,fh,f)}}

/* ---------- Output ---------- */
const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
function pulse(e){e.classList.remove('is-pulse');void e.offsetWidth;e.classList.add('is-pulse')}

// Result label + number counting up to the final value
function out(k,value,notas){const r=$('r-'+k);
 r.className='rc-res';r.innerHTML='';
 const val=node('span','rc-res-value'),n=node('span'),unit=node('span','rc-res-unit',UNIT[k]);
 val.append(n,unit);r.append(node('span','rc-res-label',TX.res[k]),val);
 void r.offsetWidth;r.classList.add('is-new');
 renderNotes($('n-'+k),notas);
 if(reduce.matches){n.textContent=f2(value);return}
 const t0=performance.now(),dur=650;
 (function tick(t){const p=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-p,3);
  n.textContent=p<1?f2(Math.round(value*e)):f2(value);
  if(p<1)requestAnimationFrame(tick)})(t0)}

function fail(k,e){const r=$('r-'+k);r.className='rc-res';void r.offsetWidth;r.className='rc-res e';r.textContent='⚠ '+e.message}

// Back to the initial state (used when an automatic recalculation is not possible)
function clear(k){const r=$('r-'+k);r.className='rc-res';r.innerHTML='';
 renderNotes($('n-'+k),TX.teo[k]);S[k]=undefined;
 if(k==='esc'){S.fr=undefined;frChip('e',null)}
 if(k==='lin')frChip('l',null)}

// f(r) chip next to f(c), shown once a reproduction factor has been calculated
function frChip(p,f){const c=$('frv-'+p);if(f==null&&c.hidden)return;
 const t='f(r) = '+(f==null?'—':f4(f)),changed=c.textContent!==t;
 c.textContent=t;c.hidden=false;if(changed)pulse(c)}

/* ---------- Calculations ---------- */
const calc={
doc(){const l=lin(),fc=fcOf(l),raw=fc*l;Object.assign(S,{l,fc,doc:Math.round(raw)});
 out('doc',S.doc,TX.steps.doc(l,fc,S.doc,raw))},
esc(){const l=lin(),fc=fcOf(l),r=repro('e'),raw=l*r.f*fc;Object.assign(S,{l,fc,fr:r.f,esc:Math.round(raw)});
 frChip('e',r.f);
 out('esc',S.esc,TX.steps.esc(l,fc,r,S.esc,raw))},
fil(){const l=lin(),fc=fcOf(l),b=16*l,a=aprox(b);Object.assign(S,{l,fc,fil:a});
 out('fil',a,TX.steps.fil(l,b,a))},
lin(){const r=repro('l'),s=num('sal',TX.names.sal),raw=s*r.f,b=Math.round(raw),lim=b>=LIM,res=lim?LIM:b;
 frChip('l',r.f);
 out('lin',res,TX.steps.lin(r,s,b,lim,raw))}
};

function run(k,auto){
 try{calc[k]();AUTO.add(k)}
 catch(e){if(auto)clear(k);else fail(k,e)}
 resumen()}
document.querySelectorAll('[data-run]').forEach(b=>b.addEventListener('click',()=>run(b.dataset.run)));

// Keep calculated results in sync with the inputs
const timers={};
function autoRun(keys){keys.forEach(k=>{if(!AUTO.has(k))return;
 clearTimeout(timers[k]);timers[k]=setTimeout(()=>run(k,true),450)})}

/* ---------- Summary ---------- */
function resumen(){const d=(v,u=' '+TX.ppi)=>v==null?TX.pending:f2(v)+u;let l='—',fc='—';
 try{const v=lin();l=f4(v)+' '+TX.lpi;fc=f4(fcOf(v))}catch(e){}
 renderNotes($('n-res'),TX.resumen(l,fc,S.fr==null?'—':f4(S.fr),d))}
resumen();

/* ---------- Quality factor shown next to the screen ruling ---------- */
function fcv(){$('lpw').hidden=+$('pap').value>0;const c=$('fcv'),prev=c.textContent;
 try{const l=lin();c.textContent=TX.fcv(f4(fcOf(l)),l<=133)}
 catch(e){c.textContent='f(c) = —'}
 if(prev&&prev!==c.textContent)pulse(c)}
function onRuling(){fcv();autoRun(['doc','esc','fil']);resumen()}
$('pap').addEventListener('change',onRuling);$('lp').addEventListener('input',onRuling);fcv();
document.querySelector('.sz[data-p="e"]').addEventListener('input',()=>autoRun(['esc']));
document.querySelector('.sz[data-p="l"]').addEventListener('input',()=>autoRun(['lin']));
$('sal').addEventListener('input',()=>autoRun(['lin']));

/* ---------- Custom dropdown for the paper select ---------- */
(function(sel){
 const id=sel.id+'-list',wrap=node('div','rc-select'),btn=node('button','rc-select-btn'),list=node('ul','rc-select-list');
 const btnName=node('span','rc-select-name'),btnLpi=node('span','rc-opt-lpi'),chev=node('span','rc-select-chev');
 btn.type='button';btn.id=sel.id+'-btn';
 btn.setAttribute('aria-haspopup','listbox');btn.setAttribute('aria-expanded','false');btn.setAttribute('aria-controls',id);
 btn.setAttribute('aria-labelledby',(sel.getAttribute('aria-labelledby')||'')+' '+btn.id);
 btn.append(btnName,btnLpi,chev);
 list.id=id;list.tabIndex=-1;list.setAttribute('role','listbox');
 const opts=Array.from(sel.options).map((o,k)=>{const [name,lpi]=o.textContent.split(' — '),v=+o.value;
  const li=node('li','rc-opt'),txt=node('span','rc-opt-text');
  li.id=id+'-'+k;li.setAttribute('role','option');li.style.setProperty('--k',k);
  txt.append(node('span','rc-opt-name',name));
  if(v>0)txt.append(node('span','rc-opt-fc','f(c) = '+f4(fcOf(v))));
  li.append(txt);
  if(lpi)li.append(node('span','rc-opt-lpi',lpi));else li.classList.add('rc-opt--other');
  list.append(li);return li});
 let open=false,active=0;

 function sync(){const i=sel.selectedIndex,o=opts[i];
  btnName.textContent=o.querySelector('.rc-opt-name').textContent;
  const lpi=o.querySelector('.rc-opt-lpi');btnLpi.textContent=lpi?lpi.textContent:'';btnLpi.hidden=!lpi;
  opts.forEach((li,k)=>li.setAttribute('aria-selected',String(k===i)))}
 function setActive(i,scroll){active=(i+opts.length)%opts.length;
  opts.forEach((li,k)=>li.classList.toggle('is-active',k===active));
  list.setAttribute('aria-activedescendant',opts[active].id);
  if(scroll)opts[active].scrollIntoView({block:'nearest'})}
 function show(v){open=v;wrap.classList.toggle('is-open',v);btn.setAttribute('aria-expanded',String(v));
  if(v){setActive(sel.selectedIndex,true);list.focus({preventScroll:true})}}
 function choose(i){show(false);btn.focus();
  if(sel.selectedIndex!==i){sel.selectedIndex=i;sel.dispatchEvent(new Event('change',{bubbles:true}))}}

 btn.addEventListener('click',()=>show(!open));
 btn.addEventListener('keydown',e=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();show(true)}});
 list.addEventListener('keydown',e=>{
  const keys={ArrowDown:()=>setActive(active+1,true),ArrowUp:()=>setActive(active-1,true),
   Home:()=>setActive(0,true),End:()=>setActive(opts.length-1,true),
   Enter:()=>choose(active),' ':()=>choose(active),Escape:()=>{show(false);btn.focus()}};
  if(keys[e.key]){e.preventDefault();keys[e.key]()}else if(e.key==='Tab')show(false)});
 list.addEventListener('click',e=>{const li=e.target.closest('.rc-opt');if(li)choose(opts.indexOf(li))});
 list.addEventListener('mousemove',e=>{const li=e.target.closest('.rc-opt');if(li&&opts.indexOf(li)!==active)setActive(opts.indexOf(li))});
 document.addEventListener('click',e=>{if(open&&!wrap.contains(e.target))show(false)});
 sel.addEventListener('change',sync);

 sel.classList.add('rc-native');sel.tabIndex=-1;sel.setAttribute('aria-hidden','true');
 wrap.append(btn,list);sel.after(wrap);sync();
})($('pap'));

/* ---------- Tabs with sliding indicator ---------- */
const bars=Array.from(document.querySelectorAll('.rc-tabs'));
function place(bar){const ind=bar.querySelector('.rc-tab-indicator'),b=bar.querySelector('[aria-selected="true"]');
 if(!ind||!b||!b.offsetWidth)return;
 ind.style.cssText=`left:${b.offsetLeft}px;top:${b.offsetTop}px;width:${b.offsetWidth}px;height:${b.offsetHeight}px`}
function select(b){const bar=b.closest('.rc-tabs');
 bar.querySelectorAll('[data-t]').forEach(x=>x.setAttribute('aria-selected',String(x===b)));
 document.querySelectorAll('[data-g="'+bar.dataset.g+'"]').forEach(p=>{if(p.id)p.hidden=p.id!==b.dataset.t});
 if(b.dataset.t==='p-res')resumen();
 bars.forEach(place)}
bars.forEach(bar=>{
 bar.insertAdjacentHTML('afterbegin','<span class="rc-tab-indicator" aria-hidden="true"></span>');
 bar.classList.add('has-indicator');place(bar);
 requestAnimationFrame(()=>requestAnimationFrame(()=>bar.classList.add('is-ready')));
 bar.addEventListener('click',e=>{const b=e.target.closest('[data-t]');if(b)select(b)})});
window.addEventListener('resize',()=>bars.forEach(place));
if(document.fonts)document.fonts.ready.then(()=>bars.forEach(place));

/* ---------- Language switch: keep open tabs and calculations (see lang.js) ---------- */
document.addEventListener('peri:lang-save',e=>{
 e.detail.tabs=Array.from(document.querySelectorAll('.rc-tabs [aria-selected="true"]')).map(b=>b.dataset.t);
 e.detail.done=Array.from(AUTO).filter(k=>$('r-'+k).querySelector('.rc-res-value'))});
document.addEventListener('peri:lang-restore',e=>{
 (e.detail.tabs||[]).forEach(t=>{const b=document.querySelector('.rc-tabs [data-t="'+t+'"]');if(b)select(b)});
 (e.detail.done||[]).forEach(k=>{if(calc[k])run(k)})});
})();
