import '@/styles/globals.css'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Layout from '@/components/layout/Layout'
import { useRouter } from 'next/router'

export default function App({ Component, pageProps }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check active session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        // Fetch user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        setUser({ ...session.user, ...profile })
      }
      setLoading(false)
    }
    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          setUser({ ...session.user, ...profile })
        } else {
          setUser(null)
          router.push('/login')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [router])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  // Public pages (login, register) don't need layout
  if (router.pathname === '/login' || router.pathname === '/register') {
    return <Component {...pageProps} />
  }

  // Redirect to login if not authenticated
  if (!user) {
    router.push('/login')
    return null
  }

  return (
    <Layout user={user}>
      <Component {...pageProps} user={user} />
    </Layout>
  )
}