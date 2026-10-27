import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
 'draco3d.decoder':await draco3d.createDecoderModule()
});
const manifest=JSON.parse(await fs.readFile('assets/black-studio-model.json','utf8'));
for(const variant of manifest.variants){
 const original=await fs.readFile(variant.source);
 assert.equal(createHash('sha256').update(original).digest('hex'),variant.sourceSha256,'previous model bytes preserved');
 const doc=await io.read(variant.output),root=doc.getRoot();
 const materials=root.listMaterials();
 const paint=['マテリアル.029','マテリアル.030','マテリアル.024','マテリアル.300'].map(name=>materials.find(m=>m.getName()===name));
 assert(paint.every(Boolean),'all four body materials exist, including the formerly gold material');
 for(const m of paint){
  const c=m.getBaseColorFactor();
  assert(Math.max(...c.slice(0,3))<.012,'black paint has no gold/white base colour');
  assert.equal(m.getBaseColorTexture(),null,'texture does not restore source paint');
 }
 for(const m of materials){const c=m.getExtension('KHR_materials_clearcoat');if(c)assert(c.getClearcoatFactor()>=0&&c.getClearcoatFactor()<=1,'valid coating intensity');}
 assert(root.listNodes().some(n=>n.getName()==='DriverDoorPivot'));
 assert(root.listNodes().some(n=>n.getName()==='BodyStatic'));
 for(const id of ['LF','RF','LR','RR'])assert(root.listNodes().some(n=>n.getName()==='Wheel_'+id));
 console.log('PASS '+variant.output+': full body paint, valid clearcoat, rig retained, earlier asset unchanged.');
}
const renderer=await fs.readFile('studio/renderer-source.js','utf8');
assert(renderer.includes("'マテリアル.300'"),'live renderer recolours formerly gold paint');
assert(renderer.includes('car-black-mobile.glb')&&renderer.includes('car-black.glb'),'live renderer loads repaired assets');
const html=await fs.readFile('studio/index.html','utf8');
assert(html.includes('<details id="controls">'),'controls are a native disclosure');
assert(!html.includes('<details id="controls" open'),'controls start collapsed');
assert(html.includes('../studio-v2/'),'previous Studio remains reachable');
console.log('Visual lighting and physical phone results require separate observation.');
