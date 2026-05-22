import { defineConfig } from 'electron-vite';
import { resolve } from 'path';

export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        external: ['better-sqlite3']
      }
    }
  },
  preload: {
    build: {
      rollupOptions: {
        external: ['electron']
      }
    }
  },
  renderer: {
    build: {
      rollupOptions: {
        input: {
          home: resolve(__dirname, 'src/renderer/pages/home/home.html'),
          budgeting: resolve(__dirname, 'src/renderer/pages/budgeting/sheet.html')
        }
      }
    }
  }
});
