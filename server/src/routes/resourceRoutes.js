import express from 'express';
import crypto from 'crypto';
import { db } from '../db.js';
import { scoreResource } from '../matchingEngine.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Search & list resources with rule-based scoring & ranking
router.get('/', (req, res) => {
  try {
    const {
      type,
      category,
      minCapacity,
      maxPrice,
      pricingUnit = 'day',
      seekerLat,
      seekerLng,
      maxDistanceKm,
      startDate,
      endDate,
      sortBy = 'match', // 'match' | 'price_asc' | 'price_desc' | 'distance' | 'rating'
      searchQuery,
      excludeProviderId
    } = req.query;

    let query = `
      SELECT r.*, 
             b.name as provider_name,
             b.type as provider_type,
             b.rating as provider_rating,
             b.reviews_count as provider_reviews_count,
             b.avatar as provider_avatar,
             b.location as provider_location,
             b.verified as provider_verified
      FROM resources r
      JOIN businesses b ON r.provider_id = b.id
      WHERE r.status = 'active'
    `;

    const params = [];

    if (excludeProviderId) {
      query += ` AND r.provider_id != ?`;
      params.push(excludeProviderId);
    }

    if (type && type !== 'All') {
      query += ` AND r.type = ?`;
      params.push(type);
    }

    if (category && category !== 'All') {
      query += ` AND r.category = ?`;
      params.push(category);
    }

    if (minCapacity) {
      query += ` AND r.capacity >= ?`;
      params.push(Number(minCapacity));
    }

    if (searchQuery) {
      query += ` AND (r.title LIKE ? OR r.description LIKE ? OR r.location LIKE ?)`;
      const term = `%${searchQuery}%`;
      params.push(term, term, term);
    }

    let resources = db.prepare(query).all(...params);

    // Parse JSON fields
    resources = resources.map(r => ({
      ...r,
      amenities: JSON.parse(r.amenities || '[]'),
      images: JSON.parse(r.images || '[]')
    }));

    // Fetch active booked slots to check availability
    const bookedSlots = db.prepare('SELECT * FROM availability_slots WHERE is_booked = 1').all();

    // Apply rule-based scoring to each resource
    const scoredResources = resources.map(resource => {
      const scoring = scoreResource(
        resource,
        {
          seekerLat: seekerLat ? Number(seekerLat) : null,
          seekerLng: seekerLng ? Number(seekerLng) : null,
          maxDistanceKm: maxDistanceKm ? Number(maxDistanceKm) : null,
          startDate,
          endDate,
          neededCapacity: minCapacity ? Number(minCapacity) : null,
          maxBudget: maxPrice ? Number(maxPrice) : null,
          pricingUnit
        },
        bookedSlots
      );

      return {
        ...resource,
        ...scoring
      };
    });

    // Filter by max distance if requested
    let filtered = scoredResources;
    if (maxDistanceKm) {
      filtered = filtered.filter(r => r.distanceKm == null || r.distanceKm <= Number(maxDistanceKm));
    }

    // Sort according to preference
    if (sortBy === 'match') {
      filtered.sort((a, b) => b.matchScore - a.matchScore);
    } else if (sortBy === 'price_asc') {
      filtered.sort((a, b) => (a.price_per_day || a.price_per_hour) - (b.price_per_day || b.price_per_hour));
    } else if (sortBy === 'price_desc') {
      filtered.sort((a, b) => (b.price_per_day || b.price_per_hour) - (a.price_per_day || a.price_per_hour));
    } else if (sortBy === 'distance') {
      filtered.sort((a, b) => (a.distanceKm || 999) - (b.distanceKm || 999));
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => (b.provider_rating || 0) - (a.provider_rating || 0));
    }

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get resources by Provider ID
router.get('/provider/:providerId', (req, res) => {
  try {
    const { providerId } = req.params;
    const resources = db.prepare(`
      SELECT r.*,
             (SELECT COUNT(*) FROM requests req WHERE req.resource_id = r.id AND req.status = 'pending') as pending_requests_count,
             (SELECT COUNT(*) FROM requests req WHERE req.resource_id = r.id AND req.status = 'accepted') as active_bookings_count
      FROM resources r
      WHERE r.provider_id = ?
      ORDER BY r.created_at DESC
    `).all(providerId);

    const parsed = resources.map(r => ({
      ...r,
      amenities: JSON.parse(r.amenities || '[]'),
      images: JSON.parse(r.images || '[]')
    }));

    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single resource detail with availability slots & reviews
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const resource = db.prepare(`
      SELECT r.*, 
             b.name as provider_name,
             b.type as provider_type,
             b.rating as provider_rating,
             b.reviews_count as provider_reviews_count,
             b.avatar as provider_avatar,
             b.location as provider_location,
             b.city as provider_city,
             b.phone as provider_phone,
             b.email as provider_email,
             b.verified as provider_verified
      FROM resources r
      JOIN businesses b ON r.provider_id = b.id
      WHERE r.id = ?
    `).get(id);

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    const availabilitySlots = db.prepare('SELECT * FROM availability_slots WHERE resource_id = ? ORDER BY start_time ASC').all(id);
    const reviews = db.prepare(`
      SELECT rev.*, b.name as seeker_name, b.avatar as seeker_avatar
      FROM reviews rev
      JOIN businesses b ON rev.seeker_id = b.id
      WHERE rev.resource_id = ?
      ORDER BY rev.created_at DESC
    `).all(id);

    res.json({
      ...resource,
      amenities: JSON.parse(resource.amenities || '[]'),
      images: JSON.parse(resource.images || '[]'),
      availabilitySlots,
      reviews: reviews.map(rv => ({
        ...rv,
        tags: JSON.parse(rv.tags || '[]')
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new resource listing
router.post('/', optionalAuth, (req, res) => {
  try {
    const provider_id = req.user?.id || req.body.provider_id;
    const {
      title,
      description,
      type,
      category,
      quantity = 1,
      capacity = 1,
      capacity_unit = 'units',
      location,
      lat,
      lng,
      price_per_hour = 0,
      price_per_day = 0,
      pricing_unit = 'day',
      min_duration_hours = 2,
      conditions = '',
      amenities = [],
      image_url,
      images = [],
      supports_transport = 0,
      transport_rate_per_km = null
    } = req.body;

    if (!provider_id || !title || !type || !location) {
      return res.status(400).json({ error: 'Provider ID, title, type, and location are required' });
    }

    const id = `res_${crypto.randomUUID().slice(0, 8)}`;
    const defaultImg = image_url || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80';
    const finalImages = images.length ? images : [defaultImg];

    // Default lat/lng near Midtown NYC if not provided
    const finalLat = lat ? Number(lat) : 40.7580 + (Math.random() - 0.5) * 0.03;
    const finalLng = lng ? Number(lng) : -73.9855 + (Math.random() - 0.5) * 0.03;

    db.prepare(`
      INSERT INTO resources (
        id, provider_id, title, description, type, category,
        quantity, capacity, capacity_unit, location, lat, lng,
        price_per_hour, price_per_day, pricing_unit, min_duration_hours,
        conditions, amenities, image_url, images, status,
        supports_transport, transport_rate_per_km
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)
    `).run(
      id, provider_id, title, description || '', type, category || type,
      Number(quantity), Number(capacity), capacity_unit, location, finalLat, finalLng,
      Number(price_per_hour), Number(price_per_day), pricing_unit, Number(min_duration_hours),
      conditions, JSON.stringify(amenities), defaultImg, JSON.stringify(finalImages),
      supports_transport ? 1 : 0,
      transport_rate_per_km != null ? Number(transport_rate_per_km) : null
    );

    const created = db.prepare('SELECT * FROM resources WHERE id = ?').get(id);
    res.status(201).json({
      ...created,
      amenities: JSON.parse(created.amenities || '[]'),
      images: JSON.parse(created.images || '[]')
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update resource listing
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM resources WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    const {
      title,
      description,
      type,
      category,
      quantity,
      capacity,
      capacity_unit,
      location,
      lat,
      lng,
      price_per_hour,
      price_per_day,
      pricing_unit,
      min_duration_hours,
      conditions,
      amenities,
      image_url,
      images,
      status,
      supports_transport,
      transport_rate_per_km
    } = req.body;

    db.prepare(`
      UPDATE resources SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        type = COALESCE(?, type),
        category = COALESCE(?, category),
        quantity = COALESCE(?, quantity),
        capacity = COALESCE(?, capacity),
        capacity_unit = COALESCE(?, capacity_unit),
        location = COALESCE(?, location),
        lat = COALESCE(?, lat),
        lng = COALESCE(?, lng),
        price_per_hour = COALESCE(?, price_per_hour),
        price_per_day = COALESCE(?, price_per_day),
        pricing_unit = COALESCE(?, pricing_unit),
        min_duration_hours = COALESCE(?, min_duration_hours),
        conditions = COALESCE(?, conditions),
        amenities = COALESCE(?, amenities),
        image_url = COALESCE(?, image_url),
        images = COALESCE(?, images),
        status = COALESCE(?, status),
        supports_transport = COALESCE(?, supports_transport),
        transport_rate_per_km = COALESCE(?, transport_rate_per_km)
      WHERE id = ?
    `).run(
      title, description, type, category,
      quantity != null ? Number(quantity) : null,
      capacity != null ? Number(capacity) : null,
      capacity_unit, location,
      lat != null ? Number(lat) : null,
      lng != null ? Number(lng) : null,
      price_per_hour != null ? Number(price_per_hour) : null,
      price_per_day != null ? Number(price_per_day) : null,
      pricing_unit,
      min_duration_hours != null ? Number(min_duration_hours) : null,
      conditions,
      amenities ? JSON.stringify(amenities) : null,
      image_url,
      images ? JSON.stringify(images) : null,
      status,
      supports_transport != null ? (supports_transport ? 1 : 0) : null,
      transport_rate_per_km != null ? Number(transport_rate_per_km) : null,
      id
    );

    const updated = db.prepare('SELECT * FROM resources WHERE id = ?').get(id);
    res.json({
      ...updated,
      amenities: JSON.parse(updated.amenities || '[]'),
      images: JSON.parse(updated.images || '[]')
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete resource listing
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM resources WHERE id = ?').run(id);
    res.json({ success: true, message: 'Resource listing deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Block availability slot (Maintenance or Blackout)
router.post('/:id/availability/block', (req, res) => {
  try {
    const { id } = req.params;
    const { start_time, end_time, reason = 'blackout' } = req.body;

    if (!start_time || !end_time) {
      return res.status(400).json({ error: 'start_time and end_time are required' });
    }

    const slotId = `slot_${crypto.randomUUID().slice(0, 8)}`;
    db.prepare(`
      INSERT INTO availability_slots (id, resource_id, start_time, end_time, is_booked, reason)
      VALUES (?, ?, ?, ?, 1, ?)
    `).run(slotId, id, start_time, end_time, reason);

    const slot = db.prepare('SELECT * FROM availability_slots WHERE id = ?').get(slotId);
    res.status(201).json(slot);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Unblock availability slot
router.delete('/:id/availability/:slotId', (req, res) => {
  try {
    const { slotId } = req.params;
    db.prepare('DELETE FROM availability_slots WHERE id = ?').run(slotId);
    res.json({ success: true, message: 'Slot unblocked successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
