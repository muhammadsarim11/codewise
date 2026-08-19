

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://codewise-s80w.onrender.com'
    : 'http://localhost:5000');