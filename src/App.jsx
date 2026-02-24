import DiskominfoWidget from './DiskominfoWidget'

function App() {
  return (
    <DiskominfoWidget
      supabaseUrl={import.meta.env.VITE_SUPABASE_URL}
      supabaseKey={import.meta.env.VITE_SUPABASE_KEY}
      webhookUrl={import.meta.env.VITE_WEBHOOK_URL}
      title="Asisten Diskominfo"
    />
  )
}

export default App