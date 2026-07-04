import { createClient } from '@supabase/supabase-js'

// Service role client – bypasses RLS, for admin actions only
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

// (Optional) If you need to get the authenticated user in API routes
// using the cookie session, you can add a helper like this:
export async function getUserFromSession(req) {
  // This is a simplified version – you can use the `supabase` client
  // with the cookie from the request if you need it.
  // For now, we just export supabaseAdmin.
}