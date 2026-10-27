import pages from '../data/reglamento.json' with { type: 'json' };
export {pages};
export const normalize=(value:string)=>value.normalize('NFKD').replace(/\u00ad/g,'').replace(/(\p{L})-\r?\n(\p{L})/gu,'$1$2').replace(/[\u0300-\u036f]/g,'').replace(/[“”«»]/g,'"').replace(/[‘’]/g,"'").toLowerCase().replace(/\s+/g,' ').trim();
export type Citation={page:number;quote:string};
export function validateCitations(input:unknown):Citation[] {
  if(!Array.isArray(input))return [];
  return input.filter((item):item is Citation=>!!item&&Number.isInteger(item.page)&&typeof item.quote==='string'&&item.quote.trim().length>=25&&item.quote.length<=1600&&!!pages.find(p=>p.page===item.page&&normalize(p.text).includes(normalize(item.quote)))).slice(0,8);
}
export function buildSource() {return pages.map(p=>`<pagina numero="${p.page}">\n${p.text}\n</pagina>`).join('\n');}
export function assessAnswer(value:unknown) {
  if(!value||typeof value!=='object')throw new Error('Formato de respuesta inválido');
  const candidate=value as {answer?:unknown;supported?:unknown;citations?:unknown};
  if(typeof candidate.answer!=='string'||!candidate.answer.trim()||typeof candidate.supported!=='boolean'||!Array.isArray(candidate.citations))throw new Error('Formato de respuesta inválido');
  const citations=validateCitations(candidate.citations);
  const verified=citations.length>0&&citations.length===candidate.citations.length;
  return {answer:candidate.answer,citations,supported:candidate.supported,verified,reason:!verified?'invalid_citations':candidate.supported?'complete':'partial'};
}
