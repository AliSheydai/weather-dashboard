const DEFAULT_PRIMARY_URL = "https://weather-dashboard-n85b.vercel.app";
const DEFAULT_SECONDARY_URL = "http://localhost:3001";

/**
 * Clean URL by removing trailing slashes.
 */
function cleanUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

/**
 * List of candidate API base URLs in priority order.
 * Priority 1: NEXT_PUBLIC_API_URL if defined, or https://weather-dashboard-n85b.vercel.app
 * Priority 2: http://localhost:3001
 */
function getCandidateUrls(): string[] {
  const envUrl = process.env.NEXT_PUBLIC_API_URL
    ? cleanUrl(process.env.NEXT_PUBLIC_API_URL)
    : null;

  const candidates: string[] = [];

  if (envUrl && envUrl !== DEFAULT_SECONDARY_URL) {
    candidates.push(envUrl);
  }

  candidates.push(cleanUrl(DEFAULT_PRIMARY_URL));
  candidates.push(cleanUrl(DEFAULT_SECONDARY_URL));

  // Deduplicate while preserving priority order
  return Array.from(new Set(candidates));
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
 * Automatically tries fallback candidate URLs if a network failure occurs.
 */
export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const activeUrl = await getApiUrl();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  try {
    return await fetch(`${activeUrl}${cleanPath}`, init);
  } catch (error) {
    // If request failed due to connection/network error, try fallback candidate URLs
    if (error instanceof TypeError || (error as Error)?.name === "AbortError") {
      for (const fallbackUrl of CANDIDATE_URLS) {
        if (fallbackUrl === activeUrl) continue;
        try {
          const fallbackRes = await fetch(`${fallbackUrl}${cleanPath}`, init);
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
