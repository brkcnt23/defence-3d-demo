import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    port: 3000,
    host: true,
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        manuli: resolve(__dirname, 'manuli.html'),
        ebaskici: resolve(__dirname, 'ebaskici.html'),
        ebaskiciv2: resolve(__dirname, 'ebaskici-v2.html'),
      },
    },
  },
});
