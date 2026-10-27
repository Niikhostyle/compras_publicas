import { randomBytes, scryptSync, timingSafeEqual, createHmac, createCipheriv, createDecipheriv } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync, existsSync, renameSync } from 'node:fs';
import path from 'node:path';
import { homedir } from 'node:os';
import { cookies } from 'next/headers';
import { isAllowedOrigin } from './origin';

const directory=process.env.NORMA_DATA_DIR
  ? path.resolve(process.env.NORMA_DATA_DIR)
  : process.env.NODE_ENV==='production'
    ? path.join(homedir(),'.local','share','norma-compras')
    : path.join(process.cwd(),'.runtime');
// Las variables del panel prevalecen. El archivo privado conserva el acceso
// y el origen entre despliegues sin copiar secretos al repositorio.
function privateRuntimeValue(name:'ADMIN_PASSWORD_HASH'|'APP_ORIGIN') {
  if(process.env[name]) return process.env[name]!;
  const file=path.join(directory,'runtime.env');
  if(!existsSync(file)) return '';
  const prefix=name+'=';
  return readFileSync(file,'utf8').split(/\r?\n/).find(line=>line.startsWith(prefix))?.slice(prefix.length).trim()||'';
}
function secret():Buffer {
  mkdirSync(directory,{recursive:true,mode:0o700});
  const file=path.join(directory,'master.key');
  if(!existsSync(file)) {try{writeFileSync(file,randomBytes(32),{flag:'wx',mode:0o600});}catch(e){if(!existsSync(file))throw e;}}
  return readFileSync(file);
}
export const adminEmail='nfigueroa@chanco.cl';
export function verifyPassword(password:string,encoded=privateRuntimeValue('ADMIN_PASSWORD_HASH')) {
  const [salt,hash]=encoded.split(':'); if(!salt||!hash)return false;
  const value=scryptSync(password,salt,64); const expected=Buffer.from(hash,'hex');
  return value.length===expected.length&&timingSafeEqual(value,expected);
}
export function signSession() {const payload=Buffer.from(JSON.stringify({email:adminEmail,expires:Date.now()+8*60*60*1000})).toString('base64url');return payload+'.'+createHmac('sha256',secret()).update(payload).digest('base64url');}
export async function isAdmin() {
  const token=(await cookies()).get('norma_session')?.value; if(!token)return false;
  try {const [payload,sig]=token.split('.'); const expected=createHmac('sha256',secret()).update(payload).digest(); const actual=Buffer.from(sig,'base64url'); if(actual.length!==expected.length||!timingSafeEqual(actual,expected))return false;const data=JSON.parse(Buffer.from(payload,'base64url').toString());return data.email===adminEmail&&data.expires>Date.now();}catch{return false;}
}
export type Settings={apiKey:string;model:string};
export function readSettings():Settings {
  const file=path.join(directory,'settings.enc'); if(!existsSync(file))return {apiKey:process.env.GEMINI_API_KEY||'',model:process.env.GEMINI_MODEL||'gemini-2.5-flash'};
  const blob=readFileSync(file);const decipher=createDecipheriv('aes-256-gcm',secret(),blob.subarray(0,12));decipher.setAuthTag(blob.subarray(12,28));return JSON.parse(Buffer.concat([decipher.update(blob.subarray(28)),decipher.final()]).toString());
}
export function saveSettings(settings:Settings) {const iv=randomBytes(12);const cipher=createCipheriv('aes-256-gcm',secret(),iv);const encrypted=Buffer.concat([cipher.update(JSON.stringify(settings)),cipher.final()]);const file=path.join(directory,'settings.enc');const temporary=file+'.'+randomBytes(5).toString('hex');writeFileSync(temporary,Buffer.concat([iv,cipher.getAuthTag(),encrypted]),{mode:0o600});renameSync(temporary,file);}
const rates=new Map<string,{count:number;until:number}>();
export function rateLimit(key:string,maximum:number,window=60_000) {const now=Date.now();if(rates.size>5000)for(const [k,v]of rates)if(v.until<now)rates.delete(k);const previous=rates.get(key);if(!previous||previous.until<now){rates.set(key,{count:1,until:now+window});return true;}return ++previous.count<=maximum;}
export function sameOrigin(request:Request) {
  return isAllowedOrigin(request, privateRuntimeValue('APP_ORIGIN'));
}
export function clientId(request:Request) {return process.env.TRUST_PROXY==='true'?(request.headers.get('x-forwarded-for')?.split(',')[0].trim()||'local'):'local';}
