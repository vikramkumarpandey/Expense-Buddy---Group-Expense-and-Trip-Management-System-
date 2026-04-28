import { Router } from 'express';
import {
	getAdminDashboard,
	getAdminUsers,
	deleteAdminUser,
	getAdminTrips,
	deleteAdminTrip,
	getAdminMembers,
	deleteAdminMember
} from '../controllers/adminController.js';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(adminMiddleware);

// GET admin dashboard statistics
router.get('/dashboard', getAdminDashboard);
router.get('/users', getAdminUsers);
router.delete('/users/:id', deleteAdminUser);
router.get('/trips', getAdminTrips);
router.delete('/trips/:id', deleteAdminTrip);
router.get('/members', getAdminMembers);
router.delete('/members/:id', deleteAdminMember);

export default router;
