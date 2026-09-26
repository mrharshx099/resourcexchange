import express from 'express';
import crypto from 'crypto';
import { db } from '../db.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Get all open requirements (Wanted Board)
router.get('/', (req, res) => {
  try {
    const { category, type, seekerId } = req.query;
    let query = `
      SELECT req.*,
             b.name as seeker_name,
             b.type as seeker_type,
             b.rating as seeker_rating,
             b.avatar as seeker_avatar,
             b.location as seeker_location
      FROM requirements req
      JOIN businesses b ON req.seeker_id = b.id
      WHERE req.status = 'open'
    `;
    const params = [];

    if (seekerId) {
      query += ` AND req.seeker_id = ?`;
      params.push(seekerId);
    }
    if (category && category !== 'All') {
      query += ` AND req.category = ?`;
      params.push(category);
    }
    if (type && type !== 'All') {
      query += ` AND req.type = ?`;
      params.push(type);
    }

    query += ` ORDER BY req.created_at DESC`;

    const requirements = db.prepare(query).all(...params);
    res.json(requirements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Post a new requirement
router.post('/', optionalAuth, (req, res) => {
  try {
    const seeker_id = req.user?.id || req.body.seeker_id;
    const {
      title,
      category,
      type,
      capacity_needed,
      location,
      lat,
      lng,
      start_date,
      end_date,
      max_budget,
      budget_type = 'total',
      description = ''
    } = req.body;

    if (!seeker_id || !title || !category || !start_date || !end_date) {
      return res.status(400).json({ error: 'seeker_id, title, category, start_date, and end_date are required' });
    }

    const id = `rfq_${crypto.randomUUID().slice(0, 8)}`;
    const finalLat = lat ? Number(lat) : 40.7580 + (Math.random() - 0.5) * 0.04;
    const finalLng = lng ? Number(lng) : -73.9855 + (Math.random() - 0.5) * 0.04;

    db.prepare(`
      INSERT INTO requirements (
        id, seeker_id, title, category, type, capacity_needed,
        location, lat, lng, start_date, end_date, max_budget,
        budget_type, description, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open')
    `).run(
      id, seeker_id, title, category, type || category, Number(capacity_needed || 1),
      location || 'New York, NY', finalLat, finalLng, start_date, end_date,
      Number(max_budget || 500), budget_type, description
    );

    const created = db.prepare('SELECT * FROM requirements WHERE id = ?').get(id);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Close a requirement
router.put('/:id/close', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare(`UPDATE requirements SET status = 'closed' WHERE id = ?`).run(id);
    const updated = db.prepare('SELECT * FROM requirements WHERE id = ?').get(id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
