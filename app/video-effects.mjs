export const videoEffects=['boxing','catduo','cattrio','hamster','kopi','princess','speed'];
export function removeGreen(data){for(let i=0;i<data.length;i+=4){const r=data[i],g=data[i+1],b=data[i+2],dominance=g-Math.max(r,b);if(g>65&&dominance>25){data[i+3]=Math.round(data[i+3]*(1-Math.min(1,(dominance-25)/65)));data[i+1]=Math.min(g,Math.max(r,b)+25)}}return data}
