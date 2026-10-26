import {readFile,writeFile,mkdir} from 'node:fs/promises';
const html=await readFile(new URL('../studio/performance.html',import.meta.url),'utf8');
await mkdir(new URL('../test/',import.meta.url),{recursive:true});
await writeFile(new URL('../test/index.html',import.meta.url),html.replace('<head>','<head>\n <base href="../studio/">'));
