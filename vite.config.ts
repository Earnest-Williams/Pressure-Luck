import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Use relative paths in the production bundle so the game works when
  // hosted from a subdirectory (e.g. GitHub Pages). Without this, the built
  // HTML requests assets from the domain root and nothing renders.
  base: "./",
  plugins: [react()],
  test: {
    environment: "jsdom"
  }
});
