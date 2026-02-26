import DiskominfoWidget from './DiskominfoWidget'

function App() {
  return (
    <div className="min-h-screen bg-olive-950 flex flex-col items-center justify-center relative overflow-hidden font-sans">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gold-500/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-brick-500/10 rounded-full blur-[150px] mix-blend-screen pointer-events-none" />

      {/* Main Content Area */}
      <main className="relative z-10 text-center px-4 max-w-3xl">
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-br from-white to-olive-300 text-transparent bg-clip-text mb-6">
          Diskominfo Widget
        </h1>
        <p className="text-olive-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
          Ini adalah halaman demonstrasi untuk Chat Widget Diskominfo. Klik tombol chat di pojok kanan bawah layar untuk mencoba percakapan interaktif.
        </p>

        {/* Installation Command */}
        <div className="bg-olive-900/80 border border-olive-800/50 rounded-2xl p-6 shadow-2xl backdrop-blur-md max-w-xl mx-auto text-left relative group">
          <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="text-xs text-olive-500 font-mono">Terminal</div>
          </div>
          <p className="text-olive-400 text-sm mb-3">Install via NPM:</p>
          <div className="bg-black/40 rounded-xl p-4 font-mono text-sm overflow-x-auto shadow-inner border border-olive-950/80">
            <span className="text-gold-400 mr-2">$</span>
            <span className="text-olive-200">npm</span>
            <span className="text-brick-400 ml-2">install</span>
            <span className="text-copper-400 ml-2">https://github.com/lexiiyz/diskominfo-widget.git</span>
          </div>
          <p className="text-olive-500 text-xs mt-4">
            *Untuk panduan lengkap, silakan lihat <a href="https://github.com/lexiiyz/diskominfo-widget#readme" target="_blank" rel="noopener noreferrer" className="text-gold-400 hover:text-gold-300 underline underline-offset-2">dokumentasi di GitHub</a>.
          </p>
        </div>
      </main>

      <DiskominfoWidget
        supabaseUrl={import.meta.env.VITE_SUPABASE_URL}
        supabaseKey={import.meta.env.VITE_SUPABASE_KEY}
        webhookUrl={import.meta.env.VITE_WEBHOOK_URL}
        groqApiKey={import.meta.env.VITE_GROQ_API_KEY}
        title="Asisten Diskominfo"
      />
    </div>
  )
}

export default App