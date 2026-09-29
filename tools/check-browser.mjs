// Requiere npm run dev. Cambia temporalmente dos archivos y los restaura al terminar.
import {chromium,expect} from '@playwright/test';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const root=process.cwd();const original=await fs.readFile(root+'/src/data/site.json','utf8');const draftPath=root+'/src/content/posts/borrador-de-ejemplo.json';const draftOriginal=await fs.readFile(draftPath,'utf8');
const browser=await chromium.launch({headless:true});const page=await browser.newPage();const base='http://127.0.0.1:4321';
try{
await page.goto(base+'/__taller');await page.getByLabel('Titular principal',{exact:true}).fill('Titular de prueba de edición');await page.getByLabel('Mostrar actualidad en portada y menú',{exact:false}).uncheck();await page.getByRole('button',{name:'Guardar cambios',exact:true}).click();await page.getByRole('status').filter({hasText:'Guardado en disco'}).waitFor();await page.goto(base);await page.getByRole('heading',{level:1,name:'Titular de prueba de edición'}).waitFor();assert.equal(await page.locator('.news').count(),0);assert.equal((await page.request.get(base+'/actualidad/conversaciones-pendientes/')).status(),200);
await page.goto(base+'/__taller');await page.getByRole('button',{name:/Borrador · Una idea/}).click();await page.getByLabel('Publicado',{exact:true}).check();await page.getByRole('button',{name:'Guardar cambios',exact:true}).click();await page.getByRole('status').filter({hasText:'Guardado en disco'}).waitFor();await expect.poll(async()=>(await page.request.get(base+'/actualidad/borrador-de-ejemplo/')).status(),{timeout:10000}).toBe(200);
const data={kind:'site',id:'site',data:JSON.parse(original)};
assert.equal((await page.request.post(base+'/__taller/api',{data,headers:{Origin:'https://evil.example'}})).status(),403);
assert.equal((await page.request.post(base+'/__taller/api',{data:{kind:'posts',id:'../../bad',data:JSON.parse(draftOriginal)},headers:{Origin:base}})).status(),400);
console.log('PASS: edición persistente, visibilidad, URL conservada, publicar borrador, rechazo de origen externo y traversal');
}finally{await fs.writeFile(root+'/src/data/site.json',original);await fs.writeFile(draftPath,draftOriginal);await browser.close();}
