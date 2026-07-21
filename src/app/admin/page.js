"use client"

import { useState, useEffect } from 'react'
import ProfileEditor from '../../components/admin/ProfileEditor'
import ProjectsEditor from '../../components/admin/ProjectsEditor'
import ListEditor from '../../components/admin/ListEditor'
import SettingsEditor from '../../components/admin/SettingsEditor'
import SkillsEditor from '../../components/admin/SkillsEditor'
import { LayoutDashboard, Briefcase, Award, FileText, Heart, Settings, LogOut, Menu, X, Home } from 'lucide-react'
import { createClient } from '../../utils/supabase/client'
import { toast } from 'sonner'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('profile')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const supabase = createClient()

  const tabs = [
    { id: 'profile', label: 'Profile & Hero', icon: LayoutDashboard },
    { id: 'values', label: 'Core Values', icon: Heart },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'projects', label: 'Projects', icon: Award },
    { id: 'skills', label: 'Skills', icon: FileText },
  ]

  const handleLogout = async (reason) => {
    if (reason) toast.error(reason)
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  useEffect(() => {
    let inactivityTimer;
    const INACTIVITY_LIMIT = 60 * 60 * 1000; // 1 hour in ms

    const resetTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        handleLogout("Session expired due to 1 hour of inactivity. Please login again.");
      }, INACTIVITY_LIMIT);
    };

    const events = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'];
    resetTimer();
    events.forEach(e => window.addEventListener(e, resetTimer));

    // Client-side auth check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        window.location.href = '/login';
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        window.location.href = '/login';
      }
    });

    return () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      events.forEach(e => window.removeEventListener(e, resetTimer));
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[var(--bg)]">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-[var(--border)] sticky top-0 z-40">
        <h1 className="font-bold tracking-tight">Content Management</h1>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-[var(--bg-alt)] text-[var(--fg)] hover:text-[var(--accent)] rounded-lg transition-colors"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 left-0 z-50 h-screen bg-white border-r border-[var(--border)] shrink-0 flex flex-col transition-transform duration-300 w-56 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}>
        <div className="p-6 border-b border-[var(--border)] hidden md:block">
          <h1 className="text-xl font-bold tracking-tight">Content Management</h1>
        </div>

        <div className="p-4 border-b border-[var(--border)] md:hidden flex justify-between items-center bg-[var(--bg-alt)]">
          <h1 className="font-bold tracking-tight">Menu</h1>
        </div>

        <nav className="p-4 flex-1 overflow-y-auto space-y-1">
          <p className="px-4 text-xs font-bold text-[var(--fg-muted)] uppercase tracking-wider mb-2 mt-4">Content</p>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
                setIsMobileMenuOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === tab.id
                ? 'bg-[var(--accent)] text-white shadow-md'
                : 'text-[var(--fg-muted)] hover:bg-[var(--bg-alt)] hover:text-[var(--fg)]'
                }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}

          <p className="px-4 text-xs font-bold text-[var(--fg-muted)] uppercase tracking-wider mb-2 mt-8">System</p>
          <button
            onClick={() => {
              setActiveTab('settings')
              setIsMobileMenuOpen(false)
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'settings'
              ? 'bg-[var(--accent)] text-white shadow-md'
              : 'text-[var(--fg-muted)] hover:bg-[var(--bg-alt)] hover:text-[var(--fg)]'
              }`}
          >
            <Settings size={18} />
            Access Settings
          </button>
        </nav>

        <div className="p-4 border-t border-[var(--border)] flex flex-col gap-2">
          <a
            href="/"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-[var(--fg-muted)] hover:bg-[var(--bg-alt)] hover:text-[var(--fg)] transition-all"
          >
            <Home size={18} />
            Back to Home
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut size={18} />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {activeTab === 'profile' && <ProfileEditor />}
          {activeTab === 'projects' && <ProjectsEditor />}
          {activeTab === 'settings' && <SettingsEditor />}

          {activeTab === 'values' && (
            <ListEditor
              title="Core Values"
              tableName="values"
              columns={[
                { key: 'title', label: 'Value Title', required: true },
                { key: 'description', label: 'Description', type: 'textarea', required: true },
              ]}
            />
          )}

          {activeTab === 'experience' && (
            <ListEditor
              title="Experience"
              tableName="experience"
              columns={[
                { key: 'org', label: 'Organization / Company', required: true },
                { key: 'role', label: 'Role', required: true },
                { key: 'period', label: 'Time Period (e.g. 2023 - 2024)', required: true },
                { key: 'description', label: 'Description', type: 'textarea', required: true },
              ]}
            />
          )}

          {activeTab === 'skills' && (
            <SkillsEditor />
          )}
        </div>
      </main>
    </div>
  )
}