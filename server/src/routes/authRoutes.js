import express from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Helper to remove sensitive password fields
function sanitizeUser(business) {
  if (!business) return null;
  const { password: _, password_hash: __, ...safeUser } = business;
  return safeUser;
}

// GET /api/auth/businesses (all businesses for demo switcher)
router.get('/businesses', (req, res) => {
  try {
    const businesses = db.prepare(`
      SELECT id, name, type, email, phone, location, city, lat, lng, avatar, rating, reviews_count, verified, about, created_at
      FROM businesses
      ORDER BY rating DESC
    `).all();
    res.json(businesses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, type, location, city, phone, about } = req.body;

    // Validate inputs
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Business name is required' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email address is required' });
    }
    const emailNorm = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailNorm)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    if (!location || !location.trim()) {
      return res.status(400).json({ error: 'Business location is required' });
    }

    // Check duplicate email
    const existing = db.prepare('SELECT id FROM businesses WHERE LOWER(email) = ?').get(emailNorm);
    if (existing) {
      return res.status(400).json({ error: 'Email already registered. Please log in instead.' });
    }

    // Hash password with bcrypt
    const passwordHash = await bcrypt.hash(password, 10);

    const id = `biz_${crypto.randomUUID().slice(0, 8)}`;
    const defaultAvatar = 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=300&q=80';
    
    // Assign nearby coordinate in metropolitan area
    const finalLat = 40.7580 + (Math.random() - 0.5) * 0.04;
    const finalLng = -73.9855 + (Math.random() - 0.5) * 0.04;
    const finalCity = city || location;
    const finalType = type || 'Hotel & Resort';

    db.prepare(`
      INSERT INTO businesses (
        id, name, type, email, password, password_hash, phone, location, city, lat, lng, avatar, rating, reviews_count, verified, about
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 5.0, 0, 1, ?)
    `).run(
      id, name.trim(), finalType, emailNorm, password, passwordHash,
      phone || '+1 (212) 555-0100', location.trim(), finalCity,
      finalLat, finalLng, defaultAvatar, about || ''
    );

    const created = db.prepare(`
      SELECT id, name, type, email, phone, location, city, lat, lng, avatar, rating, reviews_count, verified, about 
      FROM businesses 
      WHERE id = ?
    `).get(id);

    const token = generateToken(created);

    res.status(201).json({
      message: 'Account created successfully',
      user: created,
      token
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error during signup. Please try again.' });
  }
});

// POST /api/auth/login (supports email + password, or instant demo businessId login for judges)
router.post('/login', async (req, res) => {
  try {
    const { email, password, businessId } = req.body;

    // Instant judge demo login by businessId
    if (businessId) {
      const biz = db.prepare('SELECT * FROM businesses WHERE id = ?').get(businessId);
      if (!biz) {
        return res.status(404).json({ error: 'Demo business account not found' });
      }
      const safe = sanitizeUser(biz);
      const token = generateToken(safe);
      return res.json({
        user: safe,
        token
      });
    }

    // Standard email + password authentication
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email is required' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const emailNorm = email.toLowerCase().trim();
    const business = db.prepare('SELECT * FROM businesses WHERE LOWER(email) = ?').get(emailNorm);

    if (!business) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    let isMatch = false;
    if (business.password_hash) {
      isMatch = await bcrypt.compare(password, business.password_hash);
    } else if (business.password) {
      // Legacy plain check + auto-migrate hash
      isMatch = (password === business.password);
      if (isMatch) {
        const newHash = await bcrypt.hash(password, 10);
        db.prepare('UPDATE businesses SET password_hash = ? WHERE id = ?').run(newHash, business.id);
      }
    }

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const safeUser = sanitizeUser(business);
    const token = generateToken(safeUser);

    res.json({
      message: 'Login successful',
      user: safeUser,
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login. Please try again.' });
  }
});

// GET /api/auth/me (returns logged-in business profile verified by JWT token)
router.get('/me', authenticateToken, (req, res) => {
  try {
    const user = req.user;
    
    // Fetch live stats for current user
    const resourcesCount = db.prepare('SELECT COUNT(*) as count FROM resources WHERE provider_id = ?').get(user.id).count;
    const pendingRequestsCount = db.prepare("SELECT COUNT(*) as count FROM requests WHERE provider_id = ? AND status = 'pending'").get(user.id).count;
    const completedExchangesCount = db.prepare("SELECT COUNT(*) as count FROM requests WHERE (provider_id = ? OR seeker_id = ?) AND status = 'completed'").get(user.id, user.id).count;
    const requirementsCount = db.prepare("SELECT COUNT(*) as count FROM requirements WHERE seeker_id = ? AND status = 'open'").get(user.id).count;

    res.json({
      user,
      stats: {
        totalListings: resourcesCount,
        pendingRequests: pendingRequestsCount,
        completedExchanges: completedExchangesCount,
        openRequirements: requirementsCount
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/profile/:id (public profile view)
router.get('/profile/:id', (req, res) => {
  try {
    const { id } = req.params;
    const business = db.prepare('SELECT id, name, type, email, phone, location, city, lat, lng, avatar, rating, reviews_count, verified, about FROM businesses WHERE id = ?').get(id);

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    const resourcesCount = db.prepare('SELECT COUNT(*) as count FROM resources WHERE provider_id = ?').get(id).count;
    const pendingRequestsCount = db.prepare("SELECT COUNT(*) as count FROM requests WHERE provider_id = ? AND status = 'pending'").get(id).count;
    const completedExchangesCount = db.prepare("SELECT COUNT(*) as count FROM requests WHERE (provider_id = ? OR seeker_id = ?) AND status = 'completed'").get(id, id).count;
    const requirementsCount = db.prepare("SELECT COUNT(*) as count FROM requirements WHERE seeker_id = ? AND status = 'open'").get(id).count;

    res.json({
      ...business,
      stats: {
        totalListings: resourcesCount,
        pendingRequests: pendingRequestsCount,
        completedExchanges: completedExchangesCount,
        openRequirements: requirementsCount
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
