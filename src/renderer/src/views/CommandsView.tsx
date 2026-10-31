import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  Plus,
  Terminal,
  Copy,
  Check,
  Trash2,
  Edit2,
  Code2,
  Star,
  Play,
  Search,
  Filter,
  Copy as CopyIcon
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import CommandEditorModal, { CommandFormData } from '../components/CommandEditorModal'
import TemplateRunnerModal from '../components/TemplateRunnerModal'

// ── Detect {{variables}} ──────────────────────────────────────────────────────
function hasTemplateVars(syntax: string) {
  return /\{\{[^}]+\}\}/.test(syntax)
}

// ── Highlight {{variables}} inline ───────────────────────────────────────────
function SyntaxLine({ syntax }: { syntax: string }) {
  const parts = syntax.split(/(\{\{[^}]+\}\})/g)
  return (
    <code style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
      {parts.map((p, i) =>
        /^\{\{.*\}\}$/.test(p) ? (
          <span key={i} style={{ color: 'var(--accent-amber)' }}>{p}</span>
        ) : (
          <span key={i} style={{ color: 'var(--accent-green)' }}>{p}</span>
        )
      )}
    </code>
  )
}

// ── Toast ─────────────────────────────────────────────────────────────────────
interface Toast {
  id: number
  message: string
  onUndo?: () => void
  countdown: number
}

let toastCounter = 0

function ToastBar({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: number) => void }) {
  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9500, display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.15 }}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '11px',
              color: 'var(--text-primary)',
              minWidth: '280px'
            }}
          >
            <span style={{ flex: 1 }}>{t.message}</span>
            {t.onUndo && (
              <button
                className="btn"
                style={{ height: '26px', padding: '0 10px', color: 'var(--accent-amber)', borderColor: 'var(--accent-amber)' }}
                onClick={() => { t.onUndo!(); onRemove(t.id) }}
              >
                Undo ({t.countdown}s)
              </button>
            )}
            <button
              onClick={() => onRemove(t.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
            >
              ✕
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

const CommandsView: React.FC = () => {
  const [commands, setCommands] = useState<any[]>([])
  const [tools, setTools] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [copiedId, setCopiedId] = useState<number | null>(null)

  // Editor modal
  const [editorOpen, setEditorOpen] = useState(false)
  const [editorInitial, setEditorInitial] = useState<Partial<CommandFormData> | undefined>()

  // Template runner
  const [runnerCmd, setRunnerCmd] = useState<any>(null)

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([])
  const countdownRefs = useRef<Record<number, ReturnType<typeof setInterval>>>({})

  // ── Filters / Search (Step 5) ──────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTool, setFilterTool] = useState<number | null>(null)
  const [filterCategory, setFilterCategory] = useState<number | null>(null)
  const [filterTag, setFilterTag] = useState<string>('')
  const [filterFavorites, setFilterFavorites] = useState(false)
  const [sortMode, setSortMode] = useState<'recent' | 'most-used' | 'az'>('recent')
  const [groupByTool, setGroupByTool] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  // Ctrl+N opens new command
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        openCreate()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const loadData = async () => {
    try {
      const [c, t, cats] = await Promise.all([
        window.api.getCommands(),
        window.api.getTools(),
        window.api.getCategories()
      ])
      setCommands(c)
      setTools(t)
      setCategories(cats)
    } catch (err) {
      console.error('Error loading commands:', err)
    }
  }

  // ── Toast helpers ────────────────────────────────────────────────────────────
  const addToast = useCallback((message: string, onUndo?: () => void) => {
    const id = ++toastCounter
    let countdown = 5
    setToasts((prev) => [...prev, { id, message, onUndo, countdown }])

    if (onUndo) {
      countdownRefs.current[id] = setInterval(() => {
        countdown--
        setToasts((prev) =>
          prev.map((t) => (t.id === id ? { ...t, countdown } : t))
        )
        if (countdown <= 0) {
          clearInterval(countdownRefs.current[id])
          setToasts((prev) => prev.filter((t) => t.id !== id))
        }
      }, 1000)
    } else {
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000)
    }
  }, [])

  const removeToast = useCallback((id: number) => {
    clearInterval(countdownRefs.current[id])
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // ── CRUD ─────────────────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditorInitial(undefined)
    setEditorOpen(true)
  }

  const openEdit = (cmd: any) => {
    setEditorInitial({
      id: cmd.id,
      syntax: cmd.syntax ?? '',
      description: cmd.description ?? '',
      example: cmd.example ?? '',
      expected_output: cmd.expected_output ?? '',
      tool_id: cmd.tool_id ? String(cmd.tool_id) : '',
      category_id: cmd.category_id ? String(cmd.category_id) : '',
      tags: cmd.tags ? JSON.parse(cmd.tags) : []
    })
    setEditorOpen(true)
  }

  const handleSave = async (data: CommandFormData) => {
    const payload = {
      syntax: data.syntax,
      description: data.description || null,
      example: data.example || null,
      expected_output: data.expected_output || null,
      tool_id: data.tool_id ? parseInt(data.tool_id) : null,
      category_id: data.category_id ? parseInt(data.category_id) : null,
      tags: data.tags
    }
    if (data.id) {
      await window.api.updateCommand(data.id, payload)
      addToast('Command updated.')
    } else {
      await window.api.addCommand(payload)
      addToast('Command saved.')
    }
    loadData()
  }

  const handleDelete = async (cmd: any) => {
    // Optimistically remove from UI
    setCommands((prev) => prev.filter((c) => c.id !== cmd.id))
    let undone = false

    addToast(`Deleted: ${cmd.syntax.slice(0, 40)}`, async () => {
      undone = true
      // Restore by re-inserting (we stored the original object)
      await window.api.addCommand({
        syntax: cmd.syntax,
        description: cmd.description,
        example: cmd.example,
        expected_output: cmd.expected_output,
        tool_id: cmd.tool_id,
        category_id: cmd.category_id,
        tags: cmd.tags ? JSON.parse(cmd.tags) : []
      })
      loadData()
    })

    // After 5s, actually delete from DB (if not undone)
    setTimeout(async () => {
      if (!undone) {
        await window.api.deleteCommand(cmd.id)
      }
    }, 5200)
  }

  const handleDuplicate = async (cmd: any) => {
    await window.api.duplicateCommand(cmd.id)
    addToast('Command duplicated.')
    loadData()
  }

  const handleCopy = async (syntax: string, id: number) => {
    navigator.clipboard.writeText(syntax)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1500)
    await window.api.incrementCommandUse(id)
    loadData() // refresh use_count
  }

  const handleToggleFavorite = async (id: number) => {
    await window.api.toggleCommandFavorite(id)
    loadData()
  }

  // ── Filtering + Sorting ───────────────────────────────────────────────────
  const allTags = Array.from(
    new Set(commands.flatMap((c) => (c.tags ? JSON.parse(c.tags) : [])))
  ) as string[]

  const filtered = commands
    .filter((c) => {
      if (filterFavorites && !c.is_favorite) return false
      if (filterTool && c.tool_id !== filterTool) return false
      if (filterCategory && c.category_id !== filterCategory) return false
      if (filterTag) {
        const tags: string[] = c.tags ? JSON.parse(c.tags) : []
        if (!tags.includes(filterTag)) return false
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const tags: string[] = c.tags ? JSON.parse(c.tags) : []
        return (
          c.syntax?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q) ||
          c.example?.toLowerCase().includes(q) ||
          c.expected_output?.toLowerCase().includes(q) ||
          tags.some((t) => t.includes(q))
        )
      }
      return true
    })
    .sort((a, b) => {
      if (sortMode === 'most-used') return (b.use_count ?? 0) - (a.use_count ?? 0)
      if (sortMode === 'az') return (a.syntax ?? '').localeCompare(b.syntax ?? '')
      return b.id - a.id // recent
    })

  const getToolName = (id: number) => {
    const tool = tools.find((t) => t.id === id)
    return tool?.name ?? 'Core'
  }

  const getCategoryName = (id: number) => {
    const cat = categories.find((c) => c.id === id)
    return cat?.name ?? null
  }

  // Group by tool
  let grouped: { label: string; items: any[] }[] = []
  if (groupByTool) {
    const map = new Map<string, any[]>()
    filtered.forEach((c) => {
      const label = c.tool_id ? getToolName(c.tool_id) : 'No Tool'
      if (!map.has(label)) map.set(label, [])
      map.get(label)!.push(c)
    })
    grouped = Array.from(map.entries()).map(([label, items]) => ({ label, items }))
  } else {
    grouped = [{ label: '', items: filtered }]
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-default)', paddingBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '20px', marginBottom: '4px' }}>Commands</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '11px', letterSpacing: '0.8px' }}>
            {commands.length} command{commands.length !== 1 ? 's' : ''} saved
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={14} /> New Command
        </button>
      </div>

      {/* ── Search + Filters (Step 5) ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search box */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '200px', background: 'var(--bg-void)', border: '1px solid var(--border-default)', padding: '0 10px', height: '36px' }}>
            <Search size={13} color="var(--text-secondary)" />
            <input
              type="text"
              style={{ border: 'none', background: 'transparent', outline: 'none', color: 'var(--text-primary)', fontFamily: 'JetBrains Mono', fontSize: '11px', width: '100%' }}
              placeholder="Search syntax, description, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter: Tool */}
          <select
            className="input-field"
            style={{ height: '36px', minWidth: '120px', fontSize: '10px' }}
            value={filterTool ?? ''}
            onChange={(e) => setFilterTool(e.target.value ? parseInt(e.target.value) : null)}
          >
            <option value="">All Tools</option>
            {tools.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>

          {/* Filter: Category */}
          <select
            className="input-field"
            style={{ height: '36px', minWidth: '120px', fontSize: '10px' }}
            value={filterCategory ?? ''}
            onChange={(e) => setFilterCategory(e.target.value ? parseInt(e.target.value) : null)}
          >
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          {/* Filter: Tags */}
          {allTags.length > 0 && (
            <select
              className="input-field"
              style={{ height: '36px', minWidth: '100px', fontSize: '10px' }}
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
            >
              <option value="">All Tags</option>
              {allTags.map((tag) => <option key={tag} value={tag}>{tag}</option>)}
            </select>
          )}

          {/* Sort */}
          <select
            className="input-field"
            style={{ height: '36px', minWidth: '110px', fontSize: '10px' }}
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as any)}
          >
            <option value="recent">Recent</option>
            <option value="most-used">Most Used</option>
            <option value="az">A–Z</option>
          </select>
        </div>

        {/* Chip filters */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            className={filterFavorites ? 'btn btn-primary' : 'btn'}
            style={{ height: '28px', padding: '0 10px', fontSize: '9px' }}
            onClick={() => setFilterFavorites(!filterFavorites)}
          >
            <Star size={10} /> Favorites
          </button>
          <button
            className={groupByTool ? 'btn btn-primary' : 'btn'}
            style={{ height: '28px', padding: '0 10px', fontSize: '9px' }}
            onClick={() => setGroupByTool(!groupByTool)}
          >
            <Filter size={10} /> Group by Tool
          </button>
          {(searchQuery || filterTool || filterCategory || filterTag || filterFavorites) && (
            <button
              className="btn"
              style={{ height: '28px', padding: '0 10px', fontSize: '9px', color: 'var(--accent-red)', borderColor: 'var(--accent-red)' }}
              onClick={() => { setSearchQuery(''); setFilterTool(null); setFilterCategory(null); setFilterTag(''); setFilterFavorites(false) }}
            >
              Clear Filters
            </button>
          )}
          <span style={{ fontSize: '9px', color: 'var(--text-muted)', letterSpacing: '1px', marginLeft: 'auto' }}>
            {filtered.length} of {commands.length} shown
          </span>
        </div>
      </div>

      {/* ── Command List ── */}
      {grouped.map(({ label, items }) => (
        <div key={label}>
          {label && (
            <div style={{ marginBottom: '10px', paddingBottom: '4px', borderBottom: '1px solid var(--border-default)' }}>
              <span className="badge-outline magenta" style={{ fontSize: '10px' }}>{label}</span>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {items.map((cmd) => {
              const tags: string[] = cmd.tags ? JSON.parse(cmd.tags) : []
              const catName = getCategoryName(cmd.category_id)
              const isTemplate = hasTemplateVars(cmd.syntax)
              return (
                <div
                  key={cmd.id}
                  className="card"
                  style={{ padding: '14px 16px', display: 'flex', gap: '14px', alignItems: 'flex-start', background: 'var(--bg-panel)' }}
                >
                  {/* Icon + favorite */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    <div style={{ width: '34px', height: '34px', border: '1px solid var(--border-default)', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)' }}>
                      <Terminal size={15} />
                    </div>
                    <button
                      onClick={() => handleToggleFavorite(cmd.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: cmd.is_favorite ? 'var(--accent-amber)' : 'var(--text-muted)', display: 'flex', padding: '2px' }}
                      title={cmd.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Star size={12} fill={cmd.is_favorite ? 'currentColor' : 'none'} />
                    </button>
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    {/* Badges */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      {cmd.tool_id && (
                        <span className="badge-outline cyan" style={{ fontSize: '8px' }}>{getToolName(cmd.tool_id)}</span>
                      )}
                      {catName && (
                        <span className="badge-outline magenta" style={{ fontSize: '8px' }}>{catName}</span>
                      )}
                      {tags.map((tag) => (
                        <span key={tag} className="badge-outline" style={{ fontSize: '8px', borderColor: 'var(--text-muted)', color: 'var(--text-muted)' }}>{tag}</span>
                      ))}
                      {isTemplate && (
                        <span className="badge-outline amber" style={{ fontSize: '8px' }}>template</span>
                      )}
                      <span style={{ fontSize: '8px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                        {cmd.use_count > 0 ? `used ${cmd.use_count}×` : ''}
                      </span>
                    </div>

                    {/* Syntax block */}
                    <div style={{ background: '#000', border: '1px solid var(--border-default)', padding: '10px 14px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <span style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', fontSize: '12px', marginRight: '6px' }}>$</span>
                        <SyntaxLine syntax={cmd.syntax} />
                      </div>
                      <button
                        className="btn"
                        onClick={() => handleCopy(cmd.syntax, cmd.id)}
                        style={{ border: 'none', background: 'rgba(0,232,135,0.05)', padding: '3px 7px', height: 'auto', color: 'var(--accent-green)', flexShrink: 0 }}
                        title="Copy to clipboard"
                      >
                        {copiedId === cmd.id ? <Check size={12} /> : <Copy size={12} />}
                      </button>
                    </div>

                    {cmd.description && (
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '4px' }}>
                        {cmd.description}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flexShrink: 0 }}>
                    {isTemplate && (
                      <button
                        className="btn"
                        style={{ height: '28px', padding: '0 8px', fontSize: '9px', color: 'var(--accent-amber)', borderColor: 'var(--accent-amber)' }}
                        title="Run template"
                        onClick={() => setRunnerCmd(cmd)}
                      >
                        <Play size={10} />
                      </button>
                    )}
                    <button
                      className="btn-icon"
                      title="Edit"
                      onClick={() => openEdit(cmd)}
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      className="btn-icon"
                      title="Duplicate"
                      onClick={() => handleDuplicate(cmd)}
                    >
                      <CopyIcon size={12} />
                    </button>
                    <button
                      className="btn-icon"
                      style={{ color: 'var(--accent-red)' }}
                      title="Delete"
                      onClick={() => handleDelete(cmd)}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* Empty state */}
      {filtered.length === 0 && (
        <div
          className="card"
          style={{ textAlign: 'center', padding: '60px', border: '1px dashed var(--border-default)', background: 'var(--bg-panel)' }}
        >
          <Code2 size={32} style={{ opacity: 0.3, color: 'var(--accent-cyan)', marginBottom: '16px' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '16px' }}>
            {commands.length === 0
              ? 'No commands yet.'
              : 'No commands match your filters.'}
          </p>
          {commands.length === 0 && (
            <button className="btn btn-primary" onClick={openCreate} style={{ margin: '0 auto' }}>
              <Plus size={13} /> Create your first command
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      <CommandEditorModal
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSave={handleSave}
        initialData={editorInitial}
        tools={tools}
        categories={categories}
      />

      <TemplateRunnerModal
        isOpen={!!runnerCmd}
        onClose={() => setRunnerCmd(null)}
        command={runnerCmd}
        onCopy={(id) => window.api.incrementCommandUse(id).then(() => loadData())}
      />

      {/* Toast container */}
      <ToastBar toasts={toasts} onRemove={removeToast} />
    </div>
  )
}

export default CommandsView
