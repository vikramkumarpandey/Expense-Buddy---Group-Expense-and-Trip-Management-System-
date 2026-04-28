import { pool } from '../config/db.js';

// All categories available in the app
const ALL_CATEGORIES = [
  'Food', 'Transport', 'Entertainment', 'Shopping', 'Clothes', 'Education',
  'Stationary', 'Rent', 'Recharge', 'Groceries', 'Fruits & Vegetables',
  'Fitness', 'Travel', 'Other'
];

export const getBudgets = async (req, res) => {
  try {
    const userId = req.user?.id || 1;

    const [budgets] = await pool.query(
      'SELECT id, category, monthly_limit FROM budgets WHERE user_id = ? ORDER BY category',
      [userId]
    );

    // For each budget, get the spent amount
    const budgetsWithSpent = await Promise.all(
      budgets.map(async (budget) => {
        const [[spending]] = await pool.query(
          `SELECT COALESCE(SUM(amount), 0) AS spent 
           FROM personal_expenses 
           WHERE user_id = ? AND category = ? AND transaction_type = 'expense'`,
          [userId, budget.category]
        );

        return {
          id: budget.id,
          category: budget.category,
          monthly_limit: Number(budget.monthly_limit),
          spent: Number(spending.spent),
          remaining: Number(budget.monthly_limit) - Number(spending.spent),
          usedPercent: budget.monthly_limit > 0 
            ? Math.round((Number(spending.spent) / Number(budget.monthly_limit)) * 100) 
            : 0
        };
      })
    );

    res.json({
      success: true,
      data: budgetsWithSpent
    });
  } catch (error) {
    console.error('❌ Get budgets error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch budgets', 
      error: error.message 
    });
  }
};

export const getAvailableCategories = async (req, res) => {
  try {
    const userId = req.user?.id || 1;

    // Get categories already used in budgets
    const [usedCategories] = await pool.query(
      'SELECT category FROM budgets WHERE user_id = ?',
      [userId]
    );

    const usedCats = usedCategories.map((row) => row.category);

    // Return categories not yet used
    const available = ALL_CATEGORIES.filter((cat) => !usedCats.includes(cat));

    res.json({ 
      success: true,
      data: { available } 
    });
  } catch (error) {
    console.error('❌ Get available categories error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch available categories', 
      error: error.message 
    });
  }
};

export const addBudget = async (req, res) => {
  try {
    const userId = req.user?.id || 1;
    const { category, monthly_limit } = req.body;

    // Validation
    if (!category || !monthly_limit) {
      return res.status(400).json({ 
        success: false,
        message: 'Category and monthly_limit are required' 
      });
    }

    if (monthly_limit <= 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Monthly limit must be greater than 0' 
      });
    }

    // Check if category already has a budget
    const [[existing]] = await pool.query(
      'SELECT id FROM budgets WHERE user_id = ? AND category = ?',
      [userId, category]
    );

    if (existing) {
      return res.status(400).json({ 
        success: false,
        message: `Budget already exists for ${category}` 
      });
    }

    const [result] = await pool.query(
      'INSERT INTO budgets (user_id, category, monthly_limit) VALUES (?, ?, ?)',
      [userId, category, monthly_limit]
    );

    console.log(`✓ Budget added for user ${userId}`);

    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        category,
        monthly_limit: Number(monthly_limit),
        spent: 0,
        remaining: Number(monthly_limit),
        usedPercent: 0
      }
    });
  } catch (error) {
    console.error('❌ Add budget error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to add budget', 
      error: error.message 
    });
  }
};

export const updateBudget = async (req, res) => {
  try {
    const userId = req.user?.id || 1;
    const { id } = req.params;
    const { monthly_limit } = req.body;

    // Validation
    if (!monthly_limit) {
      return res.status(400).json({ 
        success: false,
        message: 'Monthly limit is required' 
      });
    }

    if (monthly_limit <= 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Monthly limit must be greater than 0' 
      });
    }

    // Verify budget belongs to user
    const [[budget]] = await pool.query(
      'SELECT id, category FROM budgets WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (!budget) {
      return res.status(404).json({ 
        success: false,
        message: 'Budget not found' 
      });
    }

    await pool.query(
      'UPDATE budgets SET monthly_limit = ? WHERE id = ?',
      [monthly_limit, id]
    );

    // Get spending info
    const [[spending]] = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS spent 
       FROM personal_expenses 
       WHERE user_id = ? AND category = ? AND transaction_type = 'expense'`,
      [userId, budget.category]
    );

    const spent = Number(spending.spent);

    console.log(`✓ Budget updated for user ${userId}`);

    res.json({
      success: true,
      data: {
        id,
        category: budget.category,
        monthly_limit: Number(monthly_limit),
        spent,
        remaining: Number(monthly_limit) - spent,
        usedPercent: monthly_limit > 0 
          ? Math.round((spent / Number(monthly_limit)) * 100) 
          : 0
      }
    });
  } catch (error) {
    console.error('❌ Update budget error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update budget', 
      error: error.message 
    });
  }
};

export const deleteBudget = async (req, res) => {
  try {
    const userId = req.user?.id || 1;
    const { id } = req.params;

    // Verify budget belongs to user
    const [[budget]] = await pool.query(
      'SELECT id FROM budgets WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (!budget) {
      return res.status(404).json({ 
        success: false,
        message: 'Budget not found' 
      });
    }

    await pool.query('DELETE FROM budgets WHERE id = ?', [id]);

    console.log(`✓ Budget deleted for user ${userId}`);

    res.json({ 
      success: true,
      message: 'Budget deleted successfully' 
    });
  } catch (error) {
    console.error('❌ Delete budget error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete budget', 
      error: error.message 
    });
  }
};

export const bulkUpdateBudgets = async (req, res) => {
  try {
    const userId = req.user?.id || 1;
    const { budgets: budgetsList } = req.body;

    // Validation
    if (!Array.isArray(budgetsList) || budgetsList.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Empty budget list' 
      });
    }

    // Validate all budgets before processing
    for (const budget of budgetsList) {
      if (!budget.category || !budget.monthly_limit) {
        return res.status(400).json({ 
          success: false,
          message: 'Each budget must have category and monthly_limit' 
        });
      }
      if (budget.monthly_limit <= 0) {
        return res.status(400).json({ 
          success: false,
          message: `Monthly limit must be > 0 for ${budget.category}` 
        });
      }
    }

    // Process each budget using INSERT ... ON DUPLICATE KEY UPDATE
    for (const budget of budgetsList) {
      await pool.query(
        `INSERT INTO budgets (user_id, category, monthly_limit) 
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE monthly_limit = VALUES(monthly_limit)`,
        [userId, budget.category, budget.monthly_limit]
      );
    }

    // Return updated budgets
    const [updatedBudgets] = await pool.query(
      'SELECT id, category, monthly_limit FROM budgets WHERE user_id = ? ORDER BY category',
      [userId]
    );

    const budgetsWithSpent = await Promise.all(
      updatedBudgets.map(async (budget) => {
        const [[spending]] = await pool.query(
          `SELECT COALESCE(SUM(amount), 0) AS spent 
           FROM personal_expenses 
           WHERE user_id = ? AND category = ? AND transaction_type = 'expense'`,
          [userId, budget.category]
        );

        return {
          id: budget.id,
          category: budget.category,
          monthly_limit: Number(budget.monthly_limit),
          spent: Number(spending.spent),
          remaining: Number(budget.monthly_limit) - Number(spending.spent),
          usedPercent: budget.monthly_limit > 0 
            ? Math.round((Number(spending.spent) / Number(budget.monthly_limit)) * 100) 
            : 0
        };
      })
    );

    console.log(`✓ Bulk budgets updated for user ${userId}`);

    res.json({
      success: true,
      data: budgetsWithSpent
    });
  } catch (error) {
    console.error('❌ Bulk update budgets error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update budgets', 
      error: error.message 
    });
  }
};
