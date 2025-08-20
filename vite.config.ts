import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: 'tests/pages',
  build: {
    outDir: '../dist/test',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'tests/pages/index.html'),
        'simple-sankey': resolve(__dirname, 'tests/pages/simple-sankey.html'),
        'complex-sankey': resolve(__dirname, 'tests/pages/complex-sankey.html'),
        'different-interpolations': resolve(__dirname, 'tests/pages/different-interpolations.html'),
        'd3-comparison': resolve(__dirname, 'tests/pages/d3-comparison.html'),
      },
    },
  },
  server: {
    port: 3000,
    host: true,
  },
});
