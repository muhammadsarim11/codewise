import jwt from 'jsonwebtoken'

export const generateToken = (idOrPayload, secret = process.env.JWT_SECRET, expiresIn = '7d') => {
  if (!secret) {
    throw new Error('JWT secret is required (set JWT_SECRET or pass a secret)');
  }

  const payload = typeof idOrPayload === 'object' ? idOrPayload : { id: idOrPayload };

  return jwt.sign(payload, secret, { expiresIn });
};