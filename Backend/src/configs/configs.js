//TURNERO\Backend\src\configs\configs.js
import dotenv from 'dotenv';

dotenv.config({path: './configs/.env'})

export default {
    PORT: process.env.PORT,
    URL_MONGO: process.env.URL_MONGO,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS,
}

