import { Toaster } from 'sonner'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-[var(--bg-alt)] font-sans text-[var(--fg)] selection:bg-[var(--accent)] selection:text-white">
      {children}
      <Toaster position="top-right" richColors />
    </div>
  );
}
