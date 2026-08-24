const isProd = () => process.env.NODE_ENV === "production";

// The JWT lifetimes these cookies carry. Keep them in step: a cookie that
// outlives its token leaves the browser sending credentials the API rejects.
export const ACCESS_TOKEN_TTL = "1d";
export const REFRESH_TOKEN_TTL = "7d";
export const ACCESS_TOKEN_MAX_AGE = 24 * 60 * 60 * 1000;
export const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

/**
 * In production the frontend (Vercel) and API (Render) sit on different sites,
 * so the cookie needs SameSite=None, which browsers only accept together with
 * Secure. Over plain http://localhost that pair is dropped silently, taking the
 * whole session with it, so local development needs Lax instead.
 *
 * The signal is the request's own protocol rather than NODE_ENV: the host has
 * already been caught serving without NODE_ENV set (see the CORS origin list,
 * deliberately independent of it for the same reason). `app.set('trust proxy')`
 * is what makes req.secure reflect x-forwarded-proto behind Render's proxy.
 */
const isSecureRequest = (req) => {
  if (req?.secure) return true;
  const forwarded = req?.headers?.["x-forwarded-proto"];
  if (typeof forwarded === "string" && forwarded.split(",")[0].trim() === "https") return true;
  // No request to inspect: fall back to the environment flag.
  return req ? false : isProd();
};

const baseOptions = (req) => {
  const secure = isSecureRequest(req);
  return {
    httpOnly: true,
    secure,
    sameSite: secure ? "none" : "lax",
    path: "/",
  };
};

export const accessCookieOptions = (req) => ({
  ...baseOptions(req),
  maxAge: ACCESS_TOKEN_MAX_AGE,
});

export const refreshCookieOptions = (req) => ({
  ...baseOptions(req),
  maxAge: REFRESH_TOKEN_MAX_AGE,
});

// clearCookie must be handed the same flags the cookie was written with,
// otherwise the browser keeps the original.
export const clearCookieOptions = (req) => baseOptions(req);
