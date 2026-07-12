import React, { useState, useEffect } from 'react'
import {
  Plus,
  Globe,
  Link as LinkIcon,
  FileText,
  ExternalLink,
  Bookmark,
  AlertTriangle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const ResourcesView: React.FC = () => {
  const [resources, setResources] = useState<any[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [newRes, setNewRes] = useState({
    title: '',
    url: '',
    type: 'link',
    description: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const data = await window.api.getResources()
      setResources(data)
    } catch (err) {
      console.error('Error loading resources:', err)
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newRes.title.trim() && newRes.url.trim()) {
      try {
        await window.api.addResource(newRes)
        setNewRes({ title: '', url: '', type: 'link', description: '' })
        setIsAdding(false)
        loadData()
      } catch (err) {
        console.error('Error adding resource:', err)
      }
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'article':
        return <FileText size={16} />
      case 'tool':
        return <Globe size={16} />
      default:
        return <LinkIcon size={16} />
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
          <h1 style={{ fontSize: '20px', marginBottom: '4px' }}>INTEL_ASSETS</h1>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.8px'
            }}
          >
            EXTERNAL METHODOLOGY SPECIFICATIONS, HOST GUIDES, AND ACTIVE WEB RECON POINTERS.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
          <Plus size={14} /> CATALOG_ASSET
        </button>
      </div>

      {/* Addition Panel Form */}
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
                <LinkIcon size={14} color="var(--accent-cyan)" />
                <h2>INDEX_NEW_DOCUMENTATION_REPLAY</h2>
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
                    ASSET TITLE (LABEL)
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    style={{ width: '100%' }}
                    value={newRes.title}
                    onChange={(e) => setNewRes({ ...newRes, title: e.target.value })}
                    placeholder="e.g. PORT SWIGGER WEB ACADEMY"
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
                    TARGET URL (LINK)
                  </label>
                  <input
                    type="url"
                    className="input-field"
                    style={{ width: '100%' }}
                    value={newRes.url}
                    onChange={(e) => setNewRes({ ...newRes, url: e.target.value })}
                    placeholder="https://..."
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
                    STRUCTURE TYPE
                  </label>
                  <select
                    className="input-field"
                    style={{ width: '100%' }}
                    value={newRes.type}
                    onChange={(e) => setNewRes({ ...newRes, type: e.target.value })}
                  >
                    <option value="link">REFERENCE SITE</option>
                    <option value="article">METHODOLOGY WALKTHROUGH</option>
                    <option value="tool">ON-LINE UTILITY</option>
                  </select>
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
                    INDEX_RESOURCE
                  </button>
                  <button type="button" className="btn" onClick={() => setIsAdding(false)}>
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
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px'
        }}
      >
        {resources.map((res) => (
          <div
            key={res.id}
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
                  background: 'var(--bg-surface)',
                  color: 'var(--accent-green)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {getIcon(res.type)}
              </div>
              <button className="btn-icon" title="Save intel marker">
                <Bookmark size={14} color="var(--text-muted)" />
              </button>
            </div>

            <div style={{ flex: 1 }}>
              <h3 style={{ marginBottom: '6px', fontSize: '13px', letterSpacing: '1px' }}>
                {res.title.toUpperCase()}
              </h3>

              <div
                style={{
                  fontSize: '9px',
                  color: 'var(--text-muted)',
                  fontFamily: 'JetBrains Mono, monospace',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginBottom: '10px'
                }}
              >
                {res.url}
              </div>

              <span className="badge-outline green">{res.type.toUpperCase()}</span>
            </div>

            <div
              style={{
                marginTop: 'auto',
                paddingTop: '16px',
                borderTop: '1px solid var(--border-default)'
              }}
            >
              <a
                href={res.url}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  gap: '8px',
                  height: '30px',
                  textDecoration: 'none'
                }}
              >
                REQUEST_LINK_LOAD <ExternalLink size={12} />
              </a>
            </div>
          </div>
        ))}
      </div>

      {resources.length === 0 && !isAdding && (
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '60px',
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
            NO REFERENCE RESOURCES INDEXED. SYSTEM IDLE.
          </p>
        </div>
      )}
    </div>
  )
}

export default ResourcesView
