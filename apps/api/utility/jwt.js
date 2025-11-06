import jwt from 'jsonwebtoken';

export const generateToken = (payload, secret, options) => {
  if (!secret) throw new Error('Secret key is required');
  return jwt.sign(payload, secret, options);
};