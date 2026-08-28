/** Build-time Surplus API base URL for SSG fetches. */
export function getBuildTimeApiBaseUrl(): string {
  const fromEnv = import.meta.env.PUBLIC_API_SERVER_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  if (import.meta.env.DEV || process.env.SURPLUS_LOCAL_RUNTIME === "1") {
    return "http://localhost:8080";
  }

  return "https://api.sharingexcess.com";
}
