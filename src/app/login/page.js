"use client"

import { createClient } from '../../utils/supabase/client'
import { useState, Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { ArrowRight, Lock, Loader2 } from 'lucide-react'

function LoginContent() {
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const errorMsg = searchParams.get('error')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        window.location.href = '/admin'
      }
    })
  }, [])

  const handleLogin = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Error logging in:', error.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[var(--accent)]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-[var(--warm)]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-[2rem] p-10 shadow-2xl relative z-10 text-center">
        
        <div className="w-16 h-16 bg-[var(--bg-alt)] border border-[var(--border)] rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
          <Lock size={24} className="text-[var(--accent)]" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight mb-3">Admin Access</h1>
        <p className="text-[var(--fg-muted)] mb-10 text-sm leading-relaxed">
          Sign in to manage your portfolio content, values, and experiences.
        </p>

        {errorMsg && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl text-sm font-medium">
            {errorMsg}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full relative group overflow-hidden bg-white text-black border border-gray-200 rounded-2xl p-4 flex items-center justify-center gap-3 font-semibold hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>
              {/* Google SVG Icon */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.67 15.63 16.89 16.81 15.74 17.58V20.35H19.3C21.38 18.43 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
                <path d="M12 23C14.97 23 17.46 22.02 19.3 20.35L15.74 17.58C14.75 18.25 13.48 18.66 12 18.66C9.13 18.66 6.7 16.73 5.82 14.12H2.15V16.97C3.96 20.57 7.68 23 12 23Z" fill="#34A853"/>
                <path d="M5.82 14.12C5.6 13.45 5.47 12.74 5.47 12C5.47 11.26 5.6 10.55 5.82 9.88V7.03H2.15C1.41 8.5 1 10.2 1 12C1 13.8 1.41 15.5 2.15 16.97L5.82 14.12Z" fill="#FBBC05"/>
                <path d="M12 5.34C13.62 5.34 15.07 5.9 16.21 6.99L19.38 3.81C17.45 2.01 14.96 1 12 1C7.68 1 3.96 3.43 2.15 7.03L5.82 9.88C6.7 7.27 9.13 5.34 12 5.34Z" fill="#EA4335"/>
              </svg>
              <span>Continue with Google</span>
              <ArrowRight size={18} className="absolute right-6 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-gray-400" />
            </>
          )}
        </button>

        <a href="/" className="mt-8 block text-sm text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors">
          &larr; Back to Portfolio
        </a>
      </div>
    </div>
  )
}

export default function Login() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-6 relative overflow-hidden pointer-events-none select-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[var(--accent)]/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-[var(--warm)]/5 rounded-full blur-[100px]" />
        <div className="w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-[2rem] p-10 shadow-2xl relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 bg-[var(--bg-alt)] border border-[var(--border)] rounded-full mb-8 animate-pulse" />
          <div className="w-48 h-8 bg-[var(--border)]/40 rounded animate-pulse mb-3" />
          <div className="w-64 h-4 bg-[var(--border)]/30 rounded animate-pulse mb-2" />
          <div className="w-56 h-4 bg-[var(--border)]/30 rounded animate-pulse mb-10" />
          <div className="w-full h-14 bg-[var(--bg-alt)] border border-[var(--border)] rounded-2xl animate-pulse mb-8" />
          <div className="w-32 h-4 bg-[var(--border)]/30 rounded animate-pulse" />
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
