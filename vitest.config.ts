import autoprefixer from "autoprefixer";
import tailwindcss from "tailwindcss";
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
  plugins: [tsconfigPaths()],
  test: {
    include: [
      "{app,packages}/**/*.{test,spec}.{ts,tsx}",
    ],
    exclude: ["**/node_modules/**", "**/dist/**", "**/.{idea,git,cache}/**"],
    environment: "jsdom",
    globals: false,
    setupFiles: "./vitest.setup.ts",
  },
});
