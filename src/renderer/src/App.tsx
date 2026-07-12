import React, { useState, useEffect } from 'react'
import Sidebar, { ViewType } from './components/Sidebar'
import GlobalSearch from './components/GlobalSearch'
import DashboardView from './views/DashboardView'
import CategoriesView from './views/CategoriesView'
import ToolsView from './views/ToolsView'
import CommandsView from './views/CommandsView'
import BlogView from './views/BlogView'
import ProgramsView from './views/ProgramsView'
import SettingsView from './views/SettingsView'

const HUDClock: React.FC = () => {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const pad = (n: number) => n.toString().padStart(2, '0')

  return (
    <div
      style={{
        fontFamily: 'Orbitron, sans-serif',
        fontSize: '11px',
        color: 'var(--accent-cyan)',
        letterSpacing: '1px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'rgba(0, 212, 255, 0.04)',
        padding: '4px 10px',
        border: '1px solid rgba(0, 212, 255, 0.15)'
      }}
    >
      <span>TIMESTAGING</span>
      <span style={{ color: 'var(--text-secondary)' }}>/</span>
      <span>
        {time.getFullYear()}-{pad(time.getMonth() + 1)}-{pad(time.getDate())}
      </span>
      <span>
        {pad(time.getHours())}:{pad(time.getMinutes())}:{pad(time.getSeconds())}
      </span>
    </div>
  )
}

function App(): React.JSX.Element {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard')

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />
      case 'categories':
        return <CategoriesView />
      case 'commands':
        return <CommandsView />
      case 'tools':
        return <ToolsView />
      case 'programs':
        return <ProgramsView />
      case 'blog':
        return <BlogView />
      case 'settings':
        return <SettingsView />
      default:
        return <DashboardView />
    }
  }

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view)
  }

  return (
    <div className="app-container">
      <aside className="sidebar-panel">
        <Sidebar currentView={currentView} onViewChange={handleViewChange} />
      </aside>

      <main className="main-content">
        <header className="header-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <h2 style={{ fontSize: '14px', letterSpacing: '1.5px', color: 'var(--text-primary)' }}>
              {currentView === 'dashboard' ? 'OPERATIONS' : currentView.toUpperCase()}
            </h2>
            <span style={{ color: 'var(--border-default)', fontSize: '14px' }}>|</span>
            <GlobalSearch onNavigate={(view) => setCurrentView(view as ViewType)} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <HUDClock />

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '9px',
                fontWeight: 800,
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-default)',
                padding: '5px 10px',
                background: 'var(--bg-panel)'
              }}
            >
              NODE_ST: <span className="status-dot green"></span>{' '}
              <span style={{ color: 'var(--accent-green)' }}>ONLINE</span>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                className="btn"
                style={{ height: '30px', padding: '0 12px' }}
                onClick={() => alert('Operational Protocol Instruction manual loaded.')}
              >
                HELP
              </button>
            </div>
          </div>
        </header>

        <div className="scrollable-area animate-fade-in">{renderView()}</div>
      </main>

      <aside className="right-panel">{/* Right panel content placeholder */}</aside>
    </div>
  )
}

export default App
