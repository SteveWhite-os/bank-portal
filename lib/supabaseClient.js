import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createBrowserClient("https://enedvnqadggbbylsszwr.supabase.co" , "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVuZWR2bnFhZGdnYmJ5bHNzendyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxMzg5OTQsImV4cCI6MjA5ODcxNDk5NH0.VGAaXwW7MRRp-vFkc8YOD4sKPEvc2NNoM_WXxxyDTOI")