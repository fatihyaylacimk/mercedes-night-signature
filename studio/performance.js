import {sample} from './timeline.js';
import {summarizeFrames,invalidatesViewport} from './performance-metrics.js?v=2';
const $=id=>document.getElementById(id);
let renderer=null,running=false,loading=false,interrupted=false,raf=0,report=null,runViewport=null;
const orientation=()=>screen.orientation?.angle??window.orientation??null;
function error(message){$('failure').hidden=false;$('failure').textContent=message;$('status').textContent='Ölçüm tamamlanmadı. Performans sonucu üretilmedi.';}
function beginRunLayout(){
 document.body.dataset.running='true';
 $('test-stage').style.height=Math.max(160,innerWidth<=700?innerHeight-240:innerHeight)+'px';
 renderer.resize();
 const rect=$('test-canvas').getBoundingClientRect();
 runViewport={width:innerWidth,height:innerHeight,canvas_css_width:rect.width,canvas_css_height:rect.height,pixel_ratio:renderer.renderer.getPixelRatio(),orientation:orientation()};
 window.scrollTo({top:0,behavior:'instant'});
}
function endRunLayout(){
 document.body.dataset.running='false';$('test-stage').style.height='';
 renderer?.resize();
}
function stop(reason){
 if(!running&&!loading)return;
 interrupted=true;running=false;cancelAnimationFrame(raf);endRunLayout();
 $('start').disabled=loading;$('stop').hidden=true;if(reason)error(reason);
}
function finish(intervals,phases,loadMs,startedAt,reused){
 const metrics=summarizeFrames(intervals);
 if(!metrics){stop('Yeterli kare ölçülemedi.');return;}
 report={schema:'gt-studio-performance-v1',tool_version:2,measured_at:new Date().toISOString(),test_started_at:startedAt,test_completed:true,physical_device_verified:false,method:'requestAnimationFrame intervals while rendering the production Studio 3D model; not GPU timer queries',test_duration_target_seconds:30,warmup_seconds:3,sound_enabled:false,quality:renderer.low?'mobile':'desktop',model:renderer.low?'car-mobile.glb':'car-rig.glb',load_ms:loadMs,model_reused:reused,renderer_version:'studio-3',viewport:{...runViewport},device:{user_agent:navigator.userAgent,hardware_concurrency:navigator.hardwareConcurrency??null,device_memory_gb:navigator.deviceMemory??null,max_touch_points:navigator.maxTouchPoints??0},metrics,phases:Object.fromEntries(Object.entries(phases).map(([name,values])=>[name,summarizeFrames(values)])),limitations:['A single 30 second run does not establish sustained thermal or battery performance.','Frame intervals measure browser frame cadence and include CPU, GPU and browser scheduling effects.','Device identity is browser reported; physical device ownership is not remotely verified.']};
 running=false;endRunLayout();$('start').disabled=false;$('stop').hidden=true;$('progress').value=30;
 $('results').hidden=false;$('summary').textContent=`Bu çalıştırmada ortalama ${metrics.average_fps.toFixed(1)} FPS ölçüldü. Görsel hatalar ve dokunmatik kullanım ayrıca gözle kontrol edilmelidir.`;
 const rows=[['Ortalama FPS',metrics.average_fps.toFixed(1)],['Ortanca kare süresi',metrics.median_frame_ms.toFixed(2)+' ms'],['%95 kare süresi',metrics.p95_frame_ms.toFixed(2)+' ms'],['En uzun kare',metrics.longest_frame_ms.toFixed(2)+' ms'],['50 ms üzerindeki kareler',String(metrics.frames_over_50ms)],['100 ms üzerindeki kareler',String(metrics.frames_over_100ms)],['Ölçülen süre',(metrics.duration_ms/1000).toFixed(2)+' sn'],['Model hazırlama',(loadMs/1000).toFixed(2)+' sn'],['Seçilen kalite',renderer.low?'Mobil':'Masaüstü']];
 const table=document.createElement('table');
 for(const [label,value]of rows){const tr=document.createElement('tr'),th=document.createElement('th'),td=document.createElement('td');th.scope='row';th.textContent=label;td.textContent=value;tr.append(th,td);table.append(tr);}
 $('metrics').replaceChildren(table);$('status').textContent='Test tamamlandı. Sonuçları okuyabilir ve raporu indirebilirsin.';
}
$('start').onclick=async()=>{
 if(running||loading)return;
 report=null;runViewport=null;interrupted=false;loading=true;$('start').disabled=true;$('stop').hidden=false;$('results').hidden=true;$('failure').hidden=true;$('progress').hidden=false;$('progress').value=0;$('status').textContent='3D model yükleniyor…';
 const reused=!!renderer,loadStart=performance.now();
 try{
  if(!renderer){
   const {CarRenderer}=await import('./renderer.js?v=studio-3');if(interrupted)return;
   renderer=new CarRenderer($('test-canvas'));
   await renderer.load(p=>{if(!interrupted)$('status').textContent='3D model yükleniyor'+(p!==null?' · %'+Math.round(p*100):'…');});
  }
  if(interrupted)return;
  if(renderer.renderer.getContext().isContextLost())throw new Error('WebGL context is lost');
  document.body.dataset.ready='true';
  const loadMs=performance.now()-loadStart;loading=false;running=true;beginRunLayout();
  const start=performance.now(),startedAt=new Date().toISOString();let previous=null,lastUi=0;
  const intervals=[],phases={scroll:[],orbit:[],reverse:[]};
  const frame=time=>{
   if(!running)return;
   try{
    const elapsed=(time-start)/1000,measured=elapsed-3;let phase='scroll',p=.14;
    if(measured<0){p=.14+Math.max(elapsed,0)/3*.12;}
    else if(measured<12){p=.14+measured/12*.85;}
    else if(measured<20){phase='orbit';p=.415;}
    else{phase='reverse';p=.99-Math.min(1,(measured-20)/10)*.85;}
    const s=sample(p);s.headlights=measured<12||measured>=20||Math.floor(measured)%2===0;
    if(phase==='orbit'){const a=(measured-12)/8*Math.PI*2;s.orbit=true;s.camera=[-.22+6.5*Math.cos(a),1.7,6.5*Math.sin(a)];s.target=[-.22,.5,0];s.doorAngle=-Math.PI*.36*(.5+.5*Math.sin(a));s.tunnel=0;s.cockpit=0;s.light=1;}
    renderer.setColor(['#15171b','#aeb7c3','#a4081c'][Math.floor(Math.max(measured,0)/10)%3]);renderer.render(s);$('cabin').style.opacity=String(phase==='orbit'?0:s.cockpit);
    if(measured>=0){if(previous!==null){const delta=time-previous;intervals.push(delta);phases[phase].push(delta);}previous=time;}
    if(time-lastUi>250){lastUi=time;$('progress').value=Math.max(0,measured);$('status').textContent=measured<0?'3D sahne ısınıyor…':`Ölçülüyor · ${Math.min(30,Math.floor(measured))}/30 sn · ${phase==='scroll'?'Hikâye':phase==='orbit'?'360° ve kontroller':'Geri kaydırma'}`;}
    if(measured>=30){finish(intervals,phases,loadMs,startedAt,reused);return;}
    raf=requestAnimationFrame(frame);
   }catch(err){stop('3D çizim sırasında hata oluştu: '+String(err.message));}
  };
  raf=requestAnimationFrame(frame);
 }catch(err){
  renderer?.dispose();renderer=null;document.body.dataset.ready='false';running=false;cancelAnimationFrame(raf);endRunLayout();
  error('3D test bu tarayıcıda başlatılamadı. Bağlantıyı telefonun Chrome veya Safari tarayıcısında açıp tekrar dene. Ayrıntı: '+String(err.message));
 }finally{
  loading=false;if(!running){$('start').disabled=false;$('stop').hidden=true;}
 }
};
$('stop').onclick=()=>stop('Test durduruldu. Yeniden başlatabilirsin.');
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop('Sekme arka plana geçtiği için ölçüm iptal edildi. Testi sayfa açıkken yeniden başlat.');});
addEventListener('resize',()=>{
 if(running&&runViewport){
  const current={width:$('test-canvas').getBoundingClientRect().width,orientation:orientation()};
  if(invalidatesViewport({width:runViewport.canvas_css_width,orientation:runViewport.orientation},current))stop('Ekran yönü veya genişliği değiştiği için ölçüm iptal edildi. Sabit yönde yeniden başlat.');
  return;
 }
 renderer?.resize();
});
$('test-canvas').addEventListener('webglcontextlost',()=>{
 const lost=renderer;renderer=null;lost?.dispose();document.body.dataset.ready='false';
 stop('3D görüntüleme bağlantısı kesildi. Sayfayı yenileyip yeniden dene.');
});
$('download').onclick=()=>{
 if(!report)return;
 const blob=new Blob([JSON.stringify(report,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='GT-Studio-Performance-'+new Date().toISOString().replace(/:/g,'-')+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
};
$('boot-note').hidden=true;$('start').disabled=false;
