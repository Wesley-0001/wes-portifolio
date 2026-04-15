/** Resolve ficheiros em `public/` com o `base` do Vite (ex.: GitHub Pages em subpath). */
export function assetUrl(path: string): string {
  const p = path.trim().replace(/^\/+/, "");
  const base = import.meta.env.BASE_URL;
  return base.endsWith("/") ? `${base}${p}` : `${base}/${p}`;
}
