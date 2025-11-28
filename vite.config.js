import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    // 2. Add this 'resolve' object
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
