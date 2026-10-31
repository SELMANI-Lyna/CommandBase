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
  AlertTriangle,
  Play,
  Copy,
  Check,
  FileText,
  GripVertical,
  Star
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// ── Types ─────────────────────────────────────────────────────────────────────
interface Program {
  id: number
  name: string
  description: string
  category_id: number | null
  is_favorite?: number
}

interface Step {
  id?: number
  command_id: number | null
  custom_command: string
  note: string
  expected_output: string
  syntax?: string
}

// ── {{variable}} helpers ──────────────────────────────────────────────────────
function extractVars(text: string): string[] {
  const regex = /\{\{([^}:]+)(?::[^}]*)?\}\}/g
  const seen = new Set<string>()
  let m: RegExpExecArray | null
  while ((m = regex.exec(text)) !== null) seen.add(m[1])
  return Array.from(seen)
}

function fillVars(text: string, vals: Record<string, string>): string {
  return text.replace(/\{\{([^}:]+)(?::[^}]*)?\}\}/g, (_, name) => vals[name] ?? `{{${name}}}`)
}

// ── Sortable step row ─────────────────────────────────────────────────────────
function SortableStep({
  step,
  index,
  commands,
  onUpdate,
  onRemove
}: {
  step: Step
  index: number
  commands: any[]
  onUpdate: (i: number, field: keyof Step, value: any) => void
  onRemove: (i: number) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: String(index)
  })
  const style = { transform: CSS.Transform.toString(transform), transition }

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        background: 'var(--bg-void)',
        border: '1px solid var(--border-default)',
        padding: '10px 12px',
        marginBottom: '8px'
      }}
    >
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button
          {...attributes}
          {...listeners}
          style={{ background: 'none', border: 'none', cursor: 'grab', color: 'var(--text-muted)', display: 'flex', padding: '2px', flexShrink: 0 }}
        >
          <GripVertical size={13} />
        </button>
        <span style={{ fontSize: '9px', color: 'var(--accent-cyan)', minWidth: '22px', fontWeight: 800 }}>
          {String(index + 1).padStart(2, '0')}
        </span>
        <select
          className="input-field"
          style={{ width: '200px', fontSize: '10px', height: '30px' }}
          value={step.command_id ?? ''}
          onChange={(e) => onUpdate(index, 'command_id', e.target.value)}
        >
          <option value="">— Custom / Type below —</option>
          {commands.map((c) => (
            <option key={c.id} value={c.id}>{c.syntax.slice(0, 60)}</option>
          ))}
        </select>
        <input
          type="text"
          className="input-field"
          style={{ flex: 1, fontSize: '10px', height: '30px' }}
          value={step.custom_command}
          onChange={(e) => onUpdate(index, 'custom_command', e.target.value)}
          placeholder="Command (or override)..."
        />
        <button
          onClick={() => onRemove(index)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-red)', display: 'flex', flexShrink: 0 }}
        >
          <X size={13} />
        </button>
      </div>
      <div style={{ marginTop: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', paddingLeft: '60px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '8px', color: 'var(--text-muted)', letterSpacing: '1px' }}>
            Note / Context
          </label>
          <textarea
            className="input-field"
            style={{ width: '100%', minHeight: '52px', fontSize: '10px', resize: 'vertical' }}
            value={step.note}
            onChange={(e) => onUpdate(index, 'note', e.target.value)}
            placeholder="Why this step, what to look for..."
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '8px', color: 'var(--text-muted)', letterSpacing: '1px' }}>
            Expected Output
          </label>
          <textarea
            className="input-field"
            style={{ width: '100%', minHeight: '52px', fontSize: '10px', fontFamily: 'JetBrains Mono', resize: 'vertical' }}
            value={step.expected_output}
            onChange={(e) => onUpdate(index, 'expected_output', e.target.value)}
            placeholder="What success looks like..."
          />
        </div>
      </div>
    </div>
  )
}

// ── Run Mode ──────────────────────────────────────────────────────────────────
function RunMode({
  program,
  steps,
  onClose
}: {
  program: Program
  steps: Step[]
  onClose: () => void
}) {
  // Collect all {{variables}} across steps
  const allVarNames = Array.from(
    new Set(steps.flatMap((s) => [...extractVars(s.custom_command), ...extractVars(s.note ?? '')]))
  )
  const [varValues, setVarValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    allVarNames.forEach((n) => (init[n] = ''))
    return init
  })
  const [done, setDone] = useState<Set<number>>(new Set())
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)
  const [copiedAll, setCopiedAll] = useState(false)

  const toggleDone = (i: number) => {
    setDone((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  const copyStep = (s: Step, i: number) => {
    const cmd = fillVars(s.custom_command || s.syntax || '', varValues)
    navigator.clipboard.writeText(cmd)
    setCopiedIdx(i)
    setTimeout(() => setCopiedIdx(null), 1500)
  }

  const copyAll = () => {
    const lines: string[] = []
    steps.forEach((s) => {
      if (s.note) lines.push(`# ${fillVars(s.note, varValues)}`)
      lines.push(fillVars(s.custom_command || s.syntax || '', varValues))
    })
    navigator.clipboard.writeText(lines.join('\n'))
    setCopiedAll(true)
    setTimeout(() => setCopiedAll(false), 2000)
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-default)', paddingBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Play size={16} color="var(--accent-green)" />
          <h2 style={{ fontSize: '16px' }}>{program.name.toUpperCase()}</h2>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{done.size}/{steps.length} done</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn"
            style={{ height: '30px', padding: '0 12px', color: copiedAll ? 'var(--accent-green)' : undefined }}
            onClick={copyAll}
          >
            {copiedAll ? <Check size={12} /> : <FileText size={12} />} Copy as .sh
          </button>
          <button className="btn btn-danger" style={{ height: '30px', padding: '0 12px' }} onClick={onClose}>
            <X size={12} /> Exit Run Mode
          </button>
        </div>
      </div>

      {/* Variable fill */}
      {allVarNames.length > 0 && (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', padding: '12px 16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '9px', color: 'var(--accent-amber)', letterSpacing: '1.5px' }}>
            Fill Variables (applied to all steps)
          </label>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {allVarNames.map((name) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'var(--accent-amber)' }}>
                  {name}
                </span>
                <input
                  type="text"
                  className="input-field"
                  style={{ height: '28px', width: '140px', fontSize: '11px' }}
                  value={varValues[name] ?? ''}
                  onChange={(e) => setVarValues((prev) => ({ ...prev, [name]: e.target.value }))}
                  placeholder={`Enter ${name}...`}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {steps.map((step, i) => {
          const cmd = fillVars(step.custom_command || step.syntax || '', varValues)
          const isDone = done.has(i)
          return (
            <div
              key={i}
              style={{
                border: `1px solid ${isDone ? 'rgba(0,232,135,0.3)' : 'var(--border-default)'}`,
                background: isDone ? 'rgba(0,232,135,0.03)' : 'var(--bg-panel)',
                padding: '12px 14px',
                opacity: isDone ? 0.65 : 1,
                transition: 'all 150ms'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <button
                  onClick={() => toggleDone(i)}
                  style={{
                    width: '22px',
                    height: '22px',
                    border: `1px solid ${isDone ? 'var(--accent-green)' : 'var(--text-muted)'}`,
                    background: isDone ? 'rgba(0,232,135,0.15)' : 'transparent',
                    color: isDone ? 'var(--accent-green)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {isDone ? <Check size={12} /> : null}
                </button>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  {step.note && (
                    <p style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '6px', lineHeight: '1.5', fontStyle: 'italic' }}>
                      # {fillVars(step.note, varValues)}
                    </p>
                  )}
                  <div style={{ background: '#000', border: '1px solid var(--border-default)', padding: '8px 12px', fontFamily: 'JetBrains Mono', fontSize: '12px', color: 'var(--accent-green)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                    <code style={{ wordBreak: 'break-all' }}>$ {cmd || '(empty)'}</code>
                    <button
                      className="btn"
                      onClick={() => copyStep(step, i)}
                      style={{ border: 'none', background: 'none', color: 'var(--accent-green)', padding: '2px 6px', height: 'auto' }}
                    >
                      {copiedIdx === i ? <Check size={11} /> : <Copy size={11} />}
                    </button>
                  </div>
                  {step.expected_output && (
                    <div style={{ marginTop: '6px', padding: '6px 10px', background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.15)', fontSize: '10px', fontFamily: 'JetBrains Mono', color: 'var(--text-muted)', whiteSpace: 'pre-wrap' }}>
                      Expected: {step.expected_output}
                    </div>
                  )}
                </div>
                <span style={{ fontSize: '9px', color: 'var(--accent-cyan)', fontWeight: 800, flexShrink: 0 }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
const ProgramsView: React.FC = () => {
  const [programs, setPrograms] = useState<Program[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [commands, setCommands] = useState<any[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [expandedSteps, setExpandedSteps] = useState<Step[]>([])
  const [runMode, setRunMode] = useState<{ program: Program; steps: Step[] } | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // form state
  const [formName, setFormName] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formCatId, setFormCatId] = useState<number | null>(null)
  const [formSteps, setFormSteps] = useState<Step[]>([])

  useEffect(() => { loadAll() }, [])

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
    setFormName(''); setFormDesc(''); setFormCatId(null); setFormSteps([])
    setIsCreating(true); setEditingId(null)
  }

  const openEdit = async (prog: Program) => {
    const steps: any[] = await window.api.getProgramSteps(prog.id)
    setFormName(prog.name)
    setFormDesc(prog.description ?? '')
    setFormCatId(prog.category_id)
    setFormSteps(steps.map((s) => ({
      command_id: s.command_id,
      custom_command: s.custom_command ?? s.syntax ?? '',
      note: s.note ?? '',
      expected_output: s.expected_output ?? ''
    })))
    setEditingId(prog.id); setIsCreating(false)
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
    setIsCreating(false); setEditingId(null); loadAll()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this workflow?')) return
    await window.api.deleteProgram(id); loadAll()
  }

  const addStep = () => setFormSteps((prev) => [...prev, { command_id: null, custom_command: '', note: '', expected_output: '' }])

  const updateStep = (index: number, field: keyof Step, value: any) => {
    setFormSteps((prev) => {
      const steps = [...prev]
      if (field === 'command_id') {
        const cmd = commands.find((c) => c.id === Number(value))
        steps[index] = { ...steps[index], command_id: value ? Number(value) : null, custom_command: cmd?.syntax ?? steps[index].custom_command }
      } else {
        steps[index] = { ...steps[index], [field]: value }
      }
      return steps
    })
  }

  const removeStep = (i: number) => setFormSteps((prev) => prev.filter((_, idx) => idx !== i))

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setFormSteps((prev) => {
        const oldIdx = parseInt(String(active.id))
        const newIdx = parseInt(String(over.id))
        return arrayMove(prev, oldIdx, newIdx)
      })
    }
  }

  const toggleExpand = async (id: number) => {
    if (expandedId === id) { setExpandedId(null); return }
    const steps = await window.api.getProgramSteps(id)
    setExpandedSteps(steps.map((s: any) => ({
      command_id: s.command_id,
      custom_command: s.custom_command ?? s.syntax ?? '',
      note: s.note ?? '',
      expected_output: s.expected_output ?? '',
      syntax: s.syntax
    })))
    setExpandedId(id)
  }

  const openRunMode = async (prog: Program) => {
    const steps = await window.api.getProgramSteps(prog.id)
    const mapped: Step[] = steps.map((s: any) => ({
      command_id: s.command_id,
      custom_command: s.custom_command ?? s.syntax ?? '',
      note: s.note ?? '',
      expected_output: s.expected_output ?? '',
      syntax: s.syntax
    }))
    setRunMode({ program: prog, steps: mapped })
  }

  const inForm = isCreating || editingId !== null

  if (runMode) {
    return (
      <RunMode
        program={runMode.program}
        steps={runMode.steps}
        onClose={() => setRunMode(null)}
      />
    )
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-default)', paddingBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '20px', marginBottom: '4px' }}>Workflows</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '11px', letterSpacing: '0.8px' }}>
            Structured playbooks — linked commands with notes and run mode.
          </p>
        </div>
        {!inForm && (
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={13} /> New Workflow
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
                {isCreating ? <Plus size={13} color="var(--accent-cyan)" /> : <Edit2 size={13} color="var(--accent-cyan)" />}
                <h2>{isCreating ? 'New Workflow' : 'Edit Workflow'}</h2>
              </div>
            </div>
            <div className="hud-panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '9px', color: 'var(--text-secondary)', letterSpacing: '1px' }}>
                    Workflow Name *
                  </label>
                  <input
                    type="text" className="input-field" style={{ width: '100%' }}
                    value={formName} onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Web Enumeration" autoFocus
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '9px', color: 'var(--text-secondary)', letterSpacing: '1px' }}>
                    Category
                  </label>
                  <select
                    className="input-field" style={{ width: '100%' }}
                    value={formCatId ?? ''} onChange={(e) => setFormCatId(e.target.value ? Number(e.target.value) : null)}
                  >
                    <option value="">— None —</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '9px', color: 'var(--text-secondary)', letterSpacing: '1px' }}>
                  Description
                </label>
                <input
                  type="text" className="input-field" style={{ width: '100%' }}
                  value={formDesc} onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Optional description..."
                />
              </div>

              {/* Steps with DnD */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <label style={{ fontSize: '9px', color: 'var(--text-secondary)', letterSpacing: '1px' }}>
                    Steps ({formSteps.length})
                  </label>
                  <button className="btn" style={{ fontSize: '9px', padding: '4px 10px', height: '26px' }} onClick={addStep}>
                    <Plus size={11} /> Add Step
                  </button>
                </div>

                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={formSteps.map((_, i) => String(i))} strategy={verticalListSortingStrategy}>
                    {formSteps.map((step, i) => (
                      <SortableStep
                        key={i}
                        step={step}
                        index={i}
                        commands={commands}
                        onUpdate={updateStep}
                        onRemove={removeStep}
                      />
                    ))}
                  </SortableContext>
                </DndContext>

                {formSteps.length === 0 && (
                  <div style={{ padding: '14px', textAlign: 'center', border: '1px dashed var(--border-default)', fontSize: '9px', color: 'var(--text-muted)', letterSpacing: '1px' }}>
                    No steps yet — click Add Step
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button className="btn btn-danger" onClick={() => { setIsCreating(false); setEditingId(null) }}>
                  <X size={12} /> Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSave}>
                  <Save size={12} /> Save Workflow
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
              <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '36px', height: '36px', border: '1px solid var(--border-default)', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-magenta)', flexShrink: 0 }}>
                  <Layers size={16} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: '13px', letterSpacing: '1px' }}>{prog.name.toUpperCase()}</h3>
                    {cat && <span className="badge-outline cyan" style={{ fontSize: '8px' }}>{cat.name.toUpperCase()}</span>}
                    {prog.is_favorite ? <Star size={11} fill="var(--accent-amber)" color="var(--accent-amber)" /> : null}
                  </div>
                  {prog.description && (
                    <p style={{ fontSize: '10px', color: 'var(--text-secondary)', margin: 0 }}>{prog.description}</p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    className="btn"
                    style={{ padding: '5px 10px', height: '30px', fontSize: '10px', color: 'var(--accent-green)', borderColor: 'var(--accent-green)' }}
                    onClick={() => openRunMode(prog)}
                  >
                    <Play size={11} /> Run
                  </button>
                  <button
                    className="btn"
                    style={{ padding: '5px 12px', height: '30px', fontSize: '10px' }}
                    onClick={() => toggleExpand(prog.id)}
                  >
                    <ChevronRight size={11} style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 150ms' }} />
                    Steps
                  </button>
                  <button className="btn" style={{ padding: '5px 10px', height: '30px' }} onClick={() => openEdit(prog)}>
                    <Edit2 size={12} />
                  </button>
                  <button className="btn btn-danger" style={{ padding: '5px 10px', height: '30px' }} onClick={() => handleDelete(prog.id)}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    style={{ overflow: 'hidden', background: 'var(--bg-void)', borderTop: '1px solid var(--border-default)', padding: '14px 20px' }}
                  >
                    {expandedSteps.length === 0 ? (
                      <p style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '1px' }}>No steps configured</p>
                    ) : (
                      expandedSteps.map((step, i) => (
                        <div key={i} style={{ marginBottom: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '9px', color: 'var(--accent-cyan)', minWidth: '24px', fontWeight: 800 }}>
                              {String(i + 1).padStart(2, '0')}
                            </span>
                            <Terminal size={11} color="var(--accent-green)" />
                            <code style={{ fontSize: '10px', color: 'var(--accent-green)', background: 'rgba(0,232,135,0.05)', padding: '2px 8px', border: '1px solid rgba(0,232,135,0.2)', wordBreak: 'break-all' }}>
                              {step.custom_command || '(empty)'}
                            </code>
                          </div>
                          {step.note && (
                            <p style={{ marginTop: '4px', paddingLeft: '44px', fontSize: '9px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                              # {step.note}
                            </p>
                          )}
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
        <div className="card" style={{ padding: '60px', textAlign: 'center', border: '1px dashed var(--border-default)' }}>
          <AlertTriangle size={32} style={{ opacity: 0.3, color: 'var(--accent-amber)', marginBottom: '16px' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '16px' }}>
            No workflows yet.
          </p>
          <button className="btn btn-primary" onClick={openCreate} style={{ margin: '0 auto' }}>
            <Plus size={13} /> Create your first workflow
          </button>
        </div>
      )}
    </div>
  )
}

export default ProgramsView
