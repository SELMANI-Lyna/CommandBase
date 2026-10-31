import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Search, Terminal, Wrench, LayoutGrid, Layers, BookOpen, X, Command } from 'lucide-react'

interface GlobalSearchProps {
  onNavigate?: (view: string) => void
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  command: <Terminal size={11} />,
  tool: <Wrench size={11} />,
  category: <LayoutGrid size={11} />,
  program: <Layers size={11} />,
  blog: <BookOpen size={11} />
}

const TYPE_COLOR: Record<string, string> = {
  command: 'var(--accent-cyan)',
  tool: 'var(--accent-magenta)',
  category: 'var(--accent-amber)',
  program: 'var(--accent-green)',
  blog: 'var(--accent-red)'
}

const TYPE_VIEW: Record<string, string> = {
  command: 'commands',
  tool: 'tools',
  category: 'categories',
  program: 'programs',
  blog: 'blog'
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ onNavigate }) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const doSearch = useCallback(async (val: string) => {
    if (val.length < 2) {
      setResults([])
      setIsOpen(false)
      return
    }
    try {
      const res = await window.api.globalSearch(val)
      setResults(res)
      setIsOpen(true)
    } catch {
      setResults([])
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(val), 280)
  }

  const handleClear = () => {
    setQuery('')
    setResults([])
    setIsOpen(false)
  }

  const handleResultClick = (result: any) => {
    const view = TYPE_VIEW[result.type] ?? 'dashboard'
    onNavigate?.(view)
    setIsOpen(false)
    setQuery('')
  }

  // Group results by type
  const grouped: Record<string, any[]> = {}
  results.forEach((r) => {
    if (!grouped[r.type]) grouped[r.type] = []
    grouped[r.type].push(r)
  })

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', width: '380px', fontFamily: 'JetBrains Mono, monospace' }}
    >
      {/* Input */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '6px 12px',
          background: 'var(--bg-void)',
          border: `1px solid ${isFocused ? 'var(--accent-cyan)' : 'var(--border-default)'}`,
          height: '34px',
          transition: 'border-color 120ms linear'
        }}
      >
        <Search size={13} color="var(--text-secondary)" />
        <input
          type="text"
          style={{
            border: 'none',
            background: 'transparent',
            padding: 0,
            width: '100%',
            fontSize: '11px',
            color: 'var(--text-primary)',
            outline: 'none',
            fontFamily: 'JetBrains Mono, monospace'
          }}
          data-global-search
          placeholder="Search (Ctrl+K) — type 2+ chars..."
          value={query}
          onChange={handleChange}
          onFocus={() => {
            setIsFocused(true)
            if (results.length) setIsOpen(true)
          }}
          onBlur={() => setIsFocused(false)}
        />
        {!query && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              background: 'var(--bg-surface)',
              padding: '1px 5px',
              border: '1px solid var(--border-default)',
              fontSize: '8px',
              color: 'var(--text-muted)',
              flexShrink: 0
            }}
          >
            <Command size={8} /> K
          </div>
        )}
        {query && (
          <X
            size={12}
            style={{ cursor: 'pointer', color: 'var(--text-secondary)', flexShrink: 0 }}
            onClick={handleClear}
          />
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 2000,
            maxHeight: '400px',
            overflowY: 'auto',
            border: '1px solid var(--accent-cyan)',
            background: 'var(--bg-surface)',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.7)'
          }}
        >
          {results.length === 0 ? (
            <div
              style={{
                padding: '20px',
                textAlign: 'center',
                fontSize: '10px',
                color: 'var(--text-muted)',
                letterSpacing: '1px'
              }}
            >
              NO MATCHES FOUND FOR "{query.toUpperCase()}"
            </div>
          ) : (
            Object.entries(grouped).map(([type, items]) => (
              <div key={type}>
                {/* Group header */}
                <div
                  style={{
                    padding: '5px 12px',
                    fontSize: '8px',
                    fontWeight: 800,
                    color: TYPE_COLOR[type] ?? 'var(--text-muted)',
                    letterSpacing: '1.5px',
                    borderBottom: '1px solid var(--border-default)',
                    background: 'var(--bg-panel)',
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span style={{ color: TYPE_COLOR[type] }}>{TYPE_ICON[type]}</span>
                  {type.toUpperCase()} ({items.length})
                </div>
                {items.slice(0, 5).map((result, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '9px 12px',
                      cursor: 'pointer',
                      borderBottom:
                        i === items.length - 1 ? 'none' : '1px solid var(--border-default)',
                      transition: 'background 80ms linear'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    onClick={() => handleResultClick(result)}
                  >
                    <span style={{ color: TYPE_COLOR[type], opacity: 0.7, flexShrink: 0 }}>
                      {TYPE_ICON[type]}
                    </span>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div
                        style={{
                          fontSize: '11px',
                          fontWeight: 'bold',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          color: 'var(--text-primary)'
                        }}
                      >
                        {result.name?.toUpperCase()}
                      </div>
                      {result.description && (
                        <div
                          style={{
                            fontSize: '9px',
                            color: 'var(--text-muted)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {result.description}
                        </div>
                      )}
                    </div>
                    <span style={{ fontSize: '8px', color: 'var(--text-muted)', flexShrink: 0 }}>
                      → {TYPE_VIEW[type].toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default GlobalSearch
