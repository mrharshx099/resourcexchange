import express from 'express';
import { seedDatabase } from '../seedData.js';

const router = express.Router();

// Reset database to initial rich seed demo state
router.post('/reset', (req, res) => {
  try {
    seedDatabase();
    res.json({ success: true, message: 'Database reset to demo state successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
