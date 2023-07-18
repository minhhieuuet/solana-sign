import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from 'vite'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {}
  },
  server: {
    watch: {
      usePolling: true, // Fixes WSL not watching.
    },
  },
   build: {
      target: ["esnext"], // 👈 build.target
    },
});
