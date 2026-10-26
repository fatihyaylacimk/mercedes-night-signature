import {SCENES} from './scenes.js';
export const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
export const mix=(a,b,t)=>a+(b-a)*t;
export function smooth(a,b,v){const t=clamp((v-a)/(b-a));return t*t*(3-2*t);}
const KEYS=[
 [0,[-5.5,1.02,.08],[-.2,.43,0]],
 [.14,[-4.4,1.12,3.35],[-.22,.43,0]],
 [.30,[-1.1,1.13,4.7],[-.22,.46,0]],
 [.35,[-.90,1.14,3.3],[-.14,.54,0]],
 [.425,[-.65,1.04,2.9],[-.16,.57,.05]],
 [.49,[-.52,.92,1.65],[-.30,.64,0]],
 [.535,[-2.40,.62,2.02],[-1.375,.28,.69]],
 [.61,[-2.15,.55,1.75],[-1.375,.28,.69]],
 [.66,[-4.3,1.02,3.7],[-.22,.43,0]],
 [.81,[-4.8,.94,3.4],[-.22,.43,0]],
 [.87,[-3.4,1.07,5.1],[-.22,.43,0]],
 [1,[-1.4,1.04,5.7],[-.22,.43,0]]
];
export function sample(value){
 const p=clamp(Number.isFinite(value)?value:0);
 let index=SCENES.findIndex(s=>p<s.range[1]);if(index<0)index=5;
 const s=SCENES[index],local=clamp((p-s.range[0])/(s.range[1]-s.range[0]));
 const i=Math.max(0,KEYS.findIndex(k=>k[0]>=p)-1);
 const k=KEYS[i],n=KEYS[Math.min(i+1,KEYS.length-1)];
 const t=n[0]===k[0]?1:smooth(k[0],n[0],p);
 const camera=k[1].map((v,j)=>mix(v,n[1][j],t)),target=k[2].map((v,j)=>mix(v,n[2][j],t));
 const doorOpen=smooth(.355,.425,p)*(1-smooth(.49,.525,p));
 const travel=clamp((p-.54)/.32)*24;
 return{p,index,local,camera,target,doorAngle:-doorOpen*Math.PI*.36,wheelAngle:-travel/.265,road:travel,
  light:smooth(.005,.08,p),tunnel:smooth(.62,.66,p)*(1-smooth(.83,.87,p)),
  cockpit:smooth(.435,.47,p)*(1-smooth(.50,.535,p)),
  scene:s,blend:smooth(.79,1,local),final:smooth(.89,.96,p)};
}
export function chapterPosition(index){const s=SCENES[clamp(index,0,5)];return index===0?0:index===5?.96:mix(s.range[0],s.range[1],.20);}
