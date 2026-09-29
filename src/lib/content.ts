import { getCollection } from 'astro:content';
import rawSite from '../data/site.json';
import { siteSchema, postSchema, type Post } from './schema';
export { renderBody, embedUrl } from './render';
export const site = siteSchema.parse(rawSite);
export async function getPosts() {
  const entries = await getCollection('posts');
  const all = entries.map((entry) => postSchema.parse(entry.data));
  if (new Set(all.map((p) => p.slug)).size !== all.length)
    throw new Error('Hay slugs duplicados');
  return all
    .filter((p) => p.published)
    .sort((a, b) => b.date.localeCompare(a.date));
}
export const labels: Record<Post['type'], string> = {
  articulo: 'Reflexiones',
  video: 'En vídeo',
  podcast: 'Para escuchar',
  enlace: 'Lecturas',
};
export function dateLabel(d: string) {
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(d));
}
