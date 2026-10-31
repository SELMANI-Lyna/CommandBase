import React, { useEffect } from 'react'
import { X, Keyboard } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface KeyboardShortcutsModalProps {
  isOpen: boolean
  onClose: () => void
}

const SHORTCUTS = [
  { key: 'Ctrl+K', desc: 'Open global search' },
  { key: 'Ctrl+N', desc: 'New command (from Commands view)' },
  { key: 'Ctrl+S', desc: 'Save (inside command editor)' },
  { key: 'Esc', desc: 'Close modal / cancel editor' },
  { key: 'Tab', desc: 'Insert 2 spaces in syntax editor' },
  { key: 'F1 / ?', desc: 'Open keyboard shortcuts' },
]

const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(2, 5, 8, 0.85)',
            zIndex: 9000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="hud-panel"
            style={{ width: '480px', maxWidth: '90vw' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="hud-panel-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Keyboard size={14} color="var(--accent-cyan)" />
                <h2>Keyboard Shortcuts</h2>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={14} />
              </button>
            </div>
            <div className="hud-panel-body" style={{ padding: '12px 16px' }}>
              {SHORTCUTS.map(({ key, desc }) => (
                <div
                  key={key}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: '1px solid var(--border-default)'
                  }}
                >
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{desc}</span>
                  <kbd
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '10px',
                      color: 'var(--accent-cyan)',
                      background: 'rgba(0,212,255,0.06)',
                      border: '1px solid rgba(0,212,255,0.3)',
                      padding: '2px 8px',
                      letterSpacing: '0.5px'
                    }}
                  >
                    {key}
                  </kbd>
                </div>
              ))}
              <p
                style={{
                  marginTop: '12px',
                  fontSize: '9px',
                  color: 'var(--text-muted)',
                  textAlign: 'center',
                  letterSpacing: '1px'
                }}
              >
                Press ESC or click outside to close
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default KeyboardShortcutsModal
