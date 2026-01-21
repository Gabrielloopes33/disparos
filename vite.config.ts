import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    // Allow overriding dev port with DEV_PORT env var to avoid conflicts
    port: Number(process.env.DEV_PORT) || 5173,
    strictPort: false,
    hmr: {
      overlay: false,
    },
    proxy: {
      '/api/n8n': {
        target: 'https://n8n.codirect.com.br',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/n8n/, ''),
        secure: true,
      },
      '/api/evolution': {
        target: 'https://evolution.codirect.com.br',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/evolution/, ''),
        secure: true,
      },
      '/api/supabase': {
        target: 'http://supabase.codirect.com.br',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/supabase/, ''),
      },
    },
  },
  plugins: [react()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
