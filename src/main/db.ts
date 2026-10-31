import Database from 'better-sqlite3'
import { app } from 'electron'
import path from 'path'
import fs from 'fs'
// @ts-ignore
import schemaText from '../database/schema.sql?raw'

let db: Database.Database

// ── Auto-backup: keep last 5 ──────────────────────────────────────────────────
function autoBackup(dbPath: string) {
  try {
    const dir = path.dirname(dbPath)
    const ts = Date.now()
    const bakPath = path.join(dir, `commandbase.db.bak-${ts}`)
    fs.copyFileSync(dbPath, bakPath)

    // Keep only 5 most-recent backups
    const baks = fs
      .readdirSync(dir)
      .filter((f) => /^commandbase\.db\.bak-\d+$/.test(f))
      .sort()
      .reverse()
    baks.slice(5).forEach((f) => {
      try {
        fs.unlinkSync(path.join(dir, f))
      } catch {
        // ignore
      }
    })
  } catch {
    // ignore backup failures — don't break startup
  }
}

export function initDatabase() {
  const dbPath = path.join(app.getPath('userData'), 'commandbase.db')

  // Backup existing DB before any migration
  if (fs.existsSync(dbPath)) {
    autoBackup(dbPath)
  }

  db = new Database(dbPath)
  db.pragma('foreign_keys = ON')

  db.exec(schemaText)

  // ─── MIGRATIONS ─────────────────────────────────────────────────────────────

  // Add category_id to programs if it doesn't exist
  const programCols = db.pragma('table_info(programs)') as any[]
  if (!programCols.find((c) => c.name === 'category_id')) {
    db.exec(
      'ALTER TABLE programs ADD COLUMN category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL'
    )
  }

  // Add type to resources if it doesn't exist
  const resourceCols = db.pragma('table_info(resources)') as any[]
  if (!resourceCols.find((c) => c.name === 'type')) {
    db.exec("ALTER TABLE resources ADD COLUMN type TEXT DEFAULT 'link'")
  }

  // Create blog_posts table
  db.exec(`
    CREATE TABLE IF NOT EXISTS blog_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT,
      categories TEXT DEFAULT '[]',
      photos TEXT DEFAULT '[]',
      font_family TEXT DEFAULT 'JetBrains Mono',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // ─── STEP 4 migrations: program_steps ─────────────────────────────────────
  const stepCols = db.pragma('table_info(program_steps)') as any[]
  if (!stepCols.find((c) => c.name === 'note')) {
    db.exec('ALTER TABLE program_steps ADD COLUMN note TEXT')
  }
  if (!stepCols.find((c) => c.name === 'expected_output')) {
    db.exec('ALTER TABLE program_steps ADD COLUMN expected_output TEXT')
  }

  // ─── STEP 5 migrations: commands ──────────────────────────────────────────
  const commandCols = db.pragma('table_info(commands)') as any[]
  if (!commandCols.find((c) => c.name === 'is_favorite')) {
    db.exec('ALTER TABLE commands ADD COLUMN is_favorite INTEGER DEFAULT 0')
  }
  if (!commandCols.find((c) => c.name === 'use_count')) {
    db.exec('ALTER TABLE commands ADD COLUMN use_count INTEGER DEFAULT 0')
  }
  if (!commandCols.find((c) => c.name === 'last_used_at')) {
    db.exec('ALTER TABLE commands ADD COLUMN last_used_at DATETIME')
  }
  if (!commandCols.find((c) => c.name === 'tags')) {
    db.exec("ALTER TABLE commands ADD COLUMN tags TEXT DEFAULT '[]'")
  }

  // ─── STEP 5 migrations: programs ──────────────────────────────────────────
  const progCols = db.pragma('table_info(programs)') as any[]
  if (!progCols.find((c) => c.name === 'is_favorite')) {
    db.exec('ALTER TABLE programs ADD COLUMN is_favorite INTEGER DEFAULT 0')
  }

  console.log('Database initialized at:', dbPath)
  return db
}

export function getDb() {
  if (!db) {
    return initDatabase()
  }
  return db
}
