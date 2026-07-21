"use client"

import { useState, useEffect } from 'react'
import { createClient } from '../../utils/supabase/client'
import { toast } from 'sonner'
import { Trash2, Edit2, Plus, Save, X, Loader2, ArrowUp, ArrowDown } from 'lucide-react'

export default function ListEditor({ tableName, title, columns }) {
  const [initialItems, setInitialItems] = useState([])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const supabase = createClient()

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order('sort_order', { ascending: true })
      
      if (error) throw error
      const fetched = data || []
      setItems(fetched)
      setInitialItems(fetched)
    } catch (error) {
      toast.error(`Error loading ${title}: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleAddNew = () => {
    const nextSortOrder = items.length > 0 ? Math.max(...items.map(i => i.sort_order)) + 1 : 1
    const newItem = { 
      id: `temp_${Date.now()}`, 
      sort_order: nextSortOrder, 
      isNew: true 
    }
    setItems([...items, newItem])
    setEditingId(newItem.id)
  }

  const handleEditChange = (id, key, value) => {
    setItems(items.map(item => item.id === id ? { ...item, [key]: value } : item))
  }

  const handleDelete = (id) => {
    setItems(items.filter(item => item.id !== id))
  }

  const moveItem = (index, direction) => {
    if (
      (direction === -1 && index === 0) || 
      (direction === 1 && index === items.length - 1)
    ) return;

    const newItems = [...items]
    const itemToMove = newItems[index]
    const itemToSwap = newItems[index + direction]

    // Swap sort_order
    const tempOrder = itemToMove.sort_order
    itemToMove.sort_order = itemToSwap.sort_order
    itemToSwap.sort_order = tempOrder

    // Swap in array
    newItems[index] = itemToSwap
    newItems[index + direction] = itemToMove

    setItems(newItems)
  }

  const hasChanges = () => {
    const sanitize = (list) => list.map(i => {
      const { isNew, id, created_at, ...rest } = i
      return { ...rest, id: isNew ? 'new' : id }
    })
    return JSON.stringify(sanitize(initialItems)) !== JSON.stringify(sanitize(items))
  }

  const handleReset = () => {
    setItems(initialItems)
    setEditingId(null)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      const currentIds = items.filter(s => !s.isNew).map(s => s.id)
      const deletedIds = initialItems.filter(s => !currentIds.includes(s.id)).map(s => s.id)
      
      if (deletedIds.length > 0) {
        const { error: deleteError } = await supabase.from(tableName).delete().in('id', deletedIds)
        if (deleteError) throw deleteError
      }
      
      for (const item of items) {
        if (item.isNew) {
          const { isNew, id, ...insertData } = item
          const { error } = await supabase.from(tableName).insert([insertData])
          if (error) throw error
        } else {
          const { isNew, created_at, ...updateData } = item
          const { error } = await supabase.from(tableName).update(updateData).eq('id', item.id)
          if (error) throw error
        }
      }
      
      toast.success(`${title} saved successfully!`)
      fetchItems()
    } catch (error) {
      toast.error(`Error saving ${title}: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const renderFormInputs = (item) => (
    <div className="space-y-4">
      {columns.map(col => (
        <div key={col.key}>
          <label className="block text-sm font-bold text-[var(--fg)] mb-2">
            {col.label}
          </label>
          {col.type === 'textarea' ? (
            <textarea
              required={col.required}
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-3 focus:border-[var(--accent)] outline-none min-h-[100px]"
              value={item[col.key] || ''}
              onChange={(e) => handleEditChange(item.id, col.key, e.target.value)}
            />
          ) : (
            <input
              type={col.type || 'text'}
              required={col.required}
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-3 focus:border-[var(--accent)] outline-none"
              value={item[col.key] || ''}
              onChange={(e) => handleEditChange(item.id, col.key, e.target.value)}
            />
          )}
        </div>
      ))}
    </div>
  )

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
          {[1, 2, 3].map(i => (
            <div key={i} className="p-6 border border-[var(--border)] rounded-[1.5rem] bg-[var(--bg-alt)]">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-3 w-full max-w-md">
                    <div className="w-48 h-6 bg-[var(--border)]/40 rounded animate-pulse" />
                    <div className="w-3/4 h-4 bg-[var(--border)]/30 rounded animate-pulse" />
                    <div className="w-1/2 h-4 bg-[var(--border)]/30 rounded animate-pulse" />
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <div className="w-8 h-8 rounded bg-[var(--border)]/30 animate-pulse" />
                    <div className="w-8 h-8 rounded bg-[var(--border)]/30 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-3xl border border-[var(--border)] shadow-sm overflow-visible mb-8">
        <div className="sticky top-0 z-20 p-6 border-b border-[var(--border)] flex justify-between items-center bg-white/90 backdrop-blur-md rounded-t-3xl">
          <h2 className="text-xl font-bold">{title}</h2>
        {editingId === null && (
          <button 
            onClick={handleAddNew}
            className="flex items-center gap-2 bg-[var(--accent)] text-white px-4 py-2 rounded-xl text-sm font-bold hover:opacity-90 transition"
          >
            <Plus size={16} /> Add New
          </button>
        )}
      </div>

      <div className="p-6 space-y-4">
        {/* List */}
        {items.length === 0 ? (
          <p className="text-[var(--fg-muted)] text-center py-8">No {title.toLowerCase()} found. Add one!</p>
        ) : (
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={item.id} className={`border border-[var(--border)] rounded-2xl p-5 hover:border-[var(--accent)]/30 transition bg-white group ${tableName === 'skills' ? 'flex items-center justify-between py-4' : ''}`}>
                {editingId === item.id ? (
                  <div>
                    {renderFormInputs(item)}
                    <div className="flex justify-end gap-3 mt-6">
                      <button 
                        type="button" 
                        onClick={() => setEditingId(null)}
                        className="px-4 py-2 rounded-xl font-bold bg-[var(--bg-alt)] text-[var(--fg)] hover:bg-[var(--border)] transition flex items-center gap-2"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={`flex flex-col sm:flex-row items-start justify-between gap-4 ${tableName === 'skills' ? 'w-full sm:items-center' : ''}`}>
                    <div className="flex-1 w-full">
                      {tableName === 'experience' ? (
                        <div>
                          <h4 className="font-bold text-[var(--fg)]">{item.org}</h4>
                          <p className="text-sm text-[var(--fg-muted)] mb-2">{item.role} &middot; {item.period}</p>
                          <p className="text-sm text-[var(--fg)] line-clamp-2">{item.description}</p>
                        </div>
                      ) : tableName === 'skills' ? (
                        <div className="font-medium text-[var(--fg)]">{item.word}</div>
                      ) : (
                        columns.map(col => (
                          <div key={col.key} className="mb-2 last:mb-0">
                            <span className="text-xs font-bold text-[var(--fg-muted)] uppercase tracking-wider">{col.label}</span>
                            <p className="text-[var(--fg)]">{item[col.key]}</p>
                          </div>
                        ))
                      )}
                    </div>
                    
                    <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity shrink-0 w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t border-[var(--border)] sm:border-none">
                      <div className="flex flex-row sm:flex-col mr-2 gap-1 sm:gap-0">
                        <button 
                          disabled={index === 0}
                          onClick={() => moveItem(index, -1)}
                          className="p-2 sm:p-1 text-[var(--fg-muted)] hover:text-[var(--accent)] disabled:opacity-30 bg-[var(--bg-alt)] sm:bg-transparent rounded-lg sm:rounded-none"
                        >
                          <ArrowUp size={16} />
                        </button>
                        <button 
                          disabled={index === items.length - 1}
                          onClick={() => moveItem(index, 1)}
                          className="p-2 sm:p-1 text-[var(--fg-muted)] hover:text-[var(--accent)] disabled:opacity-30 bg-[var(--bg-alt)] sm:bg-transparent rounded-lg sm:rounded-none"
                        >
                          <ArrowDown size={16} />
                        </button>
                      </div>
                      <button 
                        onClick={() => setEditingId(item.id)}
                        className="p-2 bg-[var(--bg-alt)] rounded-lg text-[var(--fg-muted)] hover:text-black transition"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-2 bg-red-50 rounded-lg text-red-500 hover:bg-red-100 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
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
    </>
  )
}
