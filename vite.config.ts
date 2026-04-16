import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import { CONTACT } from "./src/contact";

// GitHub Pages: URL https://<user>.github.io/<repo>/
// O nome da pasta do repo tem de coincidir com este base (ex.: wes-portifolio).
export default defineConfig({
  base: "/BBS-Portfolio-main/",
  build: {
    chunkSizeWarningLimit: 1000,
  },
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "html-og-url-from-contact",
      transformIndexHtml(html) {
        return html.replace(
          /<meta property="og:url" content="[^"]*"\s*\/>/,
          `<meta property="og:url" content="https://${CONTACT.site}" />`,
        );
      },
    },
    {
      /** GitHub Pages: rotas client-side voltam a servir o app (evita 404 em refresh). */
      name: "gh-pages-spa-fallback",
      closeBundle() {
        const dist = path.resolve(__dirname, "dist");
        const indexHtml = path.join(dist, "index.html");
        if (!existsSync(indexHtml)) return;
        const html = readFileSync(indexHtml, "utf-8");
        writeFileSync(path.join(dist, "404.html"), html);
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    // HMR is disabled in AI Studio via DISABLE_HMR env var.
    // Do not modify — file watching is disabled to prevent flickering during agent edits.
    hmr: process.env.DISABLE_HMR !== "true",
    /** Evita que o browser sirva módulos antigos em cache ao dar F5 no dev server. */
    headers: {
      "Cache-Control": "no-store",
    },
  },
});
