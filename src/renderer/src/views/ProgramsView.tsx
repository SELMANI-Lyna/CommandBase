import React, { useState, useEffect } from 'react'
import {
  Plus,
  Layers,
  Trash2,
  Edit2,
  Save,
  X,
  ChevronRight,
  Terminal,
  AlertTriangle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Program {
  id: number
  name: string
  description: string
  category_id: number | null
}

interface Step {
  id?: number
  command_id: number | null
  custom_command: string
  syntax?: string // loaded from join
}

const ProgramsView: React.FC = () => {
  const [programs, setPrograms] = useState<Program[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [commands, setCommands] = useState<any[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [expandedSteps, setExpandedSteps] = useState<Step[]>([])

  // form state
  const [formName, setFormName] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formCatId, setFormCatId] = useState<number | null>(null)
  const [formSteps, setFormSteps] = useState<Step[]>([])

  useEffect(() => {
    loadAll()
  }, [])

  const loadAll = async () => {
    const [progs, cats, cmds] = await Promise.all([
      window.api.getPrograms(),
      window.api.getCategories(),
      window.api.getCommands()
    ])
    setPrograms(progs)
    setCategories(cats)
    setCommands(cmds)
  }

  const openCreate = () => {
    setFormName('')
    setFormDesc('')
    setFormCatId(null)
    setFormSteps([])
    setIsCreating(true)
    setEditingId(null)
  }

  const openEdit = async (prog: Program) => {
    const steps: Step[] = await window.api.getProgramSteps(prog.id)
    setFormName(prog.name)
    setFormDesc(prog.description ?? '')
    setFormCatId(prog.category_id)
    setFormSteps(
      steps.map((s) => ({
        command_id: s.command_id,
        custom_command: s.custom_command ?? s.syntax ?? ''
      }))
    )
    setEditingId(prog.id)
    setIsCreating(false)
  }

  const handleSave = async () => {
    if (!formName.trim()) return
    if (isCreating) {
      const id = await window.api.addProgram(formName, formDesc, formCatId ?? undefined)
      await window.api.updateProgramSteps(id as number, formSteps)
    } else if (editingId !== null) {
      await window.api.updateProgram(editingId, formName, formDesc, formCatId ?? undefined)
      await window.api.updateProgramSteps(editingId, formSteps)
    }
    setIsCreating(false)
    setEditingId(null)
    loadAll()
  }

  const handleDelete = async (id: number) => {
    await window.api.deleteProgram(id)
    loadAll()
  }

  const addStep = () => {
    setFormSteps((prev) => [...prev, { command_id: null, custom_command: '' }])
  }

  const updateStep = (index: number, field: keyof Step, value: any) => {
    setFormSteps((prev) => {
      const steps = [...prev]
      if (field === 'command_id') {
        const cmd = commands.find((c) => c.id === Number(value))
        steps[index] = {
          ...steps[index],
          command_id: value ? Number(value) : null,
          custom_command: cmd?.syntax ?? steps[index].custom_command
        }
      } else {
        steps[index] = { ...steps[index], [field]: value }
      }
      return steps
    })
  }

  const removeStep = (i: number) => setFormSteps((prev) => prev.filter((_, idx) => idx !== i))

  const toggleExpand = async (id: number) => {
    if (expandedId === id) {
      setExpandedId(null)
      return
    }
    const steps = await window.api.getProgramSteps(id)
    setExpandedSteps(steps)
    setExpandedId(id)
  }

  const inForm = isCreating || editingId !== null

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
          <h1 style={{ fontSize: '20px', marginBottom: '4px' }}>WORKFLOW_CHAINS</h1>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.8px'
            }}
          >
            STRUCTURED COMMAND SEQUENCES. ASSIGN CATEGORY + ORDERED COMMAND STEPS.
          </p>
        </div>
        {!inForm && (
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={13} /> NEW_WORKFLOW
          </button>
        )}
      </div>

      {/* Form Panel */}
      <AnimatePresence>
        {inForm && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.14 }}
            className="hud-panel"
          >
            <div className="hud-panel-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isCreating ? (
                  <Plus size={13} color="var(--accent-cyan)" />
                ) : (
                  <Edit2 size={13} color="var(--accent-cyan)" />
                )}
                <h2>{isCreating ? 'NEW_WORKFLOW' : 'EDIT_WORKFLOW'}</h2>
              </div>
            </div>
            <div
              className="hud-panel-body"
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              {/* Row 1: name + category */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '6px',
                      fontSize: '9px',
                      color: 'var(--text-secondary)',
                      letterSpacing: '1px'
                    }}
                  >
                    WORKFLOW TITLE *
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    style={{ width: '100%' }}
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. RECON PHASE ALPHA"
                    autoFocus
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '6px',
                      fontSize: '9px',
                      color: 'var(--text-secondary)',
                      letterSpacing: '1px'
                    }}
                  >
                    CATEGORY
                  </label>
                  <select
                    className="input-field"
                    style={{ width: '100%' }}
                    value={formCatId ?? ''}
                    onChange={(e) => setFormCatId(e.target.value ? Number(e.target.value) : null)}
                  >
                    <option value="">— NONE —</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {/* Description */}
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontSize: '9px',
                    color: 'var(--text-secondary)',
                    letterSpacing: '1px'
                  }}
                >
                  DESCRIPTION
                </label>
                <input
                  type="text"
                  className="input-field"
                  style={{ width: '100%' }}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Optional description..."
                />
              </div>

              {/* Command Steps */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '10px'
                  }}
                >
                  <label
                    style={{
                      fontSize: '9px',
                      color: 'var(--text-secondary)',
                      letterSpacing: '1px'
                    }}
                  >
                    COMMAND STEPS ({formSteps.length})
                  </label>
                  <button
                    className="btn"
                    style={{ fontSize: '9px', padding: '4px 10px', height: '26px' }}
                    onClick={addStep}
                  >
                    <Plus size={11} /> ADD STEP
                  </button>
                </div>
                {formSteps.map((step, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      gap: '10px',
                      alignItems: 'center',
                      marginBottom: '8px',
                      background: 'var(--bg-void)',
                      padding: '8px 10px',
                      border: '1px solid var(--border-default)'
                    }}
                  >
                    <span
                      style={{
                        fontSize: '9px',
                        color: 'var(--accent-cyan)',
                        minWidth: '24px',
                        fontWeight: 800
                      }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <select
                      className="input-field"
                      style={{ width: '200px', fontSize: '10px' }}
                      value={step.command_id ?? ''}
                      onChange={(e) => updateStep(i, 'command_id', e.target.value)}
                    >
                      <option value="">— CUSTOM / TYPE BELOW —</option>
                      {commands.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.syntax}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      className="input-field"
                      style={{ flex: 1, fontSize: '10px' }}
                      value={step.custom_command}
                      onChange={(e) => updateStep(i, 'custom_command', e.target.value)}
                      placeholder="Custom command or override..."
                    />
                    <button
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--accent-red)'
                      }}
                      onClick={() => removeStep(i)}
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
                {formSteps.length === 0 && (
                  <div
                    style={{
                      padding: '14px',
                      textAlign: 'center',
                      border: '1px dashed var(--border-default)',
                      fontSize: '9px',
                      color: 'var(--text-muted)',
                      letterSpacing: '1px'
                    }}
                  >
                    NO STEPS YET — CLICK ADD STEP
                  </div>
                )}
              </div>

              {/* Save / Cancel */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    setIsCreating(false)
                    setEditingId(null)
                  }}
                >
                  <X size={12} /> CANCEL
                </button>
                <button className="btn btn-primary" onClick={handleSave}>
                  <Save size={12} /> SAVE_WORKFLOW
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Programs List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {programs.map((prog) => {
          const cat = categories.find((c) => c.id === prog.category_id)
          const isExpanded = expandedId === prog.id
          return (
            <div key={prog.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div
                style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    border: '1px solid var(--border-default)',
                    background: 'var(--bg-surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-magenta)',
                    flexShrink: 0
                  }}
                >
                  <Layers size={16} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginBottom: '4px'
                    }}
                  >
                    <h3 style={{ fontSize: '13px', letterSpacing: '1px' }}>
                      {prog.name.toUpperCase()}
                    </h3>
                    {cat && (
                      <span className="badge-outline cyan" style={{ fontSize: '8px' }}>
                        {cat.name.toUpperCase()}
                      </span>
                    )}
                  </div>
                  {prog.description && (
                    <p style={{ fontSize: '10px', color: 'var(--text-secondary)', margin: 0 }}>
                      {prog.description}
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    className="btn"
                    style={{ padding: '5px 12px', height: '30px', fontSize: '10px' }}
                    onClick={() => toggleExpand(prog.id)}
                  >
                    <ChevronRight
                      size={11}
                      style={{
                        transform: isExpanded ? 'rotate(90deg)' : 'none',
                        transition: 'transform 150ms'
                      }}
                    />
                    STEPS
                  </button>
                  <button
                    className="btn"
                    style={{ padding: '5px 10px', height: '30px' }}
                    onClick={() => openEdit(prog)}
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    className="btn btn-danger"
                    style={{ padding: '5px 10px', height: '30px' }}
                    onClick={() => handleDelete(prog.id)}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              {/* Expanded Steps */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      overflow: 'hidden',
                      background: 'var(--bg-void)',
                      borderTop: '1px solid var(--border-default)',
                      padding: '14px 20px'
                    }}
                  >
                    {expandedSteps.length === 0 ? (
                      <p
                        style={{
                          fontSize: '10px',
                          color: 'var(--text-muted)',
                          letterSpacing: '1px'
                        }}
                      >
                        NO STEPS CONFIGURED
                      </p>
                    ) : (
                      expandedSteps.map((step, i) => (
                        <div
                          key={i}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            marginBottom: '8px'
                          }}
                        >
                          <span
                            style={{
                              fontSize: '9px',
                              color: 'var(--accent-cyan)',
                              minWidth: '24px',
                              fontWeight: 800
                            }}
                          >
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <Terminal size={11} color="var(--accent-green)" />
                          <code
                            style={{
                              fontSize: '10px',
                              color: 'var(--accent-green)',
                              background: 'rgba(0,232,135,0.05)',
                              padding: '2px 8px',
                              border: '1px solid rgba(0,232,135,0.2)'
                            }}
                          >
                            {(step as any).syntax || step.custom_command || '(empty)'}
                          </code>
                        </div>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      {programs.length === 0 && !inForm && (
        <div
          className="card"
          style={{
            padding: '60px',
            textAlign: 'center',
            border: '1px dashed var(--border-default)'
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
            NO WORKFLOWS CONFIGURED. CREATE ONE TO BEGIN.
          </p>
        </div>
      )}
    </div>
  )
}

export default ProgramsView
