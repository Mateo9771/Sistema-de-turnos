//TURNERO\Backend\src\utils\password.js
import bcrypt from 'bcrypt';
import logger from './logger.js';

// validar password y generación token
export const createHash = (password) => {
    try {
        logger.info('Generando hash de contraseña');
        const hash = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
        logger.info('Hash de contraseña generado exitosamente');
        return hash;
    } catch (error) {
        logger.error(`Error al generar hash de contraseña: ${error.message}`);
        throw new Error('Error al generar hash de contraseña');
    }
};

//comparar los hashes
export const isValidPassword = (user, password) => {
    try {
        logger.info(`Validando contraseña para usuario: ${user.email} (ID: ${user.id})`);
        const isValid = bcrypt.compareSync(password, user.password);
        if (isValid) {
            logger.info(`Contraseña válida para usuario: ${user.email}`);
        } else {
            logger.warn(`Contraseña inválida para usuario: ${user.email}`);
        }
        return isValid;
    } catch (error) {
        logger.error(`Error al validar contraseña para usuario ${user.email}: ${error.message}`);
        throw new Error('Error al validar contraseña');
    }
};