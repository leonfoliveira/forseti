import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import removeConsole from "vite-plugin-remove-console";

export default defineConfig({
  plugins: [react(), tailwindcss(), removeConsole()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          minSize: 100000,
          groups: [
            {
              name: "react-vendor",
              test: /node_modules[\\/]react/,
              priority: 20,
            },
            {
              name: "vendor",
              test: /[\\/]node_modules[\\/]/,
              minSize: 100000,
              maxSize: 1000000,
              priority: 10,
            },
            {
              name: "common",
              minShareCount: 2,
              minSize: 10000,
              priority: 5,
            },
          ],
        },
      },
    },
  },
});
