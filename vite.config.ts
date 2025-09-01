import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    // Only configure proxy in development
    server: {
      proxy: {
        '/api': {
          target: 'https://pyme-backend-production.up.railway.app',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          secure: false,
        },
      },
    },
    // Define global constants
    define: {
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL || 'https://pyme-backend-production.up.railway.app'),
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
  };
});
