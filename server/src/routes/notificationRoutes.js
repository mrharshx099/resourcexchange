import express from 'express';
import { db } from '../db.js';

const router = express.Router();

// Get notifications for a business
router.get('/:businessId', (req, res) => {
  try {
    const { businessId } = req.params;
    const notifications = db.prepare(`
      SELECT * FROM notifications 
      WHERE business_id = ? 
      ORDER BY created_at DESC 
      LIMIT 30
    `).all(businessId);

    const unreadCount = db.prepare(`
      SELECT COUNT(*) as count FROM notifications 
      WHERE business_id = ? AND is_read = 0
    `).get(businessId).count;

    res.json({
      notifications,
      unreadCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark single notification as read
router.put('/:id/read', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark all notifications as read for business
router.put('/read-all/:businessId', (req, res) => {
  try {
    const { businessId } = req.params;
    db.prepare('UPDATE notifications SET is_read = 1 WHERE business_id = ?').run(businessId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
