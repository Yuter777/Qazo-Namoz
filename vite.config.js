import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],

  build: {
    // Raise the warning threshold — element-plus alone exceeds the 500 kB default
    chunkSizeWarningLimit: 800,

    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vue core + router + pinia — change rarely, cache a long time
          if (
            id.includes('node_modules/vue/') ||
            id.includes('node_modules/@vue/') ||
            id.includes('node_modules/vue-router/') ||
            id.includes('node_modules/pinia/')
          ) return 'vendor-vue'

          // Firebase — large and stable, own cache bucket
          if (id.includes('node_modules/firebase/') || id.includes('node_modules/@firebase/')) {
            return 'vendor-firebase'
          }

          // Element Plus + its icons — biggest package, keep isolated
          if (id.includes('node_modules/element-plus/') || id.includes('node_modules/@element-plus/')) {
            return 'vendor-element-plus'
          }

          // Vue I18n
          if (id.includes('node_modules/vue-i18n/') || id.includes('node_modules/@intlify/')) {
            return 'vendor-i18n'
          }
        },
      },
    },
  },
})
