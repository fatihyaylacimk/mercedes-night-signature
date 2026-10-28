import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs/promises';

const root = process.cwd();
const args = process.argv.slice(2);
const option = (name, fallback) => { const i=args.indexOf(name);return i<0?fallback:args[i+1]; };
const port = Number(option('--port', '4173'));
const host = option('--host', '0.0.0.0');
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.glb':'model/gltf-binary','.json':'application/json','.wasm':'application/wasm','.mp3':'audio/mpeg','.md':'text/plain; charset=utf-8'};

const server = http.createServer(async(req,res) => {
  try {
    if (!['GET','HEAD'].includes(req.method)) {res.writeHead(405);res.end();return;}
    const url=new URL(req.url,'http://preview.local');
    if(url.pathname==='/'){res.writeHead(302,{Location:'/signature/'});res.end();return;}
    // Local-only responsive inspection frames; these routes are not shipped to Pages.
    if(url.pathname==='/__preview/phone'||url.pathname==='/__preview/small-phone'){
      const small=url.pathname.endsWith('small-phone');
      res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});
      res.end(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Signature mobile preview</title><style>html,body{margin:0;background:#17191c;color:#ddd;font:12px Arial}main{padding:20px;display:grid;place-items:center}iframe{width:${small?360:390}px;height:${small?740:844}px;border:1px solid #46505b}p{margin:0 0 12px;letter-spacing:1px}</style></head><body><main><p>${small?'360 × 740':'390 × 844'} · RESPONSIVE PREVIEW</p><iframe title="Signature phone preview" src="/signature/"></iframe></main></body></html>`);return;
    }
    const decoded=decodeURIComponent(url.pathname);
    if(decoded.split('/').some(p=>p.startsWith('.')||p==='node_modules')){res.writeHead(404);res.end();return;}
    let file=path.resolve(root,'.'+decoded);
    if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
    let stat=await fs.stat(file);
    if(stat.isDirectory()){file=path.join(file,'index.html');stat=await fs.stat(file);}
    const data=await fs.readFile(file);
    res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store','Content-Length':data.length,'X-Content-Type-Options':'nosniff'});
    res.end(req.method==='HEAD'?undefined:data);
  } catch(error){res.writeHead(error.code==='ENOENT'?404:400);res.end('Not found');}
});
server.on('error',error=>{console.error(error.message);process.exitCode=1;});
server.listen(port,host,()=>console.log(`Signature preview ready on port ${port}`));
