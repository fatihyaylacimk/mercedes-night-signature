import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {DRACOLoader} from 'three/addons/loaders/DRACOLoader.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {RectAreaLightUniformsLib} from 'three/addons/lights/RectAreaLightUniformsLib.js';
import {Reflector} from 'three/addons/objects/Reflector.js';
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
export class CarRenderer{
 constructor(canvas){
  this.canvas=canvas;this.scene=new THREE.Scene();this.scene.background=new THREE.Color('#08090a');this.scene.fog=new THREE.FogExp2('#08090a',.022);
  this.camera=new THREE.PerspectiveCamera(43,innerWidth/innerHeight,.035,130);
  const context=canvas.getContext('webgl2',{antialias:true,powerPreference:'high-performance',alpha:false});
  if(!context)throw new Error('WebGL2 is unavailable');
  this.renderer=new THREE.WebGLRenderer({canvas,context,antialias:true,powerPreference:'high-performance',alpha:false});
  this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.55;
  this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  const env=new RoomEnvironment();const pmrem=new THREE.PMREMGenerator(this.renderer);this.environment=pmrem.fromScene(env,.05).texture;this.scene.environment=this.environment;this.scene.environmentIntensity=1.4;env.dispose();pmrem.dispose();
  RectAreaLightUniformsLib.init();
  this.scene.add(new THREE.HemisphereLight(0xd5deef,0x303024,1.1));
  this.key=new THREE.DirectionalLight(0xf9fbff,3.0);this.key.position.set(-3,4,3);this.key.castShadow=true;this.key.shadow.mapSize.set(1024,1024);Object.assign(this.key.shadow.camera,{left:-4,right:4,top:4,bottom:-4,near:.1,far:16});this.key.shadow.bias=-.0006;this.key.shadow.normalBias=.018;this.scene.add(this.key);
  for(const [position,intensity,width,height] of [[[-1,3,1.8],8,5,.4],[[0,2.2,-2.3],9,5,.3],[[2,2,1],5,3,.4]]){const area=new THREE.RectAreaLight(0xffffff,intensity,width,height);area.position.fromArray(position);area.lookAt(0,.4,0);this.scene.add(area);}
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(90,90),new THREE.MeshStandardMaterial({color:0x101213,metalness:.55,roughness:.22,transparent:true,opacity:.80}));floor.rotation.x=-Math.PI/2;floor.position.y=-.021;floor.receiveShadow=true;this.scene.add(floor);
  this.reflection=new Reflector(new THREE.PlaneGeometry(80,80),{textureWidth:innerWidth<650?256:512,textureHeight:innerWidth<650?256:512,color:0x5c6265,clipBias:.003});this.reflection.rotation.x=-Math.PI/2;this.reflection.position.y=-.025;this.scene.add(this.reflection);
  this.road=this.makeRoad();this.scene.add(this.road);
  this.tunnel=this.makeTunnel();this.scene.add(this.tunnel);
  this.car=new THREE.Group();this.scene.add(this.car);this.glows=[];this.makeHeadlights();
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
  for(const side of [-1,1]){const mat=new THREE.SpriteMaterial({map,color:0xeef8ff,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});const sprite=new THREE.Sprite(mat);sprite.position.set(-1.94,.48,side*.49);sprite.scale.set(.7,.7,1);this.car.add(sprite);this.glows.push(sprite);}
 }
 async load(onProgress){
  const draco=new DRACOLoader();draco.setDecoderPath('vendor/draco/');draco.setDecoderConfig({type:'wasm'});
  const loader=new GLTFLoader();loader.setDRACOLoader(draco);
  const gltf=await loader.loadAsync('assets/car-rig.glb',e=>onProgress?.(e.total?e.loaded/e.total:null));
  this.model=gltf.scene;this.car.add(this.model);this.door=this.model.getObjectByName('DriverDoorPivot');this.wheels=['LF','RF','LR','RR'].map(k=>this.model.getObjectByName('Wheel_'+k));
  this.model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;if(o.name.startsWith('Body_')&&o.material){o.material.envMapIntensity=1.4;}}});
  this.loaded=true;this.canvas.dataset.modelReady='true';draco.dispose();if(this.lastState)this.render(this.lastState);
 }
 resize(){
  this.w=innerWidth;this.h=innerHeight;this.renderer.setPixelRatio(Math.min(devicePixelRatio||1,innerWidth<650?1.35:1.6));this.renderer.setSize(this.w,this.h,false);this.camera.aspect=this.w/this.h;this.camera.setViewOffset(this.w,this.h,0,-this.h*.14,this.w,this.h);this.camera.updateProjectionMatrix();if(this.lastState)this.render(this.lastState);
 }
 render(s){
  this.lastState=s;if(!this.loaded)return;
  const aspect=this.w/this.h,close=s.index===3;
  const focus=new THREE.Vector3(...s.target),direction=new THREE.Vector3(...s.camera).sub(focus),baseDistance=direction.length();direction.normalize();
  const right=new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0),direction).normalize();
  const box=close?[[-1.69,-.03,.44],[-1.06,.58,.91]]:[[-2.08,-.03,-.86],[1.51,1.04,.88+Math.abs(s.doorAngle)*.75]];
  const desired=aspect<.9?.9:.64,tan=Math.tan(THREE.MathUtils.degToRad(this.camera.fov/2));let distance=0;
  for(const x of [box[0][0],box[1][0]])for(const y of [box[0][1],box[1][1]])for(const z of [box[0][2],box[1][2]]){const offset=new THREE.Vector3(x,y,z).sub(focus);distance=Math.max(distance,offset.dot(direction)+Math.abs(offset.dot(right))/(tan*aspect*desired));}
  distance=THREE.MathUtils.lerp(distance,baseDistance,s.cockpit);
  this.camera.position.copy(focus).addScaledVector(direction,distance);this.camera.lookAt(focus);this.camera.updateMatrixWorld();
  this.door.rotation.y=s.doorAngle;for(const wheel of this.wheels)if(wheel)wheel.rotation.z=s.wheelAngle;
  this.key.intensity=.12+s.light*3;this.scene.environmentIntensity=.15+s.light*1.25;
  for(const glow of this.glows)glow.material.opacity=s.light*.28;
  this.tunnel.visible=s.tunnel>.005;this.tunnel.position.x=clamp((s.p-.66)/.20)*30;for(const m of this.tunnelMaterials)m.opacity=s.tunnel;
  this.road.material.opacity=s.tunnel*.86;this.roadTexture.offset.y=s.road*.5;
  this.canvas.dataset.doorAngle=s.doorAngle.toFixed(5);this.canvas.dataset.wheelAngle=s.wheelAngle.toFixed(5);
  this.renderer.render(this.scene,this.camera);
 }
 dispose(){this.renderer.dispose();this.environment.dispose();}
}
