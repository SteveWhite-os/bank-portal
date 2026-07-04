import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { formatCurrency } from '@/lib/helpers'
import { useRouter } from 'next/router'

export default function ClientTransactions({ user }) {
  const [transactions, setTransactions] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('deposit')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetchTransactions()
    // Check query param for action
    if (router.query.action === 'deposit') {
      setModalType('deposit')
      setShowModal(true)
    } else if (router.query.action === 'withdraw') {
      setModalType('withdraw')
      setShowModal(true)
    }
  }, [router.query])

  const fetchTransactions = async () => {
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setTransactions(data || [])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount')
      return
    }
    if (modalType === 'withdraw' && numAmount > user.balance) {
      setError('Insufficient balance')
      return
    }

    const { error } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        amount: numAmount,
        type: modalType,
        description: description || modalType,
        status: 'pending',
      })

    if (error) {
      setError(error.message)
    } else {
      setShowModal(false)
      setAmount('')
      setDescription('')
      setError('')
      fetchTransactions()
    }
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Transactions</h1>
          <p className="text-gray-500">All your deposits and withdrawals</p>
        </div>
        <button
          onClick={() => { setModalType('deposit'); setShowModal(true) }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition"
        >
          + New Transaction
        </button>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Description</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-sm text-gray-800">{t.description || t.type}</td>
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
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(t.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-400">No transactions found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {modalType === 'deposit' ? 'Top Up' : 'Withdraw'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                <input
                  type="text"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Salary deposit"
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                type="submit"
                className={`w-full font-semibold py-2.5 rounded-lg transition ${
                  modalType === 'deposit'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-rose-600 hover:bg-rose-700 text-white'
                }`}
              >
                {modalType === 'deposit' ? 'Top Up' : 'Withdraw'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}