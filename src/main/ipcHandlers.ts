import { ipcMain, dialog, app } from 'electron'
import { getDb } from './db'
import fs from 'fs'
import path from 'path'

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
    return db.prepare('SELECT * FROM commands ORDER BY id DESC').all()
  })

  ipcMain.handle('add-command', (_, command: any) => {
    const { syntax, description, example, expected_output, tool_id, category_id, tags } = command
    const info = db
      .prepare(
        `
      INSERT INTO commands (syntax, description, example, expected_output, tool_id, category_id, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `
      )
      .run(
        syntax,
        description ?? null,
        example ?? null,
        expected_output ?? null,
        tool_id ?? null,
        category_id ?? null,
        JSON.stringify(tags ?? [])
      )
    return info.lastInsertRowid
  })

  // STEP 1 & 2: update-command now saves ALL fields
  ipcMain.handle('update-command', (_, id: number, command: any) => {
    const { syntax, description, example, expected_output, tool_id, category_id, tags } = command
    db.prepare(
      `UPDATE commands
       SET syntax=?, description=?, example=?, expected_output=?,
           tool_id=?, category_id=?, tags=?
       WHERE id=?`
    ).run(
      syntax,
      description ?? null,
      example ?? null,
      expected_output ?? null,
      tool_id ?? null,
      category_id ?? null,
      JSON.stringify(tags ?? []),
      id
    )
    return true
  })

  ipcMain.handle('delete-command', (_, id: number) => {
    db.prepare('DELETE FROM commands WHERE id = ?').run(id)
    return true
  })

  // STEP 1: Duplicate command
  ipcMain.handle('duplicate-command', (_, id: number) => {
    const cmd = db.prepare('SELECT * FROM commands WHERE id = ?').get(id) as any
    if (!cmd) return null
    const info = db
      .prepare(
        `INSERT INTO commands (syntax, description, example, expected_output, tool_id, category_id, tags)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        cmd.syntax + ' (copy)',
        cmd.description,
        cmd.example,
        cmd.expected_output,
        cmd.tool_id,
        cmd.category_id,
        cmd.tags ?? '[]'
      )
    return info.lastInsertRowid
  })

  // STEP 5: Increment use_count and update last_used_at
  ipcMain.handle('increment-command-use', (_, id: number) => {
    db.prepare(
      'UPDATE commands SET use_count = use_count + 1, last_used_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(id)
    return true
  })

  // STEP 5: Toggle favorite on command
  ipcMain.handle('toggle-command-favorite', (_, id: number) => {
    db.prepare('UPDATE commands SET is_favorite = 1 - is_favorite WHERE id = ?').run(id)
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

  // STEP 5: Toggle favorite on program
  ipcMain.handle('toggle-program-favorite', (_, id: number) => {
    db.prepare('UPDATE programs SET is_favorite = 1 - is_favorite WHERE id = ?').run(id)
    return true
  })

  // STEP 4: update-program-steps now includes note + expected_output
  ipcMain.handle('update-program-steps', (_, programId: number, steps: any[]) => {
    const deleteSteps = db.prepare('DELETE FROM program_steps WHERE program_id = ?')
    const insertStep = db.prepare(`
      INSERT INTO program_steps (program_id, command_id, step_order, custom_command, note, expected_output)
      VALUES (?, ?, ?, ?, ?, ?)
    `)

    const transaction = db.transaction((pId: number, s: any[]) => {
      deleteSteps.run(pId)
      s.forEach((step, index) => {
        insertStep.run(
          pId,
          step.command_id ?? null,
          index,
          step.custom_command ?? null,
          step.note ?? null,
          step.expected_output ?? null
        )
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

  // ─── GLOBAL SEARCH (STEP 5: extended) ─────────────────────────
  ipcMain.handle('global-search', (_, query: string) => {
    const q = `%${query}%`

    const commands = db
      .prepare(
        `SELECT "command" as type, id, syntax as name, description
         FROM commands
         WHERE syntax LIKE ? OR description LIKE ? OR example LIKE ? OR expected_output LIKE ? OR tags LIKE ?`
      )
      .all(q, q, q, q, q)
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

    // Also search workflow steps
    const stepResults = db
      .prepare(
        `SELECT DISTINCT "program" as type, p.id, p.name, p.description
         FROM programs p
         JOIN program_steps ps ON ps.program_id = p.id
         WHERE ps.custom_command LIKE ? OR ps.note LIKE ?`
      )
      .all(q, q)

    // Merge program results, deduplicate by id
    const programSet = new Map<number, any>()
    ;[...programs, ...stepResults].forEach((p: any) => {
      if (!programSet.has(p.id)) programSet.set(p.id, p)
    })

    return [...commands, ...tools, ...categories, ...Array.from(programSet.values()), ...posts]
  })

  // ─── STEP 6: Export / Import ───────────────────────────────────
  ipcMain.handle('export-data', async () => {
    const { filePath, canceled } = await dialog.showSaveDialog({
      title: 'Export CommandBase Data',
      defaultPath: `commandbase-export-${Date.now()}.json`,
      filters: [{ name: 'JSON', extensions: ['json'] }]
    })
    if (canceled || !filePath) return { success: false }

    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      categories: db.prepare('SELECT * FROM categories').all(),
      tools: db.prepare('SELECT * FROM tools').all(),
      commands: db.prepare('SELECT * FROM commands').all(),
      programs: db.prepare('SELECT * FROM programs').all(),
      program_steps: db.prepare('SELECT * FROM program_steps').all(),
      resources: db.prepare('SELECT * FROM resources').all(),
      blog_posts: db.prepare('SELECT * FROM blog_posts').all()
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
    return { success: true, filePath }
  })

  ipcMain.handle('import-data', async () => {
    const { filePaths, canceled } = await dialog.showOpenDialog({
      title: 'Import CommandBase Data',
      filters: [{ name: 'JSON', extensions: ['json'] }],
      properties: ['openFile']
    })
    if (canceled || !filePaths[0]) return { success: false }

    try {
      const raw = fs.readFileSync(filePaths[0], 'utf-8')
      const data = JSON.parse(raw)

      const importTransaction = db.transaction(() => {
        // Merge categories — skip duplicates by name
        if (Array.isArray(data.categories)) {
          const insertCat = db.prepare('INSERT OR IGNORE INTO categories (name, icon) VALUES (?, ?)')
          data.categories.forEach((c: any) => insertCat.run(c.name, c.icon))
        }
        // Merge tools — skip duplicates by name (case-insensitive)
        if (Array.isArray(data.tools)) {
          const insertTool = db.prepare(
            'INSERT OR IGNORE INTO tools (name, description, category_id, website, installation, usage_notes) VALUES (?, ?, ?, ?, ?, ?)'
          )
          data.tools.forEach((t: any) =>
            insertTool.run(t.name, t.description, t.category_id, t.website, t.installation, t.usage_notes)
          )
        }
        // Commands — skip exact syntax duplicates
        if (Array.isArray(data.commands)) {
          const insertCmd = db.prepare(
            `INSERT OR IGNORE INTO commands (syntax, description, example, expected_output, tool_id, category_id, tags)
             VALUES (?, ?, ?, ?, ?, ?, ?)`
          )
          data.commands.forEach((c: any) =>
            insertCmd.run(c.syntax, c.description, c.example, c.expected_output, c.tool_id, c.category_id, c.tags ?? '[]')
          )
        }
        // Blog posts — skip by title
        if (Array.isArray(data.blog_posts)) {
          const insertPost = db.prepare(
            'INSERT OR IGNORE INTO blog_posts (title, content, categories, photos, font_family) VALUES (?, ?, ?, ?, ?)'
          )
          data.blog_posts.forEach((p: any) =>
            insertPost.run(p.title, p.content, p.categories, p.photos, p.font_family)
          )
        }
        // Resources — skip by title+url
        if (Array.isArray(data.resources)) {
          const insertRes = db.prepare(
            'INSERT OR IGNORE INTO resources (title, url, type, description, category_id, personal_notes) VALUES (?, ?, ?, ?, ?, ?)'
          )
          data.resources.forEach((r: any) =>
            insertRes.run(r.title, r.url, r.type, r.description, r.category_id, r.personal_notes)
          )
        }
      })

      importTransaction()
      return { success: true }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  // ─── STEP 6: Manual DB backup ─────────────────────────────────
  ipcMain.handle('backup-db', async () => {
    const dbPath = path.join(app.getPath('userData'), 'commandbase.db')
    const { filePath, canceled } = await dialog.showSaveDialog({
      title: 'Save Database Backup',
      defaultPath: `commandbase-${Date.now()}.db`,
      filters: [{ name: 'SQLite Database', extensions: ['db'] }]
    })
    if (canceled || !filePath) return { success: false }
    fs.copyFileSync(dbPath, filePath)
    return { success: true, filePath }
  })
}
