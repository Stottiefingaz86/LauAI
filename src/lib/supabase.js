import { createClient } from '@supabase/supabase-js'

// Get environment variables with fallbacks
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://ycmiaagfyszjqmfhsgqb.supabase.co'
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljbWlhYWdmeXN6anFtZmhzZ3FiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyOTU1MDcsImV4cCI6MjA2ODg3MTUwN30.vQyLQ07UGBf_25Xcy4qo3WEaw3voB_nWnCqhKcaldFQ'

// Log environment status for debugging
console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Using fallback')
console.log('Supabase Key:', supabaseAnonKey ? 'Set' : 'Using fallback')

export const supabase = createClient(supabaseUrl, supabaseAnonKey) 