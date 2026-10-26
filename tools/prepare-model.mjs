import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS, KHRDracoMeshCompression, EXTTextureWebP} from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
import {Matrix4, Matrix3, Vector3} from 'three';
import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
const requireRuntime=createRequire(`${process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES}/../_runtime.cjs`);
const sharp=requireRuntime('sharp');
const decoder=await draco3d.createDecoderModule();
const encoder=await draco3d.createEncoderModule();
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'draco3d.decoder':decoder,'draco3d.encoder':encoder});
const input=process.argv[2]||'source-assets/AMG.gltf';
const doc=await io.read(input),root=doc.getRoot(),buffer=root.listBuffers()[0],scene=root.listScenes()[0];
const audit={source:'https://github.com/GabrielPedroza/Mercedes-AMG-GT-S-2016',source_commit:'c7fef03252288ba6b858da2078e6e69a364930a1',license_declaration:'Source repository README: MIT',changes:['black paint','separate driver door hinge','separate wheel pivots; fixed brake calipers','resized WebP textures','Draco recompression'],door_parts:[],wheel_parts:[],triangles:0};
const doorOrigin=[-.6204,.45,.70];
const door=doc.createNode('DriverDoorPivot').setTranslation(doorOrigin);scene.addChild(door);
const wheelCenters={LF:[-1.3755,.25347,.71],RF:[-1.3755,.25347,-.71],LR:[.688,.26435,.71],RR:[.688,.26435,-.71]};
const wheels=Object.fromEntries(Object.entries(wheelCenters).map(([k,v])=>{const node=doc.createNode('Wheel_'+k).setTranslation(v);scene.addChild(node);return[k,node];}));
const staticRoot=doc.createNode('BodyStatic');scene.addChild(staticRoot);
const v=new Vector3();
function bounds(a,indices){const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];for(const i of indices){for(let c=0;c<3;c++){const x=a[i*3+c];min[c]=Math.min(min[c],x);max[c]=Math.max(max[c],x);}}return{min,max};}
function components(pos,idx){
 const count=pos.length/3,parent=new Int32Array(count),seen=new Map();for(let i=0;i<count;i++)parent[i]=i;
 function find(a){while(parent[a]!==a){parent[a]=parent[parent[a]];a=parent[a];}return a;}
 function join(a,b){a=find(a);b=find(b);if(a!==b)parent[b]=a;}
 for(let i=0;i<count;i++){const key=[0,1,2].map(c=>Math.round(pos[i*3+c]*100000)).join(',');if(seen.has(key))join(i,seen.get(key));else seen.set(key,i);}
 for(let i=0;i<idx.length;i+=3){join(idx[i],idx[i+1]);join(idx[i],idx[i+2]);}
 const groups=new Map();for(let i=0;i<idx.length;i+=3){const key=find(idx[i]);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(idx[i],idx[i+1],idx[i+2]);}
 return [...groups.values()].map(indices=>({...bounds(pos,indices),indices}));
}
function subset(prim,indices,origin,name){
 const ids=[...new Set(indices)],map=new Map(ids.map((id,i)=>[id,i]));
 const out=doc.createPrimitive().setMaterial(prim.getMaterial()).setMode(prim.getMode());
 for(const semantic of prim.listSemantics()){
  const src=prim.getAttribute(semantic),input=src.getArray(),size=src.getElementSize(),array=new input.constructor(ids.length*size);
  for(let i=0;i<ids.length;i++)for(let c=0;c<size;c++)array[i*size+c]=input[ids[i]*size+c]-(semantic==='POSITION'?origin[c]:0);
  const attr=doc.createAccessor(name+'_'+semantic).setType(src.getType()).setNormalized(src.getNormalized()).setArray(array).setBuffer(buffer);out.setAttribute(semantic,attr);
 }
 out.setIndices(doc.createAccessor(name+'_indices').setType('SCALAR').setArray(new Uint32Array(indices.map(i=>map.get(i)))).setBuffer(buffer));
 audit.triangles+=indices.length/3;return out;
}
let partNumber=0;
function addPart(prim,indices,parent,origin,sourceName){
 if(!indices.length)return;
 const name=sourceName+'_'+partNumber++;
 const node=doc.createNode(name).setMesh(doc.createMesh(name).addPrimitive(subset(prim,indices,origin,name)));parent.addChild(node);
 if(parent===door)audit.door_parts.push(name);
 if(parent!==staticRoot&&parent!==door)audit.wheel_parts.push(name);
}
const originals=root.listNodes().filter(n=>n.getMesh());
const oldPrimitives=originals.flatMap(n=>n.getMesh().listPrimitives());
for(const node of originals){
 const name=node.getName(),matrix=new Matrix4().fromArray(node.getWorldMatrix()),normal=new Matrix3().getNormalMatrix(matrix);
 for(const prim of node.getMesh().listPrimitives()){
  for(const semantic of ['POSITION','NORMAL','TANGENT']){
   const src=prim.getAttribute(semantic);if(!src)continue;const a=src.getArray(),size=src.getElementSize(),out=new Float32Array(a.length);
   for(let i=0;i<a.length;i+=size){v.set(a[i],a[i+1],a[i+2]);if(semantic==='POSITION')v.applyMatrix4(matrix);else v.applyMatrix3(normal).normalize();out[i]=v.x;out[i+1]=v.y;out[i+2]=v.z;if(size===4)out[i+3]=a[i+3];}
   prim.setAttribute(semantic,doc.createAccessor().setType(src.getType()).setArray(out).setBuffer(buffer));
  }
  const pos=prim.getAttribute('POSITION').getArray(),idx=Array.from(prim.getIndices()?.getArray()??Array.from({length:pos.length/3},(_,i)=>i));
  const explicitWheel=/^(wheel|tyre)_(LF|RF|LR|RR)$/.exec(name)||/^tyre(LF|RF|LR|RR)$/.exec(name);
  if(explicitWheel){const key=explicitWheel.at(-1);addPart(prim,idx,wheels[key],wheelCenters[key],name);continue;}
  if(/^(brake|wheel_cap)_[FR]$/.test(name)){
   const front=name.endsWith('_F'),sides={L:[],R:[]};
   for(let i=0;i<idx.length;i+=3){const z=(pos[idx[i]*3+2]+pos[idx[i+1]*3+2]+pos[idx[i+2]*3+2])/3;sides[z>0?'L':'R'].push(...idx.slice(i,i+3));}
   for(const side of ['L','R']){const key=side+(front?'F':'R');addPart(prim,sides[side],wheels[key],wheelCenters[key],name+side);}
   continue;
  }
  if(/^(Body|window_F|mirror_clear|mirror_LED)$/.test(name)){
   const keep=[];
   for(const c of components(pos,idx)){
    const [x,y,z]=c.min,[X,Y,Z]=c.max;
    const panel=name==='Body'&&z>.60&&x>-.63&&X<.38&&y>.19&&Y<.72;
    const handle=name==='Body'&&z>.69&&x>.04&&X<.20&&y>.60&&Y<.66;
    const mirror=/^(Body|mirror_clear|mirror_LED)$/.test(name)&&z>.65&&x>-.40&&X<-.16&&y>.65&&Y<.83;
    const glass=name==='window_F'&&z>.36&&x>-.48&&X<.40&&y>.67;
    if(panel||handle||mirror||glass){prim.getMaterial()?.setDoubleSided(true);addPart(prim,c.indices,door,doorOrigin,name+'_door');}
    else keep.push(...c.indices);
   }
   addPart(prim,keep,staticRoot,[0,0,0],name);continue;
  }
  addPart(prim,idx,staticRoot,[0,0,0],name);
 }
 node.dispose();
}
for(const mat of root.listMaterials()){
 const name=mat.getName();
 if(['マテリアル.030','マテリアル.029','マテリアル.024'].includes(name))mat.setBaseColorFactor([.018,.020,.024,1]).setBaseColorTexture(null).setMetallicFactor(.82).setRoughnessFactor(.22);
}
for(const texture of root.listTextures()){
 const data=texture.getImage();if(!data)continue;
 const converted=await sharp(data).resize({width:768,height:768,fit:'inside',withoutEnlargement:true}).webp({quality:88,effort:5}).toBuffer();
 texture.setImage(new Uint8Array(converted)).setMimeType('image/webp').setURI('');
}
doc.createExtension(EXTTextureWebP).setRequired(true);
// Dispose source primitives too: unreferenced meshes alone do not release their accessor parents.
for(const primitive of oldPrimitives)primitive.dispose();
// Remove orphaned source geometry and accessors left by the geometry extraction.
for(const mesh of root.listMeshes())if(!mesh.listParents().some(p=>p.propertyType==='Node'))mesh.dispose();
for(const accessor of root.listAccessors())if(!accessor.listParents().some(p=>p.propertyType!=='Root'))accessor.dispose();
doc.createExtension(KHRDracoMeshCompression).setRequired(true).setEncoderOptions({method:KHRDracoMeshCompression.EncoderMethod.EDGEBREAKER,encodeSpeed:5,decodeSpeed:5});
audit.door_hinge=doorOrigin;audit.wheel_centers=wheelCenters;audit.output_nodes=root.listNodes().length;
if(audit.door_parts.length<3||audit.wheel_parts.length<12)throw Error('Insufficient independent rig parts');
await io.write('assets/car-rig.glb',doc);
audit.bytes=(await fs.stat('assets/car-rig.glb')).size;
await fs.writeFile('assets/model-provenance.json',JSON.stringify(audit,null,2)+'\n');
await fs.mkdir('vendor/draco',{recursive:true});
for(const file of ['draco_wasm_wrapper.js','draco_decoder.wasm'])await fs.copyFile('node_modules/three/examples/jsm/libs/draco/gltf/'+file,'vendor/draco/'+file);
await fs.copyFile('node_modules/three/LICENSE','vendor/THREE-LICENSE.txt');
console.log(JSON.stringify(audit,null,2));
