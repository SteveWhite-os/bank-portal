import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { formatCurrency } from '@/lib/helpers'
import { supabaseAdmin } from '@/lib/supabaseServer'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return res.status(400).json({ error: error.message })
  res.status(200).json(data)
}

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchUsers = async () => {
    const res = await fetch('/api/admin/users')
    const data = await res.json()
    if (res.ok) {
      setUsers(data)
    } else {
      console.error(data.error)
    }
  }
  fetchUsers()
  }, [])

  const fetchUsers = async () => {
    const { data } = await supabase.from('profiles').select('*')
    setUsers(data || [])
  }

  const handleTopUp = async (e) => {
    e.preventDefault()
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Enter a valid amount')
      return
    }
    // Call admin API to top up
    const { error } = await fetch('/api/users/topup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: selectedUserId, amount: numAmount }),
    }).then(res => res.json())

    if (error) {
      setError(error.message)
    } else {
      setShowModal(false)
      setAmount('')
      setError('')
      fetchUsers()
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Users</h1>
        <p className="text-gray-500">Manage all users</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">User</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Balance</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Role</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 flex items-center gap-3">
                  <img
                    src={u.profile_image_url || `https://ui-avatars.com/api/?name=${u.name}&background=6366f1&color=fff&size=32`}
                    className="w-8 h-8 rounded-full object-cover"
                    alt={u.name}
                  />
                  <span className="font-medium text-gray-800">{u.name}</span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{u.email}</td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-800">{formatCurrency(u.balance || 0)}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {u.role === 'client' && (
                    <button
                      onClick={() => {
                        setSelectedUserId(u.id)
                        setShowModal(true)
                      }}
                      className="text-emerald-600 hover:text-emerald-800 text-sm font-medium"
                    >
                      <span className="mr-1">+</span> Top Up
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Top-up Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Admin Top‑Up</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <form onSubmit={handleTopUp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg transition"
              >
                Top Up
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}