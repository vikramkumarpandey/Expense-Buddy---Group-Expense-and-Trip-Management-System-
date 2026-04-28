import express from 'express';
import { getSettlements, bulkUpdateSettlements, markPaid } from '../controllers/settlementController.js';

const router = express.Router();

router.get('/:tripId', getSettlements);
router.post('/bulk-update', bulkUpdateSettlements);
router.put('/:id/mark-paid', markPaid);

export default router;
