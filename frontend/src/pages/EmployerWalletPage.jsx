import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import TopUpModal from '../components/TopUpModal'

const filterTabs = ['Barchasi', 'Kirim (Daromad)', 'Chiqim (Xarajat)']

const EmployerWalletPage = () => {
  const { apiCall } = useAuth()
  const [activeFilter, setActiveFilter] = useState('Barchasi')
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState([])
  const [paymentMethods, setPaymentMethods] = useState([])
  const [loading, setLoading] = useState(true)
  const [showTopUp, setShowTopUp] = useState(false)

  const fetchWalletData = async () => {
    try {
      const data = await apiCall('/wallet')
      setBalance(data.balance || 0)
      setTransactions(data.transactions || [])
      setPaymentMethods(data.paymentMethods || [])
    } catch (err) {
      console.error('Wallet data not available:', err)
    }
  }

  useEffect(() => {
    fetchWalletData()
    setLoading(false)
  }, [])

  const filteredTransactions = transactions.filter((tx) => {
    if (activeFilter === 'Barchasi') return true
    if (activeFilter === 'Kirim (Daromad)') return tx.type === 'income'
    if (activeFilter === 'Chiqim (Xarajat)') return tx.type === 'expense'
    return true
  })

  const formatAmount = (amount) => {
    return amount?.toLocaleString() || '0'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-[#4f6ef7] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <>
      {/* Header */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-[#1a1a2e] mb-1">Hamyon</h1>
        <p className="text-sm text-gray-500">Sizning moliyaviy holatingiz va tranzaksiyalar tarixi.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Balance Card */}
        <motion.div
          className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-1">Joriy balans</p>
            <p className="text-4xl font-bold text-[#1a1a2e]">{formatAmount(balance)} <span className="text-lg font-semibold text-gray-500">UZS</span></p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowTopUp(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#4f6ef7] hover:bg-[#3b5de7] text-white rounded-xl font-semibold text-sm transition-all duration-200 hover:shadow-[0_4px_14px_rgba(79,110,247,0.35)] cursor-pointer border-0"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              To'ldirish
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="17 1 21 5 17 9" />
                <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                <polyline points="7 23 3 19 7 15" />
                <path d="M21 13v2a4 4 0 0 1-4 4H3" />
              </svg>
              Pul yechish
            </button>
          </div>
        </motion.div>

        {/* Payment Methods */}
        <motion.div
          className="bg-white rounded-2xl p-6 border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-[#1a1a2e]">To'lov usullari</h3>
            <button className="w-8 h-8 rounded-lg bg-[#4f6ef7] flex items-center justify-center text-white hover:bg-[#3b5de7] transition-colors cursor-pointer border-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>

          {paymentMethods.length === 0 ? (
            <div className="text-center py-6">
              <svg className="mx-auto mb-2 text-gray-300" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
              <p className="text-sm text-gray-500">Hali to'lov usuli qo'shilmagan</p>
              <p className="text-xs text-gray-400 mt-1">Karta qo'shish uchun "+" tugmasini bosing</p>
            </div>
          ) : (
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center border border-gray-100">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <rect x="2" y="4" width="20" height="16" rx="2" fill={method.type === 'humo' ? '#e91e63' : '#1a73e8'} />
                        <path d="M2 10h20" stroke="white" strokeWidth="1" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{method.name}</p>
                      <p className="text-xs text-gray-500">{method.number}</p>
                    </div>
                  </div>
                  <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors cursor-pointer border-0 bg-transparent">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="1" />
                      <circle cx="12" cy="5" r="1" />
                      <circle cx="12" cy="19" r="1" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <motion.div
        className="bg-white rounded-2xl p-6 border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-[#1a1a2e]">So'nggi tranzaksiyalar</h2>
          <div className="flex gap-2">
            {filterTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer border-0 ${
                  activeFilter === tab
                    ? 'bg-[#4f6ef7]/10 text-[#4f6ef7]'
                    : 'bg-transparent text-gray-500 hover:bg-gray-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto mb-3 text-gray-300" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <p className="text-gray-500 text-sm mb-1">Hali tranzaksiyalar yo'q</p>
            <p className="text-gray-400 text-xs">Tranzaksiyalar paydo bo'lganda shu yerda ko'rasiz</p>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              <div className="col-span-3">Sana</div>
              <div className="col-span-4">Tafsilot</div>
              <div className="col-span-3 text-right">Summa</div>
              <div className="col-span-2 text-right">Holat</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-gray-50">
              {filteredTransactions.map((tx) => (
                <div key={tx._id} className="grid grid-cols-12 gap-4 px-4 py-4 items-center hover:bg-gray-50 transition-colors">
                  <div className="col-span-3">
                    <p className="text-sm text-gray-700 whitespace-pre-line">
                      {new Date(tx.createdAt).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {'\n'}
                      {new Date(tx.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={tx.type === 'income' ? '#10b981' : '#f59e0b'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{tx.description || (tx.type === 'income' ? 'Kirim' : 'Chiqim')}</p>
                      <p className="text-xs text-gray-500 truncate">{tx.detail || ''}</p>
                    </div>
                  </div>
                  <div className="col-span-3 text-right">
                    <span className={`text-sm font-semibold ${tx.type === 'income' ? 'text-emerald-600' : 'text-gray-800'}`}>
                      {tx.type === 'income' ? '+' : '-'} {formatAmount(tx.amount)} UZS
                    </span>
                  </div>
                  <div className="col-span-2 text-right">
                    <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${
                      tx.status === 'completed' ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'
                    }`}>
                      {tx.status === 'completed' ? 'Bajarildi' : 'Jarayonda'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </motion.div>
      {/* Top Up Modal */}
      <TopUpModal
        isOpen={showTopUp}
        onClose={() => setShowTopUp(false)}
        onSuccess={fetchWalletData}
      />
    </>
  )
}

export default EmployerWalletPage
