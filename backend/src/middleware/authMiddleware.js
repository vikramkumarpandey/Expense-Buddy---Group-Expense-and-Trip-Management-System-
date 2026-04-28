import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Verify JWT token and attach user info to request
 */
export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Missing or invalid token'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach user info (id, role) to request
    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

/**
 * Optional auth middleware - allows requests with or without token
 * If token is provided and valid, attaches user info
 * Otherwise, continues without user info
 */
export const optionalAuthMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    }
    // Continue regardless of token presence
    next();
  } catch (error) {
    console.error('Optional auth error:', error.message);
    // Continue without user info on error
    next();
  }
};

/**
 * Check if user is admin
 */
export const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  next();
};

/**
 * Check if user has 'user' role
 */
export const userMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized'
    });
  }

  if (req.user.role !== 'user') {
    return res.status(403).json({
      success: false,
      message: 'User access required'
    });
  }

  next();
};

/**
 * Export JWT_SECRET for use in other modules
 */
export const getJwtSecret = () => JWT_SECRET;
