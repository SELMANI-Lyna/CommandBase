import React from 'react'
import { User, Monitor, Shield, Database, Lock, Globe } from 'lucide-react'

const SettingsView: React.FC = () => {
  const sections = [
    {
      id: 'profile',
      title: 'OPERATOR_PROFILE',
      icon: User,
      items: [
        { label: 'DISPLAY_NAME', value: 'ANGEL', color: 'var(--text-primary)' },
        { label: 'ROLE_IDENTIFICATION', value: 'SYSTEM_ARCHITECT', color: 'var(--accent-cyan)' },
        { label: 'ENCRYPTION_STANDARD', value: 'AES_256_GCM', color: 'var(--accent-green)' }
      ]
    },
    {
      id: 'visual',
      title: 'INTERFACE_MONITOR_SET',
      icon: Monitor,
      items: [
        { label: 'THEME_MATRIX', value: 'TERMINAL_HUD_CRT', color: 'var(--accent-cyan)' },
        {
          label: 'TYPOGRAPHY_STACK',
          value: 'JETBRAINS_MONO_ORBITRON',
          color: 'var(--text-primary)'
        },
        { label: 'ACCENT_COLOR_SET', value: 'HAZARD_ACCENT_SYSTEM', color: 'var(--accent-cyan)' }
      ]
    },
    {
      id: 'security',
      title: 'KERNEL_DEFENSE_PROTOCOLS',
      icon: Shield,
      danger: true,
      items: [
        { label: 'OPERATIONAL_STEALTH', value: 'LEVEL_04_MAX', color: 'var(--accent-amber)' },
        { label: 'CORRELATION_LOGGER', value: 'AGGRESSIVE_STRICT', color: 'var(--accent-red)' }
      ]
    }
  ]

  return (
    <div
      className="animate-fade-in"
      style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
    >
      {/* Title / Header */}
      <div style={{ borderBottom: '1px solid var(--border-default)', paddingBottom: '16px' }}>
        <h1 style={{ fontSize: '20px', marginBottom: '4px' }}>SYSTEM_CONFIGURATION</h1>
        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.8px'
          }}
        >
          ADJUST SESSION TERMINAL DEPLOYMENTS, ENCRYPTION CONSTANTS, AND AUDIT INTERNAL ENGINES.
        </p>
      </div>

      {/* Grid configs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px'
        }}
      >
        {sections.map((section) => {
          const Icon = section.icon
          return (
            <div
              key={section.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                background: section.danger
                  ? 'linear-gradient(180deg, var(--bg-panel) 0%, rgba(255, 59, 92, 0.01) 100%)'
                  : 'var(--bg-panel)',
                border: '1px solid var(--border-default)',
                borderTop: section.danger
                  ? '2px solid var(--accent-red)'
                  : '1px solid var(--border-default)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    border: '1px solid var(--border-default)',
                    background: 'var(--bg-surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: section.danger ? 'var(--accent-red)' : 'var(--accent-cyan)'
                  }}
                >
                  <Icon size={14} />
                </div>
                <h3 style={{ fontSize: '12px', letterSpacing: '1px', fontWeight: 800 }}>
                  {section.title}
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {section.items.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0',
                      borderBottom:
                        idx === section.items.length - 1
                          ? 'none'
                          : '1px solid rgba(20, 32, 48, 0.5)',
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '11px'
                    }}
                  >
                    <span style={{ color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>
                      {item.label}
                    </span>
                    <span style={{ fontWeight: 'bold', color: item.color }}>{item.value}</span>
                  </div>
                ))}
              </div>

              <button className="btn" style={{ width: '100%', height: '30px' }}>
                MODIFY_PARAMS
              </button>
            </div>
          )
        })}

        {/* Database Health Card */}
        <div
          className="card"
          style={{
            background: 'var(--bg-panel)',
            border: '1px solid var(--border-default)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            padding: '30px'
          }}
        >
          <Database size={28} color="var(--accent-green)" style={{ marginBottom: '12px' }} />
          <h3 style={{ marginBottom: '6px', fontSize: '12px', letterSpacing: '1px' }}>
            LOCAL_ENGINE_HEALTH
          </h3>
          <p
            style={{
              fontSize: '10px',
              color: 'var(--text-secondary)',
              marginBottom: '16px',
              maxWidth: '280px',
              lineHeight: '1.4'
            }}
          >
            LOCAL SQLite INSTANCE IS COMPRESSED AND INDEXING EFFICIENTLY. DIRECT DISK PIPES ACTIVE.
          </p>
          <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
            <button
              className="btn btn-primary"
              style={{ flex: 1, height: '30px' }}
              onClick={() => alert('Local backup serialized.')}
            >
              BACKUP_DB
            </button>
            <button
              className="btn"
              style={{ flex: 1, height: '30px' }}
              onClick={() => alert('Local restore initialized.')}
            >
              RESTORE_DB
            </button>
          </div>
        </div>
      </div>

      {/* Support/Links Footer */}
      <div
        style={{
          marginTop: '30px',
          padding: '16px 20px',
          background: 'var(--bg-panel)',
          border: '1px solid var(--border-default)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', gap: '20px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--text-secondary)',
              fontSize: '10px'
            }}
          >
            <Lock size={12} color="var(--accent-green)" /> STEALTH_MODE_ENGAGED
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--text-secondary)',
              fontSize: '10px'
            }}
          >
            <Globe size={12} color="var(--accent-cyan)" /> NETWORK: LOOPBACK_ONLY
          </div>
        </div>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
          COMMANDBASE_PRO // RUNNING LOCAL LAPTOP DEPLOYMENT // v2.0.0-CYBER
        </div>
      </div>
    </div>
  )
}

export default SettingsView
