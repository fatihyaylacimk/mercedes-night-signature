import {build} from 'esbuild';
await build({entryPoints:['webgl-source.js'],bundle:true,format:'esm',target:['es2020'],minify:true,outfile:'webgl.js',legalComments:'eof'});
console.log('3D renderer bundled with pinned Three.js; no runtime CDN dependency.');

await build({entryPoints:['studio/renderer-source.js'],bundle:true,format:'esm',target:['es2020'],minify:true,outfile:'studio/renderer.js',legalComments:'eof'});
