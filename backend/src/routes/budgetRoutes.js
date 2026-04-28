import { Router } from 'express';
import { 
  getBudgets, 
  getAvailableCategories, 
  addBudget, 
  updateBudget, 
  deleteBudget,
  bulkUpdateBudgets
} from '../controllers/budgetController.js';

const router = Router();

// GET specific routes first (before dynamic :id routes)
router.get('/available-categories', getAvailableCategories);
router.get('/', getBudgets);

// POST routes
router.post('/bulk-update', bulkUpdateBudgets);
router.post('/', addBudget);

// Dynamic ID routes last
router.put('/:id', updateBudget);
router.delete('/:id', deleteBudget);

export default router;
