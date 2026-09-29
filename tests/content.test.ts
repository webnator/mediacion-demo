import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { parse } from 'yaml';
import { postSchema, siteSchema } from '../src/lib/schema';
import { embedUrl, renderBody } from '../src/lib/render';
const site = JSON.parse(readFileSync('src/data/site.json', 'utf8'));
const posts = readdirSync('src/content/posts')
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(readFileSync(`src/content/posts/${f}`, 'utf8')));
test('Todos los documentos de ejemplo cumplen el modelo; los slugs son únicos', () => {
  siteSchema.parse(site);
  posts.forEach((p) => postSchema.parse(p));
  assert.equal(new Set(posts.map((p) => p.slug)).size, posts.length);
});
test('CMS cubre cada campo de los documentos', () => {
  const config = parse(readFileSync('.pages.yml', 'utf8'));
  assert.deepEqual(
    config.content[0].fields.map((f: any) => f.name).sort(),
    Object.keys(site).sort(),
  );
  assert.deepEqual(
    config.content[1].fields.map((f: any) => f.name).sort(),
    Object.keys(posts[0]).sort(),
  );
});
test('URLs y fechas incorrectas impiden guardar/publicar', () => {
  const p = posts[0];
  assert.equal(
    postSchema.safeParse({ ...p, type: 'enlace', url: 'javascript:alert(1)' })
      .success,
    false,
  );
  assert.equal(
    postSchema.safeParse({ ...p, type: 'video', url: '' }).success,
    false,
  );
  assert.equal(
    postSchema.safeParse({ ...p, slug: '../../escape' }).success,
    false,
  );
  assert.equal(
    postSchema.safeParse({ ...p, date: '2026-02-31' }).success,
    false,
  );
});
test('Solo se generan reproductores de proveedores y rutas permitidas', () => {
  assert.equal(
    embedUrl('https://youtu.be/cSohjlYQI2A'),
    'https://www.youtube-nocookie.com/embed/cSohjlYQI2A',
  );
  assert.equal(
    embedUrl('https://open.spotify.com/episode/Ab123'),
    'https://open.spotify.com/embed/episode/Ab123',
  );
  assert.equal(
    embedUrl('https://youtube.com.evil.example/watch?v=cSohjlYQI2A'),
    null,
  );
  assert.equal(embedUrl('javascript:alert(1)'), null);
});
test('Markdown conserva formato y elimina scripts, eventos e iframes', () => {
  const html = renderBody(
    '## Hola\n\n**Texto**<script>alert(1)</script><img src="x" onerror="alert(1)"><iframe src="https://evil.example"></iframe>',
  );
  assert.ok(html.includes('<h2>Hola</h2>'));
  assert.ok(html.includes('<strong>Texto</strong>'));
  assert.doesNotMatch(html, /script|onerror|iframe/);
});
test('La compilación excluye taller y borradores y publica cada entrada visible', () => {
  assert.ok(existsSync('dist/index.html'), 'Ejecuta npm run build primero');
  assert.equal(existsSync('dist/__taller'), false);
  for (const post of posts)
    assert.equal(
      existsSync(`dist/actualidad/${post.slug}/index.html`),
      post.published,
    );
  assert.doesNotMatch(readFileSync('dist/index.html', 'utf8'), /__taller/);
});
