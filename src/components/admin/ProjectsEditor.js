"use client"

import { useState, useEffect } from 'react'
import { createClient } from '../../utils/supabase/client'
import { uploadFile, deleteFile } from '../../lib/storage'
import { toast } from 'sonner'
import { Trash2, Edit2, Plus, Save, X, Loader2, ArrowUp, ArrowDown, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'
import ImageCropperModal from './ImageCropperModal'

export default function ProjectsEditor() {
  const [initialItems, setInitialItems] = useState([])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [isAdding, setIsAdding] = useState(false)
  const [addForm, setAddForm] = useState({})
  const [cropperModal, setCropperModal] = useState({ isOpen: false, src: null, formState: null, setFormState: null })
  
  const supabase = createClient()

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('sort_order', { ascending: true })
      
      if (error) throw error
      const fetched = data || []
      setItems(fetched)
      setInitialItems(fetched)
    } catch (error) {
      toast.error(`Error loading projects: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleImageSelect = (e, setFormState, currentFormState) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large! Maximum size is 5MB.")
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setCropperModal({ isOpen: true, src: reader.result, setFormState, formState: currentFormState })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleCropComplete = (croppedFile) => {
    cropperModal.setFormState({
      ...cropperModal.formState,
      pendingImageFile: croppedFile,
      pendingImagePreview: URL.createObjectURL(croppedFile)
    })
    setCropperModal({ isOpen: false, src: null, formState: null, setFormState: null })
  }

  const handleAddSubmit = (e) => {
    e.preventDefault()
    const nextSortOrder = items.length > 0 ? Math.max(...items.map(i => i.sort_order)) + 1 : 1
    const newItem = { 
      ...addForm, 
      id: `temp_${Date.now()}`, 
      sort_order: nextSortOrder, 
      isNew: true 
    }
    setItems([...items, newItem])
    setIsAdding(false)
    setAddForm({})
  }

  const handleEditSubmit = (e) => {
    e.preventDefault()
    setItems(items.map(item => item.id === editingId ? { ...item, ...editForm } : item))
    setEditingId(null)
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

    const tempOrder = itemToMove.sort_order
    itemToMove.sort_order = itemToSwap.sort_order
    itemToSwap.sort_order = tempOrder

    newItems[index] = itemToSwap
    newItems[index + direction] = itemToMove

    setItems(newItems)
  }

  const hasChanges = () => {
    const sanitize = (list) => list.map(i => {
      const { isNew, id, created_at, pendingImageFile, pendingImagePreview, ...rest } = i
      return { ...rest, id: isNew ? 'new' : id }
    })
    return JSON.stringify(sanitize(initialItems)) !== JSON.stringify(sanitize(items))
  }

  const handleReset = () => {
    setItems(initialItems)
    setIsAdding(false)
    setEditingId(null)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      const currentIds = items.filter(s => !s.isNew).map(s => s.id)
      const deletedItems = initialItems.filter(s => !currentIds.includes(s.id))
      
      if (deletedItems.length > 0) {
        for (const deleted of deletedItems) {
          if (deleted.image_url) {
            await deleteFile(deleted.image_url, 'porto-ibnughaotz-tzy')
          }
        }
        const { error: deleteError } = await supabase.from('projects').delete().in('id', deletedItems.map(d => d.id))
        if (deleteError) throw deleteError
      }
      
      for (const item of items) {
        let submitData = { ...item }
        if (submitData.pendingImageFile) {
          const toastId = toast.loading('Uploading image for ' + submitData.title)
          const publicUrl = await uploadFile(submitData.pendingImageFile, 'porto-ibnughaotz-tzy', 'projects')
          
          if (submitData.image_url && !submitData.isNew) {
             await deleteFile(submitData.image_url, 'porto-ibnughaotz-tzy')
          }
          submitData.image_url = publicUrl
          toast.success('Image uploaded!', { id: toastId })
        }
        
        delete submitData.pendingImageFile
        delete submitData.pendingImagePreview

        if (submitData.isNew) {
          const { isNew, id, ...insertData } = submitData
          const { error } = await supabase.from('projects').insert([insertData])
          if (error) throw error
        } else {
          const { isNew, created_at, ...updateData } = submitData
          const { error } = await supabase.from('projects').update(updateData).eq('id', submitData.id)
          if (error) throw error
        }
      }
      
      toast.success('Projects saved successfully!')
      fetchItems()
    } catch (error) {
      toast.error(`Error saving projects: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const renderFormInputs = (formState, setFormState) => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-bold text-[var(--fg)] mb-2">Project Image</label>
        <p className="text-xs text-[var(--fg-muted)] mb-4">Suggested: 800x600px (4:3 ratio), Max 5MB</p>
        <div className="flex items-center gap-4">
          {formState.pendingImagePreview ? (
            <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-[var(--accent)] shadow-sm">
              <Image src={formState.pendingImagePreview} alt="Preview" fill sizes="96px" className="object-cover" />
              <button type="button" onClick={() => {
                const newState = { ...formState }
                delete newState.pendingImageFile
                delete newState.pendingImagePreview
                setFormState(newState)
              }} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70">
                <X size={14} />
              </button>
            </div>
          ) : formState.image_url ? (
            <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-[var(--border)]">
              <Image src={formState.image_url} alt="Preview" fill sizes="96px" className="object-cover" />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-xl border border-dashed border-[var(--border)] flex items-center justify-center bg-[var(--bg)] text-[var(--fg-muted)]">
              <ImageIcon size={24} />
            </div>
          )}
          <label className="cursor-pointer bg-white border border-[var(--border)] px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-50 transition flex items-center gap-2">
            Choose Image
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={(e) => handleImageSelect(e, setFormState, formState)}
            />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-[var(--fg)] mb-2">Title *</label>
          <input
            type="text"
            required
            className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-3 focus:border-[var(--accent)] outline-none"
            value={formState.title || ''}
            onChange={(e) => setFormState({ ...formState, title: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-[var(--fg)] mb-2">Year</label>
          <input
            type="text"
            placeholder="e.g. 2026"
            className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-3 focus:border-[var(--accent)] outline-none"
            value={formState.year || ''}
            onChange={(e) => setFormState({ ...formState, year: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-[var(--fg)] mb-2">External Link</label>
        <input
          type="url"
          placeholder="https://"
          className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-3 focus:border-[var(--accent)] outline-none"
          value={formState.link || ''}
          onChange={(e) => setFormState({ ...formState, link: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-[var(--fg)] mb-2">Description *</label>
        <textarea
          required
          className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-3 focus:border-[var(--accent)] outline-none min-h-[100px]"
          value={formState.description || ''}
          onChange={(e) => setFormState({ ...formState, description: e.target.value })}
        />
      </div>
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
              <div className="flex gap-6 items-start">
                <div className="w-32 h-24 bg-[var(--border)]/30 rounded-xl animate-pulse shrink-0 hidden sm:block" />
                <div className="w-full space-y-3">
                  <div className="flex justify-between">
                    <div className="w-48 h-6 bg-[var(--border)]/40 rounded animate-pulse" />
                    <div className="flex gap-2">
                      <div className="w-8 h-8 rounded bg-[var(--border)]/30 animate-pulse" />
                      <div className="w-8 h-8 rounded bg-[var(--border)]/30 animate-pulse" />
                    </div>
                  </div>
                  <div className="w-3/4 h-4 bg-[var(--border)]/30 rounded animate-pulse" />
                  <div className="w-1/2 h-4 bg-[var(--border)]/30 rounded animate-pulse" />
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
          <h2 className="text-xl font-bold">Projects</h2>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-[var(--accent)] text-white px-4 py-2 rounded-xl text-sm font-bold hover:opacity-90 transition"
          >
            <Plus size={16} /> Add Project
          </button>
        )}
      </div>

      <div className="p-6 space-y-4">
        {isAdding && (
          <div className="bg-[var(--bg-alt)] p-6 rounded-2xl border border-[var(--border)] mb-6">
            <h3 className="font-bold mb-4">Add New Project</h3>
            <form onSubmit={handleAddSubmit}>
              {renderFormInputs(addForm, setAddForm)}
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 rounded-xl font-bold text-[var(--fg-muted)] hover:bg-[var(--border)] transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 rounded-xl font-bold bg-[var(--accent)] text-white hover:opacity-90 transition flex items-center gap-2"
                >
                  <Save size={16} /> Apply
                </button>
              </div>
            </form>
          </div>
        )}

        {items.length === 0 && !isAdding ? (
          <p className="text-[var(--fg-muted)] text-center py-8">No projects found. Add one!</p>
        ) : (
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={item.id} className="border border-[var(--border)] rounded-2xl p-6 hover:border-[var(--accent)]/30 transition bg-white group">
                {editingId === item.id ? (
                  <form onSubmit={handleEditSubmit}>
                    {renderFormInputs(editForm, setEditForm)}
                    <div className="flex justify-end gap-3 mt-6">
                      <button 
                        type="button" 
                        onClick={() => setEditingId(null)}
                        className="px-4 py-2 rounded-xl font-bold text-[var(--fg-muted)] hover:bg-[var(--border)] transition flex items-center gap-2"
                      >
                        <X size={16} /> Cancel
                      </button>
                      <button 
                        type="submit"
                        className="px-4 py-2 rounded-xl font-bold bg-[var(--accent)] text-white hover:opacity-90 transition flex items-center gap-2"
                      >
                        <Save size={16} /> Apply
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 w-full">
                      {item.image_url ? (
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-[var(--border)]">
                          <Image src={item.image_url} alt={item.title} fill sizes="64px" className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-xl border border-dashed border-[var(--border)] shrink-0 flex items-center justify-center bg-[var(--bg)] text-[var(--fg-muted)]">
                          <ImageIcon size={20} />
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-[var(--fg)]">{item.title} {item.year && <span className="text-xs font-normal text-[var(--fg-muted)] ml-2">{item.year}</span>}</h4>
                        <p className="text-sm text-[var(--fg-muted)] mt-1">{item.description}</p>
                        {item.link && (
                          <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--accent)] hover:underline mt-2 inline-block">
                            {item.link}
                          </a>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity shrink-0 w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t border-[var(--border)] sm:border-none">
                      <div className="flex flex-row sm:flex-col mr-2 gap-1 sm:gap-0">
                        <button disabled={index === 0} onClick={() => moveItem(index, -1)} className="p-2 sm:p-1 text-[var(--fg-muted)] hover:text-[var(--accent)] disabled:opacity-30 bg-[var(--bg-alt)] sm:bg-transparent rounded-lg sm:rounded-none"><ArrowUp size={16} /></button>
                        <button disabled={index === items.length - 1} onClick={() => moveItem(index, 1)} className="p-2 sm:p-1 text-[var(--fg-muted)] hover:text-[var(--accent)] disabled:opacity-30 bg-[var(--bg-alt)] sm:bg-transparent rounded-lg sm:rounded-none"><ArrowDown size={16} /></button>
                      </div>
                      <button onClick={() => { setEditingId(item.id); setEditForm(item); }} className="p-2 bg-[var(--bg-alt)] rounded-lg text-[var(--fg-muted)] hover:text-black transition"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(item.id, item.image_url)} className="p-2 text-[var(--fg-muted)] hover:text-red-500 hover:bg-red-50 rounded-lg transition" title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {cropperModal.isOpen && (
        <ImageCropperModal
          imageSrc={cropperModal.src}
          aspectRatio={4 / 3}
          onCropComplete={handleCropComplete}
          onCancel={() => setCropperModal({ isOpen: false, src: null, formState: null, setFormState: null })}
        />
      )}
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
