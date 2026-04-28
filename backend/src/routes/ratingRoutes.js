import { Router } from 'express';
import { getGlobalRatings, getGlobalTripRankings, getTripMemberRatings, getGlobalMembersRanking, getGlobalOrganisersRanking, submitRating, getTripsToRate } from '../controllers/ratingController.js';

const router = Router();

// Submit a rating
router.post('/', submitRating);

// User member rankings
router.get('/', getGlobalRatings);

// Get trips that need to be rated (completed trips user is a member of)
router.get('/to-rate', getTripsToRate);

// Trip rankings sorted by average ratings (descending)
router.get('/trips/rankings', getGlobalTripRankings);

// Individual trip specific member ratings
router.get('/trip/:tripId', getTripMemberRatings);

// Global Leaderboards
router.get('/global/members', getGlobalMembersRanking);
router.get('/global/organisers', getGlobalOrganisersRanking);

export default router;
