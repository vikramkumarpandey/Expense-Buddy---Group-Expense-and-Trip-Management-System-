import { pool } from '../config/db.js';

const runInTransaction = async (callback) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Get global dashboard statistics for admins
 * Shows aggregated data across entire system
 */
export const getAdminDashboard = async (req, res) => {
  try {
    // Verify user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // Get total number of users
    const [[userCount]] = await pool.query(
      'SELECT COUNT(*) as total FROM users'
    );

    // Get total number of trips
    const [[tripCount]] = await pool.query(
      'SELECT COUNT(*) as total FROM trips'
    );

    // Get trip count by status
    const [tripsByStatus] = await pool.query(
      `SELECT status, COUNT(*) as count FROM trips GROUP BY status`
    );

    // Get total members (unique participants)
    const [[memberCount]] = await pool.query(
      'SELECT COUNT(DISTINCT user_id) as total FROM trip_members'
    );

    // Get total expenses across all trips
    const [[totalTripExpenses]] = await pool.query(
      'SELECT COALESCE(SUM(amount), 0) as total FROM trip_expenses'
    );

    // Get total personal expenses
    const [[totalPersonalExpenses]] = await pool.query(
      'SELECT COALESCE(SUM(amount), 0) as total FROM personal_expenses WHERE transaction_type = "expense"'
    );

    // Get total trip budgets
    const [[totalTripBudgets]] = await pool.query(
      'SELECT COALESCE(SUM(budget), 0) as total FROM trips'
    );

    // Get top 5 most active users
    const [topUsers] = await pool.query(
      `SELECT u.id, u.name, u.email, COUNT(DISTINCT tm.trip_id) as trip_count
       FROM users u
       LEFT JOIN trip_members tm ON u.id = tm.user_id
       GROUP BY u.id, u.name, u.email
       ORDER BY trip_count DESC
       LIMIT 5`
    );

    // Get top rated user
    const [[topRatedUser]] = await pool.query(
      `SELECT rated_user_id, 
              ROUND(AVG((behavior_score + teamwork_score + reliability_score) / 3), 2) as avg_rating,
              COUNT(*) as rating_count
       FROM trip_ratings
       GROUP BY rated_user_id
       ORDER BY avg_rating DESC
       LIMIT 1`
    );

    // Get pending settlements count
    const [[pendingSettlements]] = await pool.query(
      'SELECT COUNT(*) as total FROM settlements WHERE status = "pending"'
    );

    // Get most expensive trip
    const [[mostExpensiveTrip]] = await pool.query(
      `SELECT t.id, t.title, t.destination,
              COALESCE(SUM(te.amount), 0) as total_spent, 
              t.budget
       FROM trips t
       LEFT JOIN trip_expenses te ON t.id = te.trip_id
       GROUP BY t.id, t.title, t.destination, t.budget
       ORDER BY total_spent DESC
       LIMIT 1`
    );

    // Compile status breakdown
    const statusBreakdown = {};
    tripsByStatus.forEach(row => {
      statusBreakdown[row.status] = row.count;
    });

    const totalTrips = Number(tripCount.total);
    const completedTrips = statusBreakdown['Completed'] || 0;
    const activeTrips = (statusBreakdown['Planning'] || 0) + (statusBreakdown['Open to Join'] || 0) + (statusBreakdown['Confirmed'] || 0);

    res.json({
      success: true,
      data: {
        // Core metrics
        totalUsers: Number(userCount.total),
        totalTrips,
        totalMembers: Number(memberCount.total),
        totalTripExpenses: Number(totalTripExpenses.total),
        totalPersonalExpenses: Number(totalPersonalExpenses.total),
        totalExpenses: Number(totalTripExpenses.total) + Number(totalPersonalExpenses.total),
        totalBudgets: Number(totalTripBudgets.total),
        
        // Trip breakdown
        completedTrips,
        activeTrips,
        statusBreakdown,
        
        // Advanced metrics
        topUsers: topUsers.map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          tripCount: Number(u.trip_count)
        })),
        topRatedUser: topRatedUser ? {
          userId: topRatedUser.rated_user_id,
          avgRating: Number(topRatedUser.avg_rating),
          ratingCount: Number(topRatedUser.rating_count)
        } : null,
        pendingSettlements: Number(pendingSettlements.total),
        mostExpensiveTrip: mostExpensiveTrip ? {
          id: mostExpensiveTrip.id,
          title: mostExpensiveTrip.title,
          destination: mostExpensiveTrip.destination,
          totalSpent: Number(mostExpensiveTrip.total_spent),
          budget: Number(mostExpensiveTrip.budget)
        } : null
      }
    });
  } catch (error) {
    console.error('❌ Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load admin dashboard',
      error: error.message
    });
  }
};

export const getAdminUsers = async (req, res) => {
  try {
    console.log('[admin] GET /admin/users requested by user:', req.user?.id);
    const [rows] = await pool.query(
      `SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        u.gender,
        u.city,
        u.state,
        u.country,
        u.created_at,
        COUNT(DISTINCT tm.trip_id) AS trip_count,
        COUNT(DISTINCT tr.id) AS rating_count
       FROM users u
       LEFT JOIN trip_members tm ON tm.user_id = u.id
       LEFT JOIN trip_ratings tr ON tr.rated_user_id = u.id
       GROUP BY u.id, u.name, u.email, u.role, u.gender, u.city, u.state, u.country, u.created_at
       ORDER BY u.created_at DESC, u.id DESC`
    );

    const data = rows.map((row) => ({
      ...row,
      trip_count: Number(row.trip_count),
      rating_count: Number(row.rating_count)
    }));

    console.log('[admin] GET /admin/users rows:', data.length);
    res.json({ success: true, data });
  } catch (error) {
    console.error('❌ Get admin users error:', error);
    res.status(500).json({ success: false, message: 'Failed to load users', error: error.message });
  }
};

export const deleteAdminUser = async (req, res) => {
  try {
    const userId = Number(req.params.id);

    await runInTransaction(async (connection) => {
      await connection.query('DELETE FROM trip_ratings WHERE rated_user_id = ? OR reviewer_user_id = ?', [userId, userId]);
      await connection.query('DELETE FROM trip_expenses WHERE paid_by_user_id = ?', [userId]);
      await connection.query('DELETE FROM settlements WHERE from_user_id = ? OR to_user_id = ?', [userId, userId]);
      await connection.query('DELETE FROM trip_members WHERE user_id = ?', [userId]);
      await connection.query('DELETE FROM trips WHERE created_by = ?', [userId]);
      await connection.query('DELETE FROM users WHERE id = ?', [userId]);
    });

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('❌ Delete admin user error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete user', error: error.message });
  }
};

export const getAdminTrips = async (req, res) => {
  try {
    console.log('[admin] GET /admin/trips requested by user:', req.user?.id);
    const [rows] = await pool.query(
      `SELECT 
        t.id,
        t.title,
        t.destination,
        t.budget,
        t.start_date,
        t.end_date,
        t.status,
        t.created_by,
        creator.name AS created_by_name,
        t.min_age,
        t.max_age,
        t.required_college,
        t.preferred_gender,
        t.required_travel_style,
        (SELECT COUNT(*) FROM trip_members tm WHERE tm.trip_id = t.id) AS member_count,
        (SELECT COALESCE(SUM(amount), 0) FROM trip_expenses te WHERE te.trip_id = t.id) AS total_expense
       FROM trips t
       LEFT JOIN users creator ON creator.id = t.created_by
       ORDER BY t.start_date DESC, t.id DESC`
    );

    const data = rows.map((row) => ({
      ...row,
      budget: Number(row.budget),
      member_count: Number(row.member_count),
      total_expense: Number(row.total_expense)
    }));

    console.log('[admin] GET /admin/trips rows:', data.length);
    res.json({ success: true, data });
  } catch (error) {
    console.error('❌ Get admin trips error:', error);
    res.status(500).json({ success: false, message: 'Failed to load trips', error: error.message });
  }
};

export const deleteAdminTrip = async (req, res) => {
  try {
    const tripId = Number(req.params.id);
    await pool.query('DELETE FROM trips WHERE id = ?', [tripId]);
    res.json({ success: true, message: 'Trip deleted successfully' });
  } catch (error) {
    console.error('❌ Delete admin trip error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete trip', error: error.message });
  }
};

export const getAdminMembers = async (req, res) => {
  try {
    console.log('[admin] GET /admin/members requested by user:', req.user?.id);
    const [rows] = await pool.query(
      `SELECT 
        tm.id,
        tm.trip_id,
        t.title AS trip_title,
        t.status AS trip_status,
        tm.user_id,
        u.name,
        u.email,
        tm.role,
        t.created_by,
        creator.name AS created_by_name
       FROM trip_members tm
       JOIN trips t ON t.id = tm.trip_id
       JOIN users u ON u.id = tm.user_id
       LEFT JOIN users creator ON creator.id = t.created_by
       ORDER BY t.start_date DESC, tm.role DESC, u.name`
    );
    console.log('[admin] GET /admin/members rows:', rows.length);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('❌ Get admin members error:', error);
    res.status(500).json({ success: false, message: 'Failed to load members', error: error.message });
  }
};

export const deleteAdminMember = async (req, res) => {
  try {
    const memberId = Number(req.params.id);
    const [[member]] = await pool.query('SELECT id, trip_id, user_id FROM trip_members WHERE id = ?', [memberId]);

    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    await runInTransaction(async (connection) => {
      await connection.query('DELETE FROM trip_ratings WHERE trip_id = ? AND (rated_user_id = ? OR reviewer_user_id = ?)', [member.trip_id, member.user_id, member.user_id]);
      await connection.query('DELETE FROM trip_members WHERE id = ?', [memberId]);
    });

    res.json({ success: true, message: 'Member deleted successfully' });
  } catch (error) {
    console.error('❌ Delete admin member error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete member', error: error.message });
  }
};
