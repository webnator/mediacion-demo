import { z } from 'zod';
const text = z.string().min(1);
const url = z.string().refine((v) => {
  if (!v) return true;
  try {
    const u = new URL(v);
    return ['https:', 'http:'].includes(u.protocol);
  } catch {
    return false;
  }
}, 'Usa una URL completa http o https');
const image = z
  .string()
  .refine(
    (v) =>
      !v ||
      (v.startsWith('/media/') && !v.includes('..')) ||
      /^https:\/\//.test(v),
    'Usa /media/archivo o una URL https',
  );
export const siteSchema = z
  .object({
    name: text,
    tagline: text,
    seoTitle: text,
    seoDescription: text,
    heroTitle: text,
    heroText: text,
    heroCta: text,
    servicesVisible: z.boolean(),
    servicesTitle: text,
    services: z
      .array(z.object({ title: text, text: text, detail: text }))
      .max(6),
    aboutVisible: z.boolean(),
    aboutTitle: text,
    aboutText: text,
    aboutNote: text,
    processVisible: z.boolean(),
    processTitle: text,
    steps: z.array(z.object({ title: text, text: text })).max(6),
    newsVisible: z.boolean(),
    newsTitle: text,
    contactTitle: text,
    contactText: text,
    email: z.string().email(),
    location: text,
    contactEnabled: z.boolean(),
  })
  .strict();
export const postSchema = z
  .object({
    slug: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Usa minúsculas y guiones'),
    title: text,
    summary: text,
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .refine(
        (v) =>
          !Number.isNaN(Date.parse(v)) &&
          new Date(v).toISOString().slice(0, 10) === v,
        'Fecha no válida',
      ),
    type: z.enum(['articulo', 'enlace', 'video', 'podcast']),
    published: z.boolean(),
    image: image.default(''),
    imageAlt: z.string().default(''),
    url: url.default(''),
    body: z.string().default(''),
  })
  .strict()
  .superRefine((p, ctx) => {
    if (p.type !== 'articulo' && !p.url)
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['url'],
        message: 'Este formato necesita una URL',
      });
  });
export type Post = z.infer<typeof postSchema>;
