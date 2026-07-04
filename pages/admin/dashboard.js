import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { formatCurrency } from '@/lib/helpers'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, clients: 0, pending: 0, totalBalance: 0 })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    const { data: users } = await supabase.from('profiles').select('*')
    const clients = users?.filter(u => u.role === 'client') || []
    const { data: txns } = await supabase.from('transactions').select('*')
    const pending = txns?.filter(t => t.status === 'pending').length || 0
    const totalBalance = clients.reduce((sum, u) => sum + (u.balance || 0), 0)

    setStats({
      users: users?.length || 0,
      clients: clients.length,
      pending,
      totalBalance,
    })
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Admin Overview</h1>
        <p className="text-gray-500">Manage users, transactions, and messages</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total Users</p>
          <p className="text-2xl font-bold text-gray-800">{stats.users}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Clients</p>
          <p className="text-2xl font-bold text-indigo-600">{stats.clients}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Pending Txns</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total Balance</p>
          <p className="text-2xl font-bold text-emerald-600">{formatCurrency(stats.totalBalance)}</p>
        </div>
      </div>
    </div>
  )
}