//TURNERO\Backend\src\services\dao\users.dao.js
import usersModel from '../models/users.model.js';

class UsersDAO {
  async findByEmail(email) {
    return await usersModel.findOne({ email });
  }

  async getAllUsers() {
    return await usersModel.find();
  }

  async getUserById(uid) {
    return await usersModel.findById(uid);
  }

  async createUser(userData) {
    const user = new usersModel(userData);
    return await user.save();
  }

  async updateUser(uid, userData) {
    return await usersModel.findByIdAndUpdate(uid, userData, { new: true });
  }

  async deleteUser(uid) {
    return await usersModel.findByIdAndDelete(uid);
  }
}

export default UsersDAO