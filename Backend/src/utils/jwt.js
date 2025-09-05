//TURNERO\Backend\src\utils\jwt.js
import jwt from 'jsonwebtoken';
import logger from './logger.js';

export const PRIVATE_KEY = "CoderS3cr3tC0d3";
// Genera un token JWT para un usuario
export const generateJWToken = (user) => {
    try {
        logger.info(`Generando token JWT para usuario: ${user.email} (ID: ${user.id})`);
        const token = jwt.sign({ user }, PRIVATE_KEY, { expiresIn: '1h' });
        logger.info(`Token JWT generado exitosamente para: ${user.email}`);
        return token;
    } catch (error) {
        logger.error(`Error al generar token JWT para ${user.email}: ${error.message}`);
        throw new Error('Error al generar token JWT');
    }
};
// Verifica y decodifica un token JWT
export const generateResetToken = (email) => {
    try {
        logger.info(`Generando token de restablecimiento para email: ${email}`);
        const token = jwt.sign({ email }, PRIVATE_KEY, { expiresIn: '15m' });
        logger.info(`Token de restablecimiento generado exitosamente para: ${email}`);
        return token;
    } catch (error) {
        logger.error(`Error al generar token de restablecimiento para ${email}: ${error.message}`);
        throw new Error('Error al generar token de restablecimiento');
    }
};
// Verifica y decodifica un token de restablecimiento
export const verifyResetToken = (token) => {
    try {
        logger.info(`Verificando token de restablecimiento: ${token.substring(0, 10)}...`);
        const decoded = jwt.verify(token, PRIVATE_KEY);
        logger.info(`Token de restablecimiento verificado exitosamente para email: ${decoded.email}`);
        return decoded;
    } catch (error) {
        logger.error(`Error al verificar token de restablecimiento: ${error.message}`);
        throw new Error('Token inválido o expirado');
    }
};
// Extrae el token JWT de las cookies de la solicitud
export const cookieExtractor = (req) => {
    const token = req?.cookies?.JwtCookieToken || null;
    if (token) {
        logger.info(`Cookie extraída: ${token.substring(0, 10)}...`);
    } else {
        logger.warn('No se encontró cookie JwtCookieToken');
    }
    return token;
};