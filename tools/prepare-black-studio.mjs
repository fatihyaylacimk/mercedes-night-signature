// Create corrected Studio assets while preserving the earlier source GLBs.
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS,KHRDracoMeshCompression} from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
const decoder=await draco3d.createDecoderModule(),encoder=await draco3d.createEncoderModule();
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
 'draco3d.decoder':decoder,'draco3d.encoder':encoder
});
export const PAINT_NAMES=['マテリアル.029','マテリアル.030','マテリアル.024','マテリアル.300'];
const results=[];
for(const [source,output] of [['assets/car-rig.glb','assets/car-black.glb'],['assets/car-mobile.glb','assets/car-black-mobile.glb']]){
 const sourceBytes=await fs.readFile(source),doc=await io.readBinary(sourceBytes);
 const paint=[],repaired=[];
 for(const material of doc.getRoot().listMaterials()){
  const coat=material.getExtension('KHR_materials_clearcoat');
  if(coat&&(coat.getClearcoatFactor()>1||coat.getClearcoatFactor()<0)){
   repaired.push({material:material.getName(),previous:coat.getClearcoatFactor()});
   coat.setClearcoatFactor(.5).setClearcoatRoughnessFactor(.18);
  }
  if(PAINT_NAMES.includes(material.getName())){
   material.setBaseColorFactor([.007,.008,.011,1]).setBaseColorTexture(null)
    .setMetallicFactor(.75).setRoughnessFactor(.26);
   if(coat)coat.setClearcoatFactor(.55).setClearcoatRoughnessFactor(.18);
   paint.push(material.getName());
  }
 }
 if(paint.length!==4)throw new Error('Expected all four actual body paint materials in '+source);
 doc.createExtension(KHRDracoMeshCompression).setRequired(true).setEncoderOptions({
  method:KHRDracoMeshCompression.EncoderMethod.EDGEBREAKER,encodeSpeed:5,decodeSpeed:5
 });
 await io.write(output,doc);
 if(!sourceBytes.equals(await fs.readFile(source)))throw new Error('Source changed during preparation');
 results.push({source,output,sourceSha256:createHash('sha256').update(sourceBytes).digest('hex'),
  bytes:(await fs.stat(output)).size,paintMaterials:paint,repairedClearcoat:repaired});
}
await fs.writeFile('assets/black-studio-model.json',JSON.stringify({
 vehicle:'Mercedes-AMG GT S 2016',
 sourceModel:'assets/model-provenance.json',
 note:'Material correction of existing model; no C192, detailed cockpit or trunk added.',
 variants:results
},null,2)+'\n');
console.log(JSON.stringify(results.map(r=>({output:r.output,bytes:r.bytes,paint:r.paintMaterials.length,repaired:r.repairedClearcoat.length}))));
