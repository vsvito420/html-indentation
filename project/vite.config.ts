import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/html-indentation/',
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
