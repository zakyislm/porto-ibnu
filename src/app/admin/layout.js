import { Toaster } from 'sonner'

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-[var(--bg-alt)] font-sans text-[var(--fg)] selection:bg-[var(--accent)] selection:text-white">
      {children}
      <Toaster position="top-right" richColors />
    </div>
  );
}
