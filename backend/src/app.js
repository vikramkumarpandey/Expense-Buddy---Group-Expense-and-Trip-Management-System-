import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import tripRoutes from './routes/tripRoutes.js';
import ratingRoutes from './routes/ratingRoutes.js';
import settlementRoutes from './routes/settlementRoutes.js';
import { optionalAuthMiddleware } from './middleware/authMiddleware.js';

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Expense Buddy API running' });
});

// Auth routes (no middleware needed for login)
app.use('/api/auth', authRoutes);

// Admin routes (requires authentication and admin role)
app.use('/api/admin', adminRoutes);

// Apply optional auth middleware to all other routes
// This allows existing requests to work while also supporting authenticated requests
app.use('/api/dashboard', optionalAuthMiddleware, dashboardRoutes);
app.use('/api/expenses', optionalAuthMiddleware, expenseRoutes);
app.use('/api/budgets', optionalAuthMiddleware, budgetRoutes);
app.use('/api/trips', optionalAuthMiddleware, tripRoutes);
app.use('/api/ratings', optionalAuthMiddleware, ratingRoutes);
app.use('/api/settlements', optionalAuthMiddleware, settlementRoutes);

export default app;
