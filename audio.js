export class AudioDirector{
 constructor(element){this.media=element;this.enabled=false;this.lang='tr';this.pending=null;this.active=null;this.queue=0;this.context=null;this.currentScene=null;this.lastP=0;this.lastTime=0;this.contextActive=false;}
 async setEnabled(enabled,scene){
  this.enabled=enabled;
  if(!enabled){clearTimeout(this.queue);this.media.pause();this.media.currentTime=0;this.active=null;if(this.master)this.master.gain.setTargetAtTime(0,this.context.currentTime,.05);return;}
  const AC=window.AudioContext||window.webkitAudioContext;
  if(AC&&!this.context){this.context=new AC();this.buildEffects();}
  if(this.context){await this.context.resume();this.master.gain.setTargetAtTime(.14,this.context.currentTime,.1);}
  // Reuse this one HTMLMediaElement; a direct user gesture starts its first real clip on iOS.
  await this.speak(scene,true);
 }
 buildEffects(){
  const c=this.context;this.master=c.createGain();this.master.gain.value=0;this.master.connect(c.destination);
  this.windGain=c.createGain();this.windGain.gain.value=0;const data=c.createBuffer(1,c.sampleRate*3,c.sampleRate);let seed=7;const a=data.getChannelData(0);for(let i=0;i<a.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;a[i]=((seed/4294967296)*2-1)*.5;}
  this.noise=c.createBufferSource();this.noise.buffer=data;this.noise.loop=true;const filter=c.createBiquadFilter();filter.type='lowpass';filter.frequency.value=800;this.noise.connect(filter).connect(this.windGain).connect(this.master);this.noise.start();
  this.motorGain=c.createGain();this.motorGain.gain.value=0;this.motor=c.createOscillator();this.motor.type='triangle';this.motor.frequency.value=48;this.motor.connect(this.motorGain).connect(this.master);this.motor.start();
 }
 async speak(scene,direct=false){
  if(!this.enabled||!scene)return;this.currentScene=scene;
  const key=this.lang+scene.id;if(this.active===key&&!direct)return;
  this.media.pause();this.media.src=`${this.assetBase||''}assets/audio/${this.lang}/${scene.id}.mp3`;this.media.load();this.active=key;this.media.volume=.92;
  try{await this.media.play();}catch{this.active=null;}
 }
 schedule(scene){this.currentScene=scene;clearTimeout(this.queue);if(!this.enabled)return;this.media.pause();this.active=null;this.queue=setTimeout(()=>this.speak(scene),240);this.cue(scene.id);}
 language(lang,scene){this.lang=lang;clearTimeout(this.queue);this.active=null;this.media.pause();if(this.enabled)this.speak(scene,true);}
 cue(id){
  const c=this.context;if(!this.enabled||!c||c.state!=='running')return;
  const o=c.createOscillator(),g=c.createGain();o.type=id==='03'?'sine':'triangle';const at=c.currentTime;const f={'01':900,'02':160,'03':660,'04':95,'05':72,'06':220}[id];o.frequency.setValueAtTime(f,at);o.frequency.exponentialRampToValueAtTime(f*.45,at+.25);g.gain.setValueAtTime(.001,at);g.gain.exponentialRampToValueAtTime(id==='01'?.08:.035,at+.012);g.gain.exponentialRampToValueAtTime(.001,at+.32);o.connect(g).connect(this.master);o.start(at);o.stop(at+.35);
 }
 update(state,velocity){if(!this.context||!this.enabled)return;const t=this.context.currentTime;const move=Math.min(Math.abs(velocity)*14,1);this.windGain.gain.setTargetAtTime((.015+state.tunnel*.07)*move,t,.18);this.motorGain.gain.setTargetAtTime(state.index>=3&&state.index<=4?.10*move:0,t,.12);this.motor.frequency.setTargetAtTime(45+move*45,t,.1);}
 suspend(){clearTimeout(this.queue);this.media.pause();this.active=null;if(this.master)this.master.gain.setTargetAtTime(0,this.context.currentTime,.06);}
 resume(scene){if(!this.enabled)return;if(this.context)this.master.gain.setTargetAtTime(.14,this.context.currentTime,.1);this.schedule(scene);}
}
