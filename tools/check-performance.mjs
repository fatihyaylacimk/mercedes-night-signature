import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {summarizeFrames,invalidatesViewport} from '../studio/performance-metrics.js';
let checks=0;function ok(value){assert(value);checks++;}
const sixty=summarizeFrames(Array(600).fill(1000/60));ok(Math.abs(sixty.average_fps-60)<1e-8);ok(sixty.frames_over_50ms===0);
const thirty=summarizeFrames(Array(300).fill(1000/30));ok(Math.abs(thirty.average_fps-30)<1e-8);
const stalled=summarizeFrames([10,10,20,60,120]);ok(stalled.frames_over_50ms===2);ok(stalled.frames_over_100ms===1);ok(stalled.p95_frame_ms===120);ok(Math.abs(stalled.average_fps-1000/44)<1e-8);ok(summarizeFrames([])===null);ok(summarizeFrames([NaN,0,-1,Infinity])===null);
// Android browser toolbar opening/closing must not invalidate a fixed render surface.
ok(!invalidatesViewport({width:393,height:620,orientation:0},{width:393,height:720,orientation:0}));
ok(invalidatesViewport({width:393,orientation:0},{width:780,orientation:90}));
ok(invalidatesViewport({width:393,orientation:0},{width:393,orientation:90}));
ok(invalidatesViewport({width:393},{width:360}));
const source=await readFile(new URL('../studio/performance.html',import.meta.url),'utf8'),short=await readFile(new URL('../test/index.html',import.meta.url),'utf8');
ok(short===source.replace('<head>','<head>\n <base href="../studio/">'));
console.log(`PASS ${checks} performance checks: frame cadence, stalls, toolbar resize, orientation change, and shared mobile test page.`);
