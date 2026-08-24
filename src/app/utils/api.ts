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
 * Shared API client.
 *
 * The session lives in httpOnly cookies, so `withCredentials` is what actually
 * authenticates a request. Callers should not read tokens or set headers.
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

/**
 * Transitional: sessions created before the cookie migration only exist as a
 * bearer token in localStorage. Keep sending it while those are still alive —
 * the API accepts either. Remove once the access-token TTL has fully lapsed.
 */
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window === 'undefined') return config;

  const legacyToken = window.localStorage.getItem('accessToken');
  if (legacyToken && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${legacyToken}`;
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
      .then(() => undefined)
      .finally(() => {
        refreshInFlight = null;
      });
  }

  return refreshInFlight;
};

export const clearLocalSession = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem('accessToken');
  window.localStorage.removeItem('user');
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
    } catch (refreshError) {
      // The refresh token is gone or already rotated: the session is over.
      clearLocalSession();
      if (
        typeof window !== 'undefined' &&
        !original.skipAuthRedirect &&
        !window.location.pathname.startsWith('/users/')
      ) {
        window.location.href = '/users/signin';
      }
      return Promise.reject(refreshError);
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
