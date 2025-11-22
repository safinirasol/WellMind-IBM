// components/Navbar.tsx
"use client"
import Link from 'next/link'
import { useState, useEffect } from 'react'
import CareChatbot from './CareChatbot'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [logoSrc, setLogoSrc] = useState('/api/logo')
  const [showCare, setShowCare] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogoError = () => {
    setLogoSrc((prev) => (prev === '/api/logo' ? '/logo-fallback.svg' : '/logo-fallback.svg'))
  }

  return (
    <header className={`fixed top-0 inset-x-0 z-40 transition-all ${scrolled ? 'backdrop-blur bg-white/80 shadow-card' : 'bg-white/90'} border-b border-slate-200`}>
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-2.5">
        <Link href="/" className="flex items-center gap-2 group">
          <a href="/" aria-label="Brand Logo" className="block ml-2">
            <img src="/Wellmind-LOGO.jpeg" alt="vorteX logo" onError={handleLogoError} className="h-8 w-auto rounded-md shadow-card" />
          </a>
          <span className="font-bold text-lg tracking-tight text-slate-800">vorteX Health</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm font-medium text-slate-600 hover:text-slate-900">Home</Link>
          <Link href="/hr" className="text-sm font-medium text-slate-600 hover:text-slate-900">HR Dashboard</Link>
          <button onClick={() => setShowCare(true)} className="btn btn-care text-sm">Care</button>
        </div>
      </nav>
      <CareChatbot open={showCare} onClose={() => setShowCare(false)} />
    </header>
  )
}