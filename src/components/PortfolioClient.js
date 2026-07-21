"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Heart, Lightbulb, TrendingUp, Quote, Menu, X, Mail, User } from "lucide-react";
import { Whatsapp } from "iconoir-react";
import GithubOriginal from "devicons-react/lib/icons/GithubOriginal";
import myImage from "../app/image.png"; // Ensure correct relative path




/* ── Scroll Reveal ── */
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("visible")),
      { threshold: 0.08 }
    );
    ref.current?.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return ref;
}

/* ── Navbar hide/show ── */
function useNavbarScroll() {
  const [visible, setVisible] = useState(true);
  const lastY = useRef(0);
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setVisible(y < 600 || y < lastY.current);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return visible;
}

/* ── Interactive JS Marquee ── */
function useMarqueeScroll() {
  const scrollRef = useRef(null);
  
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let animationFrameId;
    let isPaused = false;
    let isDragging = false;
    let startX;
    let scrollLeft;
    let pauseTimeout;

    const scroll = () => {
      if (!isPaused && !isDragging) {
        el.scrollLeft += 1;
      }
      
      // Infinite loop wrap-around
      if (el.scrollLeft >= el.scrollWidth / 2) {
        el.scrollLeft -= el.scrollWidth / 2;
      } else if (el.scrollLeft <= 0) {
        el.scrollLeft += el.scrollWidth / 2;
      }
      
      animationFrameId = requestAnimationFrame(scroll);
    };
    animationFrameId = requestAnimationFrame(scroll);

    const handleInteraction = () => {
      isPaused = true;
      clearTimeout(pauseTimeout);
      pauseTimeout = setTimeout(() => {
        isPaused = false;
      }, 1000); // Resume 1s after last manual scroll/drag
    };

    el.addEventListener('wheel', handleInteraction, { passive: true });
    el.addEventListener('touchstart', handleInteraction, { passive: true });
    el.addEventListener('touchmove', handleInteraction, { passive: true });

    const onMouseDown = (e) => {
      isDragging = true;
      isPaused = true;
      startX = e.pageX - el.offsetLeft;
      scrollLeft = el.scrollLeft;
      el.style.cursor = 'grabbing';
    };
    const onMouseLeave = () => {
      if (isDragging) {
        isDragging = false;
        el.style.cursor = 'grab';
        handleInteraction();
      }
    };
    const onMouseUp = () => {
      if (isDragging) {
        isDragging = false;
        el.style.cursor = 'grab';
        handleInteraction();
      }
    };
    const onMouseMove = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startX) * 1.5;
      el.scrollLeft = scrollLeft - walk;
    };

    el.addEventListener('mousedown', onMouseDown);
    el.addEventListener('mouseleave', onMouseLeave);
    el.addEventListener('mouseup', onMouseUp);
    el.addEventListener('mousemove', onMouseMove);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(pauseTimeout);
      el.removeEventListener('wheel', handleInteraction);
      el.removeEventListener('touchstart', handleInteraction);
      el.removeEventListener('touchmove', handleInteraction);
      el.removeEventListener('mousedown', onMouseDown);
      el.removeEventListener('mouseleave', onMouseLeave);
      el.removeEventListener('mouseup', onMouseUp);
      el.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return scrollRef;
}

const YEAR = new Date().getFullYear();

// Mapping icon names from DB to Lucide components
const iconMap = {
  Heart,
  Lightbulb,
  TrendingUp,
  Quote,
};

export default function PortfolioClient({ data }) {
  const containerRef = useReveal();
  const navVisible = useNavbarScroll();
  const marqueeRef = useMarqueeScroll();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const headerRef = useRef(null);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    const email = e.target.email.value;
    const message = e.target.message.value;
    
    const emailLink = socialLinks.find(l => l.platform.toLowerCase() === 'email');
    // If url has mailto:, use it directly, else prepend mailto:
    let recipient = emailLink ? emailLink.url : 'ibnugaots231206@gmail.com';
    if (!recipient.startsWith('mailto:')) {
      recipient = 'mailto:' + recipient;
    }
    
    const mailto = `${recipient}?subject=Portfolio Contact from ${encodeURIComponent(name)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)}`;
    window.location.href = mailto;
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  const { profile, values, experience, projects, skills, socialLinks = [] } = data;
  const p = profile || {};
  const firstName = p.full_name ? p.full_name.split(' ')[0] : 'Ibnu';
  const lastName = p.full_name ? p.full_name.substring(p.full_name.indexOf(' ') + 1) : 'Ghaots';

  const emailLinkObj = socialLinks.find(link => link.platform === 'Email');
  let emailLink = emailLinkObj ? emailLinkObj.url : "mailto:ibnugaots231206@gmail.com";
  if (emailLinkObj && !emailLink.startsWith('mailto:')) {
    emailLink = 'mailto:' + emailLink;
  }
  const emailText = emailLink.replace('mailto:', '');

  const waLinkObj = socialLinks.find(link => link.platform === 'WhatsApp');
  const waLink = waLinkObj ? waLinkObj.url : "https://wa.me/6288977039633";
  let waText = "+62 889 7703 9633";
  if (waLinkObj) {
    if (waLink.includes('wa.me/')) {
      waText = '+' + waLink.split('wa.me/')[1];
    } else if (waLink.includes('api.whatsapp.com/send?phone=')) {
      waText = '+' + waLink.split('phone=')[1].split('&')[0];
    } else {
      waText = waLink;
    }
  }

  return (
    <div ref={containerRef} className="relative">

      {/* Background Abstract Circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute rounded-full w-[800px] h-[800px] top-[-200px] right-[-300px] border border-[var(--border)] opacity-20 bg-[var(--accent)]/5 blur-[80px]" />
        <div className="absolute rounded-full w-[600px] h-[600px] top-[40%] left-[-200px] border border-[var(--border)] opacity-20 bg-[var(--accent)]/5 blur-[80px]" />
      </div>

      {/* ═══════════ TOP BANNER (STATIC) ═══════════ */}
      {p.is_open_to_work && (
        <div className="bg-[var(--accent)] text-white text-center py-2 px-4 text-xs tracking-[0.15em] font-bold flex items-center justify-center gap-3 relative z-50">
          {p.open_to_work_msg}
        </div>
      )}

      {/* ═══════════ NAVBAR ═══════════ */}
      <header ref={headerRef} className={`sticky top-0 left-0 right-0 z-40 transition-transform duration-300 ${navVisible ? "translate-y-0" : "-translate-y-full"}`}>
        <div className="bg-[var(--bg)]/70 backdrop-blur-xl border-b border-[var(--border)]/50 relative z-50 shadow-sm shadow-black/5">
          <div className="max-w-6xl mx-auto px-6 h-[72px] flex items-center justify-between">
            <a href="#" className="text-2xl font-bold tracking-tight group">
              {p.full_name || 'Ibnu Gaots'}<span className="text-[var(--accent)] group-hover:opacity-70 transition-opacity">.</span>
            </a>
            <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium text-[var(--fg-muted)]">
              <a href="#about" className="link-underline hover:text-[var(--fg)] transition-colors">About</a>
              <a href="#values" className="link-underline hover:text-[var(--fg)] transition-colors">Values</a>
              <a href="#experience" className="link-underline hover:text-[var(--fg)] transition-colors">Experience</a>
              <a href="#work" className="link-underline hover:text-[var(--fg)] transition-colors">Work</a>
              <a href="/admin" title="Admin Login" className="p-2 ml-1 text-[var(--fg-muted)] hover:text-[var(--accent)] hover:bg-[var(--surface)] rounded-full transition-all">
                <User size={20} />
              </a>
            </nav>
            <button className="md:hidden p-2 -mr-2 text-[var(--fg)] transition-transform duration-300" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* ═══════════ MOBILE MENU DROPDOWN ═══════════ */}
        <div className={`absolute top-full left-0 right-0 bg-[var(--surface)] border-b border-[var(--border)] shadow-xl transition-all duration-300 overflow-hidden md:hidden ${mobileMenuOpen ? 'max-h-96 py-6 opacity-100' : 'max-h-0 py-0 opacity-0'}`}>
          <nav className="flex flex-col items-center gap-6 text-lg font-bold tracking-tight text-[var(--fg)]">
            <a href="#about" onClick={() => setMobileMenuOpen(false)} className="hover:text-[var(--accent)] transition-colors">About</a>
            <a href="#values" onClick={() => setMobileMenuOpen(false)} className="hover:text-[var(--accent)] transition-colors">Values</a>
            <a href="#experience" onClick={() => setMobileMenuOpen(false)} className="hover:text-[var(--accent)] transition-colors">Experience</a>
            <a href="#work" onClick={() => setMobileMenuOpen(false)} className="hover:text-[var(--accent)] transition-colors">Work</a>
            <a href="/admin" onClick={() => setMobileMenuOpen(false)} className="p-3 text-[var(--fg-muted)] hover:text-[var(--accent)] hover:bg-[var(--surface)] rounded-full transition-colors mt-2">
              <User size={24} />
            </a>
          </nav>
        </div>
      </header>

      <main className="overflow-hidden">
        {/* ═══════════ HERO ═══════════ */}
        <section className="min-h-[90vh] flex items-center pt-8">
          <div className="max-w-6xl mx-auto px-6 w-full py-16 relative">
            <div className="grid md:grid-cols-2 gap-12 md:gap-8 items-center">

              {/* Left: Typography */}
              <div className="relative z-30 max-w-xl space-y-6 md:pr-4">
                <p className="text-sm tracking-[0.3em] text-[var(--accent)] font-medium">
                  {p.title}
                </p>
                <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-bold leading-[0.88] tracking-tighter text-[var(--fg)]">
                  {firstName}<br />
                  <span className="text-[var(--accent)]">{lastName}</span>
                </h1>
                <p className="text-lg text-[var(--fg-muted)] leading-relaxed max-w-md pt-4">
                  {p.short_desc}
                </p>
                <div className="pt-4 flex flex-wrap items-center gap-4">
                  <a href="#contact" className="inline-flex items-center gap-2 px-7 py-3.5 border-2 border-[var(--fg)] text-[var(--fg)] rounded-full font-bold hover:bg-[var(--fg)] hover:text-white transition-colors cursor-pointer group">
                    Get in Touch <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </a>
                  {p.cv_url && (
                    <a href={p.cv_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-7 py-3.5 bg-[var(--surface)] border border-[var(--border)] text-[var(--fg)] rounded-full font-bold hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors cursor-pointer group">
                      Download CV <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </a>
                  )}
                </div>
              </div>

              {/* Right: Organic Image + Quote overlapping */}
              <div className="relative flex justify-center md:justify-end z-20">
                {/* Background outline frame for depth */}
                <div className="absolute top-4 right-[-1rem] w-full max-w-[420px] aspect-[3/4] rounded-t-full rounded-bl-[4rem] rounded-br-[2rem] border-2 border-[var(--fg-muted)]/20 -z-10 rotate-6 animate-float-reverse" />
                
                {/* Organic container with grain and subtle shadow */}
                <div className="relative w-full max-w-[420px] aspect-[3/4] rounded-t-full rounded-bl-[4rem] rounded-br-[2rem] overflow-hidden organic-image shadow-2xl shadow-[var(--accent)]/10 ring-1 ring-black/5 rotate-2 hover:rotate-0 animate-float transition-transform duration-700">
                  <Image src={p.image_url || myImage} alt={p.full_name || "Hero Image"} fill sizes="(max-width: 768px) 90vw, 420px" className="object-cover" priority />
                </div>

                {/* Floating overlapping elegant quote */}
                <div className="hidden md:block absolute top-1/4 -left-8 md:-left-16 bg-white/90 backdrop-blur-md rounded-2xl p-5 shadow-xl shadow-black/5 max-w-[220px] border border-[var(--border)]">
                  <p className="font-serif italic text-base text-[var(--fg)] leading-snug">
                    {p.quote}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════ MARQUEE ═══════════ */}
        <div className="py-8 overflow-hidden">
          <div className="circle-divider"><span className="circle-icon" /></div>
          <div ref={marqueeRef} className="marquee-track group flex whitespace-nowrap select-none py-6 overflow-x-auto hide-scrollbar cursor-grab active:cursor-grabbing">
            <div className="flex shrink-0 items-center">
              {skills.map((skill, i) => (
                <span key={i} className="flex items-center">
                  <span className="text-2xl md:text-3xl font-bold text-[var(--fg)]/[0.06] group-hover:text-[var(--fg)] transition-colors duration-500 mx-8">{skill.word}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]/20 group-hover:bg-[var(--accent)]/50 transition-colors duration-500" />
                </span>
              ))}
            </div>
            <div className="flex shrink-0 items-center" aria-hidden>
              {skills.map((skill, i) => (
                <span key={i} className="flex items-center">
                  <span className="text-2xl md:text-3xl font-bold text-[var(--fg)]/[0.06] group-hover:text-[var(--fg)] transition-colors duration-500 mx-8">{skill.word}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]/20 group-hover:bg-[var(--accent)]/50 transition-colors duration-500" />
                </span>
              ))}
            </div>
          </div>
          <div className="circle-divider"><span className="circle-icon" /></div>
        </div>

        {/* ═══════════ VALUES (My Approach) ═══════════ */}
        <section id="values" className="max-w-6xl mx-auto px-6 py-32 reveal">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <p className="text-sm tracking-[0.3em] text-[var(--accent)] font-medium mb-4">My Approach</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Values That Drive Me</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((val, i) => {
              return (
                <div key={i} className="p-8 md:p-10 border border-[var(--border)] rounded-[2rem] hover:-translate-y-1.5 hover:border-[var(--accent)] hover:bg-[var(--surface)] hover:shadow-xl hover:shadow-[var(--accent)]/5 transition-all duration-500 group relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500 pointer-events-none">
                    <span className="block w-64 h-64 rounded-full border border-black" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 tracking-tight group-hover:text-[var(--accent)] transition-colors duration-300">{val.title}</h3>
                  <p className="text-[var(--fg-muted)] text-base leading-relaxed">{val.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ═══════════ QUOTE RHYTHM BREAK ═══════════ */}
        <section className="py-40 reveal relative overflow-hidden bg-[#FAF8F4] border-y border-[var(--border)] flex items-center justify-center">
          {/* Giant background quote mark */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[30rem] md:text-[40rem] font-serif italic text-[var(--fg)]/[0.02] select-none pointer-events-none leading-none z-0">
            &ldquo;
          </div>
          
          <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-64 h-64 border border-[var(--accent)]/10 rounded-full" />
          <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] border border-[var(--accent)]/[0.02] rounded-full animate-float" />

          <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
            <Quote size={48} className="text-[var(--accent)]/40 mx-auto mb-10" />
            <blockquote className="font-serif italic text-4xl md:text-5xl lg:text-7xl font-medium leading-[1.1] text-[var(--fg)] tracking-tight">
              {p.rhythm_quote}
            </blockquote>
            <p className="mt-12 text-[var(--fg-muted)] tracking-[0.2em] text-sm font-bold">
              — {p.rhythm_author}
            </p>
          </div>
        </section>

        {/* ═══════════ ABOUT ═══════════ */}
        <section id="about" className="max-w-6xl mx-auto px-6 py-32 reveal">
          <div className="grid md:grid-cols-3 gap-12 md:gap-20">
            <div className="md:col-span-1">
              <p className="text-sm tracking-[0.3em] text-[var(--accent)] font-medium mb-4">{p.about_bg}</p>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">{p.about_title}</h2>
              
              <div className="mt-10 space-y-1.5 pl-4 border-l-2 border-[var(--accent)]/30">
                <p className="text-sm font-bold text-[var(--fg)] tracking-wide ">{p.location}</p>
                <p className="text-sm font-medium text-[var(--fg-muted)]">{p.role}</p>
              </div>
            </div>
            <div className="md:col-span-2 space-y-8 text-xl text-[var(--fg-muted)] leading-loose max-w-[65ch]">
              <p>{p.about_desc_1}</p>
              <p>{p.about_desc_2}</p>
            </div>
          </div>
        </section>

        <div className="py-8"><div className="circle-divider"><span className="circle-icon" /></div></div>

        {/* ═══════════ EXPERIENCE ═══════════ */}
        <section id="experience" className="max-w-6xl mx-auto px-6 py-24 reveal">
          <p className="text-sm tracking-[0.3em] text-[var(--accent)] font-medium mb-4">Experience</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-16">Leadership & Impact</h2>
          <div>
            {experience.map((exp, i) => (
              <div key={i} className="group py-8 border-b border-[var(--border)] last:border-b-0 hover:pl-6 transition-all duration-300 cursor-default relative">
                <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-8 mb-2">
                  <h3 className="text-xl md:text-2xl font-bold group-hover:text-[var(--accent)] transition-colors">{exp.org}</h3>
                  <span className="text-[var(--warm)] text-sm font-medium">{exp.role}</span>
                  <span className="text-[var(--fg-muted)] text-xs font-mono ml-auto hidden md:block">{exp.period}</span>
                </div>
                <p className="text-[var(--fg-muted)] text-sm leading-relaxed max-w-3xl">{exp.description}</p>
                <span className="text-[var(--fg-muted)] text-xs font-mono md:hidden mt-2 block">{exp.period}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="py-8"><div className="circle-divider"><span className="circle-icon" /></div></div>

        {/* ═══════════ PROJECTS ═══════════ */}
        <section id="work" className="py-32 reveal bg-[#FAF8F4] border-y border-[var(--border)]">
          <div className="max-w-6xl mx-auto px-6">
            <p className="text-sm tracking-[0.3em] text-[var(--accent)] font-medium mb-4">Projects</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-16">Selected Work</h2>

            <div className="grid md:grid-cols-2 gap-6">
            {projects.map((proj, i) => {
              const isFirst = i === 0;
              return (
                <div key={i} className={`${isFirst ? 'md:col-span-2' : ''} group cursor-pointer project-card bg-[var(--surface)] p-3 md:p-4 rounded-[2rem] border border-[var(--border)] hover:border-[var(--accent)]/30 transition-colors`}>
                  <div className={`${isFirst ? 'aspect-[21/9]' : 'aspect-[4/3]'} rounded-[1.5rem] overflow-hidden mb-6 bg-[var(--border)] relative`}>
                    <Image src={proj.image_url || myImage} alt={proj.title} width={isFirst ? 1100 : 500} height={isFirst ? 500 : 375} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-[1.03] transition-all duration-700" loading="lazy" />
                    {proj.year && (
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-[var(--fg)] flex items-center gap-2">
                        {proj.year}
                      </div>
                    )}
                  </div>
                  <div className={`px-2 pb-2 ${isFirst ? 'md:px-4 md:pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4' : ''}`}>
                    <div className={isFirst ? "max-w-xl" : ""}>
                      <h3 className={`text-${isFirst ? '2xl' : 'xl'} font-bold mb-2 group-hover:text-[var(--accent)] transition-colors ${!isFirst ? 'flex justify-between items-center' : ''}`}>
                        {proj.title}
                        {!isFirst && <ArrowUpRight size={16} className="text-[var(--fg-muted)] group-hover:text-[var(--accent)]" />}
                      </h3>
                      <p className="text-[var(--fg-muted)] text-sm leading-relaxed">{proj.description}</p>
                    </div>
                    {isFirst && (
                      <div className="w-10 h-10 rounded-full bg-[var(--border)] flex items-center justify-center group-hover:bg-[var(--accent)] group-hover:text-white transition-colors shrink-0">
                        <ArrowUpRight size={18} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        </section>

      </main>

      {/* ═══════════ CTA SECTION ═══════════ */}
      <section id="contact" className="reveal relative py-24 md:py-32 overflow-hidden border-t border-[var(--border)]">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--accent)]/5 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[var(--warm)]/5 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3 pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-16 md:gap-20 items-start">
            {/* Left: Typography & Contact Info */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <p className="text-sm tracking-[0.3em] text-[var(--accent)] font-medium">Reach Out</p>
              </div>
              
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-6 text-[var(--fg)]">
                Let's start a <br className="hidden md:block" />
                <span className="text-[var(--accent)] italic font-serif font-normal">meaningful</span> conversation.
              </h2>
              
              <p className="text-[var(--fg-muted)] text-lg leading-relaxed mb-10 max-w-md">
                Whether you want to discuss ideas about psychology, collaboration opportunities, or simply share your thoughts — every great connection starts with a hello.
              </p>
              
              <div className="space-y-6 text-[var(--fg)] font-medium text-lg">
                <a href={emailLink} className="flex items-center gap-4 hover:text-[var(--accent)] transition-colors cursor-pointer group w-fit">
                  <span className="w-12 h-12 rounded-full border border-[var(--border)] bg-[var(--surface)] flex items-center justify-center group-hover:border-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-white transition-all shadow-sm">
                    <Mail size={18} />
                  </span>
                  {emailText}
                </a>
                <a href={waLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 hover:text-[var(--accent)] transition-colors cursor-pointer group w-fit">
                  <span className="w-12 h-12 rounded-full border border-[var(--border)] bg-[var(--surface)] flex items-center justify-center group-hover:border-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-white transition-all shadow-sm">
                    <Whatsapp width={18} height={18} />
                  </span>
                  {waText}
                </a>
              </div>
            </div>

            {/* Right: Elegant Contact Form */}
            <form onSubmit={handleContactSubmit} className="bg-[var(--surface)] p-8 md:p-10 rounded-[2.5rem] border border-[var(--border)] shadow-xl shadow-[var(--warm)]/5 space-y-6 relative">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-[var(--highlight)]/30 rounded-full blur-2xl pointer-events-none" />
              
              <div>
                <label className="block text-sm font-bold text-[var(--fg)] mb-2">What should I call you?</label>
                <input name="name" type="text" required placeholder="Your name" className="w-full px-5 py-4 bg-[var(--bg-alt)] border border-[var(--border)] rounded-2xl text-[var(--fg)] placeholder-[var(--fg-muted)]/50 focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] outline-none transition-all" />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-[var(--fg)] mb-2">How can I reach you?</label>
                <input name="email" type="email" required placeholder="your@email.com" className="w-full px-5 py-4 bg-[var(--bg-alt)] border border-[var(--border)] rounded-2xl text-[var(--fg)] placeholder-[var(--fg-muted)]/50 focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] outline-none transition-all" />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-[var(--fg)] mb-2">What's on your mind?</label>
                <textarea name="message" required rows={4} placeholder="Share your thoughts, questions, or ideas..." className="w-full px-5 py-4 bg-[var(--bg-alt)] border border-[var(--border)] rounded-2xl text-[var(--fg)] placeholder-[var(--fg-muted)]/50 focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] outline-none transition-all resize-none" />
              </div>
              
              <button type="submit" className="w-full px-8 py-4 bg-[var(--accent)] text-white rounded-2xl font-bold text-lg hover:bg-[var(--accent-soft)] transition-all hover:shadow-lg hover:shadow-[var(--accent)]/20 active:scale-[0.98] flex items-center justify-center gap-2 group">
                Send Message
                <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="bg-[var(--bg)] border-t border-[var(--border)] text-[var(--fg-muted)]">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-24 flex flex-col md:flex-row justify-between items-start md:items-center gap-10 md:gap-8 text-sm">
          <div className="flex flex-col items-start gap-2 text-left">
            <a href="#" className="text-2xl font-bold tracking-tight text-[var(--fg)]">{p.full_name || 'Ibnu Gaots'}<span className="text-[var(--accent)]">.</span></a>
            <p className="flex items-center gap-2 text-xs font-medium tracking-[0.1em]">
              &copy; {YEAR} {p.full_name || "Ibnu Gaots"}
            </p>
            <p className="text-[var(--fg-muted)] mt-2 italic text-[15px]">{p.role || "Helping people through meaningful conversations."}</p>
          </div>
          
          <div className="flex flex-wrap justify-center md:justify-end w-full md:w-auto gap-6 md:gap-10 font-medium">
            {socialLinks.length > 0 ? (
              socialLinks.map((link) => (
                <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent)] transition-colors cursor-pointer">
                  {link.platform}
                </a>
              ))
            ) : (
              <>
                <a href="#" className="hover:text-[var(--accent)] transition-colors cursor-pointer">Instagram</a>
                <a href="https://wa.me/6288977039633" className="hover:text-[var(--accent)] transition-colors cursor-pointer">WhatsApp</a>
                <a href="#" className="hover:text-[var(--accent)] transition-colors cursor-pointer">LinkedIn</a>
              </>
            )}
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 pb-8 flex items-center justify-center gap-2 opacity-50 hover:opacity-100 transition-opacity text-xs font-mono">
          <a href="https://github.com/zakyislm" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent)] transition-colors flex items-center gap-1.5">
            <GithubOriginal size={16} />
            by
          </a>
          <a href="https://zakyislm.github.io" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent)] transition-colors font-semibold">
            zakyislm
          </a>
        </div>
      </footer>
    </div>
  );
}