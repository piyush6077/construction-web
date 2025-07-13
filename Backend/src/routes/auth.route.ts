import express from 'express';
import { CreateUser, UserLogin } from '../controller/auth.controller.js';
const router = express.Router();

router.post('/signup', CreateUser)
router.post('login', UserLogin)

export default router;