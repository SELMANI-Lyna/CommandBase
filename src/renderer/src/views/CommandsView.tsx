import React, { useState, useEffect } from 'react'
import { Plus, Terminal, Copy, Check, Trash2, Edit2, Code2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const CommandsView: React.FC = () => {
  const [commands, setCommands] = useState<any[]>([])
  const [tools, setTools] = useState<any[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [newCommand, setNewCommand] = useState({
    tool_id: '',
    syntax: '',
    description: '',
    example: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [c, t] = await Promise.all([window.api.getCommands(), window.api.getTools()])
      setCommands(c)
      setTools(t)
    } catch (err) {
      console.error('Error loading commands:', err)
    }
  }

  const handleCopy = (text: string, id: number) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newCommand.syntax.trim()) {
      try {
        await window.api.addCommand({
          ...newCommand,
          tool_id: newCommand.tool_id ? parseInt(newCommand.tool_id) : null
        })
        setNewCommand({ tool_id: '', syntax: '', description: '', example: '' })
        setIsAdding(false)
        loadData()
      } catch (err) {
        console.error('Error recording syntax:', err)
      }
    }
  }

  const getToolName = (id: number) => {
    const tool = tools.find((t) => t.id === id)
    return tool ? tool.name.toUpperCase() : 'CORE'
  }

  return (
    <div
      className="animate-fade-in"
      style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderBottom: '1px solid var(--border-default)',
          paddingBottom: '16px'
        }}
      >
        <div>
          <h1 style={{ fontSize: '20px', marginBottom: '4px' }}>COMMAND_BUFFER</h1>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.8px'
            }}
          >
            EXECUTABLE SYNTAX STRINGS, TARGET ARGS, AND MISSION-CRITICAL SHELL CONFIGS.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
          <Plus size={14} /> CATALOG_SYNTAX
        </button>
      </div>

      {/* Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.12 }}
            className="hud-panel"
            style={{ background: 'var(--bg-surface)' }}
          >
            <div className="hud-panel-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Terminal size={14} color="var(--accent-cyan)" />
                <h2>CATALOG_NEW_SYNTAX_INSTRUCTION_THREAD</h2>
              </div>
            </div>
            <div className="hud-panel-body">
              <form
                onSubmit={handleAdd}
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}
              >
                <div style={{ gridColumn: 'span 2' }}>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '6px',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    EXECUTION SYNTAX STRING
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    style={{ width: '100%', fontFamily: 'JetBrains Mono', fontSize: '13px' }}
                    value={newCommand.syntax}
                    onChange={(e) => setNewCommand({ ...newCommand, syntax: e.target.value })}
                    placeholder="e.g. hashcat -m 0 -a 0 hashes.txt words.txt"
                    required
                  />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '6px',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    SOURCE UTILITY COMPONENT
                  </label>
                  <select
                    className="input-field"
                    style={{ width: '100%' }}
                    value={newCommand.tool_id}
                    onChange={(e) => setNewCommand({ ...newCommand, tool_id: e.target.value })}
                  >
                    <option value="">STANDALONE CORE</option>
                    {tools.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '6px',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    OPERATIONAL MANUAL / STRATEGY NOTES
                  </label>
                  <textarea
                    className="input-field"
                    style={{ width: '100%', minHeight: '80px' }}
                    value={newCommand.description}
                    onChange={(e) => setNewCommand({ ...newCommand, description: e.target.value })}
                    placeholder="Explain target and flag options..."
                  />
                </div>
                <div
                  style={{
                    display: 'flex',
                    gap: '10px',
                    gridColumn: 'span 2',
                    justifyContent: 'flex-end',
                    marginTop: '8px'
                  }}
                >
                  <button type="submit" className="btn btn-primary">
                    ARCHIVE_SYNTAX
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => setIsAdding(false)}
                  >
                    ABORT
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {commands.map((cmd) => (
          <div
            key={cmd.id}
            className="card"
            style={{
              padding: '16px',
              display: 'flex',
              gap: '16px',
              alignItems: 'flex-start',
              background: 'var(--bg-panel)'
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                border: '1px solid var(--border-default)',
                background: 'var(--bg-surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-cyan)',
                flexShrink: 0
              }}
            >
              <Terminal size={16} />
            </div>

            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}
              >
                <span className="badge-outline cyan">{getToolName(cmd.tool_id)}</span>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                  ID: 0x{cmd.id.toString(16).toUpperCase().padStart(4, '0')}
                </span>
              </div>

              {/* Monospace Terminal Code block */}
              <div style={{ position: 'relative', marginBottom: '10px' }}>
                <div
                  style={{
                    background: '#000000',
                    border: '1px solid var(--border-default)',
                    padding: '12px 16px',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '13px',
                    color: 'var(--accent-green)',
                    overflowX: 'auto',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <code>$ {cmd.syntax}</code>
                  <button
                    className="btn"
                    onClick={() => handleCopy(cmd.syntax, cmd.id)}
                    style={{
                      border: 'none',
                      background: 'rgba(0, 232, 135, 0.05)',
                      padding: '4px 8px',
                      height: '24px',
                      color: 'var(--accent-green)',
                      marginLeft: '12px'
                    }}
                    title="Copy to terminal"
                  >
                    {copiedId === cmd.id ? (
                      <Check size={12} color="var(--accent-green)" />
                    ) : (
                      <Copy size={12} />
                    )}
                  </button>
                </div>
              </div>

              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                {cmd.description || 'NO EXTRA MANUAL PARAMETERS LOGGED.'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '4px' }}>
              <button className="btn-icon" title="Edit">
                <Edit2 size={12} />
              </button>
              <button className="btn-icon" style={{ color: 'var(--accent-red)' }} title="Delete">
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {commands.length === 0 && !isAdding && (
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '60px',
            border: '1px dashed var(--border-default)',
            background: 'var(--bg-panel)'
          }}
        >
          <Code2
            size={32}
            style={{ opacity: 0.3, color: 'var(--accent-cyan)', marginBottom: '16px' }}
          />
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
          >
            SYNTAX BUFFER EMPTY. DEFINE EXECUTION PARAMETERS.
          </p>
        </div>
      )}
    </div>
  )
}

export default CommandsView
