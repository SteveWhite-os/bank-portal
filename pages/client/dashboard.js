import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { formatCurrency } from '@/lib/helpers'
import { useRouter } from 'next/router'

export default function ClientDashboard({ user }) {
  const [profile, setProfile] = useState(user)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    // Fetch profile (fresh balance)
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    if (profileData) setProfile(profileData)

    // Fetch last 5 transactions
    const { data: txnData } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)
    setTransactions(txnData || [])
    setLoading(false)
  }

  const pendingCount = transactions.filter(t => t.status === 'pending').length
  const totalDeposits = transactions
    .filter(t => t.type === 'deposit' && t.status === 'approved')
    .reduce((sum, t) => sum + t.amount, 0)
  const totalWithdrawals = transactions
    .filter(t => t.type === 'withdraw' && t.status === 'approved')
    .reduce((sum, t) => sum + t.amount, 0)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Welcome back, {profile?.name}!</h1>
        <p className="text-gray-500">Here's your account overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Balance</p>
          <p className="text-2xl font-bold text-gray-800">{formatCurrency(profile?.balance || 0)}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total Deposits</p>
          <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalDeposits)}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total Withdrawals</p>
          <p className="text-2xl font-bold text-rose-600">{formatCurrency(totalWithdrawals)}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <button
          onClick={() => router.push('/client/transactions?action=deposit')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition shadow-md shadow-emerald-200 flex items-center justify-center gap-2"
        >
          <span>+</span> Top Up
        </button>
        <button
          onClick={() => router.push('/client/transactions?action=withdraw')}
          className="bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 rounded-xl transition shadow-md shadow-rose-200 flex items-center justify-center gap-2"
        >
          <span>↑</span> Withdraw
        </button>
        <button
          onClick={() => router.push('/client/profile')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition shadow-md shadow-indigo-200 flex items-center justify-center gap-2"
        >
          <User className="w-5 h-5" /> Profile
        </button>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-semibold text-gray-800">Recent Transactions</h2>
          <button
            onClick={() => router.push('/client/transactions')}
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            View all
          </button>
        </div>
        <div className="divide-y divide-gray-100">
          {transactions.map((t) => (
            <div key={t.id} className="p-4 flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-800">{t.description || t.type}</p>
                <p className="text-xs text-gray-400">
                  {new Date(t.created_at).toLocaleDateString()} {new Date(t.created_at).toLocaleTimeString()}
                </p>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${t.type === 'deposit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {t.type === 'deposit' ? '+' : '-'}{formatCurrency(t.amount)}
                </p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  t.status === 'approved' ? 'bg-green-100 text-green-700' :
                  t.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {t.status}
                </span>
              </div>
            </div>
          ))}
          {transactions.length === 0 && (
            <div className="p-8 text-center text-gray-400">No transactions yet</div>
          )}
        </div>
      </div>
    </div>
  )
}