import express from 'express';
import { db } from '../db.js';
import { LOGISTICS_CONFIG, calculateLogisticsFee } from '../config/logistics.js';

const router = express.Router();

/**
 * GET /api/logistics/estimate
 * Query params:
 * - distance_km (number): estimated route distance
 * - resource_id (string, optional): to read provider custom transport rates
 */
router.get('/estimate', (req, res) => {
  try {
    const { distance_km = 5, resource_id } = req.query;
    let customRate = null;
    let supportsTransport = true;

    if (resource_id) {
      const resource = db.prepare('SELECT supports_transport, transport_rate_per_km FROM resources WHERE id = ?').get(resource_id);
      if (resource) {
        if (resource.supports_transport === 0) {
          supportsTransport = false;
        }
        if (resource.transport_rate_per_km != null && Number(resource.transport_rate_per_km) > 0) {
          customRate = Number(resource.transport_rate_per_km);
        }
      }
    }

    const estimate = calculateLogisticsFee(Number(distance_km) || 1, customRate);

    res.json({
      ...estimate,
      supports_transport: supportsTransport,
      config: {
        base_fee: LOGISTICS_CONFIG.base_fee,
        per_km_rate: customRate || LOGISTICS_CONFIG.per_km_rate
      }
    });
  } catch (err) {
    console.error('Logistics estimate error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
