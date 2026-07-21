"use client"

import { useState, useEffect, useRef } from 'react'
import { createClient } from '../../utils/supabase/client'
import { toast } from 'sonner'
import { Save, Plus, X, Loader2 } from 'lucide-react'

export default function SkillsEditor() {
  const [initialSkills, setInitialSkills] = useState([])
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState(null)
  const supabase = createClient()
  const inputRef = useRef(null)

  useEffect(() => {
    fetchSkills()
  }, [])

  const fetchSkills = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .order('sort_order', { ascending: true })

      if (error) throw error
      const fetched = data || []
      setInitialSkills(fetched)
      setSkills(fetched.map(s => ({ ...s, isEditing: false })))
    } catch (error) {
      toast.error(`Error loading skills: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const hasChanges = () => {
    const initialDataStr = JSON.stringify(initialSkills.map(s => ({ id: s.id, word: s.word })))
    const currentDataStr = JSON.stringify(skills.map(s => ({ id: s.isNew ? 'new' : s.id, word: s.word })))
    return initialDataStr !== currentDataStr
  }

  const handleReset = () => {
    setSkills(initialSkills.map(s => ({ ...s, isEditing: false })))
  }

  const handleAdd = () => {
    setSkills([...skills, { id: `temp_${Date.now()}`, word: '', isNew: true, isEditing: true }])
  }

  const handleDelete = (id) => {
    setSkills(skills.filter(s => s.id !== id))
  }

  const handleDoubleClick = (id) => {
    setSkills(skills.map(s => s.id === id ? { ...s, isEditing: true } : s))
  }

  const handleChange = (id, newWord) => {
    setSkills(skills.map(s => s.id === id ? { ...s, word: newWord } : s))
  }

  const handleBlurOrEnter = (id, e) => {
    if (e.type === 'keydown' && e.key !== 'Enter') return

    setSkills(skills.map(s => {
      if (s.id === id) {
        return { ...s, isEditing: false, word: s.word.trim() }
      }
      return s
    }).filter(s => s.word !== '')) // Remove if empty
  }

  const handleDragStart = (e, index) => {
    if (skills[index].isEditing) {
      e.preventDefault()
      return
    }
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e, index) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newSkills = [...skills]
    const draggedItem = newSkills[draggedIndex]

    newSkills.splice(draggedIndex, 1)
    newSkills.splice(index, 0, draggedItem)

    setSkills(newSkills)
    setDraggedIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  useEffect(() => {
    if (skills.some(s => s.isEditing)) {
      inputRef.current?.focus()
    }
  }, [skills])

  const handleSave = async () => {
    try {
      setSaving(true)

      const currentIds = skills.filter(s => !s.isNew).map(s => s.id)
      const deletedIds = initialSkills.filter(s => !currentIds.includes(s.id)).map(s => s.id)

      // Delete removed skills
      if (deletedIds.length > 0) {
        const { error: deleteError } = await supabase.from('skills').delete().in('id', deletedIds)
        if (deleteError) throw deleteError
      }

      // Upsert existing & insert new
      const upsertData = skills.map((s, index) => {
        if (s.isNew) {
          return { word: s.word, sort_order: index + 1 }
        } else {
          return { id: s.id, word: s.word, sort_order: index + 1 }
        }
      })

      for (const item of upsertData) {
        if (item.id) {
          const { error } = await supabase.from('skills').update({ word: item.word, sort_order: item.sort_order }).eq('id', item.id)
          if (error) throw error
        } else {
          const { error } = await supabase.from('skills').insert([item])
          if (error) throw error
        }
      }

      toast.success('Skills saved successfully!')
      fetchSkills()
    } catch (error) {
      toast.error(`Error saving skills: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-[var(--border)] shadow-sm pointer-events-none select-none">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <div className="w-48 h-8 bg-[var(--border)]/40 rounded animate-pulse mb-3" />
            <div className="w-72 h-4 bg-[var(--border)]/30 rounded animate-pulse" />
          </div>
          <div className="w-32 h-12 bg-[var(--accent)]/10 rounded-xl animate-pulse" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="p-4 border border-[var(--border)] rounded-xl bg-[var(--bg-alt)] flex items-center justify-between">
              <div className="w-32 h-6 bg-[var(--border)]/40 rounded animate-pulse" />
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded bg-[var(--border)]/30 animate-pulse" />
                <div className="w-8 h-8 rounded bg-[var(--border)]/30 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-[var(--border)] shadow-sm overflow-visible mb-8">
      <div className="sticky top-0 z-20 p-6 border-b border-[var(--border)] flex justify-between items-center bg-white/90 backdrop-blur-md rounded-t-3xl">
        <div>
          <h2 className="text-xl font-bold">Skills (Marquee)</h2>
          <p className="text-xs text-[var(--fg-muted)] mt-1">Double-click to edit • Drag to reorder</p>
        </div>
      </div>

      <div className="p-8">
        <div className="flex flex-wrap gap-3 items-center">
          {skills.map((skill, index) => (
            <div
              key={skill.id}
              draggable={!skill.isEditing}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              onDoubleClick={() => handleDoubleClick(skill.id)}
              className={`flex items-center gap-2 px-4 py-2.5 bg-[var(--bg-alt)] border border-[var(--border)] rounded-full text-sm font-bold text-[var(--fg)] hover:border-[var(--accent)]/50 hover:bg-[var(--surface)] transition-all cursor-grab active:cursor-grabbing group select-none shadow-sm ${draggedIndex === index ? 'opacity-40 scale-95' : 'opacity-100'}`}
            >
              {skill.isEditing ? (
                <input
                  ref={skill.isEditing ? inputRef : null}
                  type="text"
                  value={skill.word}
                  placeholder="Type skill..."
                  onChange={(e) => handleChange(skill.id, e.target.value)}
                  onBlur={(e) => handleBlurOrEnter(skill.id, e)}
                  onKeyDown={(e) => handleBlurOrEnter(skill.id, e)}
                  className="bg-transparent border-none outline-none text-center min-w-[80px] w-auto max-w-[150px] p-0 m-0 font-bold"
                />
              ) : (
                <>
                  <span>{skill.word}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(skill.id) }}
                    className="ml-1 text-[var(--fg-muted)] hover:text-red-500 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </>
              )}
            </div>
          ))}

          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-5 py-2.5 border-2 border-dashed border-[var(--border)] rounded-full text-sm font-bold text-[var(--fg-muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors hover:bg-[var(--surface)]"
          >
            <Plus size={16} /> Add Skill
          </button>
        </div>
      </div>

      {hasChanges() && (
        <div className="fixed bottom-6 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 z-50 bg-[#1e1e2e] border border-white/10 shadow-2xl px-4 py-3 md:px-6 md:py-4 rounded-2xl flex flex-row items-center justify-between gap-3 animate-in slide-in-from-bottom-10 fade-in duration-300 max-w-3xl">
          <span className="font-bold text-white text-sm hidden sm:inline">Careful — you have unsaved changes!</span>
          <span className="font-bold text-white text-sm sm:hidden">Unsaved changes</span>
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={handleReset} 
              disabled={saving}
              className="text-sm font-bold text-white/70 hover:text-white transition-colors"
            >
              Reset
            </button>
            <button 
              onClick={handleSave} 
              disabled={saving}
              className="bg-[var(--accent)] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-[var(--accent)]/90 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : 'Save'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
