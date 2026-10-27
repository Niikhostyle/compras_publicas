import test from 'node:test';
import assert from 'node:assert/strict';
import {basePath,appUrl} from '../lib/paths.ts';
test('API, PDF y referencias usan la subcarpeta de compras',()=>{
  assert.equal(basePath,'/apps/compras');
  for(const route of ['/api/auth','/api/status','/api/settings','/api/chat','/reglamento.pdf#page=24']){
    assert.equal(appUrl(route),`/apps/compras${route}`);
  }
});
test('no convierte enlaces externos en rutas internas',()=>{
  assert.throws(()=>appUrl('https://otro.example/api'));
  assert.throws(()=>appUrl('//otro.example/api'));
});
