//TURNERO\Backend\src\utils\jwt.js
import jwt from 'jsonwebtoken';

export const PRIVATE_KEY = "CoderS3cr3tC0d3";

export const generateJWToken = (user) => {
  return jwt.sign({ user }, PRIVATE_KEY, { expiresIn: '1h' });
};

export const generateResetToken = (email) => {
  return jwt.sign({ email}, PRIVATE_KEY, { expiresIn: '15m' });
}

export const verifyResetToken = (token) =>{
  try {
    return jwt.verify(token, PRIVATE_KEY);
  } catch (error) {
    throw new Error('Token inválido o expirado');
}
}

export const cookieExtractor = (req) => {
  const token = req?.cookies?.JwtCookieToken || null;
  console.log('Cookie extraída:', token);
  return token;
};