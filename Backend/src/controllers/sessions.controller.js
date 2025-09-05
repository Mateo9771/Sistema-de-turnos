//TURNERO\Backend\src\controllers\sessions.controller.js
import usersDAO from '../services/dao/users.dao.js';
import usersDTO from '../services/dto/users.dto.js';
import { isValidPassword } from '../utils/password.js';
import { generateJWToken } from '../utils/jwt.js';
import { createHash } from '../utils/password.js';
import logger from '../utils/logger.js';

const UsersDAO = new usersDAO(); 

// Controlador para el registro de usuarios
export const register = async (req,res) => {
    try{
        logger.info(`Datos recibidos para registro: ${JSON.stringify(req.body)}`);
        const {first_name, last_name, email, phone, password, role, age} = req.body;

        if(!first_name || !last_name || !email || !phone || !password || !age) {
            logger.warn('Faltan campos obligatorios en el registro');
            return res.status(400).json({message:'Todos los campos son obligatorios'})
        }

        const existingUser = await UsersDAO.findByEmail(email);
        if(existingUser){
            logger.warn(`El usuario ya existe con el email: ${email}`);
            return res.status(400).json({message:"El usuario ya existe"})
        }

        if(role === 'admin'){
            if(!req.user || req.user.role !== 'admin'){
                logger.warn(`Intento no autorizado de crear un usuario admin por: ${req.user ? req.user.email : 'usuario no autenticado'}`);
                return res.status(403).json({message:"Solo el administrador puede crear usuarios admin"})
            }
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if(!passwordRegex.test(password)){
            logger.warn(`Contraseña inválida para el email: ${email}`);
            return res.status(400).json(
                {message:'La contraseña debe tener al menos 8 caracteres, incluyendo una letra mayúscula, una letra minúscula, un número y un carácter especial.'
                })
        }

       
        const hashedPassword = createHash(password);

        const newUser = await UsersDAO.createUser({
        first_name,
        last_name,
        email,
        phone: Number(phone), 
        password: hashedPassword, 
        age: Number(age), 
        role: role || 'user'
        });

        logger.info(`Usuario registrado correctamente: ${email}`);
        return res.status(201).json({message:'Usuario registrado correctamente'})
    } catch (error){
        logger.error(`Error en el registro: ${error.message}`);
        return res.status(500).json({message:"Error en el registro"})
    }
}

// Controlador para manejar fallos en el registro
export const failRegister = async (req, res) => {
    logger.error('Error en el proceso de registro');
    res.status(401).send(({error: "Error al procesar registro"}))
}

// Controlador para el login
export const login = async (req, res) => {
    const {email, password} = req.body;
    
    try{
        logger.info(`Intento de login para el email: ${email}`);
        const user = await UsersDAO.findByEmail(email);
        
        if(!user){
            logger.warn(`Usuario no encontrado para el email: ${email}`);
            return res.status(401).json({message:"Usuario no encontrado"});
        } 

        if(!isValidPassword(user,password)){
            logger.warn(`Contraseña inválida para el email: ${email}`);
            return res.status(401).json({status:'error', error:"Credenciales invalidas"})
        }

        const tokenUser = new usersDTO(user);
        const access_token = generateJWToken(tokenUser);

        res.cookie('JwtCookieToken', access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',          
            sameSite: 'Lax'      
        })

         logger.info(`Login exitoso para email: ${email}, rol: ${user.role}`);
    return res.status(200).json({
      token: access_token,
      role: user.role, // Incluir role siempre
      redirect: user.role === 'admin' ? '/admin' : '/home', // Cambiar /api/patient por /home
    });
    } catch (error) {
        logger.error(`Error en el login: ${error.message}`);
        res.status(500).json({status:"error", error: "Error interno del servidor"})
    }
}

// Controlador para cerrar sesión
export const logout = (req, res) => {
    res.clearCookie('JwtCookieToken',{
        httpOnly: true,
        secure: false,
        sameSite: 'Lax'
    });
    logger.info(`Usuario ${req.user ? req.user.email : 'desconocido'} ha cerrado sesión`);
    res.status(200).json({ message: 'Sesión cerrada correctamente' });
}

// Controlador para obtener el usuario actual
export const getCurrent = (req, res) => {
    try {
        if (!req.user) {
            logger.warn(`Intento de acceso a /current sin autenticación. Cookies: ${JSON.stringify(req.cookies)}, Headers: ${JSON.stringify(req.headers.authorization)}`);
            return res.status(401).json({ message: "No autenticado" });
        }

        logger.info(`Usuario autenticado en /current: ${req.user.email} (ID: ${req.user.id})`);
        const safeUser = new usersDTO(req.user);
        res.status(200).json({...safeUser, role: req.user.role});
    } catch (error) {
        logger.error(`Error en getCurrent: ${error.message}`);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

