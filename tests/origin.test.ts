import test from 'node:test';
import assert from 'node:assert/strict';
import { isAllowedOrigin } from '../lib/origin.ts';
const behindProxy = (origin:string) => new Request('http://127.0.0.1:3000/api/auth', {headers:{host:'internal-worker:3000',origin}});
test('acepta el dominio HTTPS configurado aunque el proxy cambie Host',()=>{
  assert.equal(isAllowedOrigin(behindProxy('https://compras.chanco.cl'),'https://compras.chanco.cl'),true);
});
test('rechaza otros dominios, protocolos y puertos detrás del proxy',()=>{
  for(const value of ['https://malicioso.example','http://compras.chanco.cl','https://compras.chanco.cl:8443','null','https://compras.chanco.cl.evil.example']){
    assert.equal(isAllowedOrigin(behindProxy(value),'https://compras.chanco.cl'),false);
  }
});
test('no confía en X-Forwarded-Host aportado por una solicitud',()=>{
  const request=new Request('http://127.0.0.1:3000/api/auth',{headers:{host:'internal-worker:3000',origin:'https://malicioso.example','x-forwarded-host':'malicioso.example'}});
  assert.equal(isAllowedOrigin(request,'https://compras.chanco.cl'),false);
});
test('mantiene desarrollo local sin origen configurado y bloquea orígenes externos',()=>{
  assert.equal(isAllowedOrigin(new Request('http://127.0.0.1:3000/api/auth',{headers:{origin:'http://127.0.0.1:3000'}})),true);
  assert.equal(isAllowedOrigin(behindProxy('https://compras.chanco.cl')),false);
  assert.equal(isAllowedOrigin(new Request('http://127.0.0.1:3000/api/auth')),true);
});
