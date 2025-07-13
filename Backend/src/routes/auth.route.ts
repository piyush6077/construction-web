import express from 'express';
import { CreateUser, getUserProfile, UserLogin, UserLogout } from '../controller/auth.controller.js';
import { protectedRoute } from '../middleware/auth.middleware.js';
const router = express.Router();

router.post('/signup', CreateUser)
router.post('/login', UserLogin)
router.post('logout', protectedRoute, UserLogout)
router.get('/profile', protectedRoute , getUserProfile)

export default router;