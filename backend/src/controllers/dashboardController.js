import { pool } from '../config/db.js';

export const getDashboard = async (req, res) => {
  try {
    // Single-user mode
    const userId = req.user?.id || 1;

    // Get total income
    const [[incomeTotalRow]] = await pool.query(
      'SELECT COALESCE(SUM(amount), 0) AS total FROM personal_expenses WHERE user_id = ? AND transaction_type = "income"',
      [userId]
    );

    // Get total expense
    const [[expenseTotalRow]] = await pool.query(
      'SELECT COALESCE(SUM(amount), 0) AS total FROM personal_expenses WHERE user_id = ? AND transaction_type = "expense"',
      [userId]
    );

    const [[tripCountRow]] = await pool.query(
      'SELECT COUNT(*) AS total FROM trips WHERE status IN ("Planning", "Open to Join", "Confirmed")'
    );

    const [[budgetTotalRow]] = await pool.query(
      'SELECT COALESCE(SUM(monthly_limit), 0) AS total FROM budgets WHERE user_id = ?',
      [userId]
    );

    const [recentTransactions] = await pool.query(
      'SELECT id, title, category, amount, expense_date, transaction_type, payment_method FROM personal_expenses WHERE user_id = ? ORDER BY expense_date DESC LIMIT 5',
      [userId]
    );

    const totalIncome = Number(incomeTotalRow.total);
    const totalExpense = Number(expenseTotalRow.total);
    const balance = totalIncome - totalExpense;

    res.json({
      success: true,
      data: {
        totalIncome,
        totalExpense,
        balance,
        activeTrips: Number(tripCountRow.total),
        budgetTotal: Number(budgetTotalRow.total),
        savingsGoalPercent: budgetTotalRow.total > 0 ? Math.round((1 - totalExpense / budgetTotalRow.total) * 100) : 0,
        recentTransactions
      }
    });
  } catch (error) {
    console.error('❌ Dashboard error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to load dashboard', 
      error: error.message 
    });
  }
};
