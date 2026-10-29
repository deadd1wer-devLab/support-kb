import adapter from '@sveltejs/adapter-static';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mdsvex } from 'mdsvex';

/** @type {import('@sveltejs/kit').Config} */
export default {
  extensions: ['.svelte', '.svx'],
  preprocess: [
    mdsvex({
      extensions: ['.svx'],
      layout: { runbook: join(dirname(fileURLToPath(import.meta.url)), 'src/lib/layouts/runbook.svelte') },
    }),
  ],
  kit: {
    adapter: adapter({ pages: 'rendered', assets: 'rendered', strict: true }),
    alias: { '#lib': 'src/lib' },
    prerender: { entries: ['/kb'] },
  },
};
