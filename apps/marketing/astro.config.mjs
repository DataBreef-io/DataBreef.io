// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://databreef.io',
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',
  },
});
