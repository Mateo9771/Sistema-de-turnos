//TURNERO\Backend\src\routes\sessions.router.js
import {Router} from 'express';
import { register, failRegister, login, logout, getCurrent } from '../controllers/sessions.controller.js';
import {passportCall, authorization} from '../middlewares/auth.js'

const router = Router();

router.post('/register', register);

router.post('/login', login);

router.get('/logout', logout);

router.get('/current', passportCall('jwt'), getCurrent);

router.get('/failRegister', failRegister)


export default router