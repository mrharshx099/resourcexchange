import jwt from 'jsonwebtoken';
import { db } from '../db.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'resourcexchange-hackathon-jwt-secret-2026';

export function generateToken(business) {
  return jwt.sign(
    {
      id: business.id,
      email: business.email,
      name: business.name,
      type: business.type,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Strict authentication middleware: requires valid Bearer JWT
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ error: 'Access token required. Please log in.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.prepare(`
      SELECT id, name, type, email, phone, location, city, lat, lng, avatar, rating, reviews_count, verified, about 
      FROM businesses 
      WHERE id = ?
    `).get(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'Business account associated with token no longer exists.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired session token. Please log in again.' });
  }
}

/**
 * Optional authentication: extracts req.user if token is provided, doesn't block if missing
 */
export function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.prepare(`
      SELECT id, name, type, email, phone, location, city, lat, lng, avatar, rating, reviews_count, verified, about 
      FROM businesses 
      WHERE id = ?
    `).get(decoded.id);

    if (user) {
      req.user = user;
    }
  } catch (err) {
    // ignore invalid token for optional routes
  }
  next();
}
