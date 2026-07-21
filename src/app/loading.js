export default function Loading() {
  return (
    <div className="relative pointer-events-none select-none">
      {/* Background Abstract Circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute rounded-full w-[800px] h-[800px] top-[-200px] right-[-300px] border border-[var(--border)] opacity-20 bg-[var(--accent)]/5 blur-[80px]" />
        <div className="absolute rounded-full w-[600px] h-[600px] top-[40%] left-[-200px] border border-[var(--border)] opacity-20 bg-[var(--accent)]/5 blur-[80px]" />
      </div>

      {/* NAVBAR */}
      <header className="sticky top-0 left-0 right-0 z-40">
        <div className="bg-[var(--bg)]/70 backdrop-blur-xl border-b border-[var(--border)]/50 shadow-sm shadow-black/5">
          <div className="max-w-6xl mx-auto px-6 h-[72px] flex items-center justify-between">
            <div className="w-32 h-8 bg-[var(--border)]/30 rounded animate-pulse" />
            <nav className="hidden md:flex items-center gap-8">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-16 h-4 bg-[var(--border)]/30 rounded animate-pulse" />
              ))}
            </nav>
            <div className="md:hidden w-8 h-8 bg-[var(--border)]/30 rounded animate-pulse" />
          </div>
        </div>
      </header>

      <main className="overflow-hidden">
        {/* HERO */}
        <section className="min-h-[90vh] flex items-center pt-8">
          <div className="max-w-6xl mx-auto px-6 w-full py-16 relative">
            <div className="grid md:grid-cols-2 gap-12 md:gap-8 items-center">
              
              {/* Left: Typography */}
              <div className="relative z-30 max-w-xl space-y-6 md:pr-4">
                <div className="w-48 h-4 bg-[var(--border)]/40 rounded animate-pulse" />
                
                <div className="space-y-4">
                  <div className="w-3/4 h-20 md:h-24 bg-[var(--border)]/40 rounded-xl animate-pulse" />
                  <div className="w-1/2 h-20 md:h-24 bg-[var(--accent)]/20 rounded-xl animate-pulse" />
                </div>
                
                <div className="pt-4 space-y-2">
                  <div className="w-full max-w-sm h-4 bg-[var(--border)]/30 rounded animate-pulse" />
                  <div className="w-3/4 max-w-sm h-4 bg-[var(--border)]/30 rounded animate-pulse" />
                  <div className="w-5/6 max-w-sm h-4 bg-[var(--border)]/30 rounded animate-pulse" />
                </div>
                
                <div className="pt-4 flex flex-wrap items-center gap-4">
                  <div className="w-40 h-14 bg-[var(--border)]/40 rounded-full animate-pulse" />
                  <div className="w-40 h-14 bg-[var(--border)]/30 rounded-full animate-pulse" />
                </div>
              </div>

              {/* Right: Organic Image */}
              <div className="relative flex justify-center md:justify-end z-20">
                <div className="relative w-full max-w-[420px] aspect-[3/4] rounded-t-full rounded-bl-[4rem] rounded-br-[2rem] bg-[var(--border)]/30 animate-pulse border-2 border-[var(--fg-muted)]/10" />
                <div className="hidden md:block absolute top-1/4 -left-8 md:-left-16 bg-[var(--surface)]/50 backdrop-blur-md rounded-2xl p-5 shadow-xl shadow-black/5 w-48 h-32 border border-[var(--border)] animate-pulse" />
              </div>
            </div>
          </div>
        </section>

        {/* MARQUEE */}
        <div className="py-8 overflow-hidden">
          <div className="w-full h-[1px] bg-[var(--border)]/50 relative">
            <div className="absolute left-1/2 -top-1.5 w-3 h-3 border border-[var(--border)] rounded-full -translate-x-1/2 bg-[var(--bg)]" />
          </div>
          <div className="flex gap-8 py-6 px-10 overflow-hidden">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="flex items-center gap-8 shrink-0">
                <div className="w-32 h-8 bg-[var(--border)]/20 rounded animate-pulse" />
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--border)]/30" />
              </div>
            ))}
          </div>
          <div className="w-full h-[1px] bg-[var(--border)]/50 relative">
            <div className="absolute left-1/2 -top-1.5 w-3 h-3 border border-[var(--border)] rounded-full -translate-x-1/2 bg-[var(--bg)]" />
          </div>
        </div>

        {/* VALUES */}
        <section className="max-w-6xl mx-auto px-6 py-32">
          <div className="text-center max-w-2xl mx-auto mb-20 flex flex-col items-center">
            <div className="w-32 h-4 bg-[var(--border)]/40 rounded animate-pulse mb-6" />
            <div className="w-3/4 h-12 bg-[var(--border)]/40 rounded-xl animate-pulse" />
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-8 md:p-10 border border-[var(--border)] rounded-[2rem] h-64 bg-[var(--surface)]/30 animate-pulse">
                <div className="w-2/3 h-8 bg-[var(--border)]/40 rounded mb-6" />
                <div className="space-y-3">
                  <div className="w-full h-4 bg-[var(--border)]/30 rounded" />
                  <div className="w-full h-4 bg-[var(--border)]/30 rounded" />
                  <div className="w-3/4 h-4 bg-[var(--border)]/30 rounded" />
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
