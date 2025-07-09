//TURNERO\Backend\src\services\dao\users.dao.js
import usersModel from '../models/users.model.js';

class UsersDAO {
    async findByEmail (email) {
        return await usersModel.findOne({email});
    }

    async createUser(userData){
        const user = new usersModel(userData);
        return await user.save()
    }
    
}

export default UsersDAO