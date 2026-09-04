// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  i18n: {
    defaultLocale: 'fr',
    locales: ['fr'],
    routing: {
      prefixDefaultLocale: true
    }
  },
  output: 'static',
  site: 'https://www.consoalert.com',
  build: {
    // Le CSS de chaque page est inline dans le HTML : supprime les deux requetes
    // /_astro/*.css qui bloquaient le rendu initial. Le site tient en quelques
    // pages, le cout du CSS non partage entre pages reste inferieur au cout
    // des allers-retours reseau.
    inlineStylesheets: 'always',
  }
});
