import { useState, useEffect, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { createClient } from '@supabase/supabase-js'
import './index.css'

function parseInline(text, keyPrefix = '') {
  const parts = []
  // Match: **bold**, [label](url), <url>, or bare https:// URLs
  const regex = /(\*\*(.+?)\*\*)|(\[([^\]]+)\]\(([^)]+)\))|<(https?:\/\/[^>]+)>|(https?:\/\/[^\s)<>]+)/g
  let lastIndex = 0
  let match

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }

    if (match[1]) {
      parts.push(<strong key={`${keyPrefix}-b-${match.index}`} className="font-semibold">{match[2]}</strong>)
    } else if (match[3]) {
      parts.push(
        <a key={`${keyPrefix}-l-${match.index}`} href={match[5]} target="_blank" rel="noopener noreferrer"
           className="text-gold-400 underline underline-offset-2 hover:text-gold-300 break-all">
          {match[4]}
        </a>
      )
    } else if (match[6]) {
      parts.push(
        <a key={`${keyPrefix}-al-${match.index}`} href={match[6]} target="_blank" rel="noopener noreferrer"
           className="text-gold-400 underline underline-offset-2 hover:text-gold-300 break-all">
          Link
        </a>
      )
    } else if (match[7]) {
      parts.push(
        <a key={`${keyPrefix}-u-${match.index}`} href={match[7]} target="_blank" rel="noopener noreferrer"
           className="text-gold-400 underline underline-offset-2 hover:text-gold-300 break-all">
          {match[7]}
        </a>
      )
    }

    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts.length > 0 ? parts : [text]
}

function parseMarkdown(text) {
  // Sabuk Pengaman 1: Cegah crash jika server membalas undefined/null/bukan string
  if (!text || typeof text !== 'string') {
    return [<span key="err-invalid" className="text-red-400 italic">Pesan tidak valid dari server.</span>]
  }

  const lines = text.split('\n')

  // Detect table blocks (lines starting with |)
  const blocks = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i].trim()

    if (line.startsWith('|') && line.endsWith('|')) {
      // Collect all consecutive table lines
      const tableLines = []
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableLines.push(lines[i].trim())
        i++
      }
      blocks.push({ type: 'table', lines: tableLines })
    } else {
      blocks.push({ type: 'line', content: lines[i] })
      i++
    }
  }

  return blocks.map((block, blockIdx) => {
    if (block.type === 'table') {
      const rows = block.lines
        .filter(l => !l.match(/^\|[\s\-:|]+\|$/)) // skip separator row (|---|---|)
        .map(l => l.split('|').slice(1, -1).map(cell => cell.trim()))

      if (rows.length === 0) return null

      const header = rows[0]
      const body = rows.slice(1)

      return (
        <div key={`tbl-${blockIdx}`} className="my-2 overflow-x-auto rounded-lg border border-olive-700/40">
          <table className="w-full text-[11px] border-collapse">
            <thead>
              <tr className="bg-olive-800/80">
                {header.map((cell, ci) => (
                  <th key={ci} className="px-2.5 py-1.5 text-left text-olive-200 font-semibold border-b border-olive-700/40">
                    {parseInline(cell, `th-${blockIdx}-${ci}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((row, ri) => (
                <tr key={ri} className="border-b border-olive-800/30 last:border-b-0 hover:bg-olive-800/30 transition-colors">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-2.5 py-1.5 text-olive-200">
                      {parseInline(cell, `td-${blockIdx}-${ri}-${ci}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    // Regular line
    const line = block.content
    if (line.trim() === '') return <br key={blockIdx} />

    const inlineParts = parseInline(line, `ln-${blockIdx}`)

    return (
      <span key={blockIdx}>
        {blockIdx > 0 && blocks[blockIdx - 1]?.type !== 'table' && <br />}
        {inlineParts}
      </span>
    )
  })
}

function DiskominfoWidget({ supabaseUrl, supabaseKey, webhookUrl, title = 'Asisten Diskominfo' }) {
  const supabaseRef = useRef(null)
  if (!supabaseRef.current) {
    supabaseRef.current = createClient(supabaseUrl, supabaseKey)
  }
  const supabase = supabaseRef.current

  const [session, setSession] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [chatSessionId, setChatSessionId] = useState('')
  const messagesEndRef = useRef(null)

  // 1. Cek Session & Setup ID
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    let storedId = localStorage.getItem('chat_session_id')
    if (!storedId) {
      storedId = uuidv4()
      localStorage.setItem('chat_session_id', storedId)
    }
    setChatSessionId(storedId)

    return () => subscription.unsubscribe()
  }, [supabase])

  // Auto-scroll ke pesan terakhir
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { 
        redirectTo: window.location.origin
      }
    })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setSession(null)
    setMessages([])
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMsg = { sender: 'user', text: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg.text,
          sessionId: chatSessionId,
          userEmail: session.user.email,
          userName: session.user.user_metadata.full_name
        })
      })

      // Sabuk Pengaman 2: Validasi respons HTTP secara eksplisit
      if (!response.ok) {
        throw new Error(`Server membalas dengan status: ${response.status}`)
      }

      const data = await response.json()

      if (data.error === 'auth_failed') {
        alert("Akses ditolak: Akun Anda tidak terdaftar di sistem internal.")
        handleLogout()
        setIsLoading(false)
        return
      }

      // Sabuk Pengaman 3: Pastikan struktur data sesuai harapan
      if (!data || !data.reply) {
        throw new Error("Format respons dari server tidak memiliki field 'reply'.")
      }

      setMessages(prev => [...prev, { sender: 'bot', text: data.reply }])

    } catch (error) {
      console.error('Error:', error.message)
      // Tangkap error dan tampilkan di UI, bukan membuat aplikasi crash
      setMessages(prev => [...prev, { sender: 'bot', text: `Maaf, terjadi kesalahan sistem: ${error.message}` }])
    } finally {
      setIsLoading(false)
    }
  }

  // --- RENDER ---

  // 1. Floating Action Button (Widget Closed)
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[1000] w-16 h-16 rounded-full
                   bg-gradient-to-br from-brick-500 to-mahogany-700
                   text-white border-none text-3xl cursor-pointer
                   shadow-lg shadow-brick-500/30
                   flex items-center justify-center
                   animate-bounce-in hover:scale-110
                   hover:shadow-xl hover:shadow-brick-500/40
                   active:scale-95 transition-all duration-200
                   animate-pulse-soft"
        aria-label="Buka Chat"
      >
        💬
      </button>
    )
  }

  // 2. Chat Box (Widget Open)
  return (
    <div className="fixed bottom-6 right-6 z-[1000] w-[380px] h-[540px]
                    rounded-2xl overflow-hidden
                    flex flex-col
                    bg-olive-950 border border-olive-800/50
                    shadow-2xl shadow-black/40
                    animate-slide-up">

      {/* ── Header ── */}
      <div className="relative px-5 py-4 bg-gradient-to-r from-brick-700 via-brick-600 to-mahogany-700">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.06)_0%,transparent_50%)]" />
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm
                          flex items-center justify-center text-lg
                          border border-white/10">
              🏛️
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm tracking-wide m-0">{title}</h3>
              <p className="text-brick-200/70 text-[10px] m-0 mt-0.5">
                {session ? '● Online' : 'Silakan login'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {session && messages.length > 0 && (
              <button
                onClick={() => setMessages([])}
                className="px-2.5 py-1 text-[10px] rounded-md
                         bg-white/10 text-white/80 border border-white/10
                         hover:bg-red-500/30 hover:text-white
                         cursor-pointer transition-all duration-200"
                title="Clear chat"
              >
                🗑
              </button>
            )}
            {session && (
              <button
                onClick={handleLogout}
                className="px-2.5 py-1 text-[10px] rounded-md
                         bg-white/10 text-white/80 border border-white/10
                         hover:bg-white/20 hover:text-white
                         cursor-pointer transition-all duration-200"
              >
                Logout
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-lg flex items-center justify-center
                         bg-white/10 text-white/80 border border-white/10
                         hover:bg-white/20 hover:text-white hover:rotate-90
                         cursor-pointer transition-all duration-300"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      {!session ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8
                      bg-gradient-to-b from-olive-950 to-olive-900">
          <div className="w-20 h-20 rounded-2xl mb-6
                        bg-gradient-to-br from-gold-500/20 to-copper-500/20
                        border border-gold-500/20
                        flex items-center justify-center text-4xl
                        animate-bounce-in">
            🔐
          </div>

          <p className="text-olive-300 text-center text-sm leading-relaxed mb-6 max-w-[250px]">
            Silakan login dengan akun Google instansi untuk menjadwalkan rapat.
          </p>

          <button
            onClick={handleLogin}
            className="flex items-center gap-3 px-6 py-3
                     bg-white text-olive-900 font-medium text-sm
                     rounded-xl border-none cursor-pointer
                     shadow-lg shadow-black/20
                     hover:shadow-xl hover:shadow-black/30
                     hover:-translate-y-0.5
                     active:translate-y-0
                     transition-all duration-200"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>
        </div>
      ) : (
        <>
          {/* ── Messages Area ── */}
          <div className="flex-1 p-4 overflow-y-auto
                        bg-gradient-to-b from-olive-950 via-olive-950 to-olive-900
                        scrollbar-thin">
            {messages.length === 0 && (
              <div className="text-center mt-12 animate-fade-in">
                <div className="w-14 h-14 rounded-2xl mx-auto mb-4
                             bg-gradient-to-br from-gold-500/15 to-copper-500/15
                             border border-gold-500/15
                             flex items-center justify-center text-2xl">
                  👋
                </div>
                <p className="text-olive-400 text-sm">
                  Halo <span className="text-gold-400 font-medium">{session.user.user_metadata.full_name}</span>,
                </p>
                <p className="text-olive-500 text-xs mt-1">ada yang bisa dibantu?</p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex mb-3 animate-msg-in ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-lg mr-2 mt-1 flex-shrink-0
                               bg-gradient-to-br from-brick-600 to-mahogany-700
                               flex items-center justify-center text-xs text-white">
                    🏛️
                  </div>
                )}
                <div
                  className={`max-w-[75%] px-4 py-2.5 text-sm leading-relaxed break-words
                    ${msg.sender === 'user'
                      ? 'bg-gradient-to-br from-brick-600 to-brick-700 text-white rounded-2xl rounded-br-md shadow-md shadow-brick-900/30'
                      : 'bg-olive-800/70 text-olive-100 rounded-2xl rounded-bl-md border border-olive-700/40'
                    }`}
                >
                  {msg.sender === 'bot' ? parseMarkdown(msg.text) : msg.text}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 mb-3 animate-msg-in">
                <div className="w-7 h-7 rounded-lg mr-2 flex-shrink-0
                             bg-gradient-to-br from-brick-600 to-mahogany-700
                             flex items-center justify-center text-xs text-white">
                  🏛️
                </div>
                <div className="bg-olive-800/70 border border-olive-700/40 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-gold-400 animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 rounded-full bg-gold-400 animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 rounded-full bg-gold-400 animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* ── Input Area ── */}
          <div className="px-4 py-3 bg-olive-900/80 border-t border-olive-800/60">
            <div className="flex items-center gap-2">
              <input
                className="flex-1 px-4 py-2.5 rounded-xl text-sm
                         bg-olive-800/60 text-olive-100
                         border border-olive-700/40
                         placeholder:text-olive-500
                         focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20
                         transition-all duration-200"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Ketik pesan..."
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 rounded-xl flex-shrink-0
                         bg-gradient-to-br from-brick-500 to-brick-700
                         text-white border-none cursor-pointer
                         flex items-center justify-center
                         hover:from-brick-400 hover:to-brick-600
                         hover:shadow-lg hover:shadow-brick-500/25
                         active:scale-95
                         disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none
                         transition-all duration-200"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>

            {/* Branding */}
            <p className="text-center text-[9px] text-olive-600 mt-2 tracking-wider uppercase">
              Powered by Diskominfo
            </p>
          </div>
        </>
      )}
    </div>
  )
}

export { DiskominfoWidget }
export default DiskominfoWidget