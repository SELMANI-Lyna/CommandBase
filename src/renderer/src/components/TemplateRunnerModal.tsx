import React, { useState, useEffect } from 'react'
import { X, Copy, Check, Play } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface TemplateRunnerModalProps {
  isOpen: boolean
  onClose: () => void
  command: { id: number; syntax: string; description?: string } | null
  onCopy?: (id: number) => void
}

interface Variable {
  name: string
  defaultValue: string
}

// Persistent last-used values per variable name (in-memory for session)
const lastUsedValues: Record<string, string> = {}

function extractVariables(syntax: string): Variable[] {
  const regex = /\{\{([^}:]+)(?::([^}]*))?\}\}/g
  const seen = new Set<string>()
  const vars: Variable[] = []
  let m: RegExpExecArray | null
  while ((m = regex.exec(syntax)) !== null) {
    if (!seen.has(m[1])) {
      seen.add(m[1])
      vars.push({ name: m[1], defaultValue: m[2] ?? '' })
    }
  }
  return vars
}

function fillTemplate(syntax: string, values: Record<string, string>): string {
  return syntax.replace(/\{\{([^}:]+)(?::[^}]*)?\}\}/g, (_, name) => values[name] ?? `{{${name}}}`)
}

const TemplateRunnerModal: React.FC<TemplateRunnerModalProps> = ({
  isOpen,
  onClose,
  command,
  onCopy
}) => {
  const [values, setValues] = useState<Record<string, string>>({})
  const [copied, setCopied] = useState(false)

  const variables = command ? extractVariables(command.syntax) : []
  const filled = command ? fillTemplate(command.syntax, values) : ''

  useEffect(() => {
    if (isOpen && command) {
      const initial: Record<string, string> = {}
      extractVariables(command.syntax).forEach(({ name, defaultValue }) => {
        initial[name] = lastUsedValues[name] ?? defaultValue
      })
      setValues(initial)
      setCopied(false)
    }
  }, [isOpen, command])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  const handleCopy = () => {
    navigator.clipboard.writeText(filled)
    // Remember last used values
    Object.entries(values).forEach(([k, v]) => {
      lastUsedValues[k] = v
    })
    if (command && onCopy) onCopy(command.id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const updateValue = (name: string, val: string) => {
    setValues((prev) => ({ ...prev, [name]: val }))
  }

  if (!command) return null

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
            background: 'rgba(2, 5, 8, 0.88)',
            zIndex: 8500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="hud-panel"
            style={{ width: '600px', maxWidth: '96vw' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="hud-panel-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Play size={13} color="var(--accent-amber)" />
                <h2>Run Template</h2>
              </div>
              <button
                onClick={onClose}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}
              >
                <X size={14} />
              </button>
            </div>

            <div className="hud-panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px' }}>
              {/* Description */}
              {command.description && (
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  {command.description}
                </p>
              )}

              {/* Variable inputs */}
              {variables.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ fontSize: '9px', color: 'var(--text-muted)', letterSpacing: '1.5px' }}>
                    Fill Variables
                  </label>
                  {variables.map(({ name, defaultValue }) => (
                    <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span
                        style={{
                          minWidth: '140px',
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: '11px',
                          color: 'var(--accent-amber)',
                          background: 'rgba(255,179,0,0.08)',
                          border: '1px solid rgba(255,179,0,0.25)',
                          padding: '2px 8px',
                          flexShrink: 0
                        }}
                      >
                        {name}
                      </span>
                      <input
                        type="text"
                        className="input-field"
                        style={{ flex: 1, height: '34px', fontSize: '12px' }}
                        value={values[name] ?? ''}
                        onChange={(e) => updateValue(name, e.target.value)}
                        placeholder={defaultValue || `Enter ${name}...`}
                        autoFocus={variables[0].name === name}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '1px' }}>
                  No variables detected in this command.
                </p>
              )}

              {/* Filled preview */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '9px', color: 'var(--text-secondary)', letterSpacing: '1.5px' }}>
                  Result
                </label>
                <div
                  style={{
                    background: '#000',
                    border: '1px solid var(--border-default)',
                    padding: '12px 14px',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '13px',
                    color: 'var(--accent-green)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                    lineHeight: '1.6',
                    minHeight: '48px'
                  }}
                >
                  <span style={{ color: 'var(--text-muted)' }}>$ </span>
                  {filled}
                </div>
              </div>

              {/* Copy button */}
              <button
                className="btn btn-primary"
                style={{ height: '38px', width: '100%', fontSize: '11px', gap: '8px' }}
                onClick={handleCopy}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied to Clipboard!' : 'Copy Filled Command'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default TemplateRunnerModal
