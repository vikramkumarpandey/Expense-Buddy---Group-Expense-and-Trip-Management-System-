import { Router } from 'express';
import {
  addTrip,
  deleteTrip,
  getSettlements,
  getTripAnalysis,
  getTrips,
  getTripExpenses,
  addTripExpense,
  getTripMembers,
  joinTrip,
  removeTripMember,
  updateTripStatus
} from '../controllers/tripController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// General trip routes
router.get('/', getTrips);
router.post('/', addTrip);
router.delete('/:tripId', authMiddleware, deleteTrip);

// Trip-specific routes (must be after general routes)
router.get('/:tripId/members', getTripMembers);
router.post('/:tripId/join', authMiddleware, joinTrip);
router.put('/:tripId/status', authMiddleware, updateTripStatus);
router.delete('/:tripId/members/:memberId', authMiddleware, removeTripMember);
router.get('/:tripId/expenses', getTripExpenses);
router.post('/:tripId/expenses', addTripExpense);
router.get('/:tripId/analysis', getTripAnalysis);
router.get('/:tripId/settlements', getSettlements);

export default router;
