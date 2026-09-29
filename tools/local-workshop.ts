import type { Plugin } from 'vite';
import { readFile, readdir, writeFile, rename } from 'node:fs/promises';
import { resolve } from 'node:path';
import { parse } from 'yaml';
import { siteSchema, postSchema } from '../src/lib/schema';
export function localWorkshop(): Plugin {
  return {
    name: 'entre-local-workshop',
    apply: 'serve',
    configureServer(server) {
      const root = server.config.root;
      server.middlewares.use(async (req, res, next) => {
        const route = req.url?.split('?')[0];
        if (!route?.startsWith('/__taller')) return next();
        res.setHeader('Cache-Control', 'no-store');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Content-Security-Policy', "frame-ancestors 'none'");
        const send = (status: number, value: unknown) => {
          res.statusCode = status;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify(value));
        };
        if (!/^127\.0\.0\.1:\d+$/.test(req.headers.host || ''))
          return send(403, { error: 'El taller solo funciona en 127.0.0.1.' });
        try {
          if (route === '/__taller' && req.method === 'GET') {
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.end(
              await readFile(resolve(root, 'tools/workshop.html'), 'utf8'),
            );
            return;
          }
          if (route !== '/__taller/api')
            return send(404, { error: 'Ruta no disponible' });
          if (req.method === 'GET') {
            const folder = resolve(root, 'src/content/posts');
            const posts = await Promise.all(
              (await readdir(folder))
                .filter((n) => n.endsWith('.json'))
                .map(async (n) => ({
                  id: n.slice(0, -5),
                  data: JSON.parse(await readFile(resolve(folder, n), 'utf8')),
                })),
            );
            return send(200, {
              site: JSON.parse(
                await readFile(resolve(root, 'src/data/site.json'), 'utf8'),
              ),
              posts,
              config: parse(
                await readFile(resolve(root, '.pages.yml'), 'utf8'),
              ),
            });
          }
          if (req.method !== 'POST')
            return send(405, { error: 'Método no disponible' });
          if (
            req.headers.origin !== `http://${req.headers.host}` ||
            !req.headers['content-type']?.startsWith('application/json')
          )
            return send(403, { error: 'Origen de la petición no permitido' });
          let body = '';
          for await (const chunk of req) {
            body += chunk;
            if (Buffer.byteLength(body) > 200_000)
              return send(413, { error: 'Contenido demasiado grande' });
          }
          const payload = JSON.parse(body);
          if (!['site', 'posts'].includes(payload.kind))
            return send(400, { error: 'Tipo de contenido no válido' });
          const parsed = (
            payload.kind === 'site' ? siteSchema : postSchema
          ).safeParse(payload.data);
          if (!parsed.success)
            return send(400, {
              error: parsed.error.issues
                .map((i) => `${i.path.join('.')}: ${i.message}`)
                .join('\n'),
            });
          const id = payload.id;
          if (
            payload.kind === 'posts' &&
            !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id || '')
          )
            return send(400, { error: 'Identificador no válido' });
          if (payload.kind === 'posts') {
            const dir = resolve(root, 'src/content/posts');
            for (const file of await readdir(dir)) {
              if (!file.endsWith('.json') || file === `${id}.json`) continue;
              const existing = JSON.parse(
                await readFile(resolve(dir, file), 'utf8'),
              );
              if (existing.slug === (parsed.data as { slug: string }).slug)
                return send(409, {
                  error: 'Ya existe otra publicación con esa URL',
                });
            }
            if (payload.create && (await readdir(dir)).includes(`${id}.json`))
              return send(409, {
                error: 'Ya existe una publicación con ese identificador',
              });
          }
          const target = resolve(
            root,
            payload.kind === 'site'
              ? 'src/data/site.json'
              : `src/content/posts/${id}.json`,
          );
          await writeFile(
            target + '.tmp',
            JSON.stringify(parsed.data, null, 2) + '\n',
          );
          await rename(target + '.tmp', target);
          return send(200, { ok: true });
        } catch (error) {
          server.config.logger.error(String(error));
          send(400, {
            error:
              'No se ha podido guardar o leer el contenido. Revisa el formato y la terminal.',
          });
        }
      });
    },
  };
}
