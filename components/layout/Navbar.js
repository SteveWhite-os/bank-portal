import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/router'
import { Bell, LogOut, User } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function Navbar({ user }) {
  const router = useRouter()
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifs, setShowNotifs] = useState(false)
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    if (user) {
      fetchNotifications()
      // Subscribe to new notifications (realtime)
      const subscription = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchNotifications()
          }
        )
        .subscribe()
      return () => subscription.unsubscribe()
    }
  }, [user])

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)
    if (data) {
      setNotifications(data)
      setUnreadCount(data.filter(n => !n.read).length)
    }
  }

  const markAsRead = async (id) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id)
    fetchNotifications()
  }

  const markAllRead = async () => {
    await supabase.from('notifications').update({ read: true }).eq('user_id', user.id)
    fetchNotifications()
  }

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 h-16 flex items-center px-4 md:px-6">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-4">
          <span className="text-xl font-bold text-indigo-600">BankPortal</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="relative p-2 rounded-full hover:bg-gray-100"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 inline-block w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full -mt-1 -mr-1">
                  {unreadCount}
                </span>
              )}
            </button>
            {showNotifs && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
                <div className="p-3 border-b border-gray-200 flex justify-between items-center">
                  <span className="font-semibold">Notifications</span>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-xs text-indigo-600 hover:underline">
                      Mark all read
                    </button>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">No notifications</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${!n.read ? 'bg-indigo-50' : ''}`}
                      onClick={() => markAsRead(n.id)}
                    >
                      <p className="text-sm text-gray-800">{n.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(n.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium hidden sm:inline">{user?.name}</span>
            <button onClick={logout} className="p-2 rounded-full hover:bg-gray-100">
              <LogOut className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}