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

// Helper function to get trips based on user role for ratings
const getTripsForRatings = async (isAdmin, userId) => {
  if (isAdmin) {
    return {
      query: `
        SELECT DISTINCT t.id, t.title, t.destination, t.status, t.end_date
        FROM trips t
        WHERE t.status = 'Completed'
        ORDER BY t.end_date DESC
      `,
      params: []
    };
  } else {
    return {
      query: `
        SELECT DISTINCT t.id, t.title, t.destination, t.status, t.end_date
        FROM trips t
        INNER JOIN trip_members tm ON tm.trip_id = t.id
        WHERE tm.user_id = ? AND t.status = 'Completed'
        ORDER BY t.end_date DESC
      `,
      params: [userId]
    };
  }
};

// Retrieve trip-specific member ratings through aggregation
export const getTripMemberRatings = async (req, res) => {
  const { tripId } = req.params;
  const currentUserId = req.user?.id;
  const userRole = req.user?.role || 'user';
  
  try {
    // Check access permission
    const hasAccess = await userHasTripAccess(currentUserId, userRole, tripId);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this trip'
      });
    }

    const [rows] = await pool.query(`
      SELECT
        tm.user_id,
        u.name,
        tm.role,
        IFNULL(AVG((r.behavior_score + r.teamwork_score + r.reliability_score) / 3), 0) as avgRating,
        IFNULL(AVG(r.behavior_score), 0) as behavior,
        IFNULL(AVG(r.teamwork_score), 0) as teamwork,
        IFNULL(AVG(r.reliability_score), 0) as reliability,
        GROUP_CONCAT(r.comment_text SEPARATOR '||') as comments
      FROM trip_members tm
      JOIN users u ON tm.user_id = u.id
      LEFT JOIN trip_ratings r ON tm.user_id = r.rated_user_id AND tm.trip_id = r.trip_id
      WHERE tm.trip_id = ?
      GROUP BY tm.user_id, u.name, tm.role
      ORDER BY avgRating DESC;
    `, [tripId]);

    const enriched = rows.map((row) => {
      const overall = Number(row.avgRating);
      let badges = ['Participative'];
      if (overall >= 4.7) badges = ['Best Coordinator', 'Reliable', 'Supportive'];
      else if (overall >= 4.4) badges = ['Friendly', 'Helpful', 'Team Player'];
      else if (overall >= 4.0) badges = ['Improved', 'Calm', 'Cooperative'];

      const commentArray = row.comments ? row.comments.split('||').filter(c => c.trim().length > 0) : [];

      return {
        user_id: row.user_id,
        name: row.name,
        role: row.role,
        avgRating: overall.toFixed(1),
        parameterAverages: {
          behavior: Number(row.behavior).toFixed(1),
          teamwork: Number(row.teamwork).toFixed(1),
          reliability: Number(row.reliability).toFixed(1)
        },
        comments: commentArray.slice(0, 3), // Send top 3 comments
        badges
      };
    });

    res.json({ success: true, tripId, members: enriched });
  } catch (error) {
    console.error('❌ Get trip member ratings error:', error);
    res.status(500).json({ success: false, message: 'Failed to load trip member ratings', error: error.message });
  }
};

// Global Leaderboard Members ranking
export const getGlobalMembersRanking = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        u.id,
        u.name,
        ROUND(IFNULL(AVG((tr.behavior_score + tr.teamwork_score + tr.reliability_score)/3), 0), 2) AS avgRating,
        COUNT(DISTINCT tm.trip_id) AS totalTrips,
        COUNT(tr.id) AS totalReviews
      FROM users u
      JOIN trip_members tm ON tm.user_id = u.id
      LEFT JOIN trip_ratings tr ON tr.rated_user_id = u.id
      GROUP BY u.id
      ORDER BY avgRating DESC, totalReviews DESC;
    `);

    const formatted = rows.map(row => {
      const avg = Number(row.avgRating) || 0;
      let badge = "⚠ Needs Improvement";
      if (avg >= 4.7) badge = "🏆 Elite";
      else if (avg >= 4.5) badge = "⭐ Excellent";
      else if (avg >= 4.2) badge = "👍 Reliable";
      else if (avg >= 4.0) badge = "🙂 Good";

      return {
        id: row.id,
        name: row.name,
        avgRating: avg,
        totalTrips: Number(row.totalTrips) || 0,
        totalReviews: Number(row.totalReviews) || 0,
        badge
      };
    });

    res.json({ success: true, data: formatted });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed members ranking', error: e.message });
  }
};

// Global Leaderboard Organisers (Coordinator) ranking
export const getGlobalOrganisersRanking = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        u.id,
        u.name,
        ROUND(IFNULL(AVG((tr.behavior_score + tr.teamwork_score + tr.reliability_score)/3), 0), 2) AS avgRating,
        COUNT(DISTINCT tm.trip_id) AS totalTripsOrganised,
        COUNT(tr.id) AS totalReviews
      FROM users u
      JOIN trip_members tm ON tm.user_id = u.id AND tm.role = 'Coordinator'
      LEFT JOIN trip_ratings tr ON tr.rated_user_id = u.id
      GROUP BY u.id
      ORDER BY avgRating DESC, totalReviews DESC;
    `);

    const formatted = rows.map(row => {
      const avg = Number(row.avgRating) || 0;
      let badge = "⚠ Needs Improvement";
      if (avg >= 4.7) badge = "🏆 Elite";
      else if (avg >= 4.5) badge = "⭐ Excellent";
      else if (avg >= 4.2) badge = "👍 Reliable";
      else if (avg >= 4.0) badge = "🙂 Good";

      return {
        id: row.id,
        name: row.name,
        avgRating: avg,
        totalTrips: Number(row.totalTripsOrganised) || 0,
        totalReviews: Number(row.totalReviews) || 0,
        badge
      };
    });

    res.json({ success: true, data: formatted });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed organisers ranking', error: e.message });
  }
};

// Retrieve user member ratings ordered by overall score (highest to lowest)
export const getGlobalRatings = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        u.id,
        u.name,
        ROUND(AVG(tr.behavior_score), 1) AS behavior,
        ROUND(AVG(tr.teamwork_score), 1) AS teamwork,
        ROUND(AVG(tr.reliability_score), 1) AS reliability,
        ROUND((AVG(tr.behavior_score) + AVG(tr.teamwork_score) + AVG(tr.reliability_score)) / 3, 1) AS overall,
        MAX(tr.comment_text) AS latestComment
      FROM users u
      JOIN trip_ratings tr ON tr.rated_user_id = u.id
      GROUP BY u.id, u.name
      ORDER BY overall DESC, u.name
    `);

    const enriched = rows.map((row) => {
      const overall = Number(row.overall);
      // Assign badges based on overall rating score
      let badges = ['Participative'];
      if (overall >= 4.7) badges = ['Best Coordinator', 'Reliable', 'Supportive'];
      else if (overall >= 4.4) badges = ['Friendly', 'Helpful', 'Team Player'];
      else if (overall >= 4.0) badges = ['Improved', 'Calm', 'Cooperative'];

      return {
        id: row.id,
        name: row.name,
        behavior: Number(row.behavior),
        teamwork: Number(row.teamwork),
        reliability: Number(row.reliability),
        overall,
        comment: row.latestComment,
        badges
      };
    });

    res.json({
      success: true,
      data: enriched
    });
  } catch (error) {
    console.error('❌ Get global ratings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load ratings',
      error: error.message
    });
  }
};

// Retrieve trips ranked by average member ratings in descending order for public display
export const getGlobalTripRankings = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        t.id,
        t.title,
        t.destination,
        u.name AS organizer,
        ROUND(AVG(tr.behavior_score + tr.teamwork_score + tr.reliability_score) / 3, 2) AS avgRating,
        COUNT(DISTINCT tr.id) AS ratingCount
      FROM trips t
      JOIN trip_members tm ON tm.trip_id = t.id
      JOIN users u ON u.id = tm.user_id
      LEFT JOIN trip_ratings tr ON tr.trip_id = t.id
      WHERE t.status = 'Completed'
      GROUP BY t.id, t.title, t.destination, u.name
      ORDER BY avgRating DESC, t.title ASC
    `);

    const formatted = rows.map((row) => ({
      id: row.id,
      tripName: row.title,
      destination: row.destination,
      organizer: row.organizer,
      avgRating: Number(row.avgRating) || 0,
      ratingCount: Number(row.ratingCount)
    }));

    res.json({
      success: true,
      data: formatted
    });
  } catch (error) {
    console.error('❌ Get trip rankings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load trip rankings',
      error: error.message
    });
  }
};

// Submit a rating for a trip member
export const submitRating = async (req, res) => {
  try {
    const { trip_id, rated_user_id, behavior_score, teamwork_score, reliability_score, comment_text } = req.body;
    const currentUserId = req.user?.id;
    const userRole = req.user?.role || 'user';

    // Use authenticated user id, fallback to body field for backward compatibility
    const reviewer_user_id = currentUserId || req.body.reviewer_user_id;

    // Validation
    if (!trip_id || !rated_user_id || !reviewer_user_id) {
      return res.status(400).json({ success: false, message: 'trip_id, rated_user_id are required' });
    }
    if (!behavior_score || !teamwork_score || !reliability_score) {
      return res.status(400).json({ success: false, message: 'All three rating scores are required' });
    }
    if (Number(rated_user_id) === Number(reviewer_user_id)) {
      return res.status(400).json({ success: false, message: 'You cannot rate yourself' });
    }

    // Validate scores are between 1 and 5
    const scores = [behavior_score, teamwork_score, reliability_score];
    for (const score of scores) {
      if (score < 1 || score > 5) {
        return res.status(400).json({ success: false, message: 'Scores must be between 1 and 5' });
      }
    }

    // Check access permission
    const hasAccess = await userHasTripAccess(reviewer_user_id, userRole, trip_id);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this trip'
      });
    }

    // Check that both users are members of the trip
    const [members] = await pool.query(
      'SELECT user_id FROM trip_members WHERE trip_id = ? AND user_id IN (?, ?)',
      [trip_id, rated_user_id, reviewer_user_id]
    );
    if (members.length < 2) {
      return res.status(400).json({ success: false, message: 'Both the rater and rated user must be members of this trip' });
    }

    // Insert or update rating (handles duplicate constraint)
    await pool.query(`
      INSERT INTO trip_ratings (trip_id, rated_user_id, reviewer_user_id, behavior_score, teamwork_score, reliability_score, comment_text)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        behavior_score = VALUES(behavior_score),
        teamwork_score = VALUES(teamwork_score),
        reliability_score = VALUES(reliability_score),
        comment_text = VALUES(comment_text)
    `, [trip_id, rated_user_id, reviewer_user_id, behavior_score, teamwork_score, reliability_score, comment_text || null]);

    console.log(`✓ Rating submitted: user ${reviewer_user_id} rated user ${rated_user_id} for trip ${trip_id}`);

    res.status(201).json({
      success: true,
      message: 'Rating submitted successfully'
    });
  } catch (error) {
    console.error('❌ Submit rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit rating',
      error: error.message
    });
  }
};

// Get trips that need to be rated (completed trips user is a member of)
export const getTripsToRate = async (req, res) => {
  try {
    const currentUserId = req.user?.id;
    const userRole = req.user?.role || 'user';
    const isAdmin = userRole === 'admin';

    // Get trips based on user role
    const { query, params } = getTripsForRatings(isAdmin, currentUserId);
    const [rows] = await pool.query(query, params);

    // For each trip, check if user has already submitted ratings
    const tripsWithRatingStatus = await Promise.all(
      rows.map(async (trip) => {
        const [existingRatings] = await pool.query(
          'SELECT id FROM trip_ratings WHERE trip_id = ? AND reviewer_user_id = ?',
          [trip.id, currentUserId]
        );
        return {
          ...trip,
          hasRated: existingRatings.length > 0
        };
      })
    );

    res.json({
      success: true,
      data: tripsWithRatingStatus
    });
  } catch (error) {
    console.error('❌ Get trips to rate error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load trips to rate',
      error: error.message
    });
  }
};

