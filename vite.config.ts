/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  assetsInclude: ['**/*.lottie'],
  plugins: [
    vue(),
    legacy(),
  ],

  // SASS DEPRECATION
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler', // Sử dụng compiler mới để tắt cảnh báo legacy API
      },
    },
  },

  optimizeDeps: {
    exclude: ['@capacitor-community/sqlite'],
    include: [
      'vue',
      'vue-router',
      '@ionic/vue',
      '@ionic/vue-router',
      '@lottiefiles/dotlottie-vue',
    ],
  },
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
  resolve: {
    dedupe: ['vue', 'vue-router'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom'
  },
  build: {
    chunkSizeWarningLimit: 2000,
    cssCodeSplit: true,
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          if (id.includes('@ionic')) return 'vendor-ionic';
          if (id.includes('primevue') || id.includes('primeicons') || id.includes('@primeuix')) {
            return 'vendor-primevue';
          }
          if (id.includes('chart.js')) return 'vendor-chart';
          if (id.includes('exceljs')) return 'vendor-excel';
          if (id.includes('/docx')) return 'vendor-docx';
          if (id.includes('jspdf') || id.includes('html2canvas')) return 'vendor-pdf';
          if (id.includes('@capacitor')) return 'vendor-capacitor';
          if (
            id.includes('/node_modules/vue/') ||
            id.includes('/node_modules/vue-router/') ||
            id.includes('/node_modules/pinia/')
          ) {
            return 'vendor-vue-core';
          }
          if (id.includes('vue-i18n')) return 'vendor-i18n';

          return 'vendor-others';
        }
      }
    }
  },
})