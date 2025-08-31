//TURNERO\Backend\src\routes\resetPassword.router.js
import {Router} from 'express';
import { requestPasswordReset, resetPassword } from '../controllers/resetPassword.controller.js';

const router = Router();

router.post('/request', requestPasswordReset);
router.post('/reset', resetPassword);

export default router;