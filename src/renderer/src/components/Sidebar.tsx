import React, { useState, useEffect } from 'react'
import {
  Terminal,
  Wrench,
  Layers,
  BookOpen,
  LayoutGrid,
  Settings,
  Shield,
  Home,
  User
} from 'lucide-react'

export type ViewType =
  | 'dashboard'
  | 'categories'
  | 'tools'
  | 'programs'
  | 'blog'
  | 'commands'
  | 'settings'

interface SidebarProps {
  currentView: ViewType
  onViewChange: (view: ViewType) => void
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const [counts, setCounts] = useState({
    categories: 0,
    tools: 0,
    commands: 0,
    programs: 0,
    blog: 0
  })

  const [health, setHealth] = useState({
    cpu: 12,
    ram: 54,
    net: 2.4,
    disk: 0.8
  })

  useEffect(() => {
    const loadCounts = async () => {
      try {
        const [cats, tls, cmds, progs, posts] = await Promise.all([
          window.api.getCategories(),
          window.api.getTools(),
          window.api.getCommands(),
          window.api.getPrograms(),
          window.api.getBlogPosts()
        ])
        setCounts({
          categories: cats.length,
          tools: tls.length,
          commands: cmds.length,
          programs: progs.length,
          blog: posts.length
        })
      } catch (err) {
        console.error('Error loading sidebar counts:', err)
      }
    }

    loadCounts()
    // Reload counts periodically or when current view changes
    const interval = setInterval(loadCounts, 8000)
    return () => clearInterval(interval)
  }, [currentView])

  useEffect(() => {
    const interval = setInterval(() => {
      setHealth({
        cpu: Math.floor(Math.random() * 18) + 6, // 6%-24%
        ram: 52 + Math.floor(Math.random() * 3), // 52%-55%
        net: Number((Math.random() * 5 + 1.2).toFixed(1)), // 1.2-6.2 KB/S
        disk: Math.random() > 0.82 ? Math.floor(Math.random() * 8) + 1 : 0.8
      })
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const primaryItems = [
    { id: 'dashboard', icon: Home, label: 'OPERATIONS', badge: 'SYS_ON' },
    {
      id: 'categories',
      icon: LayoutGrid,
      label: 'CATEGORIES',
      badge: `0x${counts.categories.toString(16).toUpperCase().padStart(2, '0')}`
    },
    {
      id: 'tools',
      icon: Wrench,
      label: 'TOOLS',
      badge: `0x${counts.tools.toString(16).toUpperCase().padStart(2, '0')}`
    },
    {
      id: 'commands',
      icon: Terminal,
      label: 'COMMANDS',
      badge: `0x${counts.commands.toString(16).toUpperCase().padStart(2, '0')}`
    },
    {
      id: 'programs',
      icon: Layers,
      label: 'WORKFLOWS',
      badge: `0x${counts.programs.toString(16).toUpperCase().padStart(2, '0')}`
    },
    {
      id: 'blog',
      icon: BookOpen,
      label: 'BLOG',
      badge: `0x${counts.blog.toString(16).toUpperCase().padStart(2, '0')}`
    }
  ]

  const systemItems = [{ id: 'settings', icon: Settings, label: 'SETTINGS', badge: 'CONF' }]

  const formatProgressFilled = (val: number, max: number = 100) => {
    const filledSegments = Math.round((val / max) * 10)
    return '█'.repeat(filledSegments) + '░'.repeat(10 - filledSegments)
  }

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-base)',
        fontFamily: 'JetBrains Mono, monospace'
      }}
    >
      {/* Terminal Console Title block */}
      <div
        style={{
          padding: '20px 16px',
          borderBottom: '1px solid var(--border-default)',
          background: 'var(--bg-void)',
          color: 'var(--accent-cyan)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Shield size={16} />
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '2px',
              fontFamily: 'Orbitron'
            }}
          >
            COMMANDBASE v2.0
          </span>
        </div>
        <div style={{ fontSize: '9px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
          HOST: <span style={{ color: 'var(--text-primary)' }}>LOCAL_NODE_0X1</span>
          <br />
          SEC_ZONE: <span style={{ color: 'var(--accent-green)' }}>SECURE</span>
        </div>
      </div>

      {/* Nav Panels */}
      <div
        style={{
          flex: 1,
          padding: '16px 8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          overflowY: 'auto'
        }}
      >
        {/* PRIMARY SECTION */}
        <div>
          <div
            style={{
              padding: '0 8px 8px 8px',
              fontSize: '9px',
              fontWeight: 800,
              color: 'var(--text-muted)',
              letterSpacing: '2px',
              borderBottom: '1px solid rgba(20, 32, 48, 0.5)',
              marginBottom: '8px'
            }}
          >
            // PRIMARY_MODULES
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {primaryItems.map((item) => {
              const Icon = item.icon
              const isActive = currentView === item.id

              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id as ViewType)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    border: '1px solid transparent',
                    background: isActive ? 'var(--bg-surface)' : 'transparent',
                    borderColor: isActive ? 'var(--border-default)' : 'transparent',
                    color: isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'var(--bg-hover)'
                      e.currentTarget.style.color = 'var(--text-primary)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = 'var(--text-secondary)'
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icon size={14} style={{ opacity: isActive ? 1 : 0.6 }} />
                    <span
                      style={{
                        fontSize: '10px',
                        letterSpacing: '1.5px',
                        fontWeight: isActive ? 700 : 500
                      }}
                    >
                      {item.label}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '8px',
                      fontFamily: 'JetBrains Mono',
                      color: isActive ? 'var(--accent-cyan)' : 'var(--text-muted)',
                      fontWeight: 'bold'
                    }}
                  >
                    [{item.badge}]
                  </span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* SYSTEM SECTION */}
        <div>
          <div
            style={{
              padding: '0 8px 8px 8px',
              fontSize: '9px',
              fontWeight: 800,
              color: 'var(--text-muted)',
              letterSpacing: '2px',
              borderBottom: '1px solid rgba(20, 32, 48, 0.5)',
              marginBottom: '8px'
            }}
          >
            // SYSTEM_METRICS
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {systemItems.map((item) => {
              const Icon = item.icon
              const isActive = currentView === item.id

              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id as ViewType)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    border: '1px solid transparent',
                    background: isActive ? 'var(--bg-surface)' : 'transparent',
                    borderColor: isActive ? 'var(--border-default)' : 'transparent',
                    color: isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'var(--bg-hover)'
                      e.currentTarget.style.color = 'var(--text-primary)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = 'var(--text-secondary)'
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icon size={14} style={{ opacity: isActive ? 1 : 0.6 }} />
                    <span
                      style={{
                        fontSize: '10px',
                        letterSpacing: '1.5px',
                        fontWeight: isActive ? 700 : 500
                      }}
                    >
                      {item.label}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '8px',
                      fontFamily: 'JetBrains Mono',
                      color: isActive ? 'var(--accent-cyan)' : 'var(--text-muted)'
                    }}
                  >
                    [{item.badge}]
                  </span>
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Operator card & Live System Health */}
      <div style={{ borderTop: '1px solid var(--border-default)', background: 'var(--bg-void)' }}>
        {/* Operator Profile */}
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--border-default)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <User size={14} color="var(--accent-cyan)" />
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div
              style={{
                fontSize: '10px',
                fontWeight: 'bold',
                color: 'var(--text-primary)',
                letterSpacing: '1px',
                textTransform: 'uppercase'
              }}
            >
              OPERATOR: ANGEL
            </div>
            <div
              style={{ fontSize: '8px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}
            >
              GID: 0x03E7 (ADMIN)
            </div>
          </div>
        </div>

        {/* SYS HEALTH WIDGET */}
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '9px',
              fontWeight: 'bold',
              letterSpacing: '1.5px',
              color: 'var(--text-secondary)'
            }}
          >
            <span className="status-dot green" style={{ width: '5px', height: '5px' }}></span>
            SYS_HEALTH_MONITOR
          </div>

          {/* CPU Display */}
          <div style={{ fontSize: '9px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                color: 'var(--text-secondary)',
                marginBottom: '3px'
              }}
            >
              <span>CPU</span>
              <span style={{ color: 'var(--accent-cyan)', fontFamily: 'JetBrains Mono' }}>
                {health.cpu}%
              </span>
            </div>
            <div style={{ color: 'var(--border-default)', letterSpacing: '-0.5px' }}>
              <span style={{ color: 'var(--accent-cyan)' }}>
                {formatProgressFilled(health.cpu)}
              </span>
            </div>
          </div>

          {/* RAM Display */}
          <div style={{ fontSize: '9px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                color: 'var(--text-secondary)',
                marginBottom: '3px'
              }}
            >
              <span>RAM</span>
              <span style={{ color: 'var(--accent-cyan)' }}>{health.ram}%</span>
            </div>
            <div style={{ color: 'var(--border-default)', letterSpacing: '-0.5px' }}>
              <span style={{ color: 'var(--accent-cyan)' }}>
                {formatProgressFilled(health.ram)}
              </span>
            </div>
          </div>

          {/* NET Traffic Display */}
          <div style={{ fontSize: '9px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                color: 'var(--text-secondary)',
                marginBottom: '3px'
              }}
            >
              <span>NET</span>
              <span style={{ color: 'var(--accent-cyan)' }}>{health.net} KB/S</span>
            </div>
            <div style={{ color: 'var(--border-default)', letterSpacing: '-0.5px' }}>
              <span style={{ color: 'var(--accent-cyan)' }}>
                {formatProgressFilled(health.net, 8)}
              </span>
            </div>
          </div>

          {/* Disk Activty Display */}
          <div style={{ fontSize: '9px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                color: 'var(--text-secondary)',
                marginBottom: '3px'
              }}
            >
              <span>DSK</span>
              <span style={{ color: 'var(--accent-cyan)' }}>{health.disk}%</span>
            </div>
            <div style={{ color: 'var(--border-default)', letterSpacing: '-0.5px' }}>
              <span style={{ color: 'var(--accent-cyan)' }}>
                {formatProgressFilled(health.disk, 10)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
