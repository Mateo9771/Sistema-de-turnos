import UsersDAO from "../services/dao/users.dao.js";
import UsersDTO from "../services/dto/users.dto.js";

const usersDAO = new UsersDAO();

export const getUsers = async (req, res) => {
  try {
    const users = await usersDAO.getAllUsers();
    const usersDTO = users.map(user => new UsersDTO(user));
    res.status(200).json({ status: 'success', payload: usersDTO });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await usersDAO.getUserById(req.params.uid);
    if (!user) return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });

    const userDTO = new UsersDTO(user);
    res.status(200).json({ status: 'success', payload: userDTO });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const newUser = await usersDAO.createUser(req.body);
    const userDTO = new UsersDTO(newUser);
    res.status(201).json({ status: 'success', payload: userDTO });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const updatedUser = await usersDAO.updateUser(req.params.uid, req.body);
    if (!updatedUser) return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });

    const userDTO = new UsersDTO(updatedUser);
    res.status(200).json({ status: 'success', payload: userDTO });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const deletedUser = await usersDAO.deleteUser(req.params.uid);
    if (!deletedUser) return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });

    res.status(200).json({ status: 'success', message: 'Usuario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
