import React, { useState, useEffect, useRef } from 'react'
import { Plus, Edit2, Trash2, X, Bold, Italic, Underline, BookOpen, Camera } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface BlogPost {
  id: number
  title: string
  content: string
  categories: string // JSON
  photos: string // JSON
  font_family: string
  created_at: string
  updated_at: string
}

const FONTS = ['JetBrains Mono', 'Orbitron', 'Arial', 'Georgia', 'Courier New', 'Trebuchet MS']
const TEXT_COLORS = ['#e8eaed', '#00d4ff', '#00e887', '#ff3b5c', '#ffb300', '#bf5fff', '#ffffff']

const BlogView: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  // form state
  const [formTitle, setFormTitle] = useState('')
  const [formContent, setFormContent] = useState('')
  const [formCats, setFormCats] = useState<number[]>([])
  const [formPhotos, setFormPhotos] = useState<string[]>([])
  const [formFont, setFormFont] = useState('JetBrains Mono')
  const [formTextColor, setFormTextColor] = useState('#e8eaed')
  const editorRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadAll()
  }, [])

  const loadAll = async () => {
    const [p, c] = await Promise.all([window.api.getBlogPosts(), window.api.getCategories()])
    setPosts(p)
    setCategories(c)
  }

  const openCreate = () => {
    setEditingPost(null)
    setFormTitle('')
    setFormContent('')
    setFormCats([])
    setFormPhotos([])
    setFormFont('JetBrains Mono')
    setFormTextColor('#e8eaed')
    if (editorRef.current) editorRef.current.innerHTML = ''
    setModalOpen(true)
  }

  const openEdit = (post: BlogPost) => {
    setEditingPost(post)
    setFormTitle(post.title)
    setFormContent(post.content ?? '')
    setFormCats(JSON.parse(post.categories || '[]'))
    setFormPhotos(JSON.parse(post.photos || '[]'))
    setFormFont(post.font_family ?? 'JetBrains Mono')
    setFormTextColor('#e8eaed')
    setModalOpen(true)
    setTimeout(() => {
      if (editorRef.current) editorRef.current.innerHTML = post.content ?? ''
    }, 50)
  }

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    files.slice(0, 4 - formPhotos.length).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setFormPhotos((prev) => (prev.length < 4 ? [...prev, ev.target!.result as string] : prev))
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const removePhoto = (i: number) => setFormPhotos((prev) => prev.filter((_, idx) => idx !== i))

  const exec = (cmd: string, val?: string) => {
    editorRef.current?.focus()
    document.execCommand(cmd, false, val)
  }

  const handleSave = async () => {
    const content = editorRef.current?.innerHTML ?? ''
    const post = {
      title: formTitle,
      content,
      categories: formCats,
      photos: formPhotos,
      font_family: formFont
    }
    if (editingPost) {
      await window.api.updateBlogPost(editingPost.id, post)
    } else {
      await window.api.addBlogPost(post)
    }
    setModalOpen(false)
    loadAll()
  }

  const handleDelete = async (id: number) => {
    await window.api.deleteBlogPost(id)
    loadAll()
  }

  const toggleCat = (id: number) =>
    setFormCats((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  const getPostCats = (post: BlogPost) => {
    const ids: number[] = JSON.parse(post.categories || '[]')
    return categories.filter((c) => ids.includes(c.id))
  }

  const getPostPhotos = (post: BlogPost): string[] => JSON.parse(post.photos || '[]')

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
          <h1 style={{ fontSize: '20px', marginBottom: '4px' }}>OPERATOR_BLOG</h1>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.8px'
            }}
          >
            PERSONAL LOG — RESEARCH NOTES, WRITE-UPS, FIELD REPORTS. UP TO 4 PHOTOS PER POST.
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={13} /> NEW_POST
        </button>
      </div>

      {/* Post Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '20px'
        }}
      >
        {posts.map((post) => {
          const photos = getPostPhotos(post)
          const postCats = getPostCats(post)
          const isExpanded = expandedId === post.id
          return (
            <div
              key={post.id}
              className="card"
              style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
            >
              {/* Photo strip */}
              {photos.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    height: '100px',
                    overflow: 'hidden',
                    borderBottom: '1px solid var(--border-default)'
                  }}
                >
                  {photos.map((ph, i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        backgroundImage: `url(${ph})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        borderRight:
                          i < photos.length - 1 ? '1px solid var(--border-default)' : 'none'
                      }}
                    />
                  ))}
                </div>
              )}

              <div style={{ padding: '16px 18px', flex: 1 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '10px',
                    marginBottom: '10px'
                  }}
                >
                  <h3 style={{ fontSize: '13px', letterSpacing: '1px', lineHeight: 1.4 }}>
                    {post.title.toUpperCase()}
                  </h3>
                  <div style={{ display: 'flex', gap: '5px', flexShrink: 0 }}>
                    <button
                      className="btn"
                      style={{ padding: '4px 8px', height: '26px' }}
                      onClick={() => openEdit(post)}
                    >
                      <Edit2 size={11} />
                    </button>
                    <button
                      className="btn btn-danger"
                      style={{ padding: '4px 8px', height: '26px' }}
                      onClick={() => handleDelete(post.id)}
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>

                {/* Categories */}
                {postCats.length > 0 && (
                  <div
                    style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '10px' }}
                  >
                    {postCats.map((c) => (
                      <span key={c.id} className="badge-outline cyan" style={{ fontSize: '8px' }}>
                        {c.name.toUpperCase()}
                      </span>
                    ))}
                  </div>
                )}

                {/* Content preview / expand */}
                {!isExpanded && post.content && (
                  <div
                    style={{
                      fontSize: '10px',
                      color: 'var(--text-secondary)',
                      overflow: 'hidden',
                      maxHeight: '48px',
                      lineHeight: 1.6,
                      fontFamily: post.font_family ?? 'JetBrains Mono'
                    }}
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />
                )}
                {isExpanded && (
                  <div
                    style={{
                      fontSize: '11px',
                      color: 'var(--text-primary)',
                      lineHeight: 1.7,
                      fontFamily: post.font_family ?? 'JetBrains Mono'
                    }}
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />
                )}
              </div>

              {/* Footer */}
              <div
                style={{
                  borderTop: '1px solid var(--border-default)',
                  padding: '8px 18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>
                  {new Date(post.updated_at).toLocaleDateString()} · {photos.length} PHOTO
                  {photos.length !== 1 ? 'S' : ''}
                </span>
                <button
                  className="btn"
                  style={{ fontSize: '9px', height: '24px', padding: '0 10px' }}
                  onClick={() => setExpandedId(isExpanded ? null : post.id)}
                >
                  {isExpanded ? 'COLLAPSE' : 'READ_MORE'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {posts.length === 0 && (
        <div
          className="card"
          style={{
            padding: '60px',
            textAlign: 'center',
            border: '1px dashed var(--border-default)'
          }}
        >
          <BookOpen
            size={32}
            style={{ opacity: 0.3, color: 'var(--accent-cyan)', marginBottom: '16px' }}
          />
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
          >
            NO POSTS YET. CREATE YOUR FIRST FIELD REPORT.
          </p>
        </div>
      )}

      {/* ── MODAL ── */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9000,
              background: 'rgba(2, 5, 8, 0.85)',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              padding: '40px 20px',
              overflowY: 'auto'
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setModalOpen(false)
            }}
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{
                width: '100%',
                maxWidth: '740px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--accent-cyan)',
                borderRadius: 0
              }}
            >
              {/* Modal Header */}
              <div
                style={{
                  padding: '14px 20px',
                  borderBottom: '1px solid var(--border-default)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BookOpen size={14} color="var(--accent-cyan)" />
                  <h2>{editingPost ? 'EDIT_POST' : 'NEW_POST'}</h2>
                </div>
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-secondary)'
                  }}
                  onClick={() => setModalOpen(false)}
                >
                  <X size={16} />
                </button>
              </div>

              <div
                style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}
              >
                {/* Title */}
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
                    POST TITLE *
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    style={{ width: '100%' }}
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. CROSS-SITE SCRIPTING IN CTF ENVIRONMENT"
                    autoFocus
                  />
                </div>

                {/* Categories multi-select */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontSize: '9px',
                      color: 'var(--text-secondary)',
                      letterSpacing: '1px'
                    }}
                  >
                    RELATED CATEGORIES
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => toggleCat(c.id)}
                        style={{
                          background: formCats.includes(c.id)
                            ? 'rgba(0,212,255,0.1)'
                            : 'var(--bg-panel)',
                          border: `1px solid ${formCats.includes(c.id) ? 'var(--accent-cyan)' : 'var(--border-default)'}`,
                          color: formCats.includes(c.id)
                            ? 'var(--accent-cyan)'
                            : 'var(--text-secondary)',
                          padding: '3px 10px',
                          cursor: 'pointer',
                          fontSize: '9px',
                          letterSpacing: '0.8px',
                          fontFamily: 'JetBrains Mono, monospace',
                          borderRadius: 0
                        }}
                      >
                        {c.name.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Photos */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontSize: '9px',
                      color: 'var(--text-secondary)',
                      letterSpacing: '1px'
                    }}
                  >
                    PHOTOS ({formPhotos.length}/4)
                  </label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {formPhotos.map((ph, i) => (
                      <div
                        key={i}
                        style={{
                          position: 'relative',
                          width: '80px',
                          height: '60px',
                          border: '1px solid var(--border-default)'
                        }}
                      >
                        <img
                          src={ph}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block'
                          }}
                          alt=""
                        />
                        <button
                          onClick={() => removePhoto(i)}
                          style={{
                            position: 'absolute',
                            top: '-6px',
                            right: '-6px',
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            background: 'var(--accent-red)',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff'
                          }}
                        >
                          <X size={9} />
                        </button>
                      </div>
                    ))}
                    {formPhotos.length < 4 && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          width: '80px',
                          height: '60px',
                          border: '1px dashed var(--border-default)',
                          background: 'var(--bg-panel)',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          color: 'var(--text-muted)'
                        }}
                      >
                        <Camera size={14} />
                        <span style={{ fontSize: '7px', letterSpacing: '0.5px' }}>ADD</span>
                      </button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      style={{ display: 'none' }}
                      onChange={handlePhoto}
                    />
                  </div>
                </div>

                {/* Font + color toolbar */}
                <div
                  style={{
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'center',
                    background: 'var(--bg-panel)',
                    padding: '8px 12px',
                    border: '1px solid var(--border-default)'
                  }}
                >
                  <select
                    value={formFont}
                    onChange={(e) => {
                      setFormFont(e.target.value)
                      exec('fontName', e.target.value)
                    }}
                    style={{
                      background: 'var(--bg-void)',
                      border: '1px solid var(--border-default)',
                      color: 'var(--text-primary)',
                      fontSize: '10px',
                      padding: '2px 6px',
                      fontFamily: 'JetBrains Mono',
                      borderRadius: 0,
                      height: '26px'
                    }}
                  >
                    {FONTS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                  {[
                    ['bold', <Bold size={11} />],
                    ['italic', <Italic size={11} />],
                    ['underline', <Underline size={11} />]
                  ].map(([cmd, icon]) => (
                    <button
                      key={cmd as string}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        exec(cmd as string)
                      }}
                      style={{
                        background: 'var(--bg-void)',
                        border: '1px solid var(--border-default)',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        width: '28px',
                        height: '26px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {icon}
                    </button>
                  ))}
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    {TEXT_COLORS.map((col) => (
                      <button
                        key={col}
                        onMouseDown={(e) => {
                          e.preventDefault()
                          setFormTextColor(col)
                          exec('foreColor', col)
                        }}
                        style={{
                          width: '16px',
                          height: '16px',
                          background: col,
                          border:
                            formTextColor === col
                              ? '2px solid #fff'
                              : '1px solid rgba(255,255,255,0.2)',
                          cursor: 'pointer',
                          borderRadius: 0,
                          flexShrink: 0
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Rich Text Editor */}
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
                    CONTENT
                  </label>
                  <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    style={{
                      minHeight: '180px',
                      padding: '14px 16px',
                      background: 'var(--bg-void)',
                      border: '1px solid var(--border-default)',
                      color: 'var(--text-primary)',
                      fontSize: '12px',
                      lineHeight: 1.8,
                      fontFamily: formFont,
                      outline: 'none'
                    }}
                    dangerouslySetInnerHTML={{ __html: formContent }}
                  />
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button className="btn btn-danger" onClick={() => setModalOpen(false)}>
                    <X size={12} /> CANCEL
                  </button>
                  <button className="btn btn-primary" onClick={handleSave}>
                    <BookOpen size={12} /> {editingPost ? 'UPDATE_POST' : 'PUBLISH_POST'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default BlogView
