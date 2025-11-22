export default function Footer() {
  return (
    <footer className="mt-12 bg-slate-900 border-t border-slate-800/40 py-6 px-6 text-sm text-slate-400">
      <div className="max-w-7xl mx-auto flex flex-col items-center text-center gap-4">
        <div className="flex items-center gap-3">
          <img src="/Wellmind-LOGO.jpeg" alt="vorteX logo" className="h-10 w-auto rounded-md shadow-card bg-white/5" />
          <div>
            <p className="font-semibold text-white text-base">vorteX Health</p>
            <p className="mt-1 max-w-md text-sm leading-relaxed text-slate-300">Healthcare-grade burnout insights with orchestration hooks and ledger-backed audit trails for trust and transparency.</p>
          </div>
        </div>
        <div className="mt-3 flex flex-col items-center gap-2">
          <div className="flex gap-6 text-slate-400">
            {/* Add footer links here if needed */}
          </div>
        </div>
      </div>
      <div className="mt-6 text-xs text-slate-300 text-center">© {new Date().getFullYear()} vorteX Health. All rights reserved.</div>
    </footer>
  )
}