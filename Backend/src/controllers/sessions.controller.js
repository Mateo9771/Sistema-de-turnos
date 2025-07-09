//TURNERO\Backend\src\controllers\sessions.controller.js
import usersDAO from '../services/dao/users.dao.js';
import usersDTO from '../services/dto/users.dto.js';
import { isValidPassword } from '../utils/password.js';
import { generateJWToken } from '../utils/jwt.js';
import { createHash } from '../utils/password.js';

const UsersDAO = new usersDAO(); 

export const register = async (req,res) => {
    try{
        console.log(req.body);
        const {first_name, last_name, email, phone, password, role, age} = req.body;

        if(!first_name || !last_name || !email || !phone || !password || !age) {
            return res.status(400).json({message:'Todos los campos son obligatorios'})
        }

        const existingUser = await UsersDAO.findByEmail(email);
        if(existingUser){
            return res.status(400).json({message:"El usuario ya existe"})
        }

        if(role === 'admin'){
            if(!req.user || req.user.role !== 'admin'){
                return res.status(403).json({message:"Solo el administrador puede crear usuarios admin"})
            }
        }

       
        const hashedPassword = createHash(password);

        const newUser = await UsersDAO.createUser({
        first_name,
        last_name,
        email,
        phone: Number(phone), // Convertir a número
        password: hashedPassword, // Usar el password hasheado
        age: Number(age), // Convertir a número para consistencia
        role: role || 'user'
        });

        return res.status(201).json({message:'Usuario registrado correctamente'})
    } catch (error){
        console.error(error);
        return res.status(500).json({message:"Error en el registro"})
    }
}

export const failRegister = async (req, res) => {
    res.status(401).send(({error: "Failed to process register"}))
}

export const login = async (req, res) => {
    const {email, password} = req.body;
    
    try{
        const user = await UsersDAO.findByEmail(email);
        
        if(!user) return res.status(401).json({message:"Usuario no encontrado"});

        if(!isValidPassword(user,password)){
            console.warn("Credenciales invalidas para:" +  email);
            return res.status(401).json({status:'error', error:"Credenciales invalidas"})
        }

        const tokenUser = new usersDTO(user);
        const  access_token = generateJWToken(tokenUser);

        res.cookie('JwtCookieToken', access_token, {
            httpOnly: true,
            secure: false,          // solo en entorno local
            sameSite: 'Lax'         // permite cookies cross-site básicas
        })

        if(user.role === 'admin') {
            return res.status(200).json({
                token: access_token,
                redirect: '/admin'
            })
        } else {
            return res.status(200).json({
                token:access_token,
                redirect:'/api/patient',
            })
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({status:"error", error: "Error interno del servidor"})
    }
}

export const logout = (req, res) => {
    res.clearCookie('JwtCookieToken');
    res.redirect('/api/usersViews/login');
}

export const getCurrent = (req, res) => {
    if(!req.user) {
        return res.status(401).json({message:"No autenticado"})
    }

    const safeUser = new usersDTO(req.user);
    res.status(200).json(safeUser)
}