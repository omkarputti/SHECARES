import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// http  s://vitejs.dev/config/
export default defineConfig(({ command, mode }) => ({
  server: {
    port: 8080,
    allowedHosts: [
      'localhost',
      '0b37bff423fb.ngrok-free.app'
    ]
  },

  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));