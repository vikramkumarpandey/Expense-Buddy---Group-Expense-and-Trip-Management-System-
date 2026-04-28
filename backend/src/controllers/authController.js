import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { pool } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const TOKEN_EXPIRY = '7d'; // Token expires in 7 days
const GENDER_OPTIONS = ['Male', 'Female', 'Other', 'Prefer not to say'];
const TRAVEL_STYLE_OPTIONS = ['budget', 'luxury', 'backpacking'];
const FOOD_OPTIONS = ['veg', 'non-veg', 'vegan'];
const SLEEP_OPTIONS = ['early', 'late'];
const DRINKING_OPTIONS = ['yes', 'no'];

const normalizeNullableText = (value) => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const text = String(value).trim();
  return text.length > 0 ? text : null;
};

/**
 * Register endpoint - create new user
 * POST /api/auth/register
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    // Check if user already exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    // Select role ('user' by default, or 'admin' only if explicitly requested)
    const userRole = role === 'admin' ? 'admin' : 'user';

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name.trim(), email.trim().toLowerCase(), hashedPassword, userRole]
    );

    const userId = result.insertId;

    // Generate JWT token
    const token = jwt.sign(
      { id: userId, email: email.trim().toLowerCase(), role: userRole, name: name.trim() },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    console.log(`✓ Registration successful for user: ${email}`);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        token,
        user: {
          id: userId,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          role: userRole
        }
      }
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
  }
};

/**
 * Login endpoint - authenticate user by email + password
 * POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required' });
    }

    // Check if user exists (include password for verification)
    const [users] = await pool.query(
      'SELECT id, name, email, password, role FROM users WHERE email = ?',
      [email.trim().toLowerCase()]
    );

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const user = users[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    console.log(`✓ Login successful for user: ${email}`);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed', error: error.message });
  }
};

/**
 * Get current user info from token
 * GET /api/auth/me
 */
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const [users] = await pool.query(
      'SELECT id, name, email, role FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: users[0] });
  } catch (error) {
    console.error('❌ Get current user error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user info', error: error.message });
  }
};

/**
 * Get full profile
 * GET /api/auth/profile
 */
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const [users] = await pool.query(
      `SELECT id, name, email, role, college, age, bio, gender, city, state, country, degree, branch, interests, hobbies, travel_style, food_preference, sleep_preference, drinking_preference, created_at
       FROM users WHERE id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: users[0] });
  } catch (error) {
    console.error('❌ Get profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch profile', error: error.message });
  }
};

/**
 * Update profile
 * PUT /api/auth/profile
 */
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      college,
      age,
      bio,
      gender,
      city,
      state,
      country,
      degree,
      branch,
      interests,
      hobbies,
      travel_style,
      food_preference,
      sleep_preference,
      drinking_preference
    } = req.body;

    // Build dynamic update
    const updates = [];
    const values = [];

    if (name !== undefined && name.trim()) {
      updates.push('name = ?');
      values.push(name.trim());
    }
    if (college !== undefined) {
      updates.push('college = ?');
      values.push(normalizeNullableText(college));
    }
    if (age !== undefined) {
      updates.push('age = ?');
      const parsedAge = age === '' || age === null ? null : Number.parseInt(age, 10);
      if (parsedAge !== null && Number.isNaN(parsedAge)) {
        return res.status(400).json({ success: false, message: 'Age must be a valid number' });
      }
      values.push(parsedAge);
    }
    if (bio !== undefined) {
      updates.push('bio = ?');
      values.push(normalizeNullableText(bio));
    }
    if (gender !== undefined) {
      const normalizedGender = normalizeNullableText(gender);
      if (normalizedGender && !GENDER_OPTIONS.includes(normalizedGender)) {
        return res.status(400).json({ success: false, message: 'Invalid gender value' });
      }
      updates.push('gender = ?');
      values.push(normalizedGender);
    }
    if (city !== undefined) {
      updates.push('city = ?');
      values.push(normalizeNullableText(city));
    }
    if (state !== undefined) {
      updates.push('state = ?');
      values.push(normalizeNullableText(state));
    }
    if (country !== undefined) {
      updates.push('country = ?');
      values.push(normalizeNullableText(country));
    }
    if (degree !== undefined) {
      updates.push('degree = ?');
      values.push(normalizeNullableText(degree));
    }
    if (branch !== undefined) {
      updates.push('branch = ?');
      values.push(normalizeNullableText(branch));
    }
    if (interests !== undefined) {
      updates.push('interests = ?');
      values.push(normalizeNullableText(interests));
    }
    if (hobbies !== undefined) {
      updates.push('hobbies = ?');
      values.push(normalizeNullableText(hobbies));
    }
    if (travel_style !== undefined) {
      const normalizedTravelStyle = normalizeNullableText(travel_style);
      if (normalizedTravelStyle && !TRAVEL_STYLE_OPTIONS.includes(normalizedTravelStyle)) {
        return res.status(400).json({ success: false, message: 'Invalid travel style value' });
      }
      updates.push('travel_style = ?');
      values.push(normalizedTravelStyle);
    }
    if (food_preference !== undefined) {
      const normalizedFoodPreference = normalizeNullableText(food_preference);
      if (normalizedFoodPreference && !FOOD_OPTIONS.includes(normalizedFoodPreference)) {
        return res.status(400).json({ success: false, message: 'Invalid food preference value' });
      }
      updates.push('food_preference = ?');
      values.push(normalizedFoodPreference);
    }
    if (sleep_preference !== undefined) {
      const normalizedSleepPreference = normalizeNullableText(sleep_preference);
      if (normalizedSleepPreference && !SLEEP_OPTIONS.includes(normalizedSleepPreference)) {
        return res.status(400).json({ success: false, message: 'Invalid sleep preference value' });
      }
      updates.push('sleep_preference = ?');
      values.push(normalizedSleepPreference);
    }
    if (drinking_preference !== undefined) {
      const normalizedDrinkingPreference = normalizeNullableText(drinking_preference);
      if (normalizedDrinkingPreference && !DRINKING_OPTIONS.includes(normalizedDrinkingPreference)) {
        return res.status(400).json({ success: false, message: 'Invalid drinking preference value' });
      }
      updates.push('drinking_preference = ?');
      values.push(normalizedDrinkingPreference);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    values.push(userId);
    await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);

    // Return updated profile
    const [users] = await pool.query(
      `SELECT id, name, email, role, college, age, bio, gender, city, state, country, degree, branch, interests, hobbies, travel_style, food_preference, sleep_preference, drinking_preference, created_at
       FROM users WHERE id = ?`,
      [userId]
    );

    res.json({ success: true, message: 'Profile updated', data: users[0] });
  } catch (error) {
    console.error('❌ Update profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile', error: error.message });
  }
};

/**
 * Logout endpoint (frontend handles token removal)
 * POST /api/auth/logout
 */
export const logout = async (req, res) => {
  try {
    res.json({ success: true, message: 'Logout successful' });
  } catch (error) {
    console.error('❌ Logout error:', error);
    res.status(500).json({ success: false, message: 'Logout failed', error: error.message });
  }
};
