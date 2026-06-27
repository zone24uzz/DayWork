import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import TopUpModal from '../components/TopUpModal'

const WorkerWalletPage = () => {
  const { apiCall } = useAuth()
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showTopUp, setShowTopUp] = useState(false)

  const fetchWalletData = async () => {
    try {
      const data = await apiCall('/wallet')
      setBalance(data.balance || 0)
      setTransactions(data.transactions || [])
    } catch (err) {
      console.error('Wallet data not available:', err)
    }
  }

  useEffect(() => {
    fetchWalletData()
    setLoading(false)
  }, [])

  const formatAmount = (amount) => {
    return amount?.toLocaleString() || '0'
  }

  useEffect(() => {
    document.title = 'DayWork — Hamyon (Ishchi)'
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-[#4f6ef7] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-[#1a1a2e] mb-1">Hamyon</h1>
        <p className="text-sm text-gray-500">Moliyaviy operatsiyalaringiz</p>
      </motion.div>

      <motion.div
        className="bg-white rounded-2xl p-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Jami balans</p>
            <p className="text-3xl font-bold text-[#1a1a2e]">{formatAmount(balance)} <span className="text-lg font-semibold text-gray-500">UZS</span></p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#4f6ef7]/10 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4f6ef7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
          </div>
        </div>

        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setShowTopUp(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#4f6ef7] hover:bg-[#3b5de7] text-white rounded-xl font-semibold text-sm transition-all cursor-pointer border-0"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            To'ldirish
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold text-sm transition-all cursor-pointer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="17 1 21 5 17 9" />
              <path d="M3 11V9a4 4 0 0 1 4-4h14" />
              <polyline points="7 23 3 19 7 15" />
              <path d="M21 13v2a4 4 0 0 1-4 4H3" />
            </svg>
            Pul yechish
          </button>
        </div>

        <div className="border-t border-gray-100 pt-6">
          <h3 className="text-sm font-bold text-[#1a1a2e] mb-4">So'nggi tranzaksiyalar</h3>
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto mb-3 text-gray-300" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              <p className="text-gray-400 text-sm">Hozircha tranzaksiyalar yo'q</p>
              <p className="text-gray-300 text-xs mt-1">Ish bajarganingizda to'lovlar shu yerda ko'rinadi</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {transactions.map((tx) => (
                <div key={tx._id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm text-gray-800">{tx.description || 'Tranzaksiya'}</p>
                    <p className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleDateString('uz-UZ')}</p>
                  </div>
                  <span className={`text-sm font-semibold ${tx.type === 'income' ? 'text-emerald-600' : 'text-gray-800'}`}>
                    {tx.type === 'income' ? '+' : '-'} {formatAmount(tx.amount)} UZS
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
      {/* Top Up Modal */}
      <TopUpModal
        isOpen={showTopUp}
        onClose={() => setShowTopUp(false)}
        onSuccess={fetchWalletData}
      />
    </div>
  )
}

export default WorkerWalletPage
