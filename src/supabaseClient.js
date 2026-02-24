import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rxomifhtsqsaexcuhqgf.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4b21pZmh0c3FzYWV4Y3VocWdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyNjc5MTQsImV4cCI6MjA4Mzg0MzkxNH0.SnkRAm7I0AoOzKJZOX1UGyh-1jbHmihJRBInXxIt4Nc'

export const supabase = createClient(supabaseUrl, supabaseKey)