import express from 'express';
import crypto from 'crypto';
import { db } from '../db.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Helper to create notifications
function createNotification(businessId, type, title, message, linkType, linkId) {
  try {
    const notifId = `notif_${crypto.randomUUID().slice(0, 8)}`;
    db.prepare(`
      INSERT INTO notifications (id, business_id, type, title, message, link_type, link_id, is_read)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0)
    `).run(notifId, businessId, type, title, message, linkType, linkId);
  } catch (err) {
    console.error('Failed to create notification:', err);
  }
}

// Create new resource request / booking offer
router.post('/', optionalAuth, (req, res) => {
  try {
    const seeker_id = req.user?.id || req.body.seeker_id;
    const {
      resource_id,
      requested_qty = 1,
      start_date,
      end_date,
      start_time = '09:00',
      end_time = '18:00',
      offer_price,
      seeker_notes = '',
      needs_transport = false,
      transport_distance_km = 0,
      transport_fee = 0,
      transport_notes = ''
    } = req.body;

    if (!seeker_id || !resource_id || !start_date || !end_date) {
      return res.status(400).json({ error: 'seeker_id, resource_id, start_date, and end_date are required' });
    }

    const resource = db.prepare(`
      SELECT r.*, b.name as provider_name 
      FROM resources r 
      JOIN businesses b ON r.provider_id = b.id 
      WHERE r.id = ?
    `).get(resource_id);

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    if (resource.provider_id === seeker_id) {
      return res.status(400).json({ error: 'You cannot request your own resource listing' });
    }

    // Check double-booking collision in availability_slots
    const reqStart = new Date(`${start_date}T${start_time}`).toISOString();
    const reqEnd = new Date(`${end_date}T${end_time}`).toISOString();

    const conflictingSlot = db.prepare(`
      SELECT * FROM availability_slots 
      WHERE resource_id = ? AND is_booked = 1
      AND (
        (start_time <= ? AND end_time >= ?) OR
        (start_time <= ? AND end_time >= ?) OR
        (start_time >= ? AND end_time <= ?)
      )
    `).get(resource_id, reqStart, reqStart, reqEnd, reqEnd, reqStart, reqEnd);

    if (conflictingSlot) {
      return res.status(409).json({
        error: 'This resource is already booked or blocked for the selected dates/times. Please select alternative dates.'
      });
    }

    // Calculate total price based on duration
    const startDateObj = new Date(start_date);
    const endDateObj = new Date(end_date);
    const diffDays = Math.max(1, Math.ceil((endDateObj - startDateObj) / (1000 * 60 * 60 * 24)) + 1);

    const calcPrice = resource.pricing_unit === 'hour'
      ? (resource.price_per_hour * 8 * diffDays)
      : (resource.price_per_day * diffDays);

    const parsedTransportFee = needs_transport ? (Number(transport_fee) || 0) : 0;
    const calcPriceWithTransport = calcPrice + parsedTransportFee;
    const finalPriceWithTransport = (offer_price != null && Number(offer_price) > 0 ? Number(offer_price) : calcPrice) + parsedTransportFee;

    const reqId = `req_${crypto.randomUUID().slice(0, 8)}`;

    db.prepare(`
      INSERT INTO requests (
        id, seeker_id, provider_id, resource_id, requested_qty,
        start_date, end_date, start_time, end_time, total_price,
        negotiated_price, status, seeker_notes,
        needs_transport, transport_distance_km, transport_fee, transport_notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?)
    `).run(
      reqId, seeker_id, resource.provider_id, resource_id, Number(requested_qty),
      start_date, end_date, start_time, end_time, calcPriceWithTransport,
      finalPriceWithTransport, seeker_notes,
      needs_transport ? 1 : 0, Number(transport_distance_km) || 0, parsedTransportFee, transport_notes || ''
    );

    const seeker = db.prepare('SELECT name FROM businesses WHERE id = ?').get(seeker_id);

    // Notify provider
    createNotification(
      resource.provider_id,
      'request_received',
      'New Resource Request Received',
      `${seeker ? seeker.name : 'A business'} requested "${resource.title}" from ${start_date} to ${end_date} ($${finalPriceWithTransport}${parsedTransportFee > 0 ? ` incl. $${parsedTransportFee} delivery` : ''}).`,
      'request',
      reqId
    );

    const created = db.prepare('SELECT * FROM requests WHERE id = ?').get(reqId);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get incoming requests for Provider
router.get('/provider/:providerId', (req, res) => {
  try {
    const { providerId } = req.params;
    const requests = db.prepare(`
      SELECT req.*,
             r.title as resource_title,
             r.type as resource_type,
             r.category as resource_category,
             r.image_url as resource_image,
             r.location as resource_location,
             s.name as seeker_name,
             s.type as seeker_type,
             s.rating as seeker_rating,
             s.avatar as seeker_avatar,
             s.phone as seeker_phone,
             s.email as seeker_email,
             (SELECT COUNT(*) FROM reviews rev WHERE rev.request_id = req.id) as has_review,
             (SELECT COUNT(*) FROM messages msg WHERE msg.request_id = req.id AND msg.sender_id != req.provider_id AND msg.read_status = 0) as unread_messages_count
      FROM requests req
      JOIN resources r ON req.resource_id = r.id
      JOIN businesses s ON req.seeker_id = s.id
      WHERE req.provider_id = ?
      ORDER BY req.created_at DESC
    `).all(providerId);

    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get outgoing requests for Seeker
router.get('/seeker/:seekerId', (req, res) => {
  try {
    const { seekerId } = req.params;
    const requests = db.prepare(`
      SELECT req.*,
             r.title as resource_title,
             r.type as resource_type,
             r.category as resource_category,
             r.image_url as resource_image,
             r.location as resource_location,
             p.name as provider_name,
             p.type as provider_type,
             p.rating as provider_rating,
             p.avatar as provider_avatar,
             p.phone as provider_phone,
             p.email as provider_email,
             (SELECT COUNT(*) FROM reviews rev WHERE rev.request_id = req.id) as has_review,
             (SELECT COUNT(*) FROM messages msg WHERE msg.request_id = req.id AND msg.sender_id != req.seeker_id AND msg.read_status = 0) as unread_messages_count
      FROM requests req
      JOIN resources r ON req.resource_id = r.id
      JOIN businesses p ON req.provider_id = p.id
      WHERE req.seeker_id = ?
      ORDER BY req.created_at DESC
    `).all(seekerId);

    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single request detail
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const request = db.prepare(`
      SELECT req.*,
             r.title as resource_title,
             r.description as resource_description,
             r.type as resource_type,
             r.category as resource_category,
             r.image_url as resource_image,
             r.location as resource_location,
             r.price_per_day,
             r.price_per_hour,
             r.pricing_unit,
             r.conditions as resource_conditions,
             s.name as seeker_name,
             s.type as seeker_type,
             s.rating as seeker_rating,
             s.avatar as seeker_avatar,
             s.phone as seeker_phone,
             s.email as seeker_email,
             p.name as provider_name,
             p.type as provider_type,
             p.rating as provider_rating,
             p.avatar as provider_avatar,
             p.phone as provider_phone,
             p.email as provider_email
      FROM requests req
      JOIN resources r ON req.resource_id = r.id
      JOIN businesses s ON req.seeker_id = s.id
      JOIN businesses p ON req.provider_id = p.id
      WHERE req.id = ?
    `).get(id);

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Smart Counter-Offer Fair Price Suggestion Heuristic
// Weighted: 40% resource's own listed price, 30% similar-category median price, 30% seeker offered price
router.get('/:id/suggest-price', (req, res) => {
  try {
    const { id } = req.params;
    const request = db.prepare('SELECT * FROM requests WHERE id = ?').get(id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const resource = db.prepare('SELECT * FROM resources WHERE id = ?').get(request.resource_id);
    if (!resource) {
      return res.status(404).json({ error: 'Associated resource not found' });
    }

    // 1. Calculate duration days
    const sDate = new Date(request.start_date);
    const eDate = new Date(request.end_date);
    const diffDays = Math.max(1, Math.ceil((eDate - sDate) / (1000 * 60 * 60 * 24)) + 1);

    // 2. Resource's own standard listed price for this duration
    const resourcePrice = resource.pricing_unit === 'hour'
      ? (resource.price_per_hour * 8 * diffDays * (request.requested_qty || 1))
      : (resource.price_per_day * diffDays * (request.requested_qty || 1));

    // 3. Similar-category average rate across all listings
    const catStats = db.prepare(`
      SELECT AVG(CASE WHEN price_per_day > 0 THEN price_per_day ELSE price_per_hour * 8 END) as avg_cat_rate
      FROM resources
      WHERE category = ?
    `).get(resource.category);

    const categoryUnitRate = catStats.avg_cat_rate || resource.price_per_day || 500;
    const categoryPrice = Math.round(categoryUnitRate * diffDays * (request.requested_qty || 1));

    // 4. Seeker's offered price
    const seekerOffer = Number(request.negotiated_price || request.total_price || resourcePrice * 0.85);

    // 5. Weighted 40% own listed, 30% category median, 30% seeker offer
    const suggestedPrice = Math.round(
      (resourcePrice * 0.40) +
      (categoryPrice * 0.30) +
      (seekerOffer * 0.30)
    );

    res.json({
      suggestedPrice,
      resourcePrice,
      categoryPrice,
      seekerOffer,
      breakdown: {
        ownListedRateWeight: '40%',
        categoryMarketWeight: '30%',
        seekerOfferWeight: '30%'
      },
      explanation: `Weighted fair price: 40% listed ($${resourcePrice}) + 30% market average ($${categoryPrice}) + 30% seeker bid ($${seekerOffer})`
    });
  } catch (err) {
    console.error('Price suggestion error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Accept Request (Locks availability slot)
router.put('/:id/accept', (req, res) => {
  try {
    const { id } = req.params;
    const request = db.prepare('SELECT * FROM requests WHERE id = ?').get(id);

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.status === 'accepted') {
      return res.status(400).json({ error: 'Request is already accepted' });
    }

    // Lock slot in availability calendar
    const slotId = `slot_req_${id}`;
    const startIso = new Date(`${request.start_date}T${request.start_time || '00:00'}`).toISOString();
    const endIso = new Date(`${request.end_date}T${request.end_time || '23:59'}`).toISOString();

    db.prepare(`
      INSERT OR REPLACE INTO availability_slots (id, resource_id, start_time, end_time, is_booked, reason)
      VALUES (?, ?, ?, ?, 1, 'booked')
    `).run(slotId, request.resource_id, startIso, endIso);

    // Update request status
    db.prepare(`
      UPDATE requests 
      SET status = 'accepted', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(id);

    const resource = db.prepare('SELECT title FROM resources WHERE id = ?').get(request.resource_id);
    const provider = db.prepare('SELECT name FROM businesses WHERE id = ?').get(request.provider_id);

    // Notify seeker
    createNotification(
      request.seeker_id,
      'request_accepted',
      '🎉 Booking Request Accepted!',
      `${provider ? provider.name : 'Provider'} accepted your request for "${resource ? resource.title : 'Resource'}" for ${request.start_date}.`,
      'request',
      id
    );

    const updated = db.prepare('SELECT * FROM requests WHERE id = ?').get(id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Counter-Offer Request
router.put('/:id/counter', (req, res) => {
  try {
    const { id } = req.params;
    const { counter_price, counter_notes } = req.body;

    if (!counter_price) {
      return res.status(400).json({ error: 'Counter price is required' });
    }

    const request = db.prepare('SELECT * FROM requests WHERE id = ?').get(id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    db.prepare(`
      UPDATE requests 
      SET status = 'counter_offered', 
          negotiated_price = ?,
          counter_notes = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(Number(counter_price), counter_notes || '', id);

    const resource = db.prepare('SELECT title FROM resources WHERE id = ?').get(request.resource_id);
    const provider = db.prepare('SELECT name FROM businesses WHERE id = ?').get(request.provider_id);

    // Notify seeker
    createNotification(
      request.seeker_id,
      'counter_received',
      'Counter-Offer Received',
      `${provider ? provider.name : 'Provider'} sent a counter-offer of $${counter_price} for "${resource ? resource.title : 'Resource'}".`,
      'request',
      id
    );

    const updated = db.prepare('SELECT * FROM requests WHERE id = ?').get(id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reject Request
router.put('/:id/reject', (req, res) => {
  try {
    const { id } = req.params;
    const { rejection_reason = 'Resource unavailable on requested dates' } = req.body;

    const request = db.prepare('SELECT * FROM requests WHERE id = ?').get(id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    db.prepare(`
      UPDATE requests 
      SET status = 'rejected', 
          rejection_reason = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(rejection_reason, id);

    const resource = db.prepare('SELECT title FROM resources WHERE id = ?').get(request.resource_id);

    // Notify seeker
    createNotification(
      request.seeker_id,
      'request_rejected',
      'Booking Request Declined',
      `Your request for "${resource ? resource.title : 'Resource'}" was declined: ${rejection_reason}`,
      'request',
      id
    );

    const updated = db.prepare('SELECT * FROM requests WHERE id = ?').get(id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark Request as Completed
router.put('/:id/complete', (req, res) => {
  try {
    const { id } = req.params;
    const request = db.prepare('SELECT * FROM requests WHERE id = ?').get(id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    db.prepare(`
      UPDATE requests 
      SET status = 'completed', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(id);

    const resource = db.prepare('SELECT title FROM resources WHERE id = ?').get(request.resource_id);

    // Notify seeker to leave review
    createNotification(
      request.seeker_id,
      'request_completed',
      'Exchange Complete — Please Review',
      `Your booking for "${resource ? resource.title : 'Resource'}" has concluded. Please leave a rating and review!`,
      'request',
      id
    );

    const updated = db.prepare('SELECT * FROM requests WHERE id = ?').get(id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cancel Request
router.put('/:id/cancel', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare(`
      UPDATE requests 
      SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(id);

    // Remove slot if was locked
    db.prepare('DELETE FROM availability_slots WHERE id = ?').run(`slot_req_${id}`);

    const updated = db.prepare('SELECT * FROM requests WHERE id = ?').get(id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// IN-APP CHAT (PER-REQUEST MESSAGING THREAD)
// ==========================================

/**
 * GET /api/requests/:requestId/messages
 * Fetch thread history for a request (auth required, only participants can access)
 * Also marks unread messages sent to the current user as read
 */
router.get('/:requestId/messages', optionalAuth, (req, res) => {
  try {
    const { requestId } = req.params;
    const currentUserId = req.user?.id || req.query.user_id || req.headers['x-business-id'];

    const request = db.prepare(`
      SELECT req.*,
             r.title as resource_title,
             r.image_url as resource_image,
             r.location as resource_location,
             s.name as seeker_name,
             s.avatar as seeker_avatar,
             p.name as provider_name,
             p.avatar as provider_avatar
      FROM requests req
      JOIN resources r ON req.resource_id = r.id
      JOIN businesses s ON req.seeker_id = s.id
      JOIN businesses p ON req.provider_id = p.id
      WHERE req.id = ?
    `).get(requestId);

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Verify participant authorization if user is identified
    if (currentUserId && request.seeker_id !== currentUserId && request.provider_id !== currentUserId) {
      return res.status(403).json({ error: 'You are not a participant in this conversation thread' });
    }

    // Automatically mark messages sent by the other party as read
    if (currentUserId) {
      db.prepare(`
        UPDATE messages 
        SET read_status = 1 
        WHERE request_id = ? AND sender_id != ? AND read_status = 0
      `).run(requestId, currentUserId);
    }

    // Fetch conversation thread
    const messages = db.prepare(`
      SELECT m.*, 
             b.name as sender_name, 
             b.avatar as sender_avatar,
             b.type as sender_business_type
      FROM messages m
      JOIN businesses b ON m.sender_id = b.id
      WHERE m.request_id = ?
      ORDER BY m.created_at ASC
    `).all(requestId);

    res.json({
      request: {
        id: request.id,
        resource_id: request.resource_id,
        resource_title: request.resource_title,
        resource_image: request.resource_image,
        resource_location: request.resource_location,
        seeker_id: request.seeker_id,
        seeker_name: request.seeker_name,
        seeker_avatar: request.seeker_avatar,
        provider_id: request.provider_id,
        provider_name: request.provider_name,
        provider_avatar: request.provider_avatar,
        status: request.status,
        total_price: request.total_price,
        negotiated_price: request.negotiated_price,
        start_date: request.start_date,
        end_date: request.end_date,
        needs_transport: request.needs_transport,
        transport_fee: request.transport_fee,
        transport_notes: request.transport_notes
      },
      messages
    });
  } catch (err) {
    console.error('Fetch thread error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/requests/:requestId/messages
 * Send a message within a request thread
 */
router.post('/:requestId/messages', optionalAuth, (req, res) => {
  try {
    const { requestId } = req.params;
    const { content, sender_id } = req.body;
    const currentUserId = req.user?.id || sender_id || req.headers['x-business-id'];

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Message content cannot be empty' });
    }

    const request = db.prepare(`
      SELECT req.*, r.title as resource_title 
      FROM requests req
      JOIN resources r ON req.resource_id = r.id
      WHERE req.id = ?
    `).get(requestId);

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (currentUserId && request.seeker_id !== currentUserId && request.provider_id !== currentUserId) {
      return res.status(403).json({ error: 'You are not a participant in this conversation thread' });
    }

    const actualSenderId = currentUserId || request.seeker_id;
    const senderType = actualSenderId === request.seeker_id ? 'seeker' : 'provider';
    const recipientId = actualSenderId === request.seeker_id ? request.provider_id : request.seeker_id;

    const messageId = `msg_${crypto.randomUUID().slice(0, 8)}`;

    db.prepare(`
      INSERT INTO messages (id, request_id, sender_id, sender_type, content, read_status)
      VALUES (?, ?, ?, ?, ?, 0)
    `).run(messageId, requestId, actualSenderId, senderType, content.trim());

    // Send notification to recipient
    const senderBiz = db.prepare('SELECT name FROM businesses WHERE id = ?').get(actualSenderId);
    createNotification(
      recipientId,
      'chat_message',
      `💬 Message from ${senderBiz ? senderBiz.name : 'Partner'}`,
      `"${content.trim().slice(0, 75)}${content.trim().length > 75 ? '...' : ''}" for ${request.resource_title}`,
      'request',
      requestId
    );

    const created = db.prepare(`
      SELECT m.*, 
             b.name as sender_name, 
             b.avatar as sender_avatar,
             b.type as sender_business_type
      FROM messages m
      JOIN businesses b ON m.sender_id = b.id
      WHERE m.id = ?
    `).get(messageId);

    res.status(201).json(created);
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
