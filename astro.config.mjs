import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { loadEnv } from 'vite';
import { localWorkshop } from './tools/local-workshop.ts';
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || loadEnv(process.env.NODE_ENV || 'development', process.cwd(), 'PUBLIC_').PUBLIC_SITE_URL || 'https://example.com',
  devToolbar: { enabled: false },
  output: 'static',
  integrations: [sitemap()],
  vite: { plugins: [localWorkshop()] },
});
