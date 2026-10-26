import {SCENES} from './scenes.js';
import {sample,chapterPosition,clamp} from './timeline.js';
import {CinemaRenderer} from './fallback.js';
import {AudioDirector} from './audio.js';
const $=id=>document.getElementById(id);
const COPY={
 tr:{chapters:'Sahneler',scroll:'Keşfetmek için kaydır',explore:'Aracı keşfet',replay:'Yeniden keşfet',credit:'FATİH YAYLACI · KONSEPT',menuCaption:'Bir sahne seç veya kaydırarak ilerle.',aboutTitle:'Konsept hakkında',aboutText:'Mercedes-AMG GT için hazırlanmış bağımsız bir görsel ve etkileşim çalışması. Fatih Yaylacı.',modelNote:'3D hareket kaynağı GT S 2016 modelidir; yüksek detaylı kokpit karesi görsel konsept olarak hazırlanmıştır.',soundOn:'Ses açık',soundOff:'Ses kapalı',previous:'Önceki sahne',next:'Sonraki sahne',close:'Kapat',eyebrow:'BİR GECE YOLCULUĞU',loading:'3D sahne hazırlanıyor',visualMode:'Sinematik görsel akış. Bu tarayıcıda 3D görüntüleme kullanılamıyor.',threeMode:'Kaydırmayla kontrol edilen 3D kamera, kapı ve tekerlekler.',titles:['Gecenin<br><em>imzası.</em>','Her çizgide<br><em>karakter.</em>','Her ayrıntı,<br><em>senin için.</em>','Hareket<br><em>bir histir.</em>','Mühendislik.<br><em>Zarafet. Hareket.</em>','Gecenin<br><em>imzası.</em>'],descriptions:['Işığın izini takip et.','Işıkla şekillenen bir siluet.','Sürüşün merkezinde sen varsın.','Bir ayrıntıdan, bütün bir deneyime.','Yol açılır. Hikâye devam eder.','Mercedes-AMG GT Coupé.']},
 en:{chapters:'Chapters',scroll:'Scroll to explore',explore:'Explore the car',replay:'Explore again',credit:'FATİH YAYLACI · CONCEPT',menuCaption:'Choose a chapter or scroll to explore.',aboutTitle:'About the concept',aboutText:'An independent visual and interaction concept for the Mercedes-AMG GT. By Fatih Yaylacı.',modelNote:'The animated 3D source is a 2016 GT S; the detailed cockpit still is a separate visual concept.',soundOn:'Sound on',soundOff:'Sound off',previous:'Previous chapter',next:'Next chapter',close:'Close',eyebrow:'A JOURNEY INTO THE NIGHT',loading:'Preparing 3D scene',visualMode:'Cinematic image sequence. 3D rendering is unavailable in this browser.',threeMode:'Scroll-controlled 3D camera, door and wheels.',titles:['Signature<br><em>of the night.</em>','Character<br><em>in every line.</em>','Every detail,<br><em>for you.</em>','Motion<br><em>is a feeling.</em>','Engineering.<br><em>Elegance. Motion.</em>','Signature<br><em>of the night.</em>'],descriptions:['Follow the light.','A silhouette shaped by light.','You are at the centre of the drive.','One detail. An entire experience.','The road opens. The story continues.','Mercedes-AMG GT Coupé.']}
};
let lang='tr';try{lang=localStorage.getItem('mercedes-language')==='en'?'en':'tr';}catch{}
const audio=new AudioDirector($('narration'));audio.lang=lang;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let progress=0,target=0,currentIndex=-1,lastTime=performance.now(),lastPaint=-1,three=null,mode='canvas',running=true,frameRequest=0;
const cinema=new CinemaRenderer($('cinema'),()=>{if(document.body.dataset.renderer==='canvas')$('load-status').hidden=true;render(true);});
function readScroll(){const total=Math.max(1,$('scroll-rail').offsetHeight-innerHeight);target=clamp(scrollY/total);requestTick();}
function jump(index){const value=chapterPosition(index);const total=Math.max(1,$('scroll-rail').offsetHeight-innerHeight);window.scrollTo({top:Math.round(value*total),behavior:'instant'});target=value;progress=value;readScroll();render(true);history.replaceState(null,'',`#scene-${SCENES[clamp(index,0,5)].id}`);}
function chapterTitle(s){return s.heading[lang];}
function renderCopy(){
 document.documentElement.lang=lang;document.querySelectorAll('[data-copy]').forEach(el=>el.textContent=COPY[lang][el.dataset.copy]);
 $('lang-tr').setAttribute('aria-pressed',String(lang==='tr'));$('lang-en').setAttribute('aria-pressed',String(lang==='en'));
 $('previous').setAttribute('aria-label',COPY[lang].previous);$('next').setAttribute('aria-label',COPY[lang].next);$('menu-close').setAttribute('aria-label',COPY[lang].close);$('about-close').setAttribute('aria-label',COPY[lang].close);
 $('sound-label').textContent=audio.enabled?COPY[lang].soundOn:COPY[lang].soundOff;$('eyebrow').textContent=COPY[lang].eyebrow;
 $('home').setAttribute('aria-label',lang==='tr'?'Başlangıca dön':'Back to the beginning');document.querySelector('.skip').textContent=lang==='tr'?'Sahnelere geç':'Skip to chapters';document.querySelector('.language').setAttribute('aria-label',lang==='tr'?'Dil':'Language');$('experience').setAttribute('aria-label',lang==='tr'?'Mercedes-AMG GT etkileşimli reklam konsepti':'Mercedes-AMG GT interactive advertising concept');
 $('render-status').textContent=COPY[lang][mode==='webgl'?'threeMode':'visualMode'];
 $('chapters').replaceChildren(...SCENES.map((s,i)=>{const b=document.createElement('button');b.innerHTML=`<span>${s.id}</span>${chapterTitle(s)}`;b.setAttribute('aria-current',String(i===currentIndex));b.addEventListener('click',()=>{$('chapter-menu').close();$('menu-button').setAttribute('aria-expanded','false');jump(i);});return b;}));
 updateScene(sample(progress),true);
}
function updateScene(s,force=false){
 if(s.index===currentIndex&&!force)return;const changed=s.index!==currentIndex;currentIndex=s.index;
 $('headline').innerHTML=COPY[lang].titles[s.index];$('scene-description').textContent=COPY[lang].descriptions[s.index];$('story-number').textContent=s.scene.id+'—06';$('chapter-counter').innerHTML=s.scene.id+' <i>/ 06</i>';
 $('previous').disabled=s.index===0;$('next').disabled=s.index===5;
 $('chapters').querySelectorAll('button').forEach((b,i)=>b.setAttribute('aria-current',String(i===s.index)));
 document.body.dataset.scene=s.scene.id;
 if(changed&&audio.enabled)audio.schedule(s.scene);
}
function render(force=false){
 const s=sample(progress);updateScene(s);
 $('progress-fill').style.transform=`scaleX(${s.p})`;$('intro-hint').style.opacity=String(1-clamp(s.p/.06));$('intro-hint').hidden=s.p>.1;$('final-actions').hidden=s.p<.92;
 $('cockpit').style.opacity=mode==='webgl'?String(s.cockpit):'0';
 document.body.dataset.progress=s.p.toFixed(5);
 if(force||Math.abs(lastPaint-progress)>.00002){if(three&&mode==='webgl')three.render(s);else cinema.render(s);lastPaint=progress;}
 return s;
}
function tick(time){frameRequest=0;if(!running)return;const dt=Math.min((time-lastTime)/1000,.05)||.016;lastTime=time;const prior=progress;
 if(reduced.matches)progress=target;else progress+=(target-progress)*(1-Math.exp(-dt*13));if(Math.abs(target-progress)<.000025)progress=target;
 const s=render();audio.update(s,(progress-prior)/dt);
 if(Math.abs(target-progress)>.00001||audio.enabled)requestTick();
}
function requestTick(){if(!frameRequest&&running)frameRequest=requestAnimationFrame(tick);}
window.addEventListener('scroll',readScroll,{passive:true});
window.addEventListener('resize',()=>{cinema.resize();three?.resize();readScroll();render(true);},{passive:true});
reduced.addEventListener('change',()=>{progress=target;render(true);});
document.addEventListener('visibilitychange',()=>{running=!document.hidden;if(!running){cancelAnimationFrame(frameRequest);frameRequest=0;audio.suspend();}else{lastTime=performance.now();audio.resume(SCENES[currentIndex]);requestTick();}});
$('previous').addEventListener('click',()=>jump(currentIndex-1));$('next').addEventListener('click',()=>jump(currentIndex+1));$('home').addEventListener('click',e=>{e.preventDefault();jump(0);});$('replay').addEventListener('click',()=>jump(0));
$('menu-button').addEventListener('click',()=>{$('chapter-menu').showModal();$('menu-button').setAttribute('aria-expanded','true');});
$('menu-close').addEventListener('click',()=>$('chapter-menu').close());$('chapter-menu').addEventListener('close',()=>$('menu-button').setAttribute('aria-expanded','false'));
$('about-button').addEventListener('click',()=>$('about-dialog').showModal());$('about-close').addEventListener('click',()=>$('about-dialog').close());
for(const l of ['tr','en'])$('lang-'+l).addEventListener('click',()=>{if(l===lang)return;lang=l;try{localStorage.setItem('mercedes-language',l);}catch{}renderCopy();audio.language(lang,SCENES[currentIndex]);});
$('sound').addEventListener('click',async()=>{const on=!audio.enabled;$('sound').setAttribute('aria-pressed',String(on));$('sound-label').textContent=on?COPY[lang].soundOn:COPY[lang].soundOff;await audio.setEnabled(on,SCENES[currentIndex]);requestTick();});
document.addEventListener('keydown',e=>{if(document.querySelector('dialog[open]'))return;if(e.key==='ArrowRight'){e.preventDefault();jump(Math.min(currentIndex+1,5));}else if(e.key==='ArrowLeft'){e.preventDefault();jump(Math.max(currentIndex-1,0));}});
async function boot3D(){
 try{const {CarRenderer}=await import('./webgl.js');three=new CarRenderer($('three-stage'));$('load-status').hidden=false;await three.load(p=>{$('load-status').textContent=COPY[lang].loading+(p!==null?' · '+Math.round(p*100)+'%':'…');});mode='webgl';document.body.dataset.renderer='webgl';$('render-status').textContent=COPY[lang].threeMode;$('load-status').hidden=true;render(true);}
 catch(err){three?.dispose();three=null;mode='canvas';document.body.dataset.renderer='canvas';$('render-status').textContent=COPY[lang].visualMode;$('load-status').hidden=true;cinema.render(sample(progress));console.info('Cinematic image mode:',String(err?.message||err));}
}
renderCopy();readScroll();render(true);
const initial=/^#scene-(0[1-6])$/.exec(location.hash);if(initial)jump(Number(initial[1])-1);
boot3D();
