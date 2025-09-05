//TURNERO\Backend\src\controllers\resetPassword.controller.js
import usersModel from "../services/models/users.model.js";
import {createHash} from '../utils/password.js';
import transporter from "../configs/nodemailer.config.js";
import crypto from 'crypto';
import config from '../configs/configs.js';
import logger from "../utils/logger.js";

export const requestPasswordReset = async (req, res) => {
    const { email } = req.body;

    try {
        logger.info(`Solicitud de restablecimiento de contraseña para el email: ${email}`);
        const user = await usersModel.findOne({ email });
        if(!user) {
            logger.warn(`Usuario no encontrado para el email: ${email}`);
            return res.status(404).json({message:  'Usuario no encontrado'})
        }

        // Generar token y establecer expiración (1 hora)
        const token = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hora en milisegundos
        await user.save();
        logger.info(`Token de restablecimiento generado para el usuario: ${user.email}, token: ${token}`);

        const resetUrl = `http://localhost:5173/reset-password/${token}`;
        const mailOptions = {
            from: config.EMAIL_USER,
            to: user.email,
            subject: 'Restablecimiento de contraseña',
            text: `Recibiste este correo porque solicitaste restablecer tu contraseña.\n\n
                   Haz clic en el siguiente enlace para restablecer tu contraseña:\n
                   ${resetUrl}\n\n
                   Si no solicitaste este cambio, ignora este correo.\n
                   El enlace expirará en 1 hora.`,
            html:  `
                <h3>Restablecimiento de contraseña</h3>
                <p>Recibiste este correo porque solicitaste restablecer tu contraseña.</p>
                <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
                <a href="${resetUrl}">Restablecer contraseña</a>
                <p>Si no solicitaste este cambio, ignora este correo.</p>
                <p>El enlace expirará en 1 hora.</p>
            `
        }
    await transporter.sendMail(mailOptions);
    logger.info(`Correo de restablecimiento enviado a: ${user.email}`);
    res.status(200).json({message: 'Correo de restablecimiento enviado'})
    } catch(error) {
        logger.error(`Error en requestPasswordReset: ${error.message}`);
        res.status(500).json({ message:'Error al procesar la solicitud'})
    }
}

export const resetPassword = async (req, res) => {
    const {token, newPassword} = req.body;

    try{
        logger.info(`Intento de restablecimiento de contraseña con token: ${token}`);

        const user = await usersModel.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now()}
        })

    if(!user){
        logger.warn(`Token inválido o expirado: ${token}`);
        return res.status(400).json({message: 'Token invalido o expirado'})
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if(!passwordRegex.test(newPassword)){
        logger.warn(`Contraseña inválida para el usuario: ${user.email}`);
        return res.status(400).json(
            {message:'La contraseña debe tener al menos 8 caracteres, incluyendo una letra mayúscula, una letra minúscula, un número y un carácter especial.'
            })
    }

    user.password = createHash(newPassword);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

    logger.info(`Contraseña restablecida correctamente para el usuario: ${user.email}`)
    res.status(200).json({ message: 'Contraseña restablecida correctamente'})
    } catch (error) {
        logger.error(`Error en resetPassword: ${error.message}\n${error.stack}`);
        res.status(500).json({message: 'Error al restablecer la contraseña'})
    }
}