import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'resourcexchange.db');

// Ensure database parent directory exists if a custom volume path is configured
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS businesses (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      password_hash TEXT,
      phone TEXT,
      location TEXT NOT NULL,
      city TEXT NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      avatar TEXT,
      rating REAL DEFAULT 4.8,
      reviews_count INTEGER DEFAULT 0,
      verified INTEGER DEFAULT 1,
      about TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS resources (
      id TEXT PRIMARY KEY,
      provider_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      type TEXT NOT NULL,
      category TEXT NOT NULL,
      quantity INTEGER DEFAULT 1,
      capacity INTEGER DEFAULT 1,
      capacity_unit TEXT DEFAULT 'units',
      location TEXT NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      price_per_hour REAL DEFAULT 0,
      price_per_day REAL DEFAULT 0,
      pricing_unit TEXT DEFAULT 'day',
      min_duration_hours INTEGER DEFAULT 2,
      conditions TEXT,
      amenities TEXT DEFAULT '[]',
      image_url TEXT,
      images TEXT DEFAULT '[]',
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (provider_id) REFERENCES businesses(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS availability_slots (
      id TEXT PRIMARY KEY,
      resource_id TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      is_booked INTEGER DEFAULT 0,
      reason TEXT DEFAULT 'booked',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS requests (
      id TEXT PRIMARY KEY,
      seeker_id TEXT NOT NULL,
      provider_id TEXT NOT NULL,
      resource_id TEXT NOT NULL,
      requested_qty INTEGER DEFAULT 1,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      start_time TEXT,
      end_time TEXT,
      total_price REAL NOT NULL,
      negotiated_price REAL,
      status TEXT DEFAULT 'pending',
      seeker_notes TEXT,
      counter_notes TEXT,
      rejection_reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (seeker_id) REFERENCES businesses(id) ON DELETE CASCADE,
      FOREIGN KEY (provider_id) REFERENCES businesses(id) ON DELETE CASCADE,
      FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS requirements (
      id TEXT PRIMARY KEY,
      seeker_id TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      type TEXT NOT NULL,
      capacity_needed INTEGER NOT NULL,
      location TEXT NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      max_budget REAL NOT NULL,
      budget_type TEXT DEFAULT 'total',
      description TEXT,
      status TEXT DEFAULT 'open',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (seeker_id) REFERENCES businesses(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      request_id TEXT NOT NULL,
      resource_id TEXT NOT NULL,
      provider_id TEXT NOT NULL,
      seeker_id TEXT NOT NULL,
      rating INTEGER NOT NULL,
      tags TEXT DEFAULT '[]',
      comment TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
      FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
      FOREIGN KEY (provider_id) REFERENCES businesses(id) ON DELETE CASCADE,
      FOREIGN KEY (seeker_id) REFERENCES businesses(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      link_type TEXT,
      link_id TEXT,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      request_id TEXT NOT NULL,
      sender_id TEXT NOT NULL,
      sender_type TEXT NOT NULL, -- 'seeker' | 'provider'
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      read_status INTEGER DEFAULT 0,
      FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
      FOREIGN KEY (sender_id) REFERENCES businesses(id) ON DELETE CASCADE
    );
  `);

  // Migrate password_hash column if businesses table already exists without it
  try {
    const columns = db.prepare("PRAGMA table_info(businesses)").all();
    const hasPasswordHash = columns.some(c => c.name === 'password_hash');
    if (!hasPasswordHash) {
      db.exec("ALTER TABLE businesses ADD COLUMN password_hash TEXT");
      console.log('✅ Added password_hash column to businesses table.');
    }
  } catch (err) {
    console.error('Migration error checking password_hash:', err);
  }

  // Migrate requests table columns for logistics / transport
  try {
    const reqCols = db.prepare("PRAGMA table_info(requests)").all();
    const colNames = reqCols.map(c => c.name);

    if (!colNames.includes('needs_transport')) {
      db.exec("ALTER TABLE requests ADD COLUMN needs_transport INTEGER DEFAULT 0");
      console.log('✅ Added needs_transport column to requests table.');
    }
    if (!colNames.includes('transport_distance_km')) {
      db.exec("ALTER TABLE requests ADD COLUMN transport_distance_km REAL DEFAULT 0");
      console.log('✅ Added transport_distance_km column to requests table.');
    }
    if (!colNames.includes('transport_fee')) {
      db.exec("ALTER TABLE requests ADD COLUMN transport_fee REAL DEFAULT 0");
      console.log('✅ Added transport_fee column to requests table.');
    }
    if (!colNames.includes('transport_notes')) {
      db.exec("ALTER TABLE requests ADD COLUMN transport_notes TEXT DEFAULT ''");
      console.log('✅ Added transport_notes column to requests table.');
    }
  } catch (err) {
    console.error('Migration error checking requests transport columns:', err);
  }

  // Migrate resources table columns for logistics support
  try {
    const resCols = db.prepare("PRAGMA table_info(resources)").all();
    const colNames = resCols.map(c => c.name);

    if (!colNames.includes('supports_transport')) {
      db.exec("ALTER TABLE resources ADD COLUMN supports_transport INTEGER DEFAULT 0");
      console.log('✅ Added supports_transport column to resources table.');
    }
    if (!colNames.includes('transport_rate_per_km')) {
      db.exec("ALTER TABLE resources ADD COLUMN transport_rate_per_km REAL DEFAULT NULL");
      console.log('✅ Added transport_rate_per_km column to resources table.');
    }
  // Backfill existing rows with safe non-null defaults
  try {
    db.exec(`
      UPDATE requests SET needs_transport = 0 WHERE needs_transport IS NULL;
      UPDATE requests SET transport_distance_km = 0 WHERE transport_distance_km IS NULL;
      UPDATE requests SET transport_fee = 0 WHERE transport_fee IS NULL;
      UPDATE requests SET transport_notes = '' WHERE transport_notes IS NULL;
      UPDATE resources SET supports_transport = 1 WHERE supports_transport IS NULL;
    `);
  } catch (err) {
    console.error('Backfill default values error:', err);
  }

  console.log('✅ SQLite Database initialized with all tables & migrations.');
}
