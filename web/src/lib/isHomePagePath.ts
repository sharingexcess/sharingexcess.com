/** True for `/`, `/index`, and `/index.html` (Astro file-format builds use the latter at SSR). */
export function isHomePagePath(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname === "/index" ||
    pathname === "/index.html"
  );
}
