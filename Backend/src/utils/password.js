//TURNERO\Backend\src\utils\password.js
import bcrypt from 'bcrypt';

// validar password y generación token
export const createHash = (password) => bcrypt.hashSync(password, bcrypt.genSaltSync(10))

//comparar los hashes
export const isValidPassword = (user, password) => {
    console.log(`Datos a validar: user-password-DB: ${user.password}, password-Cliente: ${password}`);
    return bcrypt.compareSync(password, user.password);
}