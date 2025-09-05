//TURNERO\Backend\src\services\dao\users.dao.js
import usersModel from '../models/users.model.js';
import mongoose from 'mongoose';
import logger from '../../utils/logger.js';

class UsersDAO {
  // Buscar usuario por email
  async findByEmail(email) {
    if (!email || typeof email !== 'string') {
      logger.error(`Email inválido: ${email}`);
      throw new Error('Email inválido');
    }
    logger.info(`Buscando usuario por email: ${email}`);
    const user = await usersModel.findOne({ email });
    if (!user) {
      logger.warn(`Usuario no encontrado para el email: ${email}`);
    }
    return user;
  }
  // Obtener todos los usuarios
  async getAllUsers() {
    logger.info('Obteniendo todos los usuarios desde el DAO');
    const users = await usersModel.find();
    logger.info(`Total de usuarios encontrados: ${users.length}`);
    return users;
  }
// Obtener usuario por ID
  async getUserById(uid) {
    if (!mongoose.Types.ObjectId.isValid(uid)) {
      logger.error(`ID de usuario inválido: ${uid}`);
      throw new Error('ID de usuario inválido');
    }
    logger.info(`Buscando usuario por ID: ${uid}`);
    const user = await usersModel.findById(uid);
    if (!user) {
      logger.warn(`Usuario no encontrado: ${uid}`);
    }
    return user;
  }
  // Crear un nuevo usuario
  async createUser(userData) {
    if (!userData.email || !userData.first_name || !userData.last_name || !userData.password || !userData.phone || !userData.age) {
      logger.error('Faltan campos obligatorios en los datos del usuario');
      throw new Error('Faltan campos obligatorios');
    }
    logger.info(`Creando usuario: ${JSON.stringify({ ...userData, password: '[REDACTED]' })}`);
    const user = new usersModel(userData);
    const newUser = await user.save();
    logger.info(`Usuario creado correctamente: ${newUser.email}`);
    return newUser;
  }
  // Actualizar usuario por ID
  async updateUser(uid, userData) {
    if (!mongoose.Types.ObjectId.isValid(uid)) {
      logger.error(`ID de usuario inválido: ${uid}`);
      throw new Error('ID de usuario inválido');
    }
    logger.info(`Actualizando usuario ${uid}: ${JSON.stringify({ ...userData, password: userData.password ? '[REDACTED]' : undefined })}`);
    const updatedUser = await usersModel.findByIdAndUpdate(uid, userData, { new: true });
    if (!updatedUser) {
      logger.warn(`Usuario no encontrado: ${uid}`);
    }
    return updatedUser;
  }
  // Eliminar usuario por ID
  async deleteUser(uid) {
    if (!mongoose.Types.ObjectId.isValid(uid)) {
      logger.error(`ID de usuario inválido: ${uid}`);
      throw new Error('ID de usuario inválido');
    }
    logger.info(`Eliminando usuario: ${uid}`);
    const deletedUser = await usersModel.findByIdAndDelete(uid);
    if (!deletedUser) {
      logger.warn(`Usuario no encontrado: ${uid}`);
    }
    return deletedUser;
  }
}

export default UsersDAO