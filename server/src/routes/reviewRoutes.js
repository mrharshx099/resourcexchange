import express from 'express';
import crypto from 'crypto';
import { db } from '../db.js';

const router = express.Router();

// Submit a review for a completed request
router.post('/', (req, res) => {
  try {
    const {
      request_id,
      rating,
      tags = [],
      comment = ''
    } = req.body;

    if (!request_id || !rating) {
      return res.status(400).json({ error: 'request_id and rating are required' });
    }

    const request = db.prepare('SELECT * FROM requests WHERE id = ?').get(request_id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const existing = db.prepare('SELECT id FROM reviews WHERE request_id = ?').get(request_id);
    if (existing) {
      return res.status(400).json({ error: 'A review has already been submitted for this exchange' });
    }

    const reviewId = `rev_${crypto.randomUUID().slice(0, 8)}`;

    db.prepare(`
      INSERT INTO reviews (id, request_id, resource_id, provider_id, seeker_id, rating, tags, comment)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      reviewId, request_id, request.resource_id, request.provider_id,
      request.seeker_id, Number(rating), JSON.stringify(tags), comment
    );

    // Recalculate provider overall rating & review count
    const stats = db.prepare(`
      SELECT AVG(rating) as avg_rating, COUNT(*) as count 
      FROM reviews 
      WHERE provider_id = ?
    `).get(request.provider_id);

    const newRating = Math.round((stats.avg_rating || 5.0) * 10) / 10;

    db.prepare(`
      UPDATE businesses 
      SET rating = ?, reviews_count = ?
      WHERE id = ?
    `).run(newRating, stats.count, request.provider_id);

    // Notify provider of new review
    const seeker = db.prepare('SELECT name FROM businesses WHERE id = ?').get(request.seeker_id);
    const notifId = `notif_${crypto.randomUUID().slice(0, 8)}`;
    db.prepare(`
      INSERT INTO notifications (id, business_id, type, title, message, link_type, link_id, is_read)
      VALUES (?, ?, 'review_received', 'New Rating & Review Received', ?, 'resource', ?)
    `).run(
      notifId, request.provider_id,
      `${seeker ? seeker.name : 'A seeker'} left a ${rating}-star review for your exchange!`,
      request.resource_id
    );

    const created = db.prepare('SELECT * FROM reviews WHERE id = ?').get(reviewId);
    res.status(201).json({
      ...created,
      tags: JSON.parse(created.tags || '[]')
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get reviews for a specific resource
router.get('/resource/:resourceId', (req, res) => {
  try {
    const { resourceId } = req.params;
    const reviews = db.prepare(`
      SELECT rev.*, b.name as seeker_name, b.avatar as seeker_avatar, b.type as seeker_type
      FROM reviews rev
      JOIN businesses b ON rev.seeker_id = b.id
      WHERE rev.resource_id = ?
      ORDER BY rev.created_at DESC
    `).all(resourceId);

    res.json(reviews.map(r => ({
      ...r,
      tags: JSON.parse(r.tags || '[]')
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get reviews for a specific provider business
router.get('/business/:businessId', (req, res) => {
  try {
    const { businessId } = req.params;
    const reviews = db.prepare(`
      SELECT rev.*, 
             b.name as seeker_name, 
             b.avatar as seeker_avatar, 
             b.type as seeker_type,
             r.title as resource_title
      FROM reviews rev
      JOIN businesses b ON rev.seeker_id = b.id
      JOIN resources r ON rev.resource_id = r.id
      WHERE rev.provider_id = ?
      ORDER BY rev.created_at DESC
    `).all(businessId);

    res.json(reviews.map(r => ({
      ...r,
      tags: JSON.parse(r.tags || '[]')
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
