import { reactRouter } from "@react-router/dev/vite";
import autoprefixer from "autoprefixer";
import tailwindcss from "tailwindcss";
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import netlifyReactRouter from "@netlify/vite-plugin-react-router";
import netlify from "@netlify/vite-plugin";

export default defineConfig(() => {
  const isTest = Boolean(process.env.VITEST);
  return {
    css: {
      postcss: {
        plugins: [tailwindcss, autoprefixer],
      },
    },
    plugins: isTest
      ? [tsconfigPaths()]
      : [
          reactRouter(),
          tsconfigPaths(),
          netlifyReactRouter({ edge: true }),
          netlify(),
        ],
  };
});
