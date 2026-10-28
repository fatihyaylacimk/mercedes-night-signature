// Adapted from the existing GT Studio renderer; original model provenance is retained.
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {DRACOLoader} from 'three/addons/loaders/DRACOLoader.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {RectAreaLightUniformsLib} from 'three/addons/lights/RectAreaLightUniformsLib.js';
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
export class SignatureRenderer{
 constructor(canvas){
  this.low=navigator.deviceMemory<=4||innerWidth<700;this.exporting=false;
  this.canvas=canvas;this.scene=new THREE.Scene();this.scene.background=new THREE.Color('#08090a');this.scene.fog=new THREE.FogExp2('#08090a',.022);
  this.camera=new THREE.PerspectiveCamera(43,innerWidth/innerHeight,.035,130);
  const context=canvas.getContext('webgl2',{antialias:true,powerPreference:'high-performance',alpha:false});
  if(!context)throw new Error('WebGL2 is unavailable');
  this.renderer=new THREE.WebGLRenderer({canvas,context,antialias:true,powerPreference:'high-performance',alpha:false});
  this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.05;
  this.renderer.shadowMap.enabled=!this.low;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  const env=new RoomEnvironment();const pmrem=new THREE.PMREMGenerator(this.renderer);this.environment=pmrem.fromScene(env,.05).texture;this.scene.environment=this.environment;this.scene.environmentIntensity=.8;env.dispose();pmrem.dispose();
  RectAreaLightUniformsLib.init();
  this.fill=new THREE.HemisphereLight(0xe6e9ef,0x08090a,.55);this.scene.add(this.fill);this.areaLights=[];
  this.key=new THREE.DirectionalLight(0xf9fbff,3.0);this.key.position.set(-3,4,3);this.key.castShadow=true;this.key.shadow.mapSize.set(1024,1024);Object.assign(this.key.shadow.camera,{left:-4,right:4,top:4,bottom:-4,near:.1,far:16});this.key.shadow.bias=-.0006;this.key.shadow.normalBias=.018;this.scene.add(this.key);
  for(const [position,intensity,width,height] of [[[-1,3,1.8],4,5,.4],[[0,2.2,-2.3],5,5,.3],[[2,2,1],2,3,.4]]){const area=new THREE.RectAreaLight(0xffffff,intensity,width,height);area.position.fromArray(position);area.lookAt(0,.4,0);this.scene.add(area);this.areaLights.push(area);}
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(90,90),new THREE.MeshStandardMaterial({color:0x08090a,metalness:.05,roughness:.7}));floor.rotation.x=-Math.PI/2;floor.position.y=-.021;floor.receiveShadow=true;this.scene.add(floor);this.floor=floor;
  this.road=this.makeRoad();this.scene.add(this.road);
  this.tunnel=this.makeTunnel();this.scene.add(this.tunnel);
  this.car=new THREE.Group();this.scene.add(this.car);this.glows=[];this.headlightBeams=[];this.makeHeadlights();
  this.resize();this.lastState=null;
 }
 makeRoad(){
  const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.fillStyle='#171a1b';x.fillRect(0,0,256,256);let seed=13;for(let i=0;i<7000;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const v=22+(seed%18);x.fillStyle=`rgb(${v},${v},${v})`;x.fillRect(seed%256,(seed>>>8)%256,1,3);}const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(3,18);t.colorSpace=THREE.SRGBColorSpace;
  const m=new THREE.MeshStandardMaterial({color:0x313535,map:t,roughness:.35,metalness:.45,transparent:true,opacity:0,depthWrite:false});const mesh=new THREE.Mesh(new THREE.PlaneGeometry(8,90),m);mesh.rotation.set(-Math.PI/2,0,Math.PI/2);mesh.position.y=-.016;mesh.receiveShadow=true;this.roadTexture=t;return mesh;
 }
 makeTunnel(){
  const g=new THREE.Group();this.tunnelMaterials=[];
  const concrete=new THREE.MeshStandardMaterial({color:0x1d2124,roughness:.7,metalness:.1,transparent:true});this.tunnelMaterials.push(concrete);
  const white=new THREE.MeshBasicMaterial({color:0xf1f3f0,transparent:true});this.tunnelMaterials.push(white);
  for(const side of [-1,1]){const wall=new THREE.Mesh(new THREE.BoxGeometry(48,4,.18),concrete);wall.position.set(12,1.98,side*3.6);g.add(wall);}
  const roof=new THREE.Mesh(new THREE.BoxGeometry(48,.15,7.4),concrete);roof.position.set(12,4.04,0);g.add(roof);
  for(let i=0;i<14;i++)for(const side of [-1,1]){const light=new THREE.Mesh(new THREE.BoxGeometry(2.0,.025,.045),white);light.position.set(-11+i*3.5,3.9,side*2.6);g.add(light);}
  g.visible=false;return g;
 }
 makeHeadlights(){
  const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');const grad=x.createRadialGradient(32,32,0,32,32,32);grad.addColorStop(0,'rgba(230,242,255,.65)');grad.addColorStop(.15,'rgba(205,230,255,.24)');grad.addColorStop(1,'rgba(205,230,255,0)');x.fillStyle=grad;x.fillRect(0,0,64,64);const map=new THREE.CanvasTexture(c);
  for(const side of [-1,1]){const mat=new THREE.SpriteMaterial({map,color:0xeef8ff,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});const sprite=new THREE.Sprite(mat);sprite.position.set(-1.94,.48,side*.49);sprite.scale.set(.7,.7,1);this.car.add(sprite);this.glows.push(sprite);const beam=new THREE.SpotLight(0xe4efff,0,12,.3,.65,1.4);beam.position.copy(sprite.position);beam.target.position.set(-7,.05,side*.6);this.car.add(beam,beam.target);this.headlightBeams.push(beam);}
 }
 async load(onProgress){
  const draco=new DRACOLoader();draco.setDecoderPath('../vendor/draco/');draco.setDecoderConfig({type:'wasm'});
  const loader=new GLTFLoader();loader.setDRACOLoader(draco);
  this.modelFile=this.low?'car-black-mobile.glb':'car-black.glb';
  const gltf=await loader.loadAsync('../assets/'+this.modelFile,e=>onProgress?.(e.total?e.loaded/e.total:null));
  this.model=gltf.scene;this.car.add(this.model);this.door=this.model.getObjectByName('DriverDoorPivot');this.wheels=['LF','RF','LR','RR'].map(k=>this.model.getObjectByName('Wheel_'+k));
  this.paint=[];this.lamps=[];this.model.traverse(o=>{if(!o.isMesh)return;o.castShadow=true;o.receiveShadow=true;for(const m of (Array.isArray(o.material)?o.material:[o.material])){if(['マテリアル.030','マテリアル.029','マテリアル.024','マテリアル.300'].includes(m.name)&&!this.paint.includes(m)){m.envMapIntensity=.8;this.paint.push(m);}if(/headlight|light_F|LED/i.test(o.name)&&m.emissive&&!this.lamps.includes(m))this.lamps.push(m);}});this.setColor('#15171b');this.loaded=true;this.canvas.dataset.modelReady='true';this.canvas.dataset.paintMaterials=String(this.paint.length);this.canvas.dataset.modelFile=this.modelFile;draco.dispose();if(this.lastState)this.render(this.lastState);
 }
 resize(){
  this.w=this.canvas.clientWidth||innerWidth;this.h=this.canvas.clientHeight||innerHeight;this.renderer.setPixelRatio(Math.min(devicePixelRatio||1,this.low?1.15:1.6));this.renderer.setSize(this.w,this.h,false);this.camera.aspect=this.w/this.h;this.camera.clearViewOffset();this.camera.updateProjectionMatrix();if(this.lastState)this.render(this.lastState);
 }
 render(s){
  this.lastState=s;if(!this.loaded)return;
  const aspect=this.w/this.h,close=false;
  const focus=new THREE.Vector3(...s.target),direction=new THREE.Vector3(...s.camera).sub(focus),baseDistance=direction.length();direction.normalize();
  const right=new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0),direction).normalize();
  const box=close?[[-1.69,-.03,.44],[-1.06,.58,.91]]:[[-2.08,-.03,-.86],[1.51,1.04,.88+Math.abs(s.doorAngle)*.75]];
  const desired=aspect<.9?.90:.53,tan=Math.tan(THREE.MathUtils.degToRad(this.camera.fov/2)),up=new THREE.Vector3().crossVectors(direction,right).normalize();let distance=0;
  for(const x of [box[0][0],box[1][0]])for(const y of [box[0][1],box[1][1]])for(const z of [box[0][2],box[1][2]]){const offset=new THREE.Vector3(x,y,z).sub(focus);distance=Math.max(distance,offset.dot(direction)+Math.abs(offset.dot(right))/(tan*aspect*desired),offset.dot(direction)+Math.abs(offset.dot(up))/(tan*.6));}
  const ease=v=>{const t=clamp(v);return t*t*(3-2*t);};const detailZoom=ease((s.p-.515)/.035)*(1-ease((s.p-.61)/.05));distance=THREE.MathUtils.lerp(distance,baseDistance,Math.max(s.cockpit,detailZoom));
  this.camera.position.copy(focus).addScaledVector(direction,distance);this.camera.lookAt(focus);this.camera.updateMatrixWorld();
  if(s.orbit){this.camera.position.copy(focus).addScaledVector(direction,distance*baseDistance/6.5);this.camera.lookAt(focus);this.camera.updateMatrixWorld();}this.camera.setViewOffset(this.w,this.h,aspect<.9?0:-this.w*.16,-this.h*(aspect<.9?.12:.055),this.w,this.h);this.camera.updateProjectionMatrix();this.door.rotation.y=s.doorAngle;for(const wheel of this.wheels)if(wheel)wheel.rotation.z=s.wheelAngle;
  const atmosphere=s.atmosphere||'night';
  const palettes={night:{bg:0x080b0f,floor:0x090d12,key:0xe0edff,fill:0xa6bedb,exposure:1.13,environment:.82,keyPower:2.6},studio:{bg:0xe9eaeb,floor:0xc6cacf,key:0xffffff,fill:0xecf3fa,exposure:1.22,environment:1.25,keyPower:4.1},sunset:{bg:0x15100e,floor:0x241a15,key:0xffbb78,fill:0xc5b0aa,exposure:1.10,environment:.86,keyPower:3.3}};
  const palette=palettes[atmosphere]||palettes.night;
  this.scene.background.setHex(palette.bg);this.scene.fog.color.setHex(palette.bg);this.floor.material.color.setHex(palette.floor);this.floor.material.roughness=atmosphere==='studio'?.38:.26;
  this.key.color.setHex(palette.key);this.key.intensity=.12+s.light*palette.keyPower;
  this.fill.color.setHex(palette.fill);this.fill.intensity=atmosphere==='studio'?1.0:.55;
  this.scene.environmentIntensity=.1+s.light*palette.environment;this.renderer.toneMappingExposure=palette.exposure;
  this.areaLights.forEach((light,i)=>{light.color.setHex(atmosphere==='sunset'&&i===1?0xffae6a:0xffffff);light.intensity=(atmosphere==='studio'?5.5:3.5)+i;});
  for(const glow of this.glows)glow.material.opacity=s.headlights===false?0:s.light*.5;for(const m of this.lamps)m.emissiveIntensity=s.headlights===false?0:1;for(const beam of this.headlightBeams)beam.intensity=s.headlights===false?0:s.light*2.8;
  this.tunnel.visible=s.tunnel>.005;this.tunnel.position.x=clamp((s.p-.66)/.20)*30;for(const m of this.tunnelMaterials)m.opacity=s.tunnel;
  this.road.material.opacity=s.tunnel*.86;this.roadTexture.offset.y=s.road*.5;
  this.canvas.dataset.doorAngle=s.doorAngle.toFixed(5);this.canvas.dataset.wheelAngle=s.wheelAngle.toFixed(5);
  this.renderer.render(this.scene,this.camera);
 }
 projectPoint(point){const v=new THREE.Vector3(...point).project(this.camera);return{x:(v.x+1)*.5*this.canvas.clientWidth,y:(1-v.y)*.5*this.canvas.clientHeight,visible:v.z<1&&v.z>-1&&Math.abs(v.x)<.94&&Math.abs(v.y)<.9};}
 setColor(hex){for(const m of this.paint)m.color.set(hex);}
 exportImage(){this.exporting=true;this.render(this.lastState);const url=this.canvas.toDataURL('image/png');this.exporting=false;return url;}
 dispose(){this.renderer.dispose();this.environment.dispose();}
}
