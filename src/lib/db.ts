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
    `);
    // Migrations for existing tables
    try { await db.execute('ALTER TABLE customers ADD COLUMN area_code TEXT'); } catch { /* already exists */ }
    try { await db.execute('ALTER TABLE customers ADD COLUMN city TEXT'); } catch { /* already exists */ }
    try { await db.execute('ALTER TABLE seo_campaigns ADD COLUMN plan_type TEXT DEFAULT \'local_spark\''); } catch { /* already exists */ }
    initialized = true;
  }
  return db;
}
