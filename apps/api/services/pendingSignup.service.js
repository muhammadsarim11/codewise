import redis from "../utility/redis.js";

const TTL_SECONDS = 10 * 60; // matches the OTP's stated 10-minute lifetime
const MAX_ATTEMPTS = 5;
const key = (email) => `pending-signup:${email}`;

// Nothing is written to Postgres until the OTP is confirmed, so an abandoned
// signup just expires out of Redis instead of leaving an unverified user row
// behind (and never blocks that email from signing up again).
export const savePendingSignup = async (email, { name, bio, hashedPassword, otp }) => {
  await redis.set(
    key(email),
    JSON.stringify({ name, bio, hashedPassword, otp, attempts: 0 }),
    "EX",
    TTL_SECONDS
  );
};

export const getPendingSignup = async (email) => {
  const raw = await redis.get(key(email));
  return raw ? JSON.parse(raw) : null;
};

// Keeps the remaining TTL rather than resetting it, so a wrong guess can't be
// used to extend the code's lifetime indefinitely.
export const recordFailedAttempt = async (email, pending) => {
  const attempts = pending.attempts + 1;
  if (attempts >= MAX_ATTEMPTS) {
    await redis.del(key(email));
    return { attempts, locked: true };
  }
  const ttl = await redis.ttl(key(email));
  await redis.set(
    key(email),
    JSON.stringify({ ...pending, attempts }),
    "EX",
    ttl > 0 ? ttl : TTL_SECONDS
  );
  return { attempts, locked: false };
};

export const clearPendingSignup = async (email) => {
  await redis.del(key(email));
};

export { MAX_ATTEMPTS };
