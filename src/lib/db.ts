import { createClient, type Client } from '@libsql/client/web';

let client: Client;
let initialized = false;

function getTursoUrl(): string {
  const raw = process.env.TURSO_DATABASE_URL || '';
  // @libsql/client/web needs https://, convert libsql:// if needed
  const url = raw.replace(/^libsql:\/\//, 'https://').trim();
  return url;
}

export function getDb(): Client {
  if (!client) {
    client = createClient({
      url: getTursoUrl(),
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return client;
}

export async function ensureDb(): Promise<Client> {
  const db = getDb();
  if (!initialized) {
    await db.executeMultiple(`
      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        company TEXT,
        area_code TEXT,
        city TEXT,
        magic_token TEXT,
        token_expires_at INTEGER,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS outreach_prospects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product TEXT NOT NULL DEFAULT 'circuit_coders',
        name TEXT NOT NULL,
        contact_name TEXT,
        city TEXT,
        region TEXT,
        email TEXT,
        phone TEXT,
        website TEXT,
        segment TEXT,
        status TEXT NOT NULL DEFAULT 'not_contacted',
        channel TEXT,
        notes TEXT,
        last_touch_at TEXT,
        track_token TEXT,
        clicks INTEGER NOT NULL DEFAULT 0,
        first_click_at TEXT,
        last_click_at TEXT,
        bbb_rating TEXT,
        bbb_url TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );
      CREATE INDEX IF NOT EXISTS idx_outreach_product ON outreach_prospects(product);
      CREATE INDEX IF NOT EXISTS idx_outreach_status ON outreach_prospects(status);
      CREATE INDEX IF NOT EXISTS idx_outreach_token ON outreach_prospects(track_token);

      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER NOT NULL REFERENCES customers(id),
        title TEXT NOT NULL,
        description TEXT,
        project_type TEXT NOT NULL DEFAULT 'software',
        status TEXT NOT NULL DEFAULT 'inquiry',
        budget TEXT,
        timeline TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER REFERENCES projects(id),
        customer_id INTEGER NOT NULL REFERENCES customers(id),
        sender TEXT NOT NULL DEFAULT 'customer',
        content TEXT NOT NULL,
        read INTEGER NOT NULL DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS project_updates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL REFERENCES projects(id),
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        update_type TEXT NOT NULL DEFAULT 'progress',
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS project_tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL REFERENCES projects(id),
        phase TEXT NOT NULL DEFAULT 'development',
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        completed_at TEXT
      );

      CREATE TABLE IF NOT EXISTS target_pins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        label TEXT NOT NULL,
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        pin_type TEXT NOT NULL DEFAULT 'target',
        notes TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS seo_campaigns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        client_name TEXT,
        website_url TEXT,
        target_keywords TEXT,
        status TEXT NOT NULL DEFAULT 'planning',
        monthly_budget TEXT,
        start_date TEXT,
        notes TEXT,
        da_score INTEGER,
        organic_traffic INTEGER,
        keywords_ranked INTEGER,
        backlinks INTEGER,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS card_orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id TEXT UNIQUE,
        name TEXT,
        company TEXT,
        email TEXT,
        website TEXT,
        tagline TEXT,
        qr_url TEXT,
        accent TEXT,
        pack TEXT,
        quantity INTEGER,
        amount INTEGER,
        status TEXT DEFAULT 'pending',
        stripe_session_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS print_orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id TEXT UNIQUE,
        name TEXT,
        email TEXT,
        size TEXT,
        material TEXT,
        colors TEXT,
        notes TEXT,
        filename TEXT,
        file_data TEXT,
        amount INTEGER,
        status TEXT DEFAULT 'pending',
        stripe_session_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS inbound_leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        shop_name TEXT,
        name TEXT,
        phone TEXT,
        email TEXT,
        headache TEXT,
        source TEXT DEFAULT 'start-page',
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS rate_limits (
        bucket TEXT PRIMARY KEY,
        count INTEGER NOT NULL DEFAULT 0,
        window_start INTEGER NOT NULL DEFAULT 0
      );
    `);
    // Migrations for existing tables
    try { await db.execute('ALTER TABLE customers ADD COLUMN area_code TEXT'); } catch { /* already exists */ }
    try { await db.execute('ALTER TABLE customers ADD COLUMN city TEXT'); } catch { /* already exists */ }
    try { await db.execute('ALTER TABLE seo_campaigns ADD COLUMN plan_type TEXT DEFAULT \'local_spark\''); } catch { /* already exists */ }
    try { await db.execute('ALTER TABLE outreach_prospects ADD COLUMN track_token TEXT'); } catch { /* already exists */ }
    try { await db.execute('ALTER TABLE outreach_prospects ADD COLUMN clicks INTEGER NOT NULL DEFAULT 0'); } catch { /* already exists */ }
    try { await db.execute('ALTER TABLE outreach_prospects ADD COLUMN first_click_at TEXT'); } catch { /* already exists */ }
    try { await db.execute('ALTER TABLE outreach_prospects ADD COLUMN last_click_at TEXT'); } catch { /* already exists */ }
    try { await db.execute('ALTER TABLE outreach_prospects ADD COLUMN bbb_rating TEXT'); } catch { /* already exists */ }
    try { await db.execute('ALTER TABLE outreach_prospects ADD COLUMN bbb_url TEXT'); } catch { /* already exists */ }
    initialized = true;
  }
  return db;
}
