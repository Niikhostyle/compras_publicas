import test from 'node:test';
import assert from 'node:assert/strict';
import {basePath,appUrl,normalizeBasePath,sessionPath} from '../lib/paths.ts';
test('API, PDF y referencias usan la raíz del subdominio por defecto',()=>{
  assert.equal(basePath,'');
  assert.equal(sessionPath,'/');
  for(const route of ['/api/auth','/api/status','/api/settings','/api/chat','/reglamento.pdf#page=24']){
    assert.equal(appUrl(route),route);
  }
});
test('permite configurar una subcarpeta sin añadir una barra final',()=>{
  assert.equal(normalizeBasePath('/apps/compras/'),'/apps/compras');
  assert.equal(normalizeBasePath('/'),'');
  assert.equal(normalizeBasePath(''),'');
  assert.throws(()=>normalizeBasePath('//otro.example'));
  assert.throws(()=>normalizeBasePath('/../privado'));
  assert.throws(()=>normalizeBasePath('https://otro.example'));
});
test('no convierte enlaces externos en rutas internas',()=>{
  assert.throws(()=>appUrl('https://otro.example/api'));
  assert.throws(()=>appUrl('//otro.example/api'));
});
