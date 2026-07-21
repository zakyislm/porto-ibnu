import { LayoutDashboard, Briefcase, Award, FileText, Heart, Settings, LogOut, Menu, Home } from 'lucide-react'

export default function AdminLoading() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[var(--bg)] pointer-events-none select-none">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-[var(--border)] sticky top-0 z-40">
        <div className="w-40 h-6 bg-[var(--border)]/40 rounded animate-pulse" />
        <div className="w-9 h-9 bg-[var(--bg-alt)] rounded-lg animate-pulse" />
      </div>

      {/* Sidebar */}
      <aside className="hidden md:flex sticky top-0 left-0 z-50 h-screen bg-white border-r border-[var(--border)] shrink-0 flex-col w-56">
        <div className="p-6 border-b border-[var(--border)]">
          <div className="w-40 h-6 bg-[var(--border)]/40 rounded animate-pulse" />
        </div>

        <nav className="p-4 flex-1 space-y-1">
          <div className="px-4 mb-2 mt-4">
            <div className="w-16 h-3 bg-[var(--border)]/30 rounded animate-pulse" />
          </div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${i === 1 ? 'bg-[var(--accent)]/10' : ''}`}
            >
              <div className={`w-5 h-5 rounded ${i === 1 ? 'bg-[var(--accent)]/40' : 'bg-[var(--border)]/40'} animate-pulse`} />
              <div className={`h-4 rounded animate-pulse ${i === 1 ? 'bg-[var(--accent)]/30 w-24' : 'bg-[var(--border)]/30 w-20'}`} />
            </div>
          ))}

          <div className="px-4 mb-2 mt-8">
            <div className="w-16 h-3 bg-[var(--border)]/30 rounded animate-pulse" />
          </div>
          <div className="w-full flex items-center gap-3 px-4 py-3 rounded-xl">
            <div className="w-5 h-5 rounded bg-[var(--border)]/40 animate-pulse" />
            <div className="w-24 h-4 rounded bg-[var(--border)]/30 animate-pulse" />
          </div>
        </nav>

        <div className="p-4 border-t border-[var(--border)] flex flex-col gap-2">
          <div className="w-full flex items-center gap-3 px-4 py-3 rounded-xl">
            <div className="w-5 h-5 rounded bg-[var(--border)]/40 animate-pulse" />
            <div className="w-24 h-4 rounded bg-[var(--border)]/30 animate-pulse" />
          </div>
          <div className="w-full flex items-center gap-3 px-4 py-3 rounded-xl">
            <div className="w-5 h-5 rounded bg-red-100 animate-pulse" />
            <div className="w-20 h-4 rounded bg-red-100 animate-pulse" />
          </div>
        </div>
      </aside>

      {/* Main Content (Profile Editor Skeleton) */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          
          <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-[var(--border)] shadow-sm">
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

        </div>
      </main>
    </div>
  )
}
