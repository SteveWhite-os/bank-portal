import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function AdminMessages() {
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    const { data } = await supabase.from('profiles').select('id, name, email').eq('role', 'client')
    setUsers(data || [])
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!selectedUser || !message.trim()) return
    setSending(true)
    const res = await fetch('/api/notifications/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: selectedUser, message: message.trim() }),
    })
    const json = await res.json()
    if (json.success) {
      setMessage('')
      setSelectedUser('')
      alert('Message sent!')
    } else {
      alert('Error: ' + json.error)
    }
    setSending(false)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Send Message</h1>
        <p className="text-gray-500">Send internal notifications to users</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-lg">
        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recipient</label>
            <select
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              required
            >
              <option value="">Select a user...</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              rows="4"
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              required
            />
          </div>
          <button
            type="submit"
            disabled={sending}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50"
          >
            {sending ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  )
}