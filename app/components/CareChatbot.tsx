"use client"
import React, { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'

type Message = {
  id: number
  role: 'user' | 'bot'
  text: string
}

export default function CareChatbot({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        // add a greeting from the bot when opened
        setMessages((m) => (m.length ? m : [{ id: Date.now(), role: 'bot', text: '"Hi, you’re not alone. I’m here to help you navigate care options and find the support you need. How can I assist you today?"' }]))
      }, 200)
    }
  }, [open])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  if (!open) return null

  const sendMessage = async () => {
    const trimmed = input.trim()
    if (!trimmed) return
    const userMsg: Message = { id: Date.now(), role: 'user', text: trimmed }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, history: messages.map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text })) }),
      })
      const data = await res.json()
      const reply = data?.reply ?? data?.result ?? JSON.stringify(data)
      const botMsg: Message = { id: Date.now() + 1, role: 'bot', text: reply }
      setMessages((m) => [...m, botMsg])
    } catch (err) {
      const errMsg: Message = { id: Date.now() + 2, role: 'bot', text: 'Sorry — could not reach the server. Try again later.' }
      setMessages((m) => [...m, errMsg])
    } finally {
      setLoading(false)
    }
  }

  const onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="fixed right-4 bottom-4 z-50 flex">
      {/* small-screen backdrop */}
      <div className="fixed inset-0 md:hidden bg-black/40" onClick={onClose} />

      <aside role="dialog" aria-modal="true" className="relative w-full max-w-sm md:max-w-md h-[70vh] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold">C</div>
            <div>
              <div className="font-semibold">Care Assistant</div>
              <div className="text-xs text-slate-500">Powered by AI</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} aria-label="Close chat" className="text-slate-600 hover:text-slate-900 px-2 py-1">Close</button>
          </div>
        </div>

        <div className="p-4 flex-1 overflow-auto" style={{ maxHeight: 'calc(70vh - 140px)' }}>
          <div className="space-y-3">
            {messages.map((m) => (
              <div key={m.id} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                <div className={`inline-block px-3 py-2 rounded-lg ${m.role === 'user' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-900'}`}> 
                  {m.role === 'user' ? (
                    <span>{m.text}</span>
                  ) : (
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>{m.text}</ReactMarkdown>
                  )}
                </div>
              </div>
            ))}
            {loading && <div className="text-left"><div className="inline-block px-3 py-2 rounded-lg bg-slate-100 text-slate-500">Typing...</div></div>}
            <div ref={endRef} />
          </div>
        </div>

        <div className="px-3 py-3 border-t">
          <div className="flex gap-2">
            <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={onKeyDown} placeholder="Ask about care options, schedule, or resources..." className="flex-1 resize-none h-10 p-2 border rounded-md" />
            <button onClick={sendMessage} disabled={loading} className="btn btn-primary px-4 py-2">
              {loading ? 'Sending...' : 'Send'}
            </button>
          </div>
          <div className="text-xs text-slate-500 mt-2">Press Enter to send (Shift+Enter for newline).</div>
        </div>
      </aside>
    </div>
  )
}
