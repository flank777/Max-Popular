import type { ChallengeItem } from './types';
export const money=(cents:number, compact=false)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',minimumFractionDigits:compact&&cents%100===0?0:2}).format(cents/100);
export const uid=()=>crypto.randomUUID?.()||`${Date.now()}-${Math.random()}`;
export function generateSavingsChallenge(target:number):ChallengeItem[]{
  const base=[200,500,1000,2000,5000,10000,20000,50000];
  const desired=Math.max(36,Math.min(150,Math.round(target/20000)));
  const weights=[24,22,18,14,10,7,4,1]; let remaining=target; const values:number[]=[];
  for(let i=0;i<desired-1;i++){
    const slots=desired-i; const affordable=base.filter(v=>v<=remaining-(slots-1)*200); if(!affordable.length)break;
    const pool=affordable.flatMap((v,index)=>Array(Math.max(1,weights[index]||1)).fill(v));
    const avg=remaining/slots; const filtered=pool.filter(v=>v<=avg*2.1); const pick=(filtered.length?filtered:pool)[Math.floor(Math.random()*(filtered.length?filtered.length:pool.length))];
    values.push(pick);remaining-=pick;
  }
  while(remaining>50000){values.push(50000);remaining-=50000} if(remaining>0)values.push(remaining);
  return values.sort(()=>Math.random()-.5).map(amount=>({id:uid(),amount,completed:false}));
}
export const goalSaved=(goal:import('./types').Goal,tx:import('./types').Transaction[])=>goal.challenge.filter(i=>i.completed).reduce((s,i)=>s+i.amount,0)+tx.filter(t=>t.goalId===goal.id&&t.type==='manual').reduce((s,t)=>s+t.amount,0);
