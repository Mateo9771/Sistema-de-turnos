//TURNERO\Backend\src\services\models\users.model.js
import mongoose from 'mongoose';

const collection = 'users';



const schema = new mongoose.Schema({
    first_name: {type: String, required: true},
    last_name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    age: {type: Number, required:true},
    phone:{type:Number, required:true},
    password: {
        type: String, 
        required: true,
    },
    role:{type: String, default:'user'},
    resetPasswordToken: {type: String, default: null},
    resetPasswordExpires: {type: Date }
})

const usersModel = mongoose.model(collection, schema);
export default usersModel;