/** Build-time URL for the homepage impact map iframe embed. */
export function getImpactMapEmbedUrl(): string {
  const fromEnv = import.meta.env.PUBLIC_IMPACT_MAP_URL;
  const base =
    fromEnv?.replace(/\/$/, "") ??
    (import.meta.env.DEV || process.env.SURPLUS_LOCAL_RUNTIME === "1"
      ? "http://localhost:8084"
      : "https://map.sharingexcess.com");

  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}mapTheme=light-mono-green`;
}
