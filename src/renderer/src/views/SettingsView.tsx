import React, { useState } from 'react'
import { Database, Download, Upload, HardDrive, Check, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Notification {
  type: 'success' | 'error'
  message: string
}

const SettingsView: React.FC = () => {
  const [notification, setNotification] = useState<Notification | null>(null)
  const [loading, setLoading] = useState<string | null>(null)

  const notify = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 4000)
  }

  const handleExport = async () => {
    setLoading('export')
    try {
      const result = await window.api.exportData()
      if (result.success) {
        notify('success', `Exported to ${result.filePath}`)
      } else {
        notify('error', 'Export cancelled.')
      }
    } catch (err) {
      notify('error', String(err))
    } finally {
      setLoading(null)
    }
  }

  const handleImport = async () => {
    setLoading('import')
    try {
      const result = await window.api.importData()
      if (result.success) {
        notify('success', 'Data imported successfully (duplicates skipped).')
      } else if (result.error) {
        notify('error', `Import failed: ${result.error}`)
      } else {
        notify('error', 'Import cancelled.')
      }
    } catch (err) {
      notify('error', String(err))
    } finally {
      setLoading(null)
    }
  }

  const handleBackup = async () => {
    setLoading('backup')
    try {
      const result = await window.api.backupDb()
      if (result.success) {
        notify('success', `Backup saved to ${result.filePath}`)
      } else {
        notify('error', 'Backup cancelled.')
      }
    } catch (err) {
      notify('error', String(err))
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title */}
      <div style={{ borderBottom: '1px solid var(--border-default)', paddingBottom: '16px' }}>
        <h1 style={{ fontSize: '20px', marginBottom: '4px' }}>Settings</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '11px', letterSpacing: '0.8px' }}>
          Export, import, and backup your data.
        </p>
      </div>

      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.12 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              background: notification.type === 'success' ? 'rgba(0,232,135,0.08)' : 'rgba(255,59,92,0.08)',
              border: `1px solid ${notification.type === 'success' ? 'rgba(0,232,135,0.4)' : 'rgba(255,59,92,0.4)'}`,
              fontFamily: 'JetBrains Mono',
              fontSize: '11px',
              color: notification.type === 'success' ? 'var(--accent-green)' : 'var(--accent-red)'
            }}
          >
            {notification.type === 'success' ? <Check size={13} /> : <X size={13} />}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Data Management */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {/* Export */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', border: '1px solid var(--border-default)', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)' }}>
              <Download size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: '12px', marginBottom: '2px' }}>Export Data</h3>
              <p style={{ fontSize: '9px', color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>
                Save all data to a JSON file
              </p>
            </div>
          </div>
          <p style={{ fontSize: '10px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Exports all categories, tools, commands, workflows, resources, and blog posts to a JSON file you can keep as a backup or share.
          </p>
          <button
            className="btn btn-primary"
            style={{ width: '100%', height: '36px' }}
            onClick={handleExport}
            disabled={loading === 'export'}
          >
            <Download size={13} /> {loading === 'export' ? 'Exporting...' : 'Export to JSON'}
          </button>
        </div>

        {/* Import */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', border: '1px solid var(--border-default)', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-green)' }}>
              <Upload size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: '12px', marginBottom: '2px' }}>Import Data</h3>
              <p style={{ fontSize: '9px', color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>
                Merge from a JSON export file
              </p>
            </div>
          </div>
          <p style={{ fontSize: '10px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Imports data from a previous export. Merge mode: skips exact duplicates, never deletes existing entries. Safe to run multiple times.
          </p>
          <button
            className="btn"
            style={{ width: '100%', height: '36px', borderColor: 'var(--accent-green)', color: 'var(--accent-green)' }}
            onClick={handleImport}
            disabled={loading === 'import'}
          >
            <Upload size={13} /> {loading === 'import' ? 'Importing...' : 'Import from JSON'}
          </button>
        </div>

        {/* Manual Backup */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', border: '1px solid var(--border-default)', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-amber)' }}>
              <HardDrive size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: '12px', marginBottom: '2px' }}>Backup Database</h3>
              <p style={{ fontSize: '9px', color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>
                Save a copy of the raw SQLite file
              </p>
            </div>
          </div>
          <p style={{ fontSize: '10px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Copies the raw <code style={{ fontFamily: 'JetBrains Mono', color: 'var(--accent-cyan)' }}>commandbase.db</code> file to a location of your choice.
            Auto-backup (last 5) runs on every app start.
          </p>
          <button
            className="btn"
            style={{ width: '100%', height: '36px', borderColor: 'var(--accent-amber)', color: 'var(--accent-amber)' }}
            onClick={handleBackup}
            disabled={loading === 'backup'}
          >
            <Database size={13} /> {loading === 'backup' ? 'Saving...' : 'Save DB Backup'}
          </button>
        </div>
      </div>

      {/* Info */}
      <div style={{ marginTop: '10px', padding: '14px 16px', background: 'var(--bg-panel)', border: '1px solid var(--border-default)', fontSize: '10px', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
        <strong style={{ color: 'var(--text-primary)', fontFamily: 'Orbitron' }}>Auto-Backup</strong><br />
        On every app start, CommandBase automatically copies your database to{' '}
        <code style={{ fontFamily: 'JetBrains Mono', color: 'var(--accent-cyan)' }}>commandbase.db.bak-&lt;timestamp&gt;</code>{' '}
        in the same folder, keeping only the last 5 backups.
        The database lives at: <code style={{ fontFamily: 'JetBrains Mono', color: 'var(--accent-cyan)' }}>~/.config/commandbase/</code>
      </div>
    </div>
  )
}

export default SettingsView
