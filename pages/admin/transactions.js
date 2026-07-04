import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { formatCurrency } from '@/lib/helpers'
import { supabaseAdmin } from '@/lib/supabaseServer'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const { data, error } = await supabaseAdmin
    .from('transactions')
    .select('*, profiles(name)')
    .order('created_at', { ascending: false })
  if (error) return res.status(400).json({ error: error.message })
  res.status(200).json(data)
}

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([])
  const [users, setUsers] = useState([])

  useEffect(() => {
    const fetchTxns = async () => {
    const res = await fetch('/api/admin/transactions')
    const data = await res.json()
    if (res.ok) {
      setTransactions(data)
    } else {
      console.error(data.error)
    }
  }
  fetchTxns()
  }, [])

  const fetchData = async () => {
    const { data: txns } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })
    const { data: profiles } = await supabase.from('profiles').select('id, name')
    setTransactions(txns || [])
    setUsers(profiles || [])
  }

  const handleApprove = async (txnId) => {
    await fetch('/api/transactions/update', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactionId: txnId, status: 'approved' }),
    })
    fetchData()
  }

  const handleDecline = async (txnId) => {
    await fetch('/api/transactions/update', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactionId: txnId, status: 'declined' }),
    })
    fetchData()
  }

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId)
    return user ? user.name : 'Unknown'
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">All Transactions</h1>
        <p className="text-gray-500">Approve or decline pending requests</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{getUserName(t.user_id)}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      t.type === 'deposit' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {t.type}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-sm font-medium ${
                    t.type === 'deposit' ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {t.type === 'deposit' ? '+' : '-'}{formatCurrency(t.amount)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      t.status === 'approved' ? 'bg-green-100 text-green-700' :
                      t.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{new Date(t.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    {t.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(t.id)}
                          className="text-emerald-600 hover:text-emerald-800 text-sm font-medium mr-3"
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => handleDecline(t.id)}
                          className="text-rose-600 hover:text-rose-800 text-sm font-medium"
                        >
                          ✕ Decline
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-400">No transactions</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}