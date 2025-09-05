import UsersDAO from "../services/dao/users.dao.js";
import UsersDTO from "../services/dto/users.dto.js";
import logger from "../utils/logger.js";
import mongoose from "mongoose";

const usersDAO = new UsersDAO();
// Controlador para obtener todos los usuarios
export const getUsers = async (req, res) => {
  try {
    logger.info('Obteniendo todos los usuarios');
    const users = await usersDAO.getAllUsers();
    logger.info(`Total de usuarios encontrados: ${users.length}`);
    const usersDTO = users.map(user => new UsersDTO(user));
    res.status(200).json({ status: 'success', payload: usersDTO });
  } catch (error) {
    logger.error(`Error al obtener usuarios: ${error.message}`);
    res.status(500).json({ status: 'error', message: error.message });
  }
};
// Controlador para obtener un usuario por ID
export const getUserById = async (req, res) => {
    try {
        const { uid } = req.params;
        if (!mongoose.Types.ObjectId.isValid(uid)) {
            logger.warn(`ID de usuario inválido: ${uid}`);
            return res.status(400).json({ status: 'error', message: 'ID de usuario inválido' });
        }
        logger.info(`Obteniendo usuario por ID: ${uid}`);
        const user = await usersDAO.getUserById(uid);
        if (!user) {
            logger.warn(`Usuario no encontrado: ${uid}`);
            return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
        }
        const userDTO = new UsersDTO(user);
        logger.info(`Usuario encontrado: ${user.email}`);
        res.status(200).json({ status: 'success', payload: userDTO });
    } catch (error) {
        logger.error(`Error al obtener usuario por ID ${req.params.uid}: ${error.message}`);
        res.status(500).json({ status: 'error', message: error.message });
    }
};
// Controlador para crear un nuevo usuario
export const createUser = async (req, res) => {
    try {
        logger.info(`Solicitud para crear usuario: ${JSON.stringify(req.body)}`);
        const { first_name, last_name, email, phone, password, role, age } = req.body;

        if (!first_name || !last_name || !email || !phone || !password || !age) {
            logger.warn('Faltan campos obligatorios en la solicitud de creación de usuario');
            return res.status(400).json({ status: 'error', message: 'Todos los campos son obligatorios' });
        }

        const newUser = await usersDAO.createUser(req.body);
        const userDTO = new UsersDTO(newUser);
        logger.info(`Usuario creado correctamente: ${newUser.email}`);
        res.status(201).json({ status: 'success', payload: userDTO });
    } catch (error) {
        logger.error(`Error al crear usuario: ${error.message}`);
        res.status(500).json({ status: 'error', message: error.message });
    }
};
// Controlador para actualizar un usuario por ID
export const updateUser = async (req, res) => {
    try {
        const { uid } = req.params;
        if (!mongoose.Types.ObjectId.isValid(uid)) {
            logger.warn(`ID de usuario inválido: ${uid}`);
            return res.status(400).json({ status: 'error', message: 'ID de usuario inválido' });
        }
        logger.info(`Solicitud para actualizar usuario ${uid}: ${JSON.stringify(req.body)}`);
        const updatedUser = await usersDAO.updateUser(uid, req.body);
        if (!updatedUser) {
            logger.warn(`Usuario no encontrado: ${uid}`);
            return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
        }
        const userDTO = new UsersDTO(updatedUser);
        logger.info(`Usuario actualizado correctamente: ${updatedUser.email}`);
        res.status(200).json({ status: 'success', payload: userDTO });
    } catch (error) {
        logger.error(`Error al actualizar usuario ${req.params.uid}: ${error.message}`);
        res.status(500).json({ status: 'error', message: error.message });
    }
};
// Controlador para eliminar un usuario por ID
export const deleteUser = async (req, res) => {
    try {
        const { uid } = req.params;
        if (!mongoose.Types.ObjectId.isValid(uid)) {
            logger.warn(`ID de usuario inválido: ${uid}`);
            return res.status(400).json({ status: 'error', message: 'ID de usuario inválido' });
        }
        logger.info(`Solicitud para eliminar usuario: ${uid}`);
        const deletedUser = await usersDAO.deleteUser(uid);
        if (!deletedUser) {
            logger.warn(`Usuario no encontrado: ${uid}`);
            return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
        }
        logger.info(`Usuario eliminado correctamente: ${deletedUser.email}`);
        res.status(200).json({ status: 'success', message: 'Usuario eliminado correctamente' });
    } catch (error) {
        logger.error(`Error al eliminar usuario ${req.params.uid}: ${error.message}`);
        res.status(500).json({ status: 'error', message: error.message });
    }
};
