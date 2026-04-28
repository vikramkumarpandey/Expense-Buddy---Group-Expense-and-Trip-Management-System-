import { Router } from 'express';
import { addExpense, getExpenses, getAnalysis } from '../controllers/expenseController.js';

const router = Router();
router.get('/', getExpenses);
router.post('/', addExpense);
router.get('/analysis', getAnalysis);

export default router;
