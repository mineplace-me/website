import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: './',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  define: {
    __VUE_I18N_FULL_INSTALL__: true,
    __VUE_I18N_LEGACY_API__: false,
    __INTLIFY_PROD_DEVTOOLS__: false,
  },
  build: {
    sourcemap: true,
    lib: {
      entry: './src/main.js',  // must export a "load()" function
      name: 'Bluemap',
      fileName: 'bluemap'
    },
    rollupOptions: {
      // Remove external Vue configuration to bundle Vue with the library
      // external: ['vue'],       // don't bundle Vue if Qwik will load it separately
    }
  },
})
