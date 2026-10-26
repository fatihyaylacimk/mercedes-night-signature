import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
import {Vector3,Matrix4,Quaternion,Euler} from 'three';
import {sample,chapterPosition} from '../timeline.js';
import {SCENES} from '../scenes.js';
let checks=0;const ok=(value,message)=>{assert(value,message);checks++;};
ok(SCENES.length===6,'six scenes');
for(let i=0;i<6;i++){ok(sample(chapterPosition(i)).index===i,'chapter lands in correct scene '+i);ok(i===0||SCENES[i-1].range[1]===SCENES[i].range[0],'contiguous chapter ranges');await fs.access(''+SCENES[i].file);}
for(let i=0;i<=100;i++){const s=sample(i/100);ok([...s.camera,...s.target,s.doorAngle,s.wheelAngle].every(Number.isFinite),'finite camera and rig pose');ok(s.doorAngle<=0&&s.doorAngle>=-Math.PI*.37,'door limit');}
ok(sample(.4).doorAngle<-.7,'door actually opens during cabin chapter');ok(sample(.6).doorAngle===0,'door is closed during driving');ok(sample(1).wheelAngle===sample(.9).wheelAngle,'wheels settle at end');
const binary=await fs.readFile((process.argv[2]||'assets/car-rig.glb'));ok(binary.toString('utf8',0,4)==='glTF','valid GLB container');ok(binary.length<5*1024*1024,'model below 5MiB');
const jsonLength=binary.readUInt32LE(12);const header=JSON.parse(binary.toString('utf8',20,20+jsonLength));ok(header.extensionsRequired.includes('KHR_draco_mesh_compression'),'Draco declared');ok(header.extensionsRequired.includes('EXT_texture_webp'),'WebP extension declared');
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'draco3d.decoder':await draco3d.createDecoderModule()});
const doc=await io.read((process.argv[2]||'assets/car-rig.glb')),root=doc.getRoot();
const get=n=>root.listNodes().find(x=>x.getName()===n);const door=get('DriverDoorPivot'),staticNode=get('BodyStatic');ok(door&&staticNode,'rig roots present');
ok(door.listChildren().length>=8,'door carries panel, glass and mirror');
const wheels=['LF','RF','LR','RR'].map(k=>get('Wheel_'+k));ok(wheels.every(Boolean),'four independent wheel groups');
const calipers=root.listNodes().filter(n=>n.getName().startsWith('caliper_'));ok(calipers.length>=2,'calipers present');ok(calipers.every(n=>n.getParentNode()===staticNode),'calipers never parented to spinning wheels');
const point=n=>new Vector3().fromBufferAttribute({getX:()=>n.getMesh().listPrimitives()[0].getAttribute('POSITION').getArray()[0],getY:()=>n.getMesh().listPrimitives()[0].getAttribute('POSITION').getArray()[1],getZ:()=>n.getMesh().listPrimitives()[0].getAttribute('POSITION').getArray()[2]},0).applyMatrix4(new Matrix4().fromArray(n.getWorldMatrix())).toArray();
const moving=door.listChildren().find(n=>n.getName().startsWith('Body_door')),wheelMesh=wheels[0].listChildren()[0],fixed=calipers[0];
const baseline={door:point(moving),wheel:point(wheelMesh),caliper:point(fixed),hinge:door.getTranslation().slice()};
function apply(p){const s=sample(p);door.setRotation(new Quaternion().setFromEuler(new Euler(0,s.doorAngle,0)).toArray());for(const w of wheels)w.setRotation(new Quaternion().setFromEuler(new Euler(0,0,s.wheelAngle)).toArray());}
apply(.415);ok(new Vector3(...point(moving)).distanceTo(new Vector3(...baseline.door))>.1,'door geometry moves with hinge');ok(JSON.stringify(door.getTranslation())===JSON.stringify(baseline.hinge),'hinge position remains fixed');ok(JSON.stringify(point(fixed))===JSON.stringify(baseline.caliper),'caliper fixed during door motion');
apply(.61);ok(new Vector3(...point(wheelMesh)).distanceTo(new Vector3(...baseline.wheel))>.01,'rim geometry rotates');ok(JSON.stringify(point(fixed))===JSON.stringify(baseline.caliper),'caliper fixed while wheel rotates');
apply(0);for(const [name,node]of [['door',moving],['wheel',wheelMesh],['caliper',fixed]])ok(new Vector3(...point(node)).distanceTo(new Vector3(...baseline[name]))<1e-7,'reversible rig pose '+name);
const audio=JSON.parse(await fs.readFile('assets/audio/manifest.json','utf8'));ok(audio.length===12,'twelve narration clips');
for(const clip of audio){const scene=SCENES.find(s=>s.id===clip.scene);ok(clip.transcript===scene.voice[clip.language],'narration matches language and scene');ok((await fs.stat(''+clip.file)).size>1000,'audio bytes exist');ok(clip.seconds>0,'audio has valid duration');}
const html=await fs.readFile('index.html','utf8');ok(!/script[^>]+src=["']https?:/.test(html),'no external runtime scripts');ok(!html.includes('chatgpt.site'),'no ChatGPT hostname in page');
console.log(`PASS ${checks} checks: 6-scene navigation, 3D asset decode, fixed hinge, independent wheels/calipers, reverse pose, 12 TR/EN clips.`);
