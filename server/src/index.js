import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { db, initDatabase } from './db.js';
import { seedDatabase } from './seedData.js';
import authRoutes from './routes/authRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import requirementRoutes from './routes/requirementRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import seedRoutes from './routes/seedRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import logisticsRoutes from './routes/logisticsRoutes.js';

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware & CORS configuration
const frontendUrl = process.env.FRONTEND_URL;
app.use(cors({
  origin: frontendUrl ? [frontendUrl, 'http://localhost:5173'] : '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-business-id']
}));
app.use(express.json());

// Initialize DB schema
initDatabase();

// Seed if database is fresh
const bizCount = db.prepare('SELECT COUNT(*) as count FROM businesses').get().count;
if (bizCount === 0) {
  seedDatabase();
}

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/requirements', requirementRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/seed', seedRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/analytics', statsRoutes);
app.use('/api/logistics', logisticsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'ResourceXchange API'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 ResourceXchange Backend API running on http://localhost:${PORT}`);
});
