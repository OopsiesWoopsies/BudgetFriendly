import Database from 'better-sqlite3';
import { app } from 'electron';
import path from 'path';

const dbPath = path.join(app.getPath('userData'), 'budgets.db');
const db = new Database(dbPath);

db.pragma('foreign_keys = ON');

// Creates tables and indexes
db.prepare(
  `
    CREATE TABLE IF NOT EXISTS budget_sheets (
        id TEXT PRIMARY KEY,
        title TEXT,
        created_at TEXT NOT NULL,
        period TEXT NOT NULL,
        budget INTEGER NOT NULL,
        CHECK (budget >= 0)
    );
`
).run();

db.prepare(
  `
    CREATE TABLE IF NOT EXISTS category (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        budget_sheet_id TEXT NOT NULL,
        FOREIGN KEY (budget_sheet_id) REFERENCES budget_sheets(id) ON DELETE CASCADE
    );
`
).run();

db.prepare(
  `
    CREATE TABLE IF NOT EXISTS entries (
        id TEXT PRIMARY KEY,
        name TEXT,
        category_id TEXT,
        price INTEGER,
        date TEXT NOT NULL,
        budget_sheet_id TEXT NOT NULL,
        FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE SET NULL,
        FOREIGN KEY (budget_sheet_id) REFERENCES budget_sheets(id) ON DELETE CASCADE
        CHECK (price >= 0)
    );
`
).run();

db.prepare(
  `
  CREATE INDEX IF NOT EXISTS idx_entries_date ON entries(date);
`
).run();

db.prepare(
  `  
  CREATE INDEX IF NOT EXISTS idx_entries_category ON entries(category_id);
`
).run();

db.prepare(
  `  
  CREATE INDEX IF NOT EXISTS idx_entries_sheet_date ON entries(budget_sheet_id, date);
`
).run();

export default db;

console.log('created');
