//TURNERO\Backend\src\utils\jwt.js
import jwt from 'jsonwebtoken';

export const PRIVATE_KEY = "TuClaveSecretaSuperSegura";

export const generateJWToken = (user) => {
  return jwt.sign({ user }, PRIVATE_KEY, { expiresIn: '1h' });
};

export const cookieExtractor = (req) => {
  const token = req?.cookies?.JwtCookieToken || null;
  console.log('Cookie extraída:', token);
  return token;
};