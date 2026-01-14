import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  root: path.join(__dirname, "src/renderer"),
  base: "./",
  build: {
    outDir: path.join(__dirname, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "framer-motion"],
          "vendor-icons": ["react-icons"],
          "vendor-utils": ["sentiment"],
        },
      },
    },
  },
  server: {
    port: 5173,
  },
});
