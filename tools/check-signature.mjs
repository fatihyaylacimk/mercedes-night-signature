import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {ATMOSPHERES,DURATIONS,TOTAL_SECONDS,cleanName,possessive,normalizeConfig,encodeExperience,decodeExperience,chapterTime,timelineAt,poseAt,timeLabel} from '../signature/state.js';

let count=0;
const check=(value,label)=>{assert(value,label);count++;};
check(TOTAL_SECONDS===45,'the complete film lasts 45 seconds');
for(let chapter=0;chapter<6;chapter++){
  const at=timelineAt(chapterTime(chapter,.5));
  check(at.chapter===chapter && Math.abs(at.local-.5)<1e-8,'chapter seeking lands at the intended point');
}
for(let i=0;i<=450;i++){
  const at=timelineAt(i/10),pose=poseAt(at.chapter,at.local);
  check([...pose.camera,...pose.target,pose.doorAngle,pose.wheelAngle].every(Number.isFinite),'all cinematic poses remain finite');
  check(at.progress>=0&&at.progress<=1&&at.local>=0&&at.local<=1,'timeline never runs out of bounds');
}
check(timelineAt(45).complete&&timelineAt(45).chapter===5,'final state is reached once the film completes');
check(timelineAt(Infinity).elapsed===0&&timelineAt(-20).elapsed===0,'invalid and negative clocks are contained');
check(timeLabel(45)==='00:45'&&timeLabel(NaN)==='00:00','clock output is bounded');
check(possessive('Fatih')==='Fatih’in'&&possessive('Ali')==='Ali’nin'&&possessive('Oğuz')==='Oğuz’un'&&possessive('Gül')==='Gül’ün','Turkish possessive suffixes use vowel harmony');
check(possessive('Alex','en')==='Alex’s'&&possessive('James','en')==='James’','English possessive forms work');
for(const atmosphere of ATMOSPHERES){
  const input={name:'İpek Oğuz',lang:'tr',atmosphere,chapter:4};
  check(JSON.stringify(decodeExperience(encodeExperience(input)))===JSON.stringify(normalizeConfig(input)),'shared names, atmosphere and chapter round trip');
}
check(decodeExperience('#v=2&n=abc')===null,'unrecognised sharing versions are rejected');
check(decodeExperience('#v=1&a=javascript:alert(1)&l=bad&c=99').atmosphere==='night','shared preferences cannot inject unknown options');
check(!cleanName('<img src=x onerror=alert(1)>\u202e').includes('<'),'name strips markup and direction controls');
check(Array.from(cleanName('a'.repeat(200))).length===24,'long names are bounded');
check(normalizeConfig(null).name===''&&normalizeConfig({chapter:NaN}).chapter===0,'malformed persisted settings are safe');
check(poseAt(2,.8).doorAngle<-.7,'door opens during the door chapter');
check(poseAt(5,.8).doorAngle===0,'door is closed in the personal final');
for(const atmosphere of ATMOSPHERES){const file=await fs.readFile(`signature/assets/${atmosphere}.webp`);check(file.length>10000&&file.length<700000,'each atmosphere ships an optimised local asset');}
const html=await fs.readFile('signature/index.html','utf8');
check(!/script[^>]+src=["']https?:/.test(html),'no remote runtime scripts');
check(html.includes('maxlength="24"')&&html.includes('aria-labelledby="headline"'),'name length and primary heading are labelled');
const app=await fs.readFile('signature/app.js','utf8');
check(!app.includes('innerHTML'),'personal text is never interpreted as HTML');
check(app.includes("url.hash = encodeExperience")&&!app.includes('fetch('),'personal configuration is shared in a fragment without a data submission');
const css=await fs.readFile('signature/signature.css','utf8');
check(css.includes('prefers-reduced-motion')&&css.includes(':focus-visible'),'reduced motion and keyboard focus have explicit styles');
check(DURATIONS.every(d=>d>0),'every chapter has a positive duration');
console.log(`PASS ${count} signature checks: timeline boundaries, camera poses, door, sharing, name handling, atmosphere files and accessibility hooks.`);
