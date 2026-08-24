import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../shared'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Manual chunks untuk code splitting
        manualChunks(id) {
          // Vendor libraries
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'vendor-react';
            if (id.includes('react-router')) return 'vendor-router';
            return 'vendor';
          }
          // Large pages
          if (id.includes('Exploration.jsx')) return 'exploration';
          if (id.includes('TeacherDashboard.jsx')) return 'teacher';
          if (id.includes('Evaluation.jsx')) return 'evaluation';
        },
      },
    },
    // Chunk size warning - naikkan threshold
    chunkSizeWarningLimit: 800,
    // Assets inline limit
    assetsInlineLimit: 4096, // 4KB
  },
});
