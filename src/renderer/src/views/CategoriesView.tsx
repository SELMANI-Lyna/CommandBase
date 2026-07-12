import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, Folder, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const CategoriesView: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [newName, setNewName] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const data = await window.api.getCategories()
      setCategories(data)
    } catch (err) {
      console.error('Error loading categories:', err)
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newName.trim()) {
      try {
        await window.api.addCategory(newName, 'LayoutGrid')
        setNewName('')
        setIsAdding(false)
        loadData()
      } catch (err) {
        console.error('Error adding category:', err)
      }
    }
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
          <h1 style={{ fontSize: '20px', marginBottom: '4px' }}>INTELLIGENCE_DOMAINS</h1>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.8px'
            }}
          >
            LOGICAL ENTITY CLASSIFIERS FOR SYSTEM COMMANDS AND RECON METRICS.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
          <Plus size={14} /> NEW_DOMAIN
        </button>
      </div>

      {/* Addition Form */}
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
                <Plus size={14} color="var(--accent-cyan)" />
                <h2>INITIALIZE_NEW_DOMAIN_THREAD</h2>
              </div>
            </div>
            <div className="hud-panel-body">
              <form
                onSubmit={handleAdd}
                style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}
              >
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '8px',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    DOMAIN_IDENTIFIER (NAME)
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    style={{ width: '100%' }}
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. WIRELESS OPERATIONS"
                    autoFocus
                    required
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" className="btn btn-primary">
                    INITIALIZE
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

      {/* Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px'
        }}
      >
        {categories.map((cat) => (
          <div
            key={cat.id}
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
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  border: '1px solid var(--border-default)',
                  color: 'var(--accent-cyan)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--bg-surface)'
                }}
              >
                <Folder size={18} />
              </div>
              <span
                style={{
                  fontSize: '9px',
                  fontFamily: 'JetBrains Mono',
                  color: 'var(--text-muted)'
                }}
              >
                ADDR: 0x{cat.id.toString(16).toUpperCase().padStart(2, '0')}
              </span>
            </div>

            <div>
              <h3 style={{ fontSize: '14px', letterSpacing: '1px', marginBottom: '4px' }}>
                {cat.name.toUpperCase()}
              </h3>
              <div
                style={{
                  fontSize: '9px',
                  color: 'var(--text-secondary)',
                  fontFamily: 'JetBrains Mono'
                }}
              >
                SYS_ROUTING_KEY_VAL: #{cat.id.toString().padStart(4, '0')}
              </div>
            </div>

            <div
              style={{
                marginTop: '4px',
                paddingTop: '12px',
                borderTop: '1px solid var(--border-default)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span className="badge-outline green">SYSLOG: OK</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button className="btn-icon" title="Edit">
                  <Edit2 size={12} />
                </button>
                <button className="btn-icon" style={{ color: 'var(--accent-red)' }} title="Delete">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && !isAdding && (
        <div
          className="card"
          style={{
            padding: '60px',
            textAlign: 'center',
            border: '1px dashed var(--border-default)',
            background: 'var(--bg-panel)'
          }}
        >
          <AlertTriangle
            size={32}
            style={{ opacity: 0.3, color: 'var(--accent-amber)', marginBottom: '16px' }}
          />
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
          >
            NO OPERATIONAL DOMAINS DETECTED. INITIALIZE ADDR CHANNELS.
          </p>
        </div>
      )}
    </div>
  )
}

export default CategoriesView
