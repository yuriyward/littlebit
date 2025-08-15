import { loadEnv } from "vite";
import { defineConfig } from 'astro/config';

import expressiveCode from 'astro-expressive-code';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import spectre from './package/src';

import node from '@astrojs/node';
import { spectreDark } from './src/ec-theme';
import tailwindcss from "@tailwindcss/vite";

const env = loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), "");

const {
  GISCUS_REPO,
  GISCUS_REPO_ID,
  GISCUS_CATEGORY,
  GISCUS_CATEGORY_ID,
  GISCUS_MAPPING,
  GISCUS_STRICT,
  GISCUS_REACTIONS_ENABLED,
  GISCUS_EMIT_METADATA,
  GISCUS_LANG
} = env;

// https://astro.build/config
const config = defineConfig({
  site: 'https://littlebit.dev',
  output: 'static',
  integrations: [
    expressiveCode({
      themes: [spectreDark],
    }),
    mdx(),
    react(),
    sitemap(),
    spectre({
      name: 'littlebit.dev',
      openGraph: {
        home: {
          title: 'littlebit.dev',
          description: 'A personal website of Yuriy Babyak AI Engineer.'
        },
        blog: {
          title: 'Blog',
          description: 'Blog written by Yuriy Babyak.'
        },
        projects: {
          title: 'Projects',
          description: 'Projects done by Yuriy Babyak.'
        }
      },
      giscus: {
        repository: GISCUS_REPO,
        repositoryId: GISCUS_REPO_ID,
        category: GISCUS_CATEGORY,
        categoryId: GISCUS_CATEGORY_ID,
        mapping: GISCUS_MAPPING as any,
        strict: GISCUS_STRICT === "true",
        reactionsEnabled: GISCUS_REACTIONS_ENABLED === "true",
        emitMetadata: GISCUS_EMIT_METADATA === "true",
        lang: GISCUS_LANG,
      }
    })
  ],
  adapter: node({
    mode: 'standalone'
  }),
  vite: {
    plugins: [tailwindcss() as any],
  },
});

export default config;
