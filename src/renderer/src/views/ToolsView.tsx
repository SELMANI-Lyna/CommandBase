import React, { useState, useEffect } from 'react'
import { Plus, Wrench, Globe, Info, Settings, ShieldCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const ToolsView: React.FC = () => {
  const [tools, setTools] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [newTool, setNewTool] = useState({
    name: '',
    description: '',
    category_id: '',
    website: '',
    installation: '',
    usage_notes: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [t, c] = await Promise.all([window.api.getTools(), window.api.getCategories()])
      setTools(t)
      setCategories(c)
    } catch (err) {
      console.error('Error loading tools view data:', err)
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newTool.name.trim()) {
      try {
        await window.api.addTool({
          ...newTool,
          category_id: newTool.category_id ? parseInt(newTool.category_id) : null
        })
        setNewTool({
          name: '',
          description: '',
          category_id: '',
          website: '',
          installation: '',
          usage_notes: ''
        })
        setIsAdding(false)
        loadData()
      } catch (err) {
        console.error('Error recording tool:', err)
      }
    }
  }

  const getCategoryName = (id: number) => {
    const cat = categories.find((c) => c.id === id)
    return cat ? cat.name.toUpperCase() : 'GENERAL'
  }

  return (
    <div
      className="animate-fade-in"
      style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
    >
      {/* Top Header Section */}
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
          <h1 style={{ fontSize: '20px', marginBottom: '4px' }}>EQUIPMENT_REPOSITORY</h1>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.8px'
            }}
          >
            SECURE LOG OF THIRD-PARTY CYBERSECURITY COMMAND UTILITIES AND BINARY DEPENDENCIES.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
          <Plus size={14} /> CATALOG_TOOL
        </button>
      </div>

      {/* Addition Modal Panel */}
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
                <Wrench size={14} color="var(--accent-cyan)" />
                <h2>CATALOG_NEW_UTILITY_PARAMETERS</h2>
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
                    TOOL IDENTIFIER (NAME)
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    style={{ width: '100%' }}
                    value={newTool.name}
                    onChange={(e) => setNewTool({ ...newTool, name: e.target.value })}
                    placeholder="e.g. NMAP SEGMENT EXPANDER"
                    required
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '6px',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    INTEL BRANCH (CATEGORY)
                  </label>
                  <select
                    className="input-field"
                    style={{ width: '100%' }}
                    value={newTool.category_id}
                    onChange={(e) => setNewTool({ ...newTool, category_id: e.target.value })}
                  >
                    <option value="">UNASSIGNED</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '6px',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    OFFICIAL DOMAIN URL
                  </label>
                  <input
                    type="url"
                    className="input-field"
                    style={{ width: '100%' }}
                    value={newTool.website}
                    onChange={(e) => setNewTool({ ...newTool, website: e.target.value })}
                    placeholder="https://..."
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
                    DESCRIPTION AND STRATEGIC PURPOSE
                  </label>
                  <textarea
                    className="input-field"
                    style={{ width: '100%', minHeight: '80px' }}
                    value={newTool.description}
                    onChange={(e) => setNewTool({ ...newTool, description: e.target.value })}
                    placeholder="Enter full specification details..."
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
                    ARCHIVE_ENTITY
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

      {/* Grid display */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '20px'
        }}
      >
        {tools.map((tool) => (
          <div
            key={tool.id}
            className="card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              background: 'var(--bg-panel)'
            }}
          >
            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
            >
              <div>
                <h3 style={{ fontSize: '14px', letterSpacing: '1px', marginBottom: '6px' }}>
                  {tool.name.toUpperCase()}
                </h3>
                <span className={`badge-outline ${tool.category_id ? 'cyan' : 'magenta'}`}>
                  {getCategoryName(tool.category_id)}
                </span>
              </div>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  border: '1px solid var(--border-default)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-secondary)',
                  background: 'var(--bg-surface)'
                }}
              >
                <Wrench size={16} />
              </div>
            </div>

            <p
              style={{
                fontSize: '11px',
                lineHeight: '1.5',
                color: 'var(--text-secondary)',
                minHeight: '44px',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {tool.description || 'NO SPECIFICATION ENTRIES REGISTERED FOR THIS EQUIPMENT.'}
            </p>

            <div
              style={{
                display: 'flex',
                gap: '8px',
                marginTop: 'auto',
                paddingTop: '16px',
                borderTop: '1px solid var(--border-default)'
              }}
            >
              {tool.website && (
                <a
                  href={tool.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ flex: 1, textDecoration: 'none', height: '30px' }}
                >
                  <Globe size={12} /> WEBSITE
                </a>
              )}
              <button
                className="btn"
                style={{ padding: '6px', height: '30px' }}
                title="Details Details"
              >
                <Info size={14} />
              </button>
              <button
                className="btn"
                style={{ padding: '6px', height: '30px' }}
                title="Settings Config"
              >
                <Settings size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {tools.length === 0 && !isAdding && (
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '60px',
            border: '1px dashed var(--border-default)',
            background: 'var(--bg-panel)'
          }}
        >
          <ShieldCheck
            size={32}
            style={{ opacity: 0.3, color: 'var(--accent-green)', marginBottom: '16px' }}
          />
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
          >
            INVENTORY OF CYBER UTILITIES IS EMPTY. RECORD ENTRIES.
          </p>
        </div>
      )}
    </div>
  )
}

export default ToolsView
