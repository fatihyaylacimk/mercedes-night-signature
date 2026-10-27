// Check the production camera math without claiming a GPU or phone render.
import assert from 'node:assert/strict';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
import * as THREE from 'three';
import {CarRenderer} from '../studio/renderer-source.js';
import {sample} from '../studio/timeline.js';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
 'draco3d.decoder':await draco3d.createDecoderModule()
});
const doc=await io.read('assets/car-black-mobile.glb');
const door=doc.getRoot().listNodes().find(n=>n.getName()==='DriverDoorPivot');
function corners(angle){
 door.setRotation(new THREE.Quaternion().setFromEuler(new THREE.Euler(0,angle,0)).toArray());
 const out=[];
 for(const n of doc.getRoot().listNodes())for(const p of n.getMesh()?.listPrimitives()??[]){
  const pos=p.getAttribute('POSITION'),min=pos.getMin([]),max=pos.getMax([]),m=new THREE.Matrix4().fromArray(n.getWorldMatrix());
  for(const x of [min[0],max[0]])for(const y of [min[1],max[1]])for(const z of [min[2],max[2]])out.push(new THREE.Vector3(x,y,z).applyMatrix4(m));
 }
 return out;
}
let checks=0;
for(const [w,h] of [[360,606],[393,746],[1363,929],[844,390]]){
 const fixture={w,h,loaded:true,camera:new THREE.PerspectiveCamera(43,w/h,.035,130),
  canvas:{dataset:{}},renderer:{render(){}},door:{rotation:{}},wheels:[],key:{},scene:{},
  glows:[],lamps:[],headlightBeams:[],tunnel:{position:{}},tunnelMaterials:[],
  road:{material:{}},roadTexture:{offset:{}}};
 const shots=[.14,.23,.3,.36,.4,.415,.7,.81,.9,1].map(sample);
 for(let i=0;i<12;i++){
  const yaw=i/12*Math.PI*2,pitch=.2;
  shots.push({...sample(.14),orbit:true,camera:[-.22+6.5*Math.cos(yaw)*Math.cos(pitch),.5+6.5*Math.sin(pitch),6.5*Math.sin(yaw)*Math.cos(pitch)],target:[-.22,.5,0],cockpit:0,doorAngle:i%2?-.8:0});
 }
 for(const state of shots){
  CarRenderer.prototype.render.call(fixture,state);
  assert(fixture.camera.position.toArray().every(Number.isFinite));
  for(const point of corners(state.doorAngle)){
   const projected=point.clone().project(fixture.camera);
   assert(projected.z>=-1&&projected.z<=1,'car outside depth range');
   assert(Math.abs(projected.x)<=1.01,`horizontal clipping ${w}x${h}, p=${state.p}, orbit=${!!state.orbit}: ${projected.x}`);
   assert(Math.abs(projected.y)<=.82,`vertical clearance ${w}x${h}, p=${state.p}: ${projected.y}`);
  }
  checks++;
 }
}
console.log(`PASS ${checks} production camera poses against decoded model bounds. GPU rendering not exercised.`);
