const DEFAULT_REMOTE_URL = "https://weather-dashboard-n85b.vercel.app";
const DEFAULT_LOCAL_URL = "http://localhost:3001";

/**
 * Clean URL by removing trailing slashes.
 */
function cleanUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

/**
 * List of candidate API base URLs in priority order.
 *
 * - In local/dev mode: ONLY try localhost:3001 (or NEXT_PUBLIC_API_URL if set).
 *   We intentionally do NOT fall back to the remote Vercel URL in dev, because
 *   that deployed instance may be running older code without the new endpoints.
 * - In production: use NEXT_PUBLIC_API_URL or the remote URL.
 */
function getCandidateUrls(): string[] {
  const envUrl = process.env.NEXT_PUBLIC_API_URL
    ? cleanUrl(process.env.NEXT_PUBLIC_API_URL)
    : null;

  if (envUrl) {
    return [envUrl];
  }

  const isLocalDev =
    (typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1")) ||
    process.env.NODE_ENV === "development";

  if (isLocalDev) {
    // Only use local backend — never silently fallback to old deployed code
    return [cleanUrl(DEFAULT_LOCAL_URL)];
  }

  return [cleanUrl(DEFAULT_REMOTE_URL)];
}

const CANDIDATE_URLS = getCandidateUrls();

let currentWorkingUrl: string = CANDIDATE_URLS[0];
let isChecked = false;
let checkPromise: Promise<string> | null = null;

/**
 * Pings /health endpoint of a given candidate base URL with a timeout.
 */
async function checkHealth(baseUrl: string, timeoutMs = 2500): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    const res = await fetch(`${baseUrl}/health`, {
      method: "GET",
      signal: controller.signal,
      headers: { Accept: "application/json" },
      credentials: "include",
    });
    
    clearTimeout(timeoutId);
    return res.ok || res.status < 500;
  } catch {
    return false;
  }
}

/**
 * Checks candidate URLs in priority order and returns the first reachable API URL.
 */
export async function getApiUrl(): Promise<string> {
  if (isChecked) {
    return currentWorkingUrl;
  }
  if (checkPromise) {
    return checkPromise;
  }

  checkPromise = (async () => {
    for (const url of CANDIDATE_URLS) {
      const isHealthy = await checkHealth(url);
      if (isHealthy) {
        currentWorkingUrl = url;
        isChecked = true;
        checkPromise = null;
        return url;
      }
    }
    // If none respond to health check, default to top priority candidate
    currentWorkingUrl = CANDIDATE_URLS[0];
    isChecked = true;
    checkPromise = null;
    return currentWorkingUrl;
  })();

  return checkPromise;
}

/**
 * Returns current API URL synchronously.
 */
export function getApiUrlSync(): string {
  return currentWorkingUrl;
}

/**
 * Wrapper for fetch that uses the active working API URL.
 * Always sends credentials (cookies) so the HttpOnly auth_token cookie
 * is included in every request — this is how cookie-based auth works.
 * Automatically tries fallback candidate URLs if a network failure occurs.
 */
export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const activeUrl = await getApiUrl();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  // Always include credentials so the browser sends the auth_token cookie
  const requestInit: RequestInit = {
    ...init,
    credentials: "include",
  };

  try {
    return await fetch(`${activeUrl}${cleanPath}`, requestInit);
  } catch (error) {
    // If request failed due to connection/network error, try fallback candidate URLs
    if (error instanceof TypeError || (error as Error)?.name === "AbortError") {
      for (const fallbackUrl of CANDIDATE_URLS) {
        if (fallbackUrl === activeUrl) continue;
        try {
          const fallbackRes = await fetch(`${fallbackUrl}${cleanPath}`, requestInit);
          // If fallback URL responds, update working URL for future requests
          currentWorkingUrl = fallbackUrl;
          return fallbackRes;
        } catch {
          // Continue to next fallback
        }
      }
    }
    throw error;
  }
}

