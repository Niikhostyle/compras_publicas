import pages from '../data/reglamento.json' with { type: 'json' };
export {pages};
export const normalize=(value:string)=>value.normalize('NFKD').replace(/\u00ad/g,'').replace(/(\p{L})-\r?\n(\p{L})/gu,'$1$2').replace(/[\u0300-\u036f]/g,'').replace(/[“”«»]/g,'"').replace(/[‘’]/g,"'").toLowerCase().replace(/\s+/g,' ').trim();
export type Citation={page:number;quote:string};
export function validateCitations(input:unknown):Citation[] {
  if(!Array.isArray(input))return [];
  return input.filter((item):item is Citation=>!!item&&Number.isInteger(item.page)&&typeof item.quote==='string'&&item.quote.trim().length>=25&&item.quote.length<=1600&&!!pages.find(p=>p.page===item.page&&normalize(p.text).includes(normalize(item.quote)))).slice(0,8);
}
export const sourceFragments=pages.flatMap(({page,text})=>{
  const fragments:{id:string;page:number;text:string}[]=[];
  let start=0;
  while(start<text.length){
    let end=Math.min(start+1100,text.length);
    if(end<text.length){
      const newline=text.lastIndexOf('\n',end);
      const space=text.lastIndexOf(' ',end);
      if(newline>start+350)end=newline+1;
      else if(space>start+350)end=space+1;
    }
    fragments.push({id:`P${String(page).padStart(2,'0')}-F${String(fragments.length+1).padStart(2,'0')}`,page,text:text.slice(start,end)});
    start=end;
  }
  return fragments;
});
const fragmentsById=new Map(sourceFragments.map(fragment=>[fragment.id,fragment]));
export function buildSource() {return pages.map(p=>`<pagina numero="${p.page}">\n${sourceFragments.filter(f=>f.page===p.page).map(f=>`<fragmento id="${f.id}">\n${f.text}\n</fragmento>`).join('\n')}\n</pagina>`).join('\n');}
export function assessReferencedAnswer(value:unknown) {
  if(!value||typeof value!=='object')throw new Error('Formato de respuesta inválido');
  const candidate=value as {answer?:unknown;supported?:unknown;citationIds?:unknown};
  if(typeof candidate.answer!=='string'||!candidate.answer.trim()||typeof candidate.supported!=='boolean'||!Array.isArray(candidate.citationIds))throw new Error('Formato de respuesta inválido');
  const ids=candidate.citationIds;
  const verified=ids.length>0&&ids.length<=12&&ids.every(id=>typeof id==='string'&&fragmentsById.has(id));
  const citations:Citation[]=verified?[...new Set(ids as string[])].map(id=>{const fragment=fragmentsById.get(id)!;return {page:fragment.page,quote:fragment.text.trim()};}):[];
  return {answer:candidate.answer,citations,supported:candidate.supported,verified};
}
export function assessAnswer(value:unknown) {
  if(!value||typeof value!=='object')throw new Error('Formato de respuesta inválido');
  const candidate=value as {answer?:unknown;supported?:unknown;citations?:unknown};
  if(typeof candidate.answer!=='string'||!candidate.answer.trim()||typeof candidate.supported!=='boolean'||!Array.isArray(candidate.citations))throw new Error('Formato de respuesta inválido');
  const citations=validateCitations(candidate.citations);
  const verified=citations.length>0&&citations.length===candidate.citations.length;
  return {answer:candidate.answer,citations,supported:candidate.supported,verified,reason:!verified?'invalid_citations':candidate.supported?'complete':'partial'};
}
