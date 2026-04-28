import { pool } from '../config/db.js';

// Helper function to check if user has access to a trip
const userHasTripAccess = async (userId, userRole, tripId) => {
  // Admin has access to all trips
  if (userRole === 'admin') {
    return true;
  }
  
  // Check if user is a member of this trip
  const [members] = await pool.query(
    'SELECT id FROM trip_members WHERE trip_id = ? AND user_id = ?',
    [tripId, userId]
  );
  
  return members.length > 0;
};

export const bulkUpdateSettlements = async (req, res) => {
  const { trip_id, settlements } = req.body;
  const currentUserId = req.user?.id;
  const userRole = req.user?.role || 'user';
  
  if (!trip_id || !settlements) return res.status(400).json({ message: "Invalid payload" });

  // Check access permission
  const hasAccess = await userHasTripAccess(currentUserId, userRole, trip_id);
  if (!hasAccess) {
    return res.status(403).json({ success: false, message: 'You do not have access to this trip' });
  }

  try {
    for (const s of settlements) {
      if (s.isDeleted && s.id) {
        // Handle deletion
        await pool.query('DELETE FROM settlements WHERE id = ?', [s.id]);
        continue;
      }
      if (s.isDeleted) continue; // Item was new but deleted before saving

      await pool.query(
        `INSERT INTO settlements (id, trip_id, from_user_id, to_user_id, amount, status)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           from_user_id = VALUES(from_user_id),
           to_user_id = VALUES(to_user_id),
           amount = VALUES(amount),
           status = VALUES(status)`,
        [s.id || null, trip_id, s.from_user_id, s.to_user_id, s.amount, s.status]
      );
    }

    // Fetch and return the updated manual settlements
    const [updated] = await pool.query(
      `SELECT s.*, 
        fu.name as from_user_name, 
        tu.name as to_user_name 
       FROM settlements s
       JOIN users fu ON s.from_user_id = fu.id
       JOIN users tu ON s.to_user_id = tu.id
       WHERE s.trip_id = ?`,
      [trip_id]
    );

    res.json({ message: "Settlements updated successfully", settlements: updated });
  } catch (error) {
    console.error("Bulk update error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getSettlements = async (req, res) => {
  const { tripId } = req.params;
  const currentUserId = req.user?.id;
  const userRole = req.user?.role || 'user';
  
  try {
    // Check access permission
    const hasAccess = await userHasTripAccess(currentUserId, userRole, tripId);
    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'You do not have access to this trip' });
    }

    const [settlements] = await pool.query(
      `SELECT s.*, 
        fu.name as from_user_name, 
        tu.name as to_user_name 
       FROM settlements s
       JOIN users fu ON s.from_user_id = fu.id
       JOIN users tu ON s.to_user_id = tu.id
       WHERE s.trip_id = ?`,
      [tripId]
    );
    res.json(settlements);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const markPaid = async (req, res) => {
  const { id } = req.params;
  const currentUserId = req.user?.id;
  const userRole = req.user?.role || 'user';
  
  try {
    // Get the settlement to find the trip_id
    const [settlement] = await pool.query('SELECT trip_id FROM settlements WHERE id = ?', [id]);
    
    if (settlement.length === 0) {
      return res.status(404).json({ message: "Settlement not found" });
    }
    
    const tripId = settlement[0].trip_id;
    
    // Check access permission
    const hasAccess = await userHasTripAccess(currentUserId, userRole, tripId);
    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'You do not have access to this trip' });
    }
    
    await pool.query('UPDATE settlements SET status = "paid" WHERE id = ?', [id]);
    res.json({ message: "Marked as paid successfully", id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
