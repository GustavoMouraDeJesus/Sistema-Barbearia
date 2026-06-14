const DEFAULT_API_URL = "http://127.0.0.1:8000";

function normalizeApiUrl(url: string) {
  return url.replace(/\/$/, "");
}

export const API_URL = normalizeApiUrl(
  import.meta.env.VITE_API_URL || DEFAULT_API_URL
);
