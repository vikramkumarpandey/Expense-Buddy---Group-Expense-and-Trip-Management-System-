import { pool } from '../config/db.js';

const GENDER_OPTIONS = ['Male', 'Female', 'Other', 'Prefer not to say'];
const TRAVEL_STYLE_OPTIONS = ['budget', 'luxury', 'backpacking'];

const normalizeText = (value) => (value === undefined || value === null ? '' : String(value).trim().toLowerCase());

const parseCsvValues = (value) =>
  String(value || '')
    .split(',')
    .map((item) => normalizeText(item))
    .filter(Boolean);

const hasInterestOverlap = (userInterests, hostInterests) => {
  const userList = parseCsvValues(userInterests);
  const hostList = parseCsvValues(hostInterests);
  return userList.some((interest) => hostList.includes(interest));
};

const computeCompatibilityScore = (userProfile, tripRow) => {
  if (!userProfile) {
    return null;
  }

  let score = 0;

  if (tripRow.required_college && userProfile.college && normalizeText(tripRow.required_college) === normalizeText(userProfile.college)) {
    score += 20;
  }

  if (tripRow.required_travel_style && userProfile.travel_style && normalizeText(tripRow.required_travel_style) === normalizeText(userProfile.travel_style)) {
    score += 20;
  }

  if (tripRow.creator_food_preference && userProfile.food_preference && normalizeText(tripRow.creator_food_preference) === normalizeText(userProfile.food_preference)) {
    score += 20;
  }

  if (hasInterestOverlap(userProfile.interests, tripRow.creator_interests)) {
    score += 20;
  }

  if (tripRow.creator_city && userProfile.city && normalizeText(tripRow.creator_city) === normalizeText(userProfile.city)) {
    score += 20;
  }

  return score;
};

const getTripMatchError = (userProfile, tripRow) => {
  if (!userProfile) {
    return 'Complete your profile before joining this trip.';
  }

  if (tripRow.min_age !== null && tripRow.min_age !== undefined) {
    if (userProfile.age === null || userProfile.age === undefined) {
      return 'Add your age in profile to join this trip.';
    }
    if (Number(userProfile.age) < Number(tripRow.min_age)) {
      return `This trip requires a minimum age of ${tripRow.min_age}.`;
    }
  }

  if (tripRow.max_age !== null && tripRow.max_age !== undefined) {
    if (userProfile.age === null || userProfile.age === undefined) {
      return 'Add your age in profile to join this trip.';
    }
    if (Number(userProfile.age) > Number(tripRow.max_age)) {
      return `This trip allows a maximum age of ${tripRow.max_age}.`;
    }
  }

  if (tripRow.required_college && normalizeText(tripRow.required_college) !== 'any') {
    if (!userProfile.college) {
      return 'Add your college in profile to join this trip.';
    }
    if (normalizeText(userProfile.college) !== normalizeText(tripRow.required_college)) {
      return `This trip is open only to ${tripRow.required_college} participants.`;
    }
  }

  if (tripRow.preferred_gender && normalizeText(tripRow.preferred_gender) !== 'any') {
    if (!userProfile.gender) {
      return 'Add your gender in profile to join this trip.';
    }
    if (normalizeText(userProfile.gender) !== normalizeText(tripRow.preferred_gender)) {
      return `This trip prefers ${tripRow.preferred_gender} participants.`;
    }
  }

  if (tripRow.required_travel_style) {
    if (!userProfile.travel_style) {
      return 'Add your travel style in profile to join this trip.';
    }
    if (normalizeText(userProfile.travel_style) !== normalizeText(tripRow.required_travel_style)) {
      return `This trip requires a ${tripRow.required_travel_style} travel style.`;
    }
  }

  return null;
};

export const getTrips = async (req, res) => {
  try {
    const currentUserId = req.user?.id;
    let currentUserProfile = null;

    if (currentUserId) {
      const [[profile]] = await pool.query(
        `SELECT id, name, email, city, college, gender, travel_style, food_preference, interests
         FROM users WHERE id = ?`,
        [currentUserId]
      );
      currentUserProfile = profile || null;
    }

    await pool.query("UPDATE trips SET status = 'Completed' WHERE end_date < CURDATE() AND status != 'Completed'");

    const query = `
      SELECT 
        t.id,
        t.created_by,
        t.title,
        t.destination,
        t.budget,
        t.start_date,
        t.end_date,
        t.status,
        t.min_age,
        t.max_age,
        t.required_college,
        t.preferred_gender,
        t.required_travel_style,
        creator.name AS creator_name,
        creator.city AS creator_city,
        creator.college AS creator_college,
        creator.gender AS creator_gender,
        creator.travel_style AS creator_travel_style,
        creator.food_preference AS creator_food_preference,
        creator.interests AS creator_interests,
        (SELECT COUNT(*) FROM trip_members WHERE trip_id = t.id) AS members,
        (SELECT COALESCE(SUM(amount), 0) FROM trip_expenses WHERE trip_id = t.id) AS total_expense
      FROM trips t
      LEFT JOIN users creator ON creator.id = t.created_by
      ORDER BY t.start_date
    `;

    const [rows] = await pool.query(query);

    res.json({
      success: true,
      data: rows.map((row) => ({
        ...row,
        budget: Number(row.budget),
        members: Number(row.members),
        totalExpense: Number(row.total_expense),
        compatibilityScore: currentUserProfile ? computeCompatibilityScore(currentUserProfile, row) : null
      }))
    });
  } catch (error) {
    console.error('❌ Get trips error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load trips',
      error: error.message
    });
  }
};

export const addTrip = async (req, res) => {
  try {
    const userId = req.user?.id || 1;
    const {
      title,
      destination,
      budget,
      start_date,
      end_date,
      status,
      min_age,
      max_age,
      required_college,
      preferred_gender,
      required_travel_style
    } = req.body;

    // Validation
    if (!title || !destination || !budget || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'All trip fields are required'
      });
    }

    if (budget <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Budget must be greater than 0'
      });
    }

    const parsedMinAge = min_age === undefined || min_age === null || min_age === '' ? null : Number(min_age);
    const parsedMaxAge = max_age === undefined || max_age === null || max_age === '' ? null : Number(max_age);

    if ((parsedMinAge !== null && Number.isNaN(parsedMinAge)) || (parsedMaxAge !== null && Number.isNaN(parsedMaxAge))) {
      return res.status(400).json({ success: false, message: 'Trip age filters must be valid numbers' });
    }

    if (parsedMinAge !== null && parsedMaxAge !== null && parsedMinAge > parsedMaxAge) {
      return res.status(400).json({ success: false, message: 'Minimum age cannot be greater than maximum age' });
    }

    const normalizedPreferredGender = preferred_gender ? String(preferred_gender).trim() : 'Any';
    if (normalizedPreferredGender && ![...GENDER_OPTIONS, 'Any'].includes(normalizedPreferredGender)) {
      return res.status(400).json({ success: false, message: 'Invalid preferred gender value' });
    }

    const normalizedTravelStyle = required_travel_style ? String(required_travel_style).trim().toLowerCase() : null;
    if (normalizedTravelStyle && !TRAVEL_STYLE_OPTIONS.includes(normalizedTravelStyle)) {
      return res.status(400).json({ success: false, message: 'Invalid travel style value' });
    }

    const [result] = await pool.query(
      `INSERT INTO trips (
        created_by, title, destination, budget, start_date, end_date, status,
        min_age, max_age, required_college, preferred_gender, required_travel_style
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        title,
        destination,
        budget,
        start_date,
        end_date,
        status || 'Planning',
        parsedMinAge,
        parsedMaxAge,
        required_college ? String(required_college).trim() || null : null,
        normalizedPreferredGender,
        normalizedTravelStyle
      ]
    );

    // Add creator as coordinator
    await pool.query(
      'INSERT INTO trip_members (trip_id, user_id, role) VALUES (?, ?, ?)',
      [result.insertId, userId, 'Coordinator']
    );

    console.log(`✓ Trip added by user ${userId}`);

    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        title,
        destination,
        budget,
        start_date,
        end_date,
        status: status || 'Planning',
        min_age: parsedMinAge,
        max_age: parsedMaxAge,
        required_college: required_college ? String(required_college).trim() || null : null,
        preferred_gender: normalizedPreferredGender,
        required_travel_style: normalizedTravelStyle,
        created_by: userId
      }
    });
  } catch (error) {
    console.error('❌ Add trip error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add trip',
      error: error.message
    });
  }
};

export const getTripAnalysis = async (req, res) => {
  try {
    const tripId = Number(req.params.tripId);
    const [[tripRow]] = await pool.query('SELECT id, title, budget FROM trips WHERE id = ?', [tripId]);

    if (!tripRow) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    const [expenseRows] = await pool.query(
      'SELECT category, SUM(amount) AS total FROM trip_expenses WHERE trip_id = ? GROUP BY category',
      [tripId]
    );

    const totalSpent = expenseRows.reduce((sum, item) => sum + Number(item.total), 0);

    res.json({
      success: true,
      data: {
        tripId,
        title: tripRow.title,
        budget: Number(tripRow.budget),
        spent: totalSpent,
        usedPercent: tripRow.budget > 0 ? Math.round((totalSpent / Number(tripRow.budget)) * 100) : 0,
        categories: expenseRows.map((item) => ({
          category: item.category,
          total: Number(item.total)
        }))
      }
    });
  } catch (error) {
    console.error('❌ Get trip analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load trip analysis',
      error: error.message
    });
  }
};

export const getSettlements = async (req, res) => {
  try {
    const tripId = Number(req.params.tripId);

    const [members] = await pool.query(
      'SELECT tm.user_id, u.name FROM trip_members tm JOIN users u ON u.id = tm.user_id WHERE tm.trip_id = ? ORDER BY u.id',
      [tripId]
    );

    const [expenses] = await pool.query(
      'SELECT paid_by_user_id, amount FROM trip_expenses WHERE trip_id = ?',
      [tripId]
    );

    if (members.length === 0) {
      return res.json({
        success: true,
        data: []
      });
    }

    const memberIds = members.map((m) => m.user_id);
    const sharePerExpense = (amount) => amount / memberIds.length;

    const paidMap = {};
    const owesMap = {};
    members.forEach((m) => {
      paidMap[m.user_id] = 0;
      owesMap[m.user_id] = 0;
    });

    expenses.forEach((expense) => {
      paidMap[expense.paid_by_user_id] += Number(expense.amount);
      memberIds.forEach((memberId) => {
        owesMap[memberId] += sharePerExpense(Number(expense.amount));
      });
    });

    const balances = members.map((member) => ({
      userId: member.user_id,
      name: member.name,
      balance: Number((paidMap[member.user_id] - owesMap[member.user_id]).toFixed(2))
    }));

    const creditors = balances.filter((b) => b.balance > 0).map((b) => ({ ...b }));
    const debtors = balances.filter((b) => b.balance < 0).map((b) => ({ ...b, balance: Math.abs(b.balance) }));

    const settlements = [];
    let i = 0;
    let j = 0;

    while (i < debtors.length && j < creditors.length) {
      const amount = Math.min(debtors[i].balance, creditors[j].balance);
      settlements.push({
        from: debtors[i].name,
        to: creditors[j].name,
        amount: Number(amount.toFixed(2))
      });

      debtors[i].balance = Number((debtors[i].balance - amount).toFixed(2));
      creditors[j].balance = Number((creditors[j].balance - amount).toFixed(2));

      if (debtors[i].balance === 0) i += 1;
      if (creditors[j].balance === 0) j += 1;
    }

    res.json({
      success: true,
      data: settlements
    });
  } catch (error) {
    console.error('❌ Get settlements error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate settlements',
      error: error.message
    });
  }
};

export const deleteTrip = async (req, res) => {
  try {
    const tripId = Number(req.params.tripId);
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const [[trip]] = await pool.query('SELECT id, created_by FROM trips WHERE id = ?', [tripId]);

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    if (userRole !== 'admin' && Number(trip.created_by) !== Number(userId)) {
      return res.status(403).json({ success: false, message: 'You can only delete your own trips' });
    }

    await pool.query('DELETE FROM trips WHERE id = ?', [tripId]);

    res.json({ success: true, message: 'Trip deleted successfully' });
  } catch (error) {
    console.error('❌ Delete trip error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete trip', error: error.message });
  }
};

export const removeTripMember = async (req, res) => {
  try {
    const tripId = Number(req.params.tripId);
    const memberId = Number(req.params.memberId);
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const [[trip]] = await pool.query('SELECT id, created_by FROM trips WHERE id = ?', [tripId]);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    const [[requesterMember]] = await pool.query(
      'SELECT role FROM trip_members WHERE trip_id = ? AND user_id = ?',
      [tripId, userId]
    );

    const isCoordinator = requesterMember?.role === 'Coordinator';
    const canManageMembers = userRole === 'admin' || Number(trip.created_by) === Number(userId) || isCoordinator;

    if (!canManageMembers) {
      return res.status(403).json({ success: false, message: 'Only the coordinator can remove members' });
    }

    const [[member]] = await pool.query('SELECT id, user_id, role FROM trip_members WHERE id = ? AND trip_id = ?', [memberId, tripId]);

    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    if (member.role === 'Coordinator' && userRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'Coordinator member cannot be removed' });
    }

    await pool.query('DELETE FROM trip_ratings WHERE trip_id = ? AND (rated_user_id = ? OR reviewer_user_id = ?)', [tripId, member.user_id, member.user_id]);
    await pool.query('DELETE FROM trip_members WHERE id = ?', [memberId]);

    const [members] = await pool.query(
      `SELECT 
        tm.id,
        tm.trip_id,
        tm.user_id,
        tm.role,
        u.name,
        u.email
      FROM trip_members tm
      JOIN users u ON u.id = tm.user_id
      WHERE tm.trip_id = ?
      ORDER BY tm.role DESC, u.name`,
      [tripId]
    );

    res.json({ success: true, message: 'Member removed successfully', data: members });
  } catch (error) {
    console.error('❌ Remove trip member error:', error);
    res.status(500).json({ success: false, message: 'Failed to remove member', error: error.message });
  }
};
// Get trip expenses
export const getTripExpenses = async (req, res) => {
  try {
    const tripId = Number(req.params.tripId);

    const [expenses] = await pool.query(
      'SELECT id, title, category, amount, expense_date, paid_by_user_id FROM trip_expenses WHERE trip_id = ? ORDER BY expense_date DESC',
      [tripId]
    );

    // Get member name for each expense
    const enrichedExpenses = await Promise.all(
      expenses.map(async (expense) => {
        const [[member]] = await pool.query(
          'SELECT name FROM users WHERE id = ?',
          [expense.paid_by_user_id]
        );
        return {
          ...expense,
          amount: Number(expense.amount),
          paid_by: member?.name || 'Unknown'
        };
      })
    );

    res.json({
      success: true,
      data: enrichedExpenses
    });
  } catch (error) {
    console.error('❌ Get trip expenses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trip expenses',
      error: error.message
    });
  }
};

// Add trip expense
export const addTripExpense = async (req, res) => {
  try {
    const tripId = Number(req.params.tripId);
    const { title, category, amount, expense_date, paid_by_user_id } = req.body;

    // Validation
    if (!title || !category || !amount || !expense_date || !paid_by_user_id) {
      return res.status(400).json({
        success: false,
        message: 'Title, category, amount, date, and paid_by_user_id are required'
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0'
      });
    }

    const [result] = await pool.query(
      'INSERT INTO trip_expenses (trip_id, title, category, amount, expense_date, paid_by_user_id) VALUES (?, ?, ?, ?, ?, ?)',
      [tripId, title, category, amount, expense_date, paid_by_user_id]
    );

    console.log(`✓ Trip expense added for trip ${tripId}`);

    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        title,
        category,
        amount: Number(amount),
        expense_date,
        paid_by_user_id
      }
    });
  } catch (error) {
    console.error('❌ Add trip expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add trip expense',
      error: error.message
    });
  }
};

// Get trip members
export const getTripMembers = async (req, res) => {
  try {
    const tripId = Number(req.params.tripId);

    const [members] = await pool.query(
      `SELECT 
        tm.id,
        tm.trip_id,
        tm.user_id,
        tm.role,
        u.name,
        u.email
      FROM trip_members tm
      JOIN users u ON u.id = tm.user_id
      WHERE tm.trip_id = ?
      ORDER BY tm.role DESC, u.name`,
      [tripId]
    );

    res.json({
      success: true,
      data: members
    });
  } catch (error) {
    console.error('❌ Get trip members error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trip members',
      error: error.message
    });
  }
};

/**
 * Join a trip (add current user to trip_members)
 */
export const joinTrip = async (req, res) => {
  try {
    const tripId = Number(req.params.tripId);
    const userId = req.user?.id;

    // Validate
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (!tripId || isNaN(tripId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid trip ID'
      });
    }

    // Check if trip exists
    const [[trip]] = await pool.query(
      `SELECT 
        t.id,
        t.created_by,
        t.min_age,
        t.max_age,
        t.required_college,
        t.preferred_gender,
        t.required_travel_style,
        creator.city AS creator_city,
        creator.college AS creator_college,
        creator.gender AS creator_gender,
        creator.travel_style AS creator_travel_style,
        creator.food_preference AS creator_food_preference,
        creator.interests AS creator_interests
       FROM trips t
       LEFT JOIN users creator ON creator.id = t.created_by
       WHERE t.id = ?`,
      [tripId]
    );
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    const [[userProfile]] = await pool.query(
      `SELECT id, name, email, age, college, gender, city, travel_style, food_preference, interests
       FROM users WHERE id = ?`,
      [userId]
    );

    const matchError = getTripMatchError(userProfile, trip);
    if (matchError) {
      return res.status(400).json({ success: false, message: matchError });
    }

    const compatibilityScore = computeCompatibilityScore(userProfile, trip);

    // Check if user is already a member
    const [[existingMember]] = await pool.query(
      'SELECT id FROM trip_members WHERE trip_id = ? AND user_id = ?',
      [tripId, userId]
    );

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this trip'
      });
    }

    // Add user to trip_members
    const [result] = await pool.query(
      'INSERT INTO trip_members (trip_id, user_id, role) VALUES (?, ?, ?)',
      [tripId, userId, 'Member']
    );

    console.log(`✓ User ${userId} joined trip ${tripId}`);

    // Return updated members list
    const [members] = await pool.query(
      `SELECT 
        tm.id,
        tm.trip_id,
        tm.user_id,
        tm.role,
        u.name,
        u.email
      FROM trip_members tm
      JOIN users u ON u.id = tm.user_id
      WHERE tm.trip_id = ?
      ORDER BY tm.role DESC, u.name`,
      [tripId]
    );

    res.json({
      success: true,
      message: 'Successfully joined trip',
      compatibilityScore,
      data: members
    });
  } catch (error) {
    console.error('❌ Join trip error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join trip',
      error: error.message
    });
  }
};

/**
 * Update trip status (Coordinator only)
 */
export const updateTripStatus = async (req, res) => {
  try {
    const tripId = Number(req.params.tripId);
    const { status } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (!tripId || isNaN(tripId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid trip ID'
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    // Check if user is Coordinator for this trip
    const [[member]] = await pool.query(
      'SELECT role FROM trip_members WHERE trip_id = ? AND user_id = ?',
      [tripId, userId]
    );

    if (!member || member.role !== 'Coordinator') {
      return res.status(403).json({
        success: false,
        message: 'Only the trip coordinator can update the status'
      });
    }

    // Update status
    await pool.query(
      'UPDATE trips SET status = ? WHERE id = ?',
      [status, tripId]
    );

    res.json({
      success: true,
      message: 'Trip status updated successfully',
      data: { tripId, status }
    });
  } catch (error) {
    console.error('❌ Update trip status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update trip status',
      error: error.message
    });
  }
};