"use client"

import { useState, useEffect } from 'react'
import { createClient } from '../../utils/supabase/client'
import { toast } from 'sonner'
import { Trash2, Plus, ShieldAlert, Users, Loader2, Link as LinkIcon, ArrowUp, ArrowDown } from 'lucide-react'

export default function SettingsEditor() {
  const [initialAdmins, setInitialAdmins] = useState([])
  const [admins, setAdmins] = useState([])
  const [newEmail, setNewEmail] = useState('')
  
  const [initialLinks, setInitialLinks] = useState([])
  const [links, setLinks] = useState([])
  const [newLinkUrl, setNewLinkUrl] = useState('')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    Promise.all([fetchAdmins(), fetchLinks()]).finally(() => setLoading(false))
  }, [])

  const fetchAdmins = async () => {
    try {
      const { data, error } = await supabase
        .from('whitelisted_admins')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      const fetched = data || []
      setAdmins(fetched)
      setInitialAdmins(fetched)
    } catch (error) {
      toast.error('Failed to load admins: ' + error.message)
    }
  }

  const fetchLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('social_links')
        .select('*')
        .order('index', { ascending: true })
      
      if (error) throw error
      const fetched = (data || []).map(l => {
        if (l.platform === 'Email' && l.url.startsWith('mailto:')) {
          return { ...l, url: l.url.replace('mailto:', '') }
        }
        return l;
      })
      setLinks(fetched)
      setInitialLinks(fetched)
    } catch (error) {
      toast.error('Failed to load social links: ' + error.message)
    }
  }

  const handleAddAdmin = (e) => {
    e.preventDefault()
    if (!newEmail.trim()) return

    const emailStr = newEmail.trim()
    if (admins.find(a => a.email === emailStr)) {
      toast.error(`${emailStr} is already in the list.`)
      return
    }

    setAdmins([{ email: emailStr, created_at: new Date().toISOString() }, ...admins])
    setNewEmail('')
  }

  const handleRemoveAdmin = (email) => {
    setAdmins(admins.filter(a => a.email !== email))
  }

  const detectPlatform = (url) => {
    url = url.toLowerCase();
    const platforms = [
      { key: 'instagram.com', name: 'Instagram' },
      { key: 'linkedin.com', name: 'LinkedIn' },
      { key: 'github.com', name: 'GitHub' },
      { key: 'twitter.com', name: 'Twitter' },
      { key: 'x.com', name: 'Twitter' },
      { key: 'wa.me', name: 'WhatsApp' },
      { key: 'whatsapp.com', name: 'WhatsApp' },
      { key: 'mailto:', name: 'Email' },
      { key: '@', name: 'Email' },
      { key: 'youtube.com', name: 'YouTube' },
      { key: 'tiktok.com', name: 'TikTok' },
      { key: 'facebook.com', name: 'Facebook' },
      { key: 'medium.com', name: 'Medium' },
      { key: 'behance.net', name: 'Behance' },
      { key: 'dribbble.com', name: 'Dribbble' },
      { key: 'spotify.com', name: 'Spotify' },
      { key: 'pinterest.com', name: 'Pinterest' },
      { key: 'reddit.com', name: 'Reddit' },
      { key: 'discord.com', name: 'Discord' },
      { key: 'discord.gg', name: 'Discord' },
      { key: 'telegram.me', name: 'Telegram' },
      { key: 't.me', name: 'Telegram' },
      { key: 'snapchat.com', name: 'Snapchat' },
      { key: 'twitch.tv', name: 'Twitch' },
      { key: 'vimeo.com', name: 'Vimeo' },
      { key: 'soundcloud.com', name: 'SoundCloud' },
      { key: 'threads.net', name: 'Threads' },
      { key: 'line.me', name: 'LINE' },
      { key: 'gitlab.com', name: 'GitLab' },
      { key: 'bitbucket.org', name: 'Bitbucket' },
      { key: 'substack.com', name: 'Substack' },
      { key: 'notion.so', name: 'Notion' },
    ];
    
    for (const p of platforms) {
      if (url.includes(p.key)) return p.name;
    }
    return 'Website';
  }

  const handleAddLink = (e) => {
    e.preventDefault()
    if (!newLinkUrl.trim()) return

    let urlStr = newLinkUrl.trim()
    let displayUrl = urlStr
    if (!urlStr.startsWith('http') && !urlStr.startsWith('mailto:') && !urlStr.startsWith('tel:')) {
      if (urlStr.includes('@') && !urlStr.includes('/')) {
        // keep as is for display (no mailto:)
        urlStr = 'mailto:' + urlStr // strictly for platform detection if needed, though detectPlatform uses '@'
      } else {
        urlStr = 'https://' + urlStr
        displayUrl = urlStr
      }
    }

    const platform = detectPlatform(urlStr)
    const newLink = {
      id: `temp-${Date.now()}`,
      url: displayUrl,
      platform,
      index: links.length
    }

    setLinks([...links, newLink])
    setNewLinkUrl('')
  }

  const handleRemoveLink = (id) => {
    const newLinks = links.filter(l => l.id !== id).map((l, i) => ({ ...l, index: i }))
    setLinks(newLinks)
  }

  const handleUpdateLinkUrl = (index, newUrl) => {
    const newLinks = [...links];
    newLinks[index] = { ...newLinks[index], url: newUrl };
    
    // Auto-detect platform again but allow fallback
    let urlStr = newUrl.trim()
    if (!urlStr.startsWith('http') && !urlStr.startsWith('mailto:') && !urlStr.startsWith('tel:')) {
      if (urlStr.includes('@') && !urlStr.includes('/')) {
        // it's an email, don't prepend anything
      } else {
        urlStr = 'https://' + urlStr
      }
    }
    newLinks[index].platform = detectPlatform(urlStr);
    
    setLinks(newLinks);
  }

  const moveLink = (index, direction) => {
    const newLinks = [...links];
    const temp = newLinks[index];
    newLinks[index] = newLinks[index + direction];
    newLinks[index + direction] = temp;
    
    // Update indices
    const updated = newLinks.map((item, i) => ({ ...item, index: i }));
    setLinks(updated);
  };

  const sanitizeLinks = (list) => list.map(l => ({ url: l.url, platform: l.platform, index: l.index }))

  const hasChanges = () => {
    const initialEmails = initialAdmins.map(a => a.email).sort().join(',')
    const currentEmails = admins.map(a => a.email).sort().join(',')
    
    const initialLinksStr = JSON.stringify(sanitizeLinks(initialLinks))
    const currentLinksStr = JSON.stringify(sanitizeLinks(links))
    
    return (initialEmails !== currentEmails) || (initialLinksStr !== currentLinksStr)
  }

  const handleReset = () => {
    setAdmins(initialAdmins)
    setNewEmail('')
    setLinks(initialLinks)
    setNewLinkUrl('')
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      // -- Save Admins --
      const initialEmails = initialAdmins.map(a => a.email)
      const currentEmails = admins.map(a => a.email)
      
      const toAddAdmins = currentEmails.filter(e => !initialEmails.includes(e))
      const toRemoveAdmins = initialEmails.filter(e => !currentEmails.includes(e))
      
      if (toRemoveAdmins.length > 0) {
        const { error } = await supabase.from('whitelisted_admins').delete().in('email', toRemoveAdmins)
        if (error) throw error
      }
      
      if (toAddAdmins.length > 0) {
        const { error } = await supabase.from('whitelisted_admins').insert(toAddAdmins.map(email => ({ email })))
        if (error) throw error
      }

      // -- Save Social Links --
      const toDeleteLinks = initialLinks.filter(il => !links.find(l => l.id === il.id));
      const toUpdateLinks = links.filter(l => !l.id.toString().startsWith('temp-') && JSON.stringify(sanitizeLinks([l])) !== JSON.stringify(sanitizeLinks([initialLinks.find(il => il.id === l.id)])));
      const toInsertLinks = links.filter(l => l.id.toString().startsWith('temp-'));

      if (toDeleteLinks.length > 0) {
        const { error } = await supabase.from('social_links').delete().in('id', toDeleteLinks.map(l => l.id));
        if (error) throw error;
      }

      if (toUpdateLinks.length > 0) {
        for (const link of toUpdateLinks) {
          const { error } = await supabase.from('social_links').update({ url: link.url, platform: link.platform, index: link.index }).eq('id', link.id);
          if (error) throw error;
        }
      }

      if (toInsertLinks.length > 0) {
        const insertData = toInsertLinks.map(l => ({ url: l.url, platform: l.platform, index: l.index }));
        const { error } = await supabase.from('social_links').insert(insertData);
        if (error) throw error;
      }
      
      toast.success('Settings saved successfully!')
      fetchAdmins()
      fetchLinks()
    } catch (error) {
      toast.error(`Error saving settings: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="max-w-4xl mx-auto py-12 px-6">
        <div className="flex items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Access Settings</h1>
            <p className="text-[var(--fg-muted)]">Manage who can access the admin dashboard & your social links</p>
          </div>
        </div>

        {/* --- Whitelisted Admins Section --- */}
        <div className="bg-white rounded-3xl border border-[var(--border)] shadow-sm overflow-hidden mb-8">
          <div className="p-8 border-b border-[var(--border)]">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
              Whitelisted Admins
            </h2>
            <p className="text-sm text-[var(--fg-muted)] mb-6">
              Emails listed here are allowed to log in via Google and edit your portfolio. 
              (Note: The Master Admin is automatically allowed via environment variables).
            </p>

            <form onSubmit={handleAddAdmin} className="flex flex-col sm:flex-row gap-4">
              <input 
                type="email" 
                required
                placeholder="Enter Google email to whitelist..." 
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="flex-1 bg-[var(--bg-alt)] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
              <button 
                type="submit" 
                className="bg-[var(--accent)] text-white px-6 py-3 rounded-xl font-bold hover:bg-[var(--accent)]/90 transition-colors flex items-center gap-2"
              >
                <Plus size={18} />
                Add Admin
              </button>
            </form>
          </div>

          <div className="p-0">
            {loading ? (
              <div className="p-6 pointer-events-none select-none">
                {[1, 2].map(i => (
                  <div key={i} className="flex justify-between items-center py-4 border-b border-[var(--border)] last:border-0">
                    <div className="space-y-2">
                      <div className="w-48 h-5 bg-[var(--border)]/40 rounded animate-pulse" />
                      <div className="w-32 h-3 bg-[var(--border)]/30 rounded animate-pulse" />
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-[var(--border)]/30 animate-pulse" />
                  </div>
                ))}
              </div>
            ) : admins.length === 0 ? (
              <div className="p-8 text-center text-[var(--fg-muted)]">
                No extra admins added yet. Only the Master Admin can access.
              </div>
            ) : (
              <ul className="divide-y divide-[var(--border)]">
                {admins.map(admin => (
                  <li key={admin.email} className="p-6 flex items-center justify-between hover:bg-[var(--bg-alt)]/50 transition-colors">
                    <div>
                      <p className="font-bold">{admin.email}</p>
                      <p className="text-xs text-[var(--fg-muted)] mt-1">Added {new Date(admin.created_at).toLocaleDateString()}</p>
                    </div>
                    <button 
                      onClick={() => handleRemoveAdmin(admin.email)}
                      className="p-3 text-[var(--fg-muted)] hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      title="Remove access"
                    >
                      <Trash2 size={18} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* --- Social Links Section --- */}
        <div className="bg-white rounded-3xl border border-[var(--border)] shadow-sm overflow-hidden mb-24">
          <div className="p-8 border-b border-[var(--border)]">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
              Social Links
            </h2>
            <p className="text-sm text-[var(--fg-muted)] mb-6">
              Add your social media profiles here. They will appear in the footer of your portfolio.
              The platform name is detected automatically from the URL.
            </p>

            <form onSubmit={handleAddLink} className="flex flex-col sm:flex-row gap-4">
              <input 
                type="text" 
                required
                placeholder="e.g. https://instagram.com/username" 
                value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
                className="flex-1 bg-[var(--bg-alt)] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
              <button 
                type="submit" 
                className="bg-[var(--accent)] text-white px-6 py-3 rounded-xl font-bold hover:bg-[var(--accent)]/90 transition-colors flex items-center shrink-0 gap-2"
              >
                <Plus size={18} />
                Add Link
              </button>
            </form>
          </div>

          <div className="p-0">
            {loading ? (
              <div className="p-6 space-y-6 pointer-events-none select-none">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-4 items-end pb-6 border-b border-[var(--border)] last:border-0 last:pb-0">
                    <div className="flex-1 space-y-2">
                      <div className="w-24 h-5 bg-[var(--border)]/40 rounded animate-pulse" />
                      <div className="w-full h-10 bg-[var(--border)]/30 rounded-xl animate-pulse" />
                    </div>
                    <div className="flex gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[var(--border)]/30 animate-pulse" />
                      <div className="w-8 h-8 rounded-lg bg-[var(--border)]/30 animate-pulse" />
                      <div className="w-10 h-10 rounded-xl bg-[var(--border)]/30 animate-pulse ml-2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : links.length === 0 ? (
              <div className="p-8 text-center text-[var(--fg-muted)]">
                No social links added yet. Add one above!
              </div>
            ) : (
              <ul className="divide-y divide-[var(--border)]">
                {links.map((link, index) => (
                  <li key={link.id} className="p-6 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-[var(--bg-alt)]/50 transition-colors group">
                    <div className="flex-1 w-full">
                      <p className="font-bold text-[var(--fg)] mb-2">{link.platform}</p>
                      <input 
                        type="text"
                        value={link.url}
                        onChange={(e) => handleUpdateLinkUrl(index, e.target.value)}
                        className="w-full bg-white border border-[var(--border)] rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
                      />
                    </div>
                    
                    <div className="flex flex-row items-center gap-2 shrink-0">
                      <button 
                        disabled={index === 0}
                        onClick={() => moveLink(index, -1)}
                        className="p-2 sm:p-1 text-[var(--fg-muted)] hover:text-[var(--accent)] disabled:opacity-30 bg-[var(--bg-alt)] sm:bg-transparent rounded-lg sm:rounded-none"
                      >
                        <ArrowUp size={16} />
                      </button>
                      <button 
                        disabled={index === links.length - 1}
                        onClick={() => moveLink(index, 1)}
                        className="p-2 sm:p-1 text-[var(--fg-muted)] hover:text-[var(--accent)] disabled:opacity-30 bg-[var(--bg-alt)] sm:bg-transparent rounded-lg sm:rounded-none"
                      >
                        <ArrowDown size={16} />
                      </button>
                      <button 
                        onClick={() => handleRemoveLink(link.id)}
                        className="p-3 text-[var(--fg-muted)] hover:text-red-500 hover:bg-red-50 rounded-xl transition-all ml-2"
                        title="Remove link"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
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
