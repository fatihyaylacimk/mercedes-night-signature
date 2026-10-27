// Structural inventory only. Mesh names cannot establish visual quality,
// vehicle identity, collision-free camera paths, or permission to publish.
import fs from 'node:fs/promises';
import path from 'node:path';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';

const inputs=process.argv.slice(2);
if(!inputs.length)throw new Error('Usage: node tools/audit-vehicle.mjs vehicle.glb [vehicle-mobile.glb]');
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
 'draco3d.decoder':await draco3d.createDecoderModule()
});
const reports=[];
for(const input of inputs){
 const doc=await io.read(input),root=doc.getRoot();
 const names=root.listNodes().map(n=>n.getName());
 const stats=new Map(root.listMaterials().map(m=>[m,{material:m.getName(),triangles:0,meshNames:[]}]));
 let triangles=0;
 for(const mesh of root.listMeshes())for(const p of mesh.listPrimitives()){
  if(p.getMode()!==4)continue;
  const count=(p.getIndices()?.getCount()??p.getAttribute('POSITION')?.getCount()??0)/3;
  triangles+=count;
  const s=stats.get(p.getMaterial());
  if(s){s.triangles+=count;s.meshNames.push(mesh.getName());}
 }
 const paintCandidates=[],invalidClearcoat=[];
 for(const m of root.listMaterials()){
  const statsForMaterial=stats.get(m),c=m.getExtension('KHR_materials_clearcoat');
  if(c&&(c.getClearcoatFactor()<0||c.getClearcoatFactor()>1)){
   invalidClearcoat.push({material:m.getName(),value:c.getClearcoatFactor(),allowed:[0,1]});
  }
  if(statsForMaterial.meshNames.some(n=>/^Body(?:_|$)/.test(n))){
   paintCandidates.push({...statsForMaterial,baseColor:m.getBaseColorFactor(),
    metallic:m.getMetallicFactor(),roughness:m.getRoughnessFactor(),
    clearcoat:c?.getClearcoatFactor()??0,
    textured:Boolean(m.getBaseColorTexture())});
  }
 }
 const hints={
  door:names.filter(n=>/door|kap[iı]/i.test(n)),
  trunk:names.filter(n=>/trunk|hatch|boot|tailgate|bagaj/i.test(n)),
  interior:names.filter(n=>/cockpit|dashboard|steer|seat|interior|console/i.test(n))
 };
 reports.push({file:input,bytes:(await fs.stat(input)).size,triangles,
  nodes:root.listNodes().length,meshes:root.listMeshes().length,
  materials:root.listMaterials().length,animations:root.listAnimations().map(a=>a.getName()),
  namedPartHints:hints,paintCandidates,invalidClearcoat,
  review:{status:'manual-review-required',
   message:'Names and counts are inventory, not approval. Inspect actual exterior, cockpit, door lining and trunk geometry.',
   vehicleIdentityVerified:false,interiorQualityVerified:false,trunkInteriorVerified:false,
   cameraClearanceVerified:false,phoneRenderingVerified:false,publicationPermissionVerified:false}
 });
}
const target=path.resolve('vehicle-next/current-model-inventory.json');
await fs.mkdir(path.dirname(target),{recursive:true});
await fs.writeFile(target,JSON.stringify(reports,null,2)+'\n');
for(const r of reports)console.log(JSON.stringify({file:r.file,triangles:r.triangles,
 doorHints:r.namedPartHints.door.length,trunkHints:r.namedPartHints.trunk.length,
 interiorHints:r.namedPartHints.interior.length,invalidClearcoat:r.invalidClearcoat.length,
 status:r.review.status}));
console.log('Inventory written to '+target);
