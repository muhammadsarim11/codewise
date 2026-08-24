import axios, {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://codewise-s80w.onrender.com'
    : 'http://localhost:5000');

/**
 * Shared API client. Callers should not set auth headers themselves — the
 * interceptor below attaches the session to every request.
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

const TOKEN_KEY = 'accessToken';

export const storeAccessToken = (token?: string | null) => {
  if (typeof window === 'undefined' || !token) return;
  window.localStorage.setItem(TOKEN_KEY, token);
};

/**
 * The API accepts either an httpOnly cookie or a bearer header, and both are
 * kept live on purpose. The cookie alone is not enough: the frontend (Vercel)
 * and the API (Render) are different sites, so its SameSite=None cookie is a
 * third-party cookie — blocked by default in Safari and Firefox, and on its way
 * out in Chrome. The bearer token is what keeps those browsers signed in.
 */
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window === 'undefined') return config;

  const token = window.localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

declare module 'axios' {
  export interface AxiosRequestConfig {
    /**
     * Suppresses the redirect to sign-in when the session turns out to be dead.
     * Set it on probes that run for anonymous visitors too — the landing page
     * asks who you are, and "nobody" is a valid answer there.
     */
    skipAuthRedirect?: boolean;
  }
}

type RetriableRequest = AxiosRequestConfig & { _retried?: boolean };

// A page can fire several requests at once, and all of them can 401 together.
// Without this, each would trigger its own refresh and the rotation would
// invalidate the others. Concurrent callers instead await one shared refresh.
let refreshInFlight: Promise<void> | null = null;

const refreshSession = async () => {
  if (!refreshInFlight) {
    refreshInFlight = axios
      .post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true })
      .then((res) => {
        // Rotation issues a new pair; the bearer copy has to follow the cookie
        // or the next request replays a token the API has already retired.
        storeAccessToken(res.data?.accessToken);
      })
      .finally(() => {
        refreshInFlight = null;
      });
  }

  return refreshInFlight;
};

export const clearLocalSession = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem('user');
};

export const readCachedUser = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem('user');
    return raw ? (JSON.parse(raw) as { name: string; email: string }) : null;
  } catch {
    return null;
  }
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableRequest | undefined;

    const isAuthCall =
      original?.url?.includes('/auth/refresh') ||
      original?.url?.includes('/signin') ||
      original?.url?.includes('/signup');

    if (error.response?.status !== 401 || !original || original._retried || isAuthCall) {
      return Promise.reject(error);
    }

    original._retried = true;

    try {
      await refreshSession();
      return api(original);
    } catch {
      // The refresh token is gone or already rotated: the session is over.
      clearLocalSession();
      if (
        typeof window !== 'undefined' &&
        !original.skipAuthRedirect &&
        !window.location.pathname.startsWith('/users/')
      ) {
        window.location.href = '/users/signin';
      }

      // Reject with the ORIGINAL 401, not the refresh failure. Callers decide
      // between "your session ended" and "the server is unreachable" by reading
      // the status, and surfacing the refresh error handed them the wrong one —
      // the deployed API answers /auth/refresh with 404, so an expired session
      // arrived looking like an outage.
      return Promise.reject(error);
    }
  }
);

/** Ends the session server-side, then clears whatever is left locally. */
export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch {
    // Logging out of an already-dead session is not a failure worth surfacing.
  } finally {
    clearLocalSession();
  }
};

export default api;
