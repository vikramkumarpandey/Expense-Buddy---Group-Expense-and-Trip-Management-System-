import { pool } from '../config/db.js';

export const getExpenses = async (req, res) => {
  try {
    const userId = req.user?.id || 1; // Use authenticated user if available, else default to 1
    
    const [rows] = await pool.query(
      'SELECT id, title, category, amount, expense_date, notes, transaction_type, payment_method FROM personal_expenses WHERE user_id = ? ORDER BY expense_date DESC, id DESC',
      [userId]
    );
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('❌ Get expenses error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch transactions', 
      error: error.message 
    });
  }
};

export const addExpense = async (req, res) => {
  try {
    const userId = req.user?.id || 1; // Use authenticated user if available, else default to 1
    const { title, category, amount, expense_date, notes, transaction_type, payment_method } = req.body;

    // Validation
    if (!title || !category || !amount || !expense_date) {
      return res.status(400).json({ 
        success: false,
        message: 'Title, category, amount and date are required' 
      });
    }

    if (amount <= 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Amount must be greater than 0' 
      });
    }

    const [result] = await pool.query(
      'INSERT INTO personal_expenses (user_id, title, category, amount, expense_date, notes, transaction_type, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, title, category, amount, expense_date, notes || null, transaction_type || 'expense', payment_method || null]
    );

    console.log(`✓ Expense added for user ${userId}`);

    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        title,
        category,
        amount,
        expense_date,
        notes: notes || null,
        transaction_type: transaction_type || 'expense',
        payment_method: payment_method || null
      }
    });
  } catch (error) {
    console.error('❌ Add expense error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to add transaction', 
      error: error.message 
    });
  }
};

export const getAnalysis = async (req, res) => {
  try {
    const userId = req.user?.id || 1; // Use authenticated user if available, else default to 1

    // Get total income and expense
    const [[incomeData]] = await pool.query(
      'SELECT COALESCE(SUM(amount), 0) AS total FROM personal_expenses WHERE user_id = ? AND transaction_type = "income"',
      [userId]
    );

    const [[expenseData]] = await pool.query(
      'SELECT COALESCE(SUM(amount), 0) AS total FROM personal_expenses WHERE user_id = ? AND transaction_type = "expense"',
      [userId]
    );

    const totalIncome = Number(incomeData.total);
    const totalExpense = Number(expenseData.total);
    const savings = totalIncome - totalExpense;

    // Get category breakdown for expenses only
    const [categoryData] = await pool.query(
      `SELECT 
        category, 
        COALESCE(SUM(amount), 0) AS total
      FROM personal_expenses 
      WHERE user_id = ? AND transaction_type = 'expense'
      GROUP BY category
      ORDER BY total DESC`,
      [userId]
    );

    const categoryBreakdown = categoryData.map((item) => ({
      category: item.category,
      total: Number(item.total)
    }));

    res.json({
      success: true,
      data: {
        totalIncome,
        totalExpense,
        savings,
        categoryBreakdown
      }
    });
  } catch (error) {
    console.error('❌ Get analysis error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to load analysis', 
      error: error.message 
    });
  }
};
