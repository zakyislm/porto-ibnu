"use client"

import { useState, useEffect } from 'react'
import { createClient } from '../../utils/supabase/client'
import { uploadFile, deleteFile } from '../../lib/storage'
import { toast } from 'sonner'
import { Save, Loader2, Image as ImageIcon, FileText, X } from 'lucide-react'
import Image from 'next/image'
import ImageCropperModal from './ImageCropperModal'

export default function ProfileEditor() {
  const [initialProfile, setInitialProfile] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pendingImageFile, setPendingImageFile] = useState(null)
  const [pendingImagePreview, setPendingImagePreview] = useState(null)
  const [cropperModal, setCropperModal] = useState({ isOpen: false, src: null })
  const [pendingCVFile, setPendingCVFile] = useState(null)

  const supabase = createClient()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profile')
        .select('*')
        .eq('id', 1)
        .single()
      
      if (error) throw error
      setProfile(data)
      setInitialProfile(data)
    } catch (error) {
      toast.error(`Error loading profile: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const hasChanges = () => {
    if (!initialProfile || !profile) return false
    const isProfileChanged = JSON.stringify(initialProfile) !== JSON.stringify(profile)
    const hasPendingFiles = pendingImageFile !== null || pendingCVFile !== null
    return isProfileChanged || hasPendingFiles
  }

  const handleReset = () => {
    setProfile(initialProfile)
    setPendingImageFile(null)
    setPendingImagePreview(null)
    setPendingCVFile(null)
  }

  const handleSave = async (e) => {
    if (e) e.preventDefault()
    try {
      setSaving(true)
      let updatedProfile = { ...profile }

      // Upload pending image if exists
      if (pendingImageFile) {
        const toastId = toast.loading('Uploading profile picture...')
        const publicUrl = await uploadFile(pendingImageFile, 'porto-ibnughaotz-tzy', 'profile')
        if (profile.image_url) {
          await deleteFile(profile.image_url, 'porto-ibnughaotz-tzy')
        }
        updatedProfile.image_url = publicUrl
        toast.success('Profile picture uploaded!', { id: toastId })
      }

      // Upload pending CV if exists
      if (pendingCVFile) {
        const toastId = toast.loading('Uploading CV...')
        const publicUrl = await uploadFile(pendingCVFile, 'porto-ibnughaotz-tzy', 'cv')
        if (initialProfile.cv_url) {
          await deleteFile(initialProfile.cv_url, 'porto-ibnughaotz-tzy')
        }
        updatedProfile.cv_url = publicUrl
        toast.success('CV uploaded successfully!', { id: toastId })
      } else if (initialProfile.cv_url && !profile.cv_url) {
        const toastId = toast.loading('Deleting CV...')
        await deleteFile(initialProfile.cv_url, 'porto-ibnughaotz-tzy')
        toast.success('CV deleted successfully!', { id: toastId })
      }

      const { error } = await supabase
        .from('profile')
        .update(updatedProfile)
        .eq('id', 1)
      
      if (error) throw error

      setProfile(updatedProfile)
      setPendingImageFile(null)
      setPendingImagePreview(null)
      setPendingCVFile(null)

      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error(`Error saving changes: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large! Maximum size is 5MB.")
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setCropperModal({ isOpen: true, src: reader.result })
    }
    reader.readAsDataURL(file)
    e.target.value = '' // Reset input
  }

  const handleCropComplete = (croppedFile) => {
    setPendingImageFile(croppedFile)
    setPendingImagePreview(URL.createObjectURL(croppedFile))
    setCropperModal({ isOpen: false, src: null })
  }

  const handleCVSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPendingCVFile(file)
    e.target.value = '' // Reset input
  }

  if (loading) {
    return (
      <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-[var(--border)] shadow-sm pointer-events-none select-none">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="w-48 h-8 bg-[var(--border)]/40 rounded animate-pulse mb-3" />
            <div className="w-72 h-4 bg-[var(--border)]/30 rounded animate-pulse" />
          </div>
          <div className="w-full md:w-32 h-12 bg-[var(--accent)]/10 rounded-xl animate-pulse" />
        </div>

        {/* Profile Picture */}
        <div className="bg-[var(--bg-alt)] rounded-[1.5rem] p-6 mb-10 border border-[var(--border)]">
          <div className="w-32 h-5 bg-[var(--border)]/40 rounded animate-pulse mb-6" />
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            <div className="w-32 h-32 bg-[var(--border)]/30 rounded-2xl animate-pulse shrink-0" />
            <div className="flex flex-col gap-4 w-full max-w-md">
              <div className="flex gap-4">
                <div className="w-32 h-10 bg-[var(--border)]/40 rounded-xl animate-pulse" />
                <div className="w-32 h-10 bg-red-100 rounded-xl animate-pulse" />
              </div>
              <div className="w-64 h-3 bg-[var(--border)]/30 rounded animate-pulse" />
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-6 md:items-center">
              <div className="w-24 h-4 bg-[var(--border)]/40 rounded animate-pulse md:text-right" />
              <div className="md:col-span-3">
                <div className="w-full h-12 bg-[var(--bg-alt)] rounded-xl animate-pulse border border-[var(--border)]" />
              </div>
            </div>
          ))}
          
          {/* Textarea */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-6 items-start pt-2">
            <div className="w-32 h-4 bg-[var(--border)]/40 rounded animate-pulse md:text-right md:mt-4" />
            <div className="md:col-span-3">
              <div className="w-full h-32 bg-[var(--bg-alt)] rounded-xl animate-pulse border border-[var(--border)]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <div className="p-8 text-center text-[var(--fg-muted)]">No profile data found. Please run the default SQL insert.</div>
  }

  return (
    <>
      <div className="bg-white rounded-3xl border border-[var(--border)] shadow-sm overflow-visible mb-8">
        <div className="sticky top-0 z-20 p-6 border-b border-[var(--border)] flex justify-between items-center bg-white/90 backdrop-blur-md rounded-t-3xl">
          <h2 className="text-xl font-bold">Profile & Hero Section</h2>
        </div>

        <form className="p-6 space-y-8" onSubmit={handleSave}>
        
        {/* Media Section */}
        <div className="space-y-8 pb-10 border-b border-[var(--border)]">
          
          {/* Photo */}
          <div>
            <label className="block text-sm font-bold text-[var(--fg)] mb-2">Hero Profile Picture</label>
            <p className="text-xs text-[var(--fg-muted)] mb-4">Suggested: 600x800px (3:4 ratio), Max 5MB</p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                {pendingImagePreview ? (
                  <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-2 border-[var(--accent)] shadow-sm shrink-0">
                    <Image src={pendingImagePreview} alt="Pending Profile" fill sizes="128px" className="object-cover" />
                    <button type="button" onClick={() => { setPendingImageFile(null); setPendingImagePreview(null); }} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70">
                      <X size={14} />
                    </button>
                  </div>
                ) : profile.image_url ? (
                  <div className="relative w-32 h-32 rounded-2xl overflow-hidden border border-[var(--border)] shadow-sm shrink-0">
                    <Image src={profile.image_url} alt="Profile" fill sizes="128px" className="object-cover" />
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-2xl border border-dashed border-[var(--border)] flex items-center justify-center bg-[var(--bg-alt)] text-[var(--fg-muted)] shrink-0">
                    <ImageIcon size={32} />
                  </div>
                )}
                
                <div className="flex flex-col gap-4 w-full max-w-md">
                  <label className="cursor-pointer bg-white border border-[var(--border)] px-4 py-2 rounded-xl text-sm font-bold hover:bg-[var(--bg-alt)] transition flex items-center justify-center gap-2 self-start">
                    Upload Picture
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                  </label>
                  
                  <div>
                    <label className="block text-sm font-bold text-[var(--fg)] mb-2">Web Title (Browser Tab)</label>
                    <input 
                      type="text" 
                      className="w-full bg-[var(--bg-alt)] border border-[var(--border)] rounded-xl px-4 py-3 focus:border-[var(--accent)] outline-none" 
                      placeholder="e.g. Ibnu Gaots | Portfolio"
                      value={profile.web_title || ''} 
                      onChange={e => setProfile({...profile, web_title: e.target.value})} 
                    />
                  </div>
                </div>
              </div>
          </div>

          {/* CV */}
          <div className="border-t border-[var(--border)] pt-8">
            <label className="block text-sm font-bold text-[var(--fg)] mb-2">CV / Resume (PDF)</label>
            <p className="text-xs text-[var(--fg-muted)] mb-4">Upload your latest CV in PDF format</p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              {pendingCVFile ? (
                <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-2 border-[var(--accent)] shadow-sm shrink-0 flex flex-col items-center justify-center bg-[var(--bg-alt)] text-[var(--accent)]">
                  <FileText size={32} className="mb-2" />
                  <span className="text-[10px] font-bold text-center w-full truncate px-2">{pendingCVFile.name}</span>
                  <button type="button" onClick={() => setPendingCVFile(null)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70">
                    <X size={14} />
                  </button>
                </div>
              ) : profile.cv_url ? (
                <div className="relative w-32 h-32 rounded-2xl overflow-hidden border border-[var(--border)] shadow-sm shrink-0 flex flex-col items-center justify-center bg-[var(--bg-alt)] text-[var(--accent)] group">
                  <FileText size={32} className="mb-2" />
                  <a href={profile.cv_url} target="_blank" rel="noopener noreferrer" className="text-xs hover:underline font-bold text-center w-full truncate px-2">View CV</a>
                </div>
              ) : (
                <div className="w-32 h-32 rounded-2xl border border-dashed border-[var(--border)] flex items-center justify-center bg-[var(--bg-alt)] text-[var(--fg-muted)] shrink-0">
                  <FileText size={32} />
                </div>
              )}
              
              <div className="flex flex-col gap-4 w-full max-w-md">
                <div className="flex flex-col sm:flex-row gap-4">
                  <label className="cursor-pointer bg-white border border-[var(--border)] px-4 py-2 rounded-xl text-sm font-bold hover:bg-[var(--bg-alt)] transition flex items-center justify-center gap-2 self-start">
                    Upload CV
                    <input type="file" accept=".pdf" className="hidden" onChange={handleCVSelect} />
                  </label>
                  {(profile.cv_url || pendingCVFile) && (
                    <button 
                      type="button"
                      onClick={() => {
                        setPendingCVFile(null);
                        setProfile({ ...profile, cv_url: null });
                      }}
                      className="cursor-pointer bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-100 transition flex items-center justify-center gap-2 self-start"
                    >
                      Delete CV
                    </button>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-[var(--fg)] mb-2">CV Preview Link</label>
                  <input 
                    type="text" 
                    readOnly
                    className="w-full bg-[var(--bg-alt)] border border-[var(--border)] rounded-xl px-4 py-3 focus:border-[var(--accent)] outline-none text-[var(--fg-muted)] cursor-not-allowed" 
                    value={pendingCVFile ? pendingCVFile.name : (profile.cv_url || 'No CV uploaded')} 
                  />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Basic Info */}
        <div className="space-y-6">
          <h3 className="font-bold text-lg mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-[var(--fg)] mb-2">Full Name</label>
              <input type="text" className="w-full bg-[var(--bg-alt)] border border-[var(--border)] rounded-xl px-4 py-3 focus:border-[var(--accent)] outline-none" value={profile.full_name} onChange={e => setProfile({...profile, full_name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-[var(--fg)] mb-2">Title / Profession</label>
              <input type="text" className="w-full bg-[var(--bg-alt)] border border-[var(--border)] rounded-xl px-4 py-3 focus:border-[var(--accent)] outline-none" value={profile.title} onChange={e => setProfile({...profile, title: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-[var(--fg)] mb-2">Short Description (Hero Section)</label>
              <textarea className="w-full bg-[var(--bg-alt)] border border-[var(--border)] rounded-xl px-4 py-3 focus:border-[var(--accent)] outline-none min-h-[80px]" value={profile.short_desc} onChange={e => setProfile({...profile, short_desc: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-[var(--fg)] mb-2">Hero Quote</label>
              <input type="text" className="w-full bg-[var(--bg-alt)] border border-[var(--border)] rounded-xl px-4 py-3 focus:border-[var(--accent)] outline-none" value={profile.quote} onChange={e => setProfile({...profile, quote: e.target.value})} />
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="space-y-6 pt-8 border-t border-[var(--border)]">
          <h3 className="font-bold text-lg mb-4">About Section</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-[var(--fg)] mb-2">About Background Text (Small Label)</label>
              <input type="text" className="w-full bg-[var(--bg-alt)] border border-[var(--border)] rounded-xl px-4 py-3 focus:border-[var(--accent)] outline-none" value={profile.about_bg} onChange={e => setProfile({...profile, about_bg: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-[var(--fg)] mb-2">About Title</label>
              <input type="text" className="w-full bg-[var(--bg-alt)] border border-[var(--border)] rounded-xl px-4 py-3 focus:border-[var(--accent)] outline-none" value={profile.about_title} onChange={e => setProfile({...profile, about_title: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-[var(--fg)] mb-2">Paragraph 1</label>
              <textarea className="w-full bg-[var(--bg-alt)] border border-[var(--border)] rounded-xl px-4 py-3 focus:border-[var(--accent)] outline-none min-h-[100px]" value={profile.about_desc_1} onChange={e => setProfile({...profile, about_desc_1: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-[var(--fg)] mb-2">Paragraph 2</label>
              <textarea className="w-full bg-[var(--bg-alt)] border border-[var(--border)] rounded-xl px-4 py-3 focus:border-[var(--accent)] outline-none min-h-[100px]" value={profile.about_desc_2} onChange={e => setProfile({...profile, about_desc_2: e.target.value})} />
            </div>
          </div>
        </div>

        {/* Status & Footer */}
        <div className="space-y-6 pt-8 border-t border-[var(--border)]">
          <h3 className="font-bold text-lg mb-4">Status & Footer Rhythm</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-[var(--fg)] mb-2">Location</label>
              <input type="text" className="w-full bg-[var(--bg-alt)] border border-[var(--border)] rounded-xl px-4 py-3 focus:border-[var(--accent)] outline-none" value={profile.location} onChange={e => setProfile({...profile, location: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-[var(--fg)] mb-2">Current Role (for Status)</label>
              <input type="text" className="w-full bg-[var(--bg-alt)] border border-[var(--border)] rounded-xl px-4 py-3 focus:border-[var(--accent)] outline-none" value={profile.role} onChange={e => setProfile({...profile, role: e.target.value})} />
            </div>
            <div className="flex items-center gap-4 bg-[var(--bg-alt)] p-4 rounded-xl border border-[var(--border)]">
              <input 
                type="checkbox" 
                id="openToWork" 
                className="w-5 h-5 accent-[var(--accent)]" 
                checked={profile.is_open_to_work} 
                onChange={e => setProfile({...profile, is_open_to_work: e.target.checked})} 
              />
              <label htmlFor="openToWork" className="font-bold cursor-pointer">Is Open to Work?</label>
            </div>
            <div>
              <label className="block text-sm font-bold text-[var(--fg)] mb-2">Open to Work Message</label>
              <input type="text" className="w-full bg-[var(--bg-alt)] border border-[var(--border)] rounded-xl px-4 py-3 focus:border-[var(--accent)] outline-none" value={profile.open_to_work_msg} onChange={e => setProfile({...profile, open_to_work_msg: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-[var(--fg)] mb-2">Footer Rhythm Quote</label>
              <input type="text" className="w-full bg-[var(--bg-alt)] border border-[var(--border)] rounded-xl px-4 py-3 focus:border-[var(--accent)] outline-none" value={profile.rhythm_quote} onChange={e => setProfile({...profile, rhythm_quote: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-[var(--fg)] mb-2">Footer Rhythm Author</label>
              <input type="text" className="w-full bg-[var(--bg-alt)] border border-[var(--border)] rounded-xl px-4 py-3 focus:border-[var(--accent)] outline-none" value={profile.rhythm_author} onChange={e => setProfile({...profile, rhythm_author: e.target.value})} />
            </div>
          </div>
        </div>

      </form>

      {cropperModal.isOpen && (
        <ImageCropperModal
          imageSrc={cropperModal.src}
          aspectRatio={3 / 4}
          onCropComplete={handleCropComplete}
          onCancel={() => setCropperModal({ isOpen: false, src: null })}
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
