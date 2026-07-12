import Database from 'better-sqlite3'
import { app } from 'electron'
import path from 'path'
// @ts-ignore
import schemaText from '../database/schema.sql?raw'

let db: Database.Database

export function initDatabase() {
  const dbPath = path.join(app.getPath('userData'), 'commandbase.db')

  db = new Database(dbPath)
  db.pragma('foreign_keys = ON')

  db.exec(schemaText)

  // --- MIGRATIONS ---
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

  console.log('Database initialized at:', dbPath)
  return db
}

export function getDb() {
  if (!db) {
    return initDatabase()
  }
  return db
}
