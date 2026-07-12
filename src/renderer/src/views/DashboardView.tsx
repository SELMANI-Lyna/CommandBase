import React, { useState, useEffect } from 'react'
import { Terminal, Wrench, Layers, BookOpen, LayoutGrid, Activity } from 'lucide-react'

const DashboardView: React.FC = () => {
  const [stats, setStats] = useState({
    commands: 0,
    tools: 0,
    programs: 0,
    resources: 0
  })
  const [categories, setCategories] = useState<any[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [c, t, p, r, cats] = await Promise.all([
        window.api.getCommands(),
        window.api.getTools(),
        window.api.getPrograms(),
        window.api.getResources(),
        window.api.getCategories()
      ])
      setStats({
        commands: c.length,
        tools: t.length,
        programs: p.length,
        resources: r.length
      })
      setCategories(cats.slice(0, 6)) // Show top 6
    } catch (err) {
      console.error('Error loading dashboard stats:', err)
    }
  }

  const statCards = [
    {
      label: 'COMMAND BUFFER',
      value: stats.commands,
      icon: Terminal,
      color: 'var(--accent-cyan)',
      hex: '0x01'
    },
    {
      label: 'EQ_REPOSITORY',
      value: stats.tools,
      icon: Wrench,
      color: 'var(--accent-magenta)',
      hex: '0x02'
    },
    {
      label: 'SCRIPT_TRACKS',
      value: stats.programs,
      icon: Layers,
      color: 'var(--accent-green)',
      hex: '0x03'
    },
    {
      label: 'INTEL_RESOURCES',
      value: stats.resources,
      icon: BookOpen,
      color: 'var(--accent-amber)',
      hex: '0x04'
    }
  ]

  return (
    <div
      className="animate-fade-in"
      style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}
    >
      {/* Operator Welcome Section */}
      <header style={{ borderBottom: '1px solid var(--border-default)', paddingBottom: '16px' }}>
        <h1 style={{ marginBottom: '6px' }}>OPERATOR_WORKSPACE: ANGEL</h1>
        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '11px',
            letterSpacing: '1px',
            textTransform: 'uppercase'
          }}
        >
          SECURE SHELL INITIALIZED // ACTIVE SESSION // SYSLOG ATTACHED
        </p>
      </header>

      {/* Stat Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px'
        }}
      >
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="card"
            style={{
              borderTop: `2px solid ${stat.color}`,
              background: 'var(--bg-surface)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: 'bold',
                  color: 'var(--text-secondary)',
                  letterSpacing: '1.5px'
                }}
              >
                {stat.label}
              </span>
              <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{stat.hex}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
              <span
                style={{
                  fontSize: '28px',
                  fontFamily: 'Orbitron',
                  fontWeight: 'bold',
                  color: 'var(--text-primary)'
                }}
              >
                {stat.value.toString().padStart(2, '0')}
              </span>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>ENTITIES</span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '9px',
                color: stat.color,
                borderTop: '1px solid var(--border-default)',
                paddingTop: '8px',
                marginTop: '4px'
              }}
            >
              <stat.icon size={12} />
              <span>INDEX_INTEGRATED: OK</span>
            </div>
          </div>
        ))}
      </div>

      {/* Layout Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '24px' }}>
        {/* Categories Table / Panel */}
        <div className="hud-panel">
          <div className="hud-panel-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <LayoutGrid size={14} color="var(--accent-cyan)" />
              <h2>INTEL BRANCHES / DIRECTORIES</h2>
            </div>
            <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>0xCAT_DB</div>
          </div>
          <div className="hud-panel-body" style={{ background: 'var(--bg-panel)' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px'
              }}
            >
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="card"
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-default)',
                    padding: '12px'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '8px'
                    }}
                  >
                    <div
                      style={{ width: '4px', height: '4px', background: 'var(--accent-cyan)' }}
                    ></div>
                    <h3
                      style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}
                    >
                      {cat.name}
                    </h3>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span
                      style={{
                        fontSize: '9px',
                        color: 'var(--text-muted)',
                        fontFamily: 'JetBrains Mono'
                      }}
                    >
                      ADDR: 0x{cat.id.toString(16).toUpperCase().padStart(2, '0')}
                    </span>
                    <span
                      style={{
                        fontSize: '9px',
                        color: 'var(--accent-green)',
                        letterSpacing: '1px'
                      }}
                    >
                      [VERIFIED]
                    </span>
                  </div>
                </div>
              ))}
              {categories.length === 0 && (
                <div
                  style={{
                    gridColumn: 'span 2',
                    textAlign: 'center',
                    padding: '24px',
                    color: 'var(--text-muted)',
                    fontSize: '12px'
                  }}
                >
                  NO INTEL BRANCHE DATA FOUND. INITIALIZE CLASSIFIERS.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* System syslog Activity Logging */}
        <div className="hud-panel">
          <div className="hud-panel-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={14} color="var(--accent-amber)" />
              <h2>OPERATIONS SYSLOG</h2>
            </div>
            <span className="status-dot amber"></span>
          </div>
          <div
            className="hud-panel-body"
            style={{
              background: 'var(--bg-void)',
              padding: '0',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {[
              {
                action: 'CMD_ERR_CHECK',
                desc: 'nmap -sV 10.0.1.5',
                time: '14:24:08',
                mod: 'RECON',
                col: 'var(--accent-cyan)'
              },
              {
                action: 'TOOL_PARAM_UP',
                desc: 'Metasploit kernel settings',
                time: '13:01:22',
                mod: 'EXPLOIT',
                col: 'var(--accent-red)'
              },
              {
                action: 'INTEL_URL_INDEX',
                desc: 'OWASP checklist linked',
                time: '11:45:00',
                mod: 'WEB_SEC',
                col: 'var(--accent-amber)'
              },
              {
                action: 'CAT_INIT_CALL',
                desc: 'Active Directory domain branch',
                time: '09:12:15',
                mod: 'POST_EXP',
                col: 'var(--accent-magenta)'
              }
            ].map((act, i) => (
              <div
                key={i}
                style={{
                  padding: '12px 14px',
                  borderBottom: i === 3 ? 'none' : '1px solid var(--border-default)',
                  fontFamily: 'JetBrains Mono, monospace',
                  lineHeight: '1.4'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '4px'
                  }}
                >
                  <span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>[{act.time}]</span>
                  <span
                    style={{
                      fontSize: '8px',
                      color: act.col,
                      border: `1px solid ${act.col}30`,
                      background: `${act.col}08`,
                      padding: '1px 5px',
                      fontWeight: 'bold',
                      letterSpacing: '1px'
                    }}
                  >
                    {act.mod}
                  </span>
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-primary)', fontWeight: 'bold' }}>
                  {act.action}
                </div>
                <div style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>
                  &gt; {act.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardView
