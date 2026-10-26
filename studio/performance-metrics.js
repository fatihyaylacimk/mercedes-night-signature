export function summarizeFrames(intervals){
 const values=intervals.filter(x=>Number.isFinite(x)&&x>0);if(!values.length)return null;
 const sorted=[...values].sort((a,b)=>a-b),duration=values.reduce((a,b)=>a+b,0),percentile=p=>sorted[Math.min(sorted.length-1,Math.ceil(p*sorted.length)-1)];
 return {frames:values.length,duration_ms:duration,average_fps:values.length*1000/duration,median_frame_ms:percentile(.5),p95_frame_ms:percentile(.95),longest_frame_ms:sorted.at(-1),frames_over_50ms:values.filter(v=>v>50).length,frames_over_100ms:values.filter(v=>v>100).length};
}
