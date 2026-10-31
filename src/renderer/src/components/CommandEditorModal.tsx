import React, { useState, useEffect, useRef, useCallback } from 'react'
import { X, Save, Eye, EyeOff, Terminal, Copy, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export interface CommandFormData {
  id?: number
  syntax: string
  description: string
  example: string
  expected_output: string
  tool_id: string
  category_id: string
  tags: string[]
}

interface CommandEditorModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CommandFormData) => Promise<void>
  initialData?: Partial<CommandFormData>
  tools: any[]
  categories: any[]
}

// Extract {{variable}} or {{variable:default}} from syntax
function extractVariables(syntax: string): { name: string; defaultValue: string }[] {
  const regex = /\{\{([^}:]+)(?::([^}]*))?\}\}/g
  const seen = new Set<string>()
  const vars: { name: string; defaultValue: string }[] = []
  let m: RegExpExecArray | null
  while ((m = regex.exec(syntax)) !== null) {
    if (!seen.has(m[1])) {
      seen.add(m[1])
      vars.push({ name: m[1], defaultValue: m[2] ?? '' })
    }
  }
  return vars
}

// Render syntax with {{variable}} highlighted
function HighlightedSyntax({ syntax }: { syntax: string }) {
  const parts = syntax.split(/(\{\{[^}]+\}\})/g)
  return (
    <code style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
      {parts.map((p, i) =>
        /^\{\{.*\}\}$/.test(p) ? (
          <span
            key={i}
            style={{
              color: 'var(--accent-amber)',
              background: 'rgba(255,179,0,0.12)',
              border: '1px solid rgba(255,179,0,0.3)',
              padding: '0 3px'
            }}
          >
            {p}
          </span>
        ) : (
          <span key={i} style={{ color: 'var(--accent-green)' }}>{p}</span>
        )
      )}
    </code>
  )
}

// Minimal line-number gutter + textarea
function CodeEditor({
  value,
  onChange,
  placeholder
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  const taRef = useRef<HTMLTextAreaElement>(null)
  const gutterRef = useRef<HTMLDivElement>(null)

  const lines = value.split('\n')

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const ta = e.currentTarget
      const start = ta.selectionStart
      const end = ta.selectionEnd
      const newVal = value.substring(0, start) + '  ' + value.substring(end)
      onChange(newVal)
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 2
      })
    }
  }

  const syncScroll = () => {
    if (taRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = taRef.current.scrollTop
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        background: '#000',
        border: '1px solid var(--border-default)',
        minHeight: '180px',
        maxHeight: '340px',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Line numbers */}
      <div
        ref={gutterRef}
        style={{
          padding: '12px 8px',
          minWidth: '36px',
          background: '#020508',
          borderRight: '1px solid var(--border-default)',
          textAlign: 'right',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '12px',
          lineHeight: '1.6',
          color: 'var(--text-muted)',
          userSelect: 'none',
          overflowY: 'hidden',
          flexShrink: 0
        }}
      >
        {lines.map((_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>
      {/* Textarea */}
      <textarea
        ref={taRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onScroll={syncScroll}
        placeholder={placeholder}
        style={{
          flex: 1,
          background: 'transparent',
          border: 'none',
          outline: 'none',
          padding: '12px',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '13px',
          color: 'var(--accent-green)',
          resize: 'none',
          lineHeight: '1.6',
          overflowY: 'auto',
          minHeight: '180px',
          maxHeight: '340px'
        }}
        spellCheck={false}
      />
    </div>
  )
}

const EMPTY_FORM: CommandFormData = {
  syntax: '',
  description: '',
  example: '',
  expected_output: '',
  tool_id: '',
  category_id: '',
  tags: []
}

const CommandEditorModal: React.FC<CommandEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  tools,
  categories
}) => {
  const [form, setForm] = useState<CommandFormData>(EMPTY_FORM)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [previewDesc, setPreviewDesc] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (isOpen) {
      const merged = { ...EMPTY_FORM, ...initialData }
      setForm(merged)
      setDirty(false)
      setSaving(false)
    }
  }, [isOpen, initialData])

  const update = useCallback(<K extends keyof CommandFormData>(key: K, value: CommandFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setDirty(true)
  }, [])

  const handleSave = async () => {
    if (!form.syntax.trim()) return
    setSaving(true)
    await onSave(form)
    setDirty(false)
    setSaving(false)
    onClose()
  }

  // Keyboard shortcuts inside modal
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!isOpen) return
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
      if (e.key === 'Escape') {
        if (dirty) {
          if (confirm('You have unsaved changes. Close without saving?')) onClose()
        } else {
          onClose()
        }
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, dirty, form])

  const addTag = () => {
    const t = tagInput.trim().toLowerCase()
    if (t && !form.tags.includes(t)) {
      update('tags', [...form.tags, t])
    }
    setTagInput('')
  }

  const removeTag = (tag: string) => {
    update('tags', form.tags.filter((t) => t !== tag))
  }

  const copyPreview = () => {
    navigator.clipboard.writeText(form.syntax)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const variables = extractVariables(form.syntax)
  const isEditing = !!initialData?.id

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(2, 5, 8, 0.92)',
            zIndex: 8000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <motion.div
            initial={{ scale: 0.97, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.97, opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="hud-panel"
            style={{ width: '100%', maxWidth: '900px', maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
          >
            {/* Header */}
            <div className="hud-panel-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Terminal size={14} color="var(--accent-cyan)" />
                <h2>{isEditing ? 'Edit Command' : 'New Command'}</h2>
                {dirty && (
                  <span style={{ fontSize: '9px', color: 'var(--accent-amber)', letterSpacing: '1px' }}>
                    • UNSAVED
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)', letterSpacing: '1px' }}>
                  Ctrl+S to save • Esc to close
                </span>
                <button
                  className="btn btn-primary"
                  style={{ height: '30px', padding: '0 14px' }}
                  onClick={handleSave}
                  disabled={saving || !form.syntax.trim()}
                >
                  <Save size={12} />
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    if (dirty && !confirm('Unsaved changes. Close?')) return
                    onClose()
                  }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Body — two columns */}
            <div
              className="hud-panel-body"
              style={{ overflow: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '20px' }}
            >
              {/* ── LEFT COLUMN ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Syntax editor */}
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '9px', color: 'var(--accent-cyan)', letterSpacing: '1.5px' }}>
                    SYNTAX *
                  </label>
                  <CodeEditor
                    value={form.syntax}
                    onChange={(v) => update('syntax', v)}
                    placeholder={'nmap -sV -p- {{target}}\n# add -A for OS detection'}
                  />
                  {variables.length > 0 && (
                    <div style={{ marginTop: '6px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {variables.map((v) => (
                        <span key={v.name} className="badge-outline amber" style={{ fontSize: '9px' }}>
                          {'{{'}
                          {v.name}
                          {v.defaultValue ? `:${v.defaultValue}` : ''}
                          {'}}'}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tool + Category */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '9px', color: 'var(--text-secondary)', letterSpacing: '1px' }}>
                      Tool
                    </label>
                    <select
                      className="input-field"
                      style={{ width: '100%' }}
                      value={form.tool_id}
                      onChange={(e) => update('tool_id', e.target.value)}
                    >
                      <option value="">— None —</option>
                      {tools.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '9px', color: 'var(--text-secondary)', letterSpacing: '1px' }}>
                      Category
                    </label>
                    <select
                      className="input-field"
                      style={{ width: '100%' }}
                      value={form.category_id}
                      onChange={(e) => update('category_id', e.target.value)}
                    >
                      <option value="">— None —</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '9px', color: 'var(--text-secondary)', letterSpacing: '1px' }}>
                    Tags
                  </label>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    {form.tags.map((tag) => (
                      <span
                        key={tag}
                        className="badge-outline cyan"
                        style={{ fontSize: '9px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        onClick={() => removeTag(tag)}
                        title="Click to remove"
                      >
                        {tag} ×
                      </span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input
                      type="text"
                      className="input-field"
                      style={{ flex: 1, height: '32px', fontSize: '11px' }}
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                      placeholder="Add tag, press Enter"
                    />
                    <button className="btn" style={{ height: '32px', padding: '0 10px' }} onClick={addTag}>
                      +
                    </button>
                  </div>
                </div>

                {/* Description / Notes */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '9px', color: 'var(--text-secondary)', letterSpacing: '1px' }}>
                      Description / Notes
                    </label>
                    <button
                      className="btn"
                      style={{ height: '24px', padding: '0 8px', fontSize: '9px' }}
                      onClick={() => setPreviewDesc(!previewDesc)}
                    >
                      {previewDesc ? <EyeOff size={10} /> : <Eye size={10} />}
                      {previewDesc ? 'Edit' : 'Preview'}
                    </button>
                  </div>
                  {previewDesc ? (
                    <div
                      style={{
                        background: 'var(--bg-void)',
                        border: '1px solid var(--border-default)',
                        padding: '10px 12px',
                        minHeight: '80px',
                        fontSize: '12px',
                        color: 'var(--text-primary)',
                        lineHeight: '1.6',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word'
                      }}
                    >
                      {form.description || <span style={{ color: 'var(--text-muted)' }}>No description.</span>}
                    </div>
                  ) : (
                    <textarea
                      className="input-field"
                      style={{ width: '100%', minHeight: '80px', resize: 'vertical' }}
                      value={form.description}
                      onChange={(e) => update('description', e.target.value)}
                      placeholder="Explain flags, use cases, context..."
                    />
                  )}
                </div>
              </div>

              {/* ── RIGHT COLUMN ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Live preview */}
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '9px', color: 'var(--accent-cyan)', letterSpacing: '1.5px' }}>
                    Live Preview
                  </label>
                  <div
                    style={{
                      background: '#000',
                      border: '1px solid var(--border-default)',
                      padding: '12px 14px',
                      minHeight: '64px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '8px'
                    }}
                  >
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <span style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', fontSize: '12px', marginRight: '6px' }}>$</span>
                      <HighlightedSyntax syntax={form.syntax || 'your command will appear here...'} />
                    </div>
                    <button
                      className="btn"
                      onClick={copyPreview}
                      style={{ border: 'none', background: 'none', color: 'var(--accent-green)', padding: '2px 6px', height: 'auto', flexShrink: 0 }}
                    >
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  </div>
                  {form.description && (
                    <p style={{ marginTop: '6px', fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                      {form.description.slice(0, 120)}{form.description.length > 120 ? '…' : ''}
                    </p>
                  )}
                </div>

                {/* Example */}
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '9px', color: 'var(--text-secondary)', letterSpacing: '1px' }}>
                    Example (filled-in)
                  </label>
                  <textarea
                    className="input-field"
                    style={{ width: '100%', minHeight: '70px', fontFamily: 'JetBrains Mono', fontSize: '12px', resize: 'vertical' }}
                    value={form.example}
                    onChange={(e) => update('example', e.target.value)}
                    placeholder={'nmap -sV -p- 10.10.10.5'}
                  />
                </div>

                {/* Expected output */}
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '9px', color: 'var(--text-secondary)', letterSpacing: '1px' }}>
                    Expected Output
                  </label>
                  <textarea
                    className="input-field"
                    style={{ width: '100%', minHeight: '100px', fontFamily: 'JetBrains Mono', fontSize: '12px', resize: 'vertical' }}
                    value={form.expected_output}
                    onChange={(e) => update('expected_output', e.target.value)}
                    placeholder={'PORT   STATE SERVICE VERSION\n22/tcp open  ssh     OpenSSH 8.2p1'}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default CommandEditorModal
