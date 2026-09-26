import bcrypt from 'bcryptjs';
import { db } from './db.js';

export function seedDatabase() {
  console.log('🌱 Seeding database with rich hospitality marketplace demo data...');

  // Pre-compute standard password hash for password123
  const defaultPasswordHash = bcrypt.hashSync('password123', 10);

  // Clear existing data
  db.exec(`
    DELETE FROM messages;
    DELETE FROM notifications;
    DELETE FROM reviews;
    DELETE FROM requests;
    DELETE FROM requirements;
    DELETE FROM availability_slots;
    DELETE FROM resources;
    DELETE FROM businesses;
  `);

  const insertBiz = db.prepare(`
    INSERT INTO businesses (id, name, type, email, password, password_hash, phone, location, city, lat, lng, avatar, rating, reviews_count, verified, about)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const businesses = [
    {
      id: 'biz_grand_palace',
      name: 'Grand Palace Hotel & Resort',
      type: 'Hotel & Resort',
      email: 'host@grandpalace.com',
      password: 'password123',
      phone: '+1 (212) 555-0140',
      location: '720 5th Avenue, Midtown',
      city: 'New York, NY',
      lat: 40.7614,
      lng: -73.9776,
      avatar: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=300&q=80',
      rating: 4.9,
      reviews_count: 42,
      verified: 1,
      about: 'Premier luxury 5-star hotel in Midtown Manhattan with expansive event spaces, excess commercial kitchen capacity on weekdays, and secure valet garages.'
    },
    {
      id: 'biz_spice_artistry',
      name: 'Spice Artistry Catering Co.',
      type: 'Catering & Dining',
      email: 'operations@spiceartistry.com',
      password: 'password123',
      phone: '+1 (212) 555-0199',
      location: '410 W 42nd St, Hell\'s Kitchen',
      city: 'New York, NY',
      lat: 40.7592,
      lng: -73.9942,
      avatar: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80',
      rating: 4.8,
      reviews_count: 29,
      verified: 1,
      about: 'State-of-the-art commercial production kitchens, bakery deck ovens, and high-volume catering gear available during our off-peak shift windows.'
    },
    {
      id: 'biz_azure_banquet',
      name: 'Azure Grand Banquet & Expo',
      type: 'Banquet & Convention',
      email: 'events@azuregrand.com',
      password: 'password123',
      phone: '+1 (212) 555-0182',
      location: '555 W 33rd St, Hudson Yards',
      city: 'New York, NY',
      lat: 40.7549,
      lng: -74.0021,
      avatar: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=300&q=80',
      rating: 4.9,
      reviews_count: 56,
      verified: 1,
      about: 'Versatile waterfront exhibition halls, luxury Chiavari furniture inventory, and breakout suites for conferences and galas.'
    },
    {
      id: 'biz_apex_av',
      name: 'Apex Stage & AudioVisual',
      type: 'Event Production',
      email: 'gear@apexstage.com',
      password: 'password123',
      phone: '+1 (212) 555-0114',
      location: '120 E 23rd St, Flatiron',
      city: 'New York, NY',
      lat: 40.7398,
      lng: -73.9857,
      avatar: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=300&q=80',
      rating: 4.9,
      reviews_count: 38,
      verified: 1,
      about: 'Concert-grade sound systems, 4K LED video walls, wireless mic racks, and atmospheric lighting rigs for hospitality and corporate events.'
    },
    {
      id: 'biz_metro_logistics',
      name: 'Metro Fleet & Cold Logistics',
      type: 'Fleet & Transport',
      email: 'fleet@metrotransport.com',
      password: 'password123',
      phone: '+1 (718) 555-0163',
      location: '28-10 Queens Plaza N, Long Island City',
      city: 'New York, NY',
      lat: 40.7512,
      lng: -73.9385,
      avatar: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=300&q=80',
      rating: 4.7,
      reviews_count: 18,
      verified: 1,
      about: 'Refrigerated Sprinter vans, 24ft liftgate box trucks, and secure bus staging yards for hospitality events across the tri-state area.'
    }
  ];

  for (const b of businesses) {
    insertBiz.run(b.id, b.name, b.type, b.email, b.password, defaultPasswordHash, b.phone, b.location, b.city, b.lat, b.lng, b.avatar, b.rating, b.reviews_count, b.verified, b.about);
  }

  // Insert Resources
  const insertResource = db.prepare(`
    INSERT INTO resources (id, provider_id, title, description, type, category, quantity, capacity, capacity_unit, location, lat, lng, price_per_hour, price_per_day, pricing_unit, min_duration_hours, conditions, amenities, image_url, images, status, supports_transport, transport_rate_per_km)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const resources = [
    {
      id: 'res_ballroom_azure',
      provider_id: 'biz_azure_banquet',
      title: 'Grand Crystal Ballroom & Pre-Function Foyer',
      description: 'Stunning 6,500 sq ft ballroom with crystal chandeliers, integrated intelligent lighting, sound system, and dedicated guest reception foyer. Ideal for wedding receptions, corporate galas, and award ceremonies.',
      type: 'Space',
      category: 'Banquet & Event Space',
      quantity: 1,
      capacity: 450,
      capacity_unit: 'guests',
      location: '555 W 33rd St, Hudson Yards',
      lat: 40.7549,
      lng: -74.0021,
      price_per_hour: 250,
      price_per_day: 1850,
      pricing_unit: 'day',
      min_duration_hours: 4,
      conditions: 'Caterer must provide proof of liability insurance ($2M). Music cutoff at 1:00 AM. Setup access starts 2 hours prior.',
      amenities: JSON.stringify(['High-Speed Wi-Fi', 'Integrated Audio System', 'Bridal Suite', 'Loading Dock Access', 'Dimmable Chandeliers', 'Climate Control']),
      image_url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80'
      ]),
      status: 'active'
    },
    {
      id: 'res_kitchen_spice',
      provider_id: 'biz_spice_artistry',
      title: 'Commercial Production Kitchen & Combi Ovens',
      description: 'Fully equipped DOH-certified commercial kitchen featuring 3 Rational Combi Ovens, 10-burner Garland ranges, 40-gallon tilting kettle, walk-in blast chiller, and extensive stainless prep counters.',
      type: 'Kitchen',
      category: 'Commercial Kitchen & Cold Storage',
      quantity: 1,
      capacity: 500,
      capacity_unit: 'meals/hr',
      location: '410 W 42nd St, Hell\'s Kitchen',
      lat: 40.7592,
      lng: -73.9942,
      price_per_hour: 95,
      price_per_day: 680,
      pricing_unit: 'hour',
      min_duration_hours: 3,
      conditions: 'Food handler certified staff required. Clean-as-you-go policy. Grease traps inspected daily.',
      amenities: JSON.stringify(['3x Rational Combi Ovens', 'Walk-in Refrigerator & Freezer', 'Commercial Dishwasher', 'Blast Chiller', 'Dry Storage Shelving', 'Grease Interceptor']),
      image_url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1200&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1577106263724-2c8e03bfe9cf?auto=format&fit=crop&w=1200&q=80'
      ]),
      status: 'active'
    },
    {
      id: 'res_parking_grand',
      provider_id: 'biz_grand_palace',
      title: 'Covered Hotel Valet Garage (Block of 40 Spaces)',
      description: 'Secure, climate-controlled underground parking facility with EV charging ports, 24/7 security attendant, automated ticket validator, and smooth wide entry ramps for luxury sedans and SUVs.',
      type: 'Parking',
      category: 'Guest Parking & Valet Lots',
      quantity: 40,
      capacity: 40,
      capacity_unit: 'vehicles',
      location: '720 5th Avenue, Midtown',
      lat: 40.7614,
      lng: -73.9776,
      price_per_hour: 8,
      price_per_day: 35,
      pricing_unit: 'day',
      min_duration_hours: 2,
      conditions: 'Vehicle height limit 7ft 2in. Overnight parking permitted. Security check required on entry.',
      amenities: JSON.stringify(['24/7 Monitored CCTV', 'EV Level 2 Chargers', 'Direct Hotel Elevator', 'Valet Attendant Option', 'Covered & Heated']),
      image_url: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1200&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1200&q=80'
      ]),
      status: 'active'
    },
    {
      id: 'res_sprinter_metro',
      provider_id: 'biz_metro_logistics',
      title: 'Mercedes Sprinter Dual-Temp Refrigerated Van',
      description: 'Late-model high-roof Mercedes-Benz Sprinter equipped with Thermo King V-520 dual-zone refrigeration (capable of -20°C deep freeze and +4°C fresh storage). Includes hydraulic liftgate and cargo E-track straps.',
      type: 'Fleet',
      category: 'Refrigerated Fleet & Transport',
      quantity: 2,
      capacity: 3500,
      capacity_unit: 'lbs cargo',
      location: '28-10 Queens Plaza N, Long Island City',
      lat: 40.7512,
      lng: -73.9385,
      price_per_hour: 40,
      price_per_day: 260,
      pricing_unit: 'day',
      min_duration_hours: 4,
      conditions: 'Valid US driver\'s license with clean record (25+ years old). Return with full diesel tank. 100 miles/day included.',
      amenities: JSON.stringify(['Dual-Temp (-20°C to +4°C)', 'Electric Standby Plug', 'Backup Camera & GPS', 'Hydraulic Liftgate', 'Cargo E-Track Tie-downs']),
      image_url: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&q=80'
      ]),
      status: 'active'
    },
    {
      id: 'res_av_apex',
      provider_id: 'biz_apex_av',
      title: 'Concert Audio System & Wireless Mic Package',
      description: 'Complete touring sound package: 4x L-Acoustics Kiva II line array elements, 2x SB15m subwoofers, Midas M32R digital mixing console, 6x Shure Axient Digital wireless handhelds, and all XLR/power cabling.',
      type: 'AV',
      category: 'Audio, Lighting & Stage AV',
      quantity: 1,
      capacity: 800,
      capacity_unit: 'audience',
      location: '120 E 23rd St, Flatiron',
      lat: 40.7398,
      lng: -73.9857,
      price_per_hour: 120,
      price_per_day: 850,
      pricing_unit: 'day',
      min_duration_hours: 4,
      conditions: 'Certified AV technician on-site required (optional technician add-on available). Road cases must be returned sealed.',
      amenities: JSON.stringify(['Midas M32R Console', '6x Shure Axient Mics', 'L-Acoustics Line Array', 'iPad Remote Mix Setup', 'Heavy-Duty Road Cases']),
      image_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80'
      ]),
      status: 'active'
    },
    {
      id: 'res_furniture_azure',
      provider_id: 'biz_azure_banquet',
      title: 'Gold Chiavari Chairs & Round Table Banquet Sets',
      description: 'Matching luxury gold hardwood Chiavari chairs with ivory padded cushions and 60-inch heavy-duty round folding tables (seats 8-10 per table). Includes linen covers in white or champagne.',
      type: 'Furniture',
      category: 'Banquet Furniture & Decor',
      quantity: 300,
      capacity: 300,
      capacity_unit: 'guests',
      location: '555 W 33rd St, Hudson Yards',
      lat: 40.7549,
      lng: -74.0021,
      price_per_hour: 50,
      price_per_day: 420,
      pricing_unit: 'day',
      min_duration_hours: 6,
      conditions: 'Indoor use only or enclosed tent. Stacking dollies provided. Security deposit $200.',
      amenities: JSON.stringify(['Ivory Foam Cushions', '60" Round Tables Included', 'Champagne & White Linens', 'Stacking Transport Carts']),
      image_url: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1200&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1200&q=80'
      ]),
      status: 'active'
    },
    {
      id: 'res_rooftop_grand',
      provider_id: 'biz_grand_palace',
      title: 'Rooftop Skyline Terrace & Cocktail Lounge',
      description: 'Panoramic open-air terrace overlooking the Manhattan skyline with teak bar counters, fire tables, retractable weather pergolas, and ambient perimeter LED lighting.',
      type: 'Space',
      category: 'Banquet & Event Space',
      quantity: 1,
      capacity: 180,
      capacity_unit: 'guests',
      location: '720 5th Avenue, Midtown',
      lat: 40.7614,
      lng: -73.9776,
      price_per_hour: 220,
      price_per_day: 1500,
      pricing_unit: 'hour',
      min_duration_hours: 3,
      conditions: 'Private elevator express access. Weatherproof canopy can deploy in 2 minutes. Licensed bar tenders only.',
      amenities: JSON.stringify(['Skyline View', 'Fire Pits & Lounge Seating', 'Retractable Glass Roof', 'Built-in Teak Wet Bar', 'Sonos Sound Zones']),
      image_url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80'
      ]),
      status: 'active'
    },
    {
      id: 'res_led_wall_apex',
      provider_id: 'biz_apex_av',
      title: 'Ultra-HD P2.6 LED Video Wall (16ft x 9ft)',
      description: 'Modular high-brightness indoor/outdoor P2.6mm LED panel screen. Includes Novastar NovaPro UHD video processor, truss ground support rigging, and HDMI/SDI fiber run.',
      type: 'AV',
      category: 'Audio, Lighting & Stage AV',
      quantity: 1,
      capacity: 600,
      capacity_unit: 'audience',
      location: '120 E 23rd St, Flatiron',
      lat: 40.7398,
      lng: -73.9857,
      price_per_hour: 160,
      price_per_day: 1100,
      pricing_unit: 'day',
      min_duration_hours: 4,
      conditions: 'Requires 2 dedicated 20A power circuits. Includes certified setup technician for first 2 hours.',
      amenities: JSON.stringify(['P2.6 High Refresh Rate', 'Novastar 4K Processor', 'Ground Support Truss', 'Daylight Viewable (1200 nits)', 'Seamless Bezel']),
      image_url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1200&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1200&q=80'
      ]),
      status: 'active'
    },
    {
      id: 'res_bakery_spice',
      provider_id: 'biz_spice_artistry',
      title: 'High-Capacity Artisan Bakery & Pastry Suite',
      description: 'Dedicated pastry and bakery deck containing 3-deck stone hearth electric deck ovens, 80-quart Hobart spiral dough mixer, temperature/humidity controlled proofing box, and marble sheeter table.',
      type: 'Kitchen',
      category: 'Commercial Kitchen & Cold Storage',
      quantity: 1,
      capacity: 350,
      capacity_unit: 'loaves/hr',
      location: '410 W 42nd St, Hell\'s Kitchen',
      lat: 40.7592,
      lng: -73.9942,
      price_per_hour: 75,
      price_per_day: 520,
      pricing_unit: 'hour',
      min_duration_hours: 4,
      conditions: 'Flour dust handling protocols apply. Pastry chef certification required.',
      amenities: JSON.stringify(['Stone Deck Hearth Oven', '80qt Hobart Spiral Mixer', 'Rondo Dough Sheeter', 'Humidity Controlled Proofer', 'Marble Pastry Benches']),
      image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80'
      ]),
      status: 'active'
    },
    {
      id: 'res_box_truck_metro',
      provider_id: 'biz_metro_logistics',
      title: '24ft Heavy-Duty Box Truck with 3000lb Liftgate',
      description: 'Freightliner 24-foot dry freight commercial truck with tuckaway aluminum liftgate, dual side loading doors, wood slat tie-off rails, and walk-up ramp. Accommodates 12 standard pallets.',
      type: 'Fleet',
      category: 'Refrigerated Fleet & Transport',
      quantity: 2,
      capacity: 12,
      capacity_unit: 'pallets',
      location: '28-10 Queens Plaza N, Long Island City',
      lat: 40.7512,
      lng: -73.9385,
      price_per_hour: 45,
      price_per_day: 320,
      pricing_unit: 'day',
      min_duration_hours: 4,
      conditions: 'Commercial license or experienced driver over 25. Fuel replacement charge if returned below initial level.',
      amenities: JSON.stringify(['3,000 lb Power Liftgate', 'Side-Door Loading Access', 'Pallet Jack Included', 'E-Track Restraints', 'Automatic Transmission']),
      image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80'
      ]),
      status: 'active'
    }
  ];

  for (const r of resources) {
    insertResource.run(
      r.id, r.provider_id, r.title, r.description, r.type, r.category,
      r.quantity, r.capacity, r.capacity_unit, r.location, r.lat, r.lng,
      r.price_per_hour, r.price_per_day, r.pricing_unit, r.min_duration_hours,
      r.conditions, r.amenities, r.image_url, r.images, r.status,
      r.supports_transport || (r.type === 'Fleet' || r.category.includes('Fleet') || r.category.includes('AV') || r.category.includes('Furniture') ? 1 : 0),
      r.transport_rate_per_km || 2.5
    );
  }

  // Insert Availability Slots / Booked blocks
  const insertSlot = db.prepare(`
    INSERT INTO availability_slots (id, resource_id, start_time, end_time, is_booked, reason)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const sampleSlots = [
    {
      id: 'slot_1',
      resource_id: 'res_ballroom_azure',
      start_time: '2026-10-02T10:00:00.000Z',
      end_time: '2026-10-02T23:00:00.000Z',
      is_booked: 1,
      reason: 'booked'
    },
    {
      id: 'slot_2',
      resource_id: 'res_ballroom_azure',
      start_time: '2026-10-10T08:00:00.000Z',
      end_time: '2026-10-10T18:00:00.000Z',
      is_booked: 1,
      reason: 'booked'
    },
    {
      id: 'slot_3',
      resource_id: 'res_kitchen_spice',
      start_time: '2026-10-03T06:00:00.000Z',
      end_time: '2026-10-03T16:00:00.000Z',
      is_booked: 1,
      reason: 'booked'
    },
    {
      id: 'slot_4',
      resource_id: 'res_sprinter_metro',
      start_time: '2026-10-04T07:00:00.000Z',
      end_time: '2026-10-05T20:00:00.000Z',
      is_booked: 1,
      reason: 'booked'
    }
  ];

  for (const s of sampleSlots) {
    insertSlot.run(s.id, s.resource_id, s.start_time, s.end_time, s.is_booked, s.reason);
  }

  // Insert Sample Requests
  const insertReq = db.prepare(`
    INSERT INTO requests (
      id, seeker_id, provider_id, resource_id, requested_qty,
      start_date, end_date, start_time, end_time, total_price,
      negotiated_price, status, seeker_notes, counter_notes, rejection_reason,
      needs_transport, transport_distance_km, transport_fee, transport_notes,
      created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', ?), datetime('now', ?))
  `);

  const requests = [
    {
      id: 'req_101',
      seeker_id: 'biz_spice_artistry',
      provider_id: 'biz_azure_banquet',
      resource_id: 'res_ballroom_azure',
      requested_qty: 1,
      start_date: '2026-10-15',
      end_date: '2026-10-15',
      start_time: '14:00',
      end_time: '23:00',
      total_price: 1850,
      negotiated_price: 1850,
      status: 'pending',
      seeker_notes: 'Hosting a corporate dinner for 280 guests. We will bring our own catering staff and bar setup.',
      counter_notes: null,
      rejection_reason: null,
      created_offset: '-2 hours',
      updated_offset: '-2 hours'
    },
    {
      id: 'req_102',
      seeker_id: 'biz_grand_palace',
      provider_id: 'biz_spice_artistry',
      resource_id: 'res_kitchen_spice',
      requested_qty: 1,
      start_date: '2026-10-08',
      end_date: '2026-10-09',
      start_time: '05:00',
      end_time: '15:00',
      total_price: 1360,
      negotiated_price: 1200,
      status: 'counter_offered',
      seeker_notes: 'Need extra prep capacity for an upcoming international summit dinner.',
      counter_notes: 'We can accept $1,200 for the two 10-hour day blocks if prep concludes promptly by 3:00 PM for our evening shift.',
      rejection_reason: null,
      created_offset: '-1 day',
      updated_offset: '-3 hours'
    },
    {
      id: 'req_103',
      seeker_id: 'biz_grand_palace',
      provider_id: 'biz_apex_av',
      resource_id: 'res_av_apex',
      requested_qty: 1,
      start_date: '2026-10-12',
      end_date: '2026-10-12',
      start_time: '16:00',
      end_time: '23:00',
      total_price: 850,
      negotiated_price: 850,
      status: 'accepted',
      seeker_notes: 'Need line array system for guest keynote speaker in our central atrium.',
      counter_notes: null,
      rejection_reason: null,
      created_offset: '-3 days',
      updated_offset: '-1 day'
    },
    {
      id: 'req_104',
      seeker_id: 'biz_azure_banquet',
      provider_id: 'biz_metro_logistics',
      resource_id: 'res_sprinter_metro',
      requested_qty: 1,
      start_date: '2026-09-20',
      end_date: '2026-09-21',
      start_time: '08:00',
      end_time: '18:00',
      total_price: 520,
      negotiated_price: 520,
      status: 'completed',
      seeker_notes: 'Transporting perishable floral and seafood arrangements for Hudson wedding.',
      counter_notes: null,
      rejection_reason: null,
      created_offset: '-7 days',
      updated_offset: '-5 days'
    },
    {
      id: 'req_past_1',
      seeker_id: 'biz_grand_palace',
      provider_id: 'biz_azure_banquet',
      resource_id: 'res_ballroom_azure',
      requested_qty: 1,
      start_date: '2026-09-12',
      end_date: '2026-09-12',
      start_time: '09:00',
      end_time: '23:00',
      total_price: 1850,
      negotiated_price: 1850,
      status: 'completed',
      seeker_notes: 'VIP overflow conference gala dinner.',
      counter_notes: null,
      rejection_reason: null,
      created_offset: '-15 days',
      updated_offset: '-12 days'
    },
    {
      id: 'req_past_2',
      seeker_id: 'biz_grand_palace',
      provider_id: 'biz_spice_artistry',
      resource_id: 'res_kitchen_spice',
      requested_qty: 1,
      start_date: '2026-09-04',
      end_date: '2026-09-05',
      start_time: '06:00',
      end_time: '16:00',
      total_price: 1360,
      negotiated_price: 1360,
      status: 'completed',
      seeker_notes: 'Extra prep capacity for 600-portion catering batch.',
      counter_notes: null,
      rejection_reason: null,
      created_offset: '-22 days',
      updated_offset: '-20 days'
    }
  ];

  for (const req of requests) {
    insertReq.run(
      req.id, req.seeker_id, req.provider_id, req.resource_id, req.requested_qty,
      req.start_date, req.end_date, req.start_time, req.end_time,
      req.total_price, req.negotiated_price, req.status,
      req.seeker_notes, req.counter_notes, req.rejection_reason,
      req.id === 'req_101' ? 1 : 0,
      req.id === 'req_101' ? 4.5 : 0,
      req.id === 'req_101' ? 36 : 0,
      req.id === 'req_101' ? 'Requires power liftgate freight delivery to staging bay' : '',
      req.created_offset, req.updated_offset
    );
  }

  // Insert Sample In-App Messages
  const insertMsg = db.prepare(`
    INSERT INTO messages (id, request_id, sender_id, sender_type, content, read_status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now', ?))
  `);

  const sampleMessages = [
    {
      id: 'msg_seed_1',
      request_id: 'req_101',
      sender_id: 'biz_spice_artistry',
      sender_type: 'seeker',
      content: 'Hello Azure Grand team! We submitted this request for the product launch dinner. Do you have loading dock access available around 1:00 PM for catering staging?',
      read_status: 1,
      offset: '-1 hour'
    },
    {
      id: 'msg_seed_2',
      request_id: 'req_101',
      sender_id: 'biz_azure_banquet',
      sender_type: 'provider',
      content: 'Hi Spice Artistry! Yes, freight bay #3 will be clear starting at 12:30 PM. We also have direct service elevator access to the ballroom pre-function area.',
      read_status: 0,
      offset: '-25 minutes'
    },
    {
      id: 'msg_seed_3',
      request_id: 'req_102',
      sender_id: 'biz_grand_palace',
      sender_type: 'seeker',
      content: 'Good morning! Would it be possible to add cold-storage shelving for our pastry prep on the second morning?',
      read_status: 1,
      offset: '-6 hours'
    },
    {
      id: 'msg_seed_4',
      request_id: 'req_102',
      sender_id: 'biz_spice_artistry',
      sender_type: 'provider',
      content: 'Certainly! We have designated rack space in Walk-In 2 ready for your team.',
      read_status: 1,
      offset: '-5 hours'
    }
  ];

  for (const m of sampleMessages) {
    insertMsg.run(m.id, m.request_id, m.sender_id, m.sender_type, m.content, m.read_status, m.offset);
  }

  // Insert Sample Reviews
  const insertRev = db.prepare(`
    INSERT INTO reviews (id, request_id, resource_id, provider_id, seeker_id, rating, tags, comment, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now', ?))
  `);

  const reviews = [
    {
      id: 'rev_1',
      request_id: 'req_104',
      resource_id: 'res_sprinter_metro',
      provider_id: 'biz_metro_logistics',
      seeker_id: 'biz_azure_banquet',
      rating: 5,
      tags: JSON.stringify(['Immaculate Vehicle', 'Punctual Handover', 'Reliable Cooling']),
      comment: 'The Sprinter van was spotless and maintained -18°C throughout the entire 10-hour transfer! Metro Logistics made pickup seamless.',
      offset: '-4 days'
    },
    {
      id: 'rev_2',
      request_id: 'req_past_1',
      resource_id: 'res_ballroom_azure',
      provider_id: 'biz_azure_banquet',
      seeker_id: 'biz_grand_palace',
      rating: 5,
      tags: JSON.stringify(['Stunning Venue', 'Great Acoustics', 'Helpful Staff']),
      comment: 'Flawless ballroom experience for our VIP overflow conference. The lighting presets and acoustics impressed all our stakeholders.',
      offset: '-12 days'
    },
    {
      id: 'rev_3',
      request_id: 'req_past_2',
      resource_id: 'res_kitchen_spice',
      provider_id: 'biz_spice_artistry',
      seeker_id: 'biz_grand_palace',
      rating: 5,
      tags: JSON.stringify(['Spotless Sanitary', 'Top-tier Ovens', 'Easy Logistics']),
      comment: 'The Rational combi ovens made our 600-portion catering batch effortless. Clean kitchen, verified temperature logs, 10/10.',
      offset: '-20 days'
    }
  ];

  for (const rv of reviews) {
    insertRev.run(rv.id, rv.request_id, rv.resource_id, rv.provider_id, rv.seeker_id, rv.rating, rv.tags, rv.comment, rv.offset);
  }

  // Insert Seeker Requirements (Wanted Board RFQs)
  const insertReqmt = db.prepare(`
    INSERT INTO requirements (id, seeker_id, title, category, type, capacity_needed, location, lat, lng, start_date, end_date, max_budget, budget_type, description, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', ?))
  `);

  const requirements = [
    {
      id: 'rfq_1',
      seeker_id: 'biz_spice_artistry',
      title: 'Urgent: Need 300+ Guest Banquet Hall for Tech Product Launch',
      category: 'Banquet & Event Space',
      type: 'Space',
      capacity_needed: 300,
      location: 'Midtown or Hudson Yards, Manhattan',
      lat: 40.7550,
      lng: -73.9900,
      start_date: '2026-10-18',
      end_date: '2026-10-18',
      max_budget: 2200,
      budget_type: 'day',
      description: 'Looking for a premium indoor ballroom or exhibition hall with high ceilings, AV support, and guest reception space for a tech keynote and dinner.',
      status: 'open',
      offset: '-1 day'
    },
    {
      id: 'rfq_2',
      seeker_id: 'biz_grand_palace',
      title: 'Need 2x 24ft Box Trucks with Liftgate for Furniture Transfer',
      category: 'Refrigerated Fleet & Transport',
      type: 'Fleet',
      capacity_needed: 2,
      location: 'Midtown Manhattan',
      lat: 40.7614,
      lng: -73.9776,
      start_date: '2026-10-22',
      end_date: '2026-10-23',
      max_budget: 700,
      budget_type: 'total',
      description: 'Transferring seasonal patio sets and banquet decor into storage. Need hydraulic liftgate and dollies included.',
      status: 'open',
      offset: '-2 days'
    }
  ];

  for (const rq of requirements) {
    insertReqmt.run(
      rq.id, rq.seeker_id, rq.title, rq.category, rq.type, rq.capacity_needed,
      rq.location, rq.lat, rq.lng, rq.start_date, rq.end_date, rq.max_budget,
      rq.budget_type, rq.description, rq.status, rq.offset
    );
  }

  // Insert Notifications
  const insertNotif = db.prepare(`
    INSERT INTO notifications (id, business_id, type, title, message, link_type, link_id, is_read, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now', ?))
  `);

  const notifications = [
    {
      id: 'notif_1',
      business_id: 'biz_azure_banquet',
      type: 'request_received',
      title: 'New Booking Request Received',
      message: 'Spice Artistry Catering Co. requested Grand Crystal Ballroom for Oct 15, 2026 ($1,850).',
      link_type: 'request',
      link_id: 'req_101',
      is_read: 0,
      offset: '-2 hours'
    },
    {
      id: 'notif_2',
      business_id: 'biz_grand_palace',
      type: 'counter_received',
      title: 'Counter-Offer Received',
      message: 'Spice Artistry proposed $1,200 for Commercial Production Kitchen (Oct 8-9).',
      link_type: 'request',
      link_id: 'req_102',
      is_read: 0,
      offset: '-3 hours'
    },
    {
      id: 'notif_3',
      business_id: 'biz_grand_palace',
      type: 'request_accepted',
      title: 'Request Accepted!',
      message: 'Apex Stage & AudioVisual accepted your booking for Concert Audio System on Oct 12.',
      link_type: 'request',
      link_id: 'req_103',
      is_read: 1,
      offset: '-1 day'
    }
  ];

  for (const n of notifications) {
    insertNotif.run(n.id, n.business_id, n.type, n.title, n.message, n.link_type, n.link_id, n.is_read, n.offset);
  }

  console.log('✅ Seed data successfully inserted.');
}
