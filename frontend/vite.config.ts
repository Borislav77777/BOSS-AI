import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Отключаем TypeScript проверку в Vite
      typescript: {
        ignoreBuildErrors: true,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    host: true,
    open: true,
    allowedHosts: [
      "81f0fd87b319.ngrok-free.app",
      ".ngrok-free.app",
      ".ngrok.io",
    ],
    fs: {
      strict: false,
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false, // Отключено для production
    minify: "esbuild", // Включаем минификацию
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          ui: ["framer-motion", "@react-spring/web"],
          utils: ["axios", "clsx", "tailwind-merge"],
        },
      },
    },
    // Оптимизация для production
    target: "es2015",
    cssCodeSplit: true,
    assetsInlineLimit: 4096, // 4KB
  },
});
