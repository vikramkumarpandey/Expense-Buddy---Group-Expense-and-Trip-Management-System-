import express from 'express';
import {
  register,
  login,
  getCurrentUser,
  getProfile,
  updateProfile,
  logout
} from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes (require valid JWT token)
router.get('/me', authMiddleware, getCurrentUser);
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.post('/logout', authMiddleware, logout);

export default router;
