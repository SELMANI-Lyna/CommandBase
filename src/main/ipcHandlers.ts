import { ipcMain } from 'electron'
import { getDb } from './db'

export function setupIpcHandlers() {
  const db = getDb()

  // ─── CATEGORIES ───────────────────────────────────────────────
  ipcMain.handle('get-categories', () => {
    return db.prepare('SELECT * FROM categories ORDER BY name ASC').all()
  })

  ipcMain.handle('add-category', (_, name: string, icon: string) => {
    const info = db.prepare('INSERT INTO categories (name, icon) VALUES (?, ?)').run(name, icon)
    return info.lastInsertRowid
  })

  ipcMain.handle('update-category', (_, id: number, name: string) => {
    db.prepare('UPDATE categories SET name = ? WHERE id = ?').run(name, id)
    return true
  })

  ipcMain.handle('delete-category', (_, id: number) => {
    db.prepare('DELETE FROM categories WHERE id = ?').run(id)
    return true
  })

  // ─── TOOLS ────────────────────────────────────────────────────
  ipcMain.handle('get-tools', () => {
    return db.prepare('SELECT * FROM tools ORDER BY name ASC').all()
  })

  ipcMain.handle('add-tool', (_, tool: any) => {
    const { name, description, category_id, website, installation, usage_notes } = tool
    const info = db
      .prepare(
        `
      INSERT INTO tools (name, description, category_id, website, installation, usage_notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `
      )
      .run(name, description, category_id, website, installation, usage_notes)
    return info.lastInsertRowid
  })

  ipcMain.handle('update-tool', (_, id: number, tool: any) => {
    const { name, description, category_id, website } = tool
    db.prepare('UPDATE tools SET name=?, description=?, category_id=?, website=? WHERE id=?').run(
      name,
      description,
      category_id,
      website,
      id
    )
    return true
  })

  ipcMain.handle('delete-tool', (_, id: number) => {
    db.prepare('DELETE FROM tools WHERE id = ?').run(id)
    return true
  })

  // ─── COMMANDS ─────────────────────────────────────────────────
  ipcMain.handle('get-commands', () => {
    return db.prepare('SELECT * FROM commands').all()
  })

  ipcMain.handle('add-command', (_, command: any) => {
    const { syntax, description, example, expected_output, tool_id, category_id } = command
    const info = db
      .prepare(
        `
      INSERT INTO commands (syntax, description, example, expected_output, tool_id, category_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `
      )
      .run(syntax, description, example, expected_output, tool_id, category_id)
    return info.lastInsertRowid
  })

  ipcMain.handle('update-command', (_, id: number, command: any) => {
    const { syntax, description, tool_id, category_id } = command
    db.prepare(
      'UPDATE commands SET syntax=?, description=?, tool_id=?, category_id=? WHERE id=?'
    ).run(syntax, description, tool_id, category_id, id)
    return true
  })

  ipcMain.handle('delete-command', (_, id: number) => {
    db.prepare('DELETE FROM commands WHERE id = ?').run(id)
    return true
  })

  // ─── PROGRAMS (WORKFLOWS) ────────────────────────────────────
  ipcMain.handle('get-programs', () => {
    return db.prepare('SELECT * FROM programs ORDER BY name ASC').all()
  })

  ipcMain.handle('get-program-steps', (_, programId: number) => {
    return db
      .prepare(
        `
      SELECT ps.*, c.syntax, c.description as command_description 
      FROM program_steps ps
      LEFT JOIN commands c ON ps.command_id = c.id
      WHERE ps.program_id = ?
      ORDER BY ps.step_order ASC
    `
      )
      .all(programId)
  })

  ipcMain.handle('add-program', (_, name: string, description: string, category_id?: number) => {
    const info = db
      .prepare('INSERT INTO programs (name, description, category_id) VALUES (?, ?, ?)')
      .run(name, description, category_id ?? null)
    return info.lastInsertRowid
  })

  ipcMain.handle(
    'update-program',
    (_, id: number, name: string, description: string, category_id?: number) => {
      db.prepare('UPDATE programs SET name=?, description=?, category_id=? WHERE id=?').run(
        name,
        description,
        category_id ?? null,
        id
      )
      return true
    }
  )

  ipcMain.handle('delete-program', (_, id: number) => {
    db.prepare('DELETE FROM programs WHERE id = ?').run(id)
    return true
  })

  ipcMain.handle('update-program-steps', (_, programId: number, steps: any[]) => {
    const deleteSteps = db.prepare('DELETE FROM program_steps WHERE program_id = ?')
    const insertStep = db.prepare(`
      INSERT INTO program_steps (program_id, command_id, step_order, custom_command)
      VALUES (?, ?, ?, ?)
    `)

    const transaction = db.transaction((pId: number, s: any[]) => {
      deleteSteps.run(pId)
      s.forEach((step, index) => {
        insertStep.run(pId, step.command_id ?? null, index, step.custom_command ?? null)
      })
    })

    transaction(programId, steps)
    return true
  })

  // ─── RESOURCES ────────────────────────────────────────────────
  ipcMain.handle('get-resources', () => {
    return db.prepare('SELECT * FROM resources ORDER BY id DESC').all()
  })

  ipcMain.handle('add-resource', (_, resource: any) => {
    const { title, url, type, description, category_id, personal_notes } = resource
    const info = db
      .prepare(
        `
      INSERT INTO resources (title, url, type, description, category_id, personal_notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `
      )
      .run(
        title,
        url,
        type ?? 'link',
        description ?? null,
        category_id ?? null,
        personal_notes ?? null
      )
    return info.lastInsertRowid
  })

  ipcMain.handle('update-resource', (_, id: number, resource: any) => {
    const { title, url, type, description, category_id, personal_notes } = resource
    db.prepare(
      `
      UPDATE resources
      SET title=?, url=?, type=?, description=?, category_id=?, personal_notes=?
      WHERE id=?
    `
    ).run(
      title,
      url,
      type ?? 'link',
      description ?? null,
      category_id ?? null,
      personal_notes ?? null,
      id
    )
    return true
  })

  ipcMain.handle('delete-resource', (_, id: number) => {
    db.prepare('DELETE FROM resources WHERE id = ?').run(id)
    return true
  })

  // ─── BLOG POSTS ───────────────────────────────────────────────
  ipcMain.handle('get-blog-posts', () => {
    return db.prepare('SELECT * FROM blog_posts ORDER BY updated_at DESC').all()
  })

  ipcMain.handle('add-blog-post', (_, post: any) => {
    const { title, content, categories, photos, font_family } = post
    const info = db
      .prepare(
        `
      INSERT INTO blog_posts (title, content, categories, photos, font_family, updated_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `
      )
      .run(
        title,
        content,
        JSON.stringify(categories ?? []),
        JSON.stringify(photos ?? []),
        font_family ?? 'JetBrains Mono'
      )
    return info.lastInsertRowid
  })

  ipcMain.handle('update-blog-post', (_, id: number, post: any) => {
    const { title, content, categories, photos, font_family } = post
    db.prepare(
      `
      UPDATE blog_posts SET title=?, content=?, categories=?, photos=?, font_family=?, updated_at=CURRENT_TIMESTAMP
      WHERE id=?
    `
    ).run(
      title,
      content,
      JSON.stringify(categories ?? []),
      JSON.stringify(photos ?? []),
      font_family ?? 'JetBrains Mono',
      id
    )
    return true
  })

  ipcMain.handle('delete-blog-post', (_, id: number) => {
    db.prepare('DELETE FROM blog_posts WHERE id = ?').run(id)
    return true
  })

  // ─── GLOBAL SEARCH ────────────────────────────────────────────
  ipcMain.handle('global-search', (_, query: string) => {
    const q = `%${query}%`

    const commands = db
      .prepare(
        'SELECT "command" as type, id, syntax as name, description FROM commands WHERE syntax LIKE ? OR description LIKE ?'
      )
      .all(q, q)
    const tools = db
      .prepare(
        'SELECT "tool" as type, id, name, description FROM tools WHERE name LIKE ? OR description LIKE ?'
      )
      .all(q, q)
    const categories = db
      .prepare(
        'SELECT "category" as type, id, name, NULL as description FROM categories WHERE name LIKE ?'
      )
      .all(q)
    const programs = db
      .prepare(
        'SELECT "program" as type, id, name, description FROM programs WHERE name LIKE ? OR description LIKE ?'
      )
      .all(q, q)
    const posts = db
      .prepare(
        'SELECT "blog" as type, id, title as name, content as description FROM blog_posts WHERE title LIKE ? OR content LIKE ?'
      )
      .all(q, q)

    return [...commands, ...tools, ...categories, ...programs, ...posts]
  })
}
