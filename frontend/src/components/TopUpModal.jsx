import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

const paymentProviders = [
  {
    id: 'payme',
    name: 'Payme',
    color: '#2BA7E0',
    bgClass: 'bg-[#2BA7E0]/10 hover:bg-[#2BA7E0]/20',
    borderClass: 'border-[#2BA7E0]/30',
    selectedClass: 'border-[#2BA7E0] bg-[#2BA7E0]/10 shadow-[0_0_0_3px_rgba(43,167,224,0.15)]',
    icon: (
      <img src="/payme-logo.png" alt="Payme" className="w-8 h-8 object-contain" />
    ),
  },
  {
    id: 'click',
    name: 'Click',
    color: '#00C853',
    bgClass: 'bg-[#00C853]/10 hover:bg-[#00C853]/20',
    borderClass: 'border-[#00C853]/30',
    selectedClass: 'border-[#00C853] bg-[#00C853]/10 shadow-[0_0_0_3px_rgba(0,200,83,0.15)]',
    icon: (
      <img src="/click-logo.png" alt="Click" className="w-8 h-8 object-contain" />
    ),
  },
]

const AMOUNT_PRESETS = [50000, 100000, 200000, 500000, 1000000, 2000000]

const TopUpModal = ({ isOpen, onClose, onSuccess }) => {
  const { apiCall } = useAuth()
  const [selectedProvider, setSelectedProvider] = useState('')
  const [customAmount, setCustomAmount] = useState('')
  const [selectedPreset, setSelectedPreset] = useState(null)
  const [step, setStep] = useState('select') // select | confirm | processing | success
  const [error, setError] = useState('')
  const [transaction, setTransaction] = useState(null)
  const [processing, setProcessing] = useState(false)

  const getAmount = () => {
    if (selectedPreset !== null) return AMOUNT_PRESETS[selectedPreset]
    return parseInt(customAmount.replace(/\s/g, '')) || 0
  }

  const formatAmount = (value) => {
    const nums = value.replace(/\D/g, '')
    return nums.replace(/\B(?=(?:\d{3})+(?!\d))/g, ' ')
  }

  const handleAmountClick = (index) => {
    setSelectedPreset(index)
    setCustomAmount('')
  }

  const handleCustomAmount = (value) => {
    setCustomAmount(formatAmount(value))
    setSelectedPreset(null)
  }

  const handleContinue = () => {
    const amount = getAmount()
    if (amount < 1000) {
      setError('Minimal to\'lov: 1 000 UZS')
      return
    }
    if (!selectedProvider) {
      setError('Iltimos, to\'lov usulini tanlang')
      return
    }
    setError('')
    setStep('confirm')
  }

  const handleSubmit = async () => {
    setProcessing(true)
    setError('')

    try {
      const data = await apiCall('/wallet/deposit', {
        method: 'POST',
        body: JSON.stringify({
          amount: getAmount(),
          paymentMethod: selectedProvider,
        }),
      })

      setTransaction(data)

      // Open payment URL in new tab
      if (data.paymentUrl && selectedProvider === 'payme') {
        window.open(data.paymentUrl, '_blank', 'noopener,noreferrer')
      } else if (data.paymentUrl && selectedProvider === 'click') {
        window.open(data.paymentUrl, '_blank', 'noopener,noreferrer')
      }

      setStep('success')
      onSuccess?.()
    } catch (err) {
      setError(err.message || 'Xatolik yuz berdi')
    } finally {
      setProcessing(false)
    }
  }

  const handleSimulate = async () => {
    if (!transaction?.transactionId) return
    setProcessing(true)
    try {
      await apiCall('/wallet/simulate', {
        method: 'POST',
        body: JSON.stringify({ transactionId: transaction.transactionId }),
      })
      setStep('success')
      onSuccess?.()
    } catch (err) {
      setError(err.message || 'Xatolik yuz berdi')
    } finally {
      setProcessing(false)
    }
  }

  const handleClose = () => {
    setStep('select')
    setSelectedProvider('')
    setCustomAmount('')
    setSelectedPreset(null)
    setError('')
    setTransaction(null)
    onClose()
  }

  const amount = getAmount()

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#1a1a2e]">Hisobni to'ldirish</h2>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all cursor-pointer border-0 bg-transparent"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Step: Select Amount & Provider */}
            {step === 'select' && (
              <div className="px-6 py-5">
                {/* Amount presets */}
                <label className="block text-sm font-medium text-gray-700 mb-3">To'lov summasi</label>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {AMOUNT_PRESETS.map((preset, i) => (
                    <button
                      key={preset}
                      onClick={() => handleAmountClick(i)}
                      className={`px-3 py-3 rounded-xl text-sm font-semibold border-2 transition-all duration-200 cursor-pointer ${
                        selectedPreset === i
                          ? 'border-[#4f6ef7] bg-[#4f6ef7]/10 text-[#4f6ef7]'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {preset >= 1000000
                        ? `${(preset / 1000000).toFixed(preset % 1000000 === 0 ? 0 : 1)} mln`
                        : `${(preset / 1000).toFixed(0)} ming`}
                    </button>
                  ))}
                </div>

                {/* Custom amount */}
                <div className="relative mb-6">
                  <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden focus-within:border-[#4f6ef7] transition-colors">
                    <input
                      type="text"
                      value={customAmount}
                      onChange={(e) => handleCustomAmount(e.target.value)}
                      placeholder="Boshqa summa"
                      className="flex-1 px-4 py-3 text-sm text-gray-800 outline-none bg-transparent"
                    />
                    <span className="px-4 text-sm font-medium text-gray-400">UZS</span>
                  </div>
                  {amount > 0 && (
                    <p className="text-xs text-gray-400 mt-1 text-right">
                      {amount.toLocaleString()} UZS
                    </p>
                  )}
                </div>

                {/* Payment providers */}
                <label className="block text-sm font-medium text-gray-700 mb-3">To'lov usuli</label>
                <div className="space-y-3 mb-6">
                  {paymentProviders.map((provider) => (
                    <button
                      key={provider.id}
                      onClick={() => { setSelectedProvider(provider.id); setError('') }}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
                        selectedProvider === provider.id
                          ? provider.selectedClass
                          : `${provider.bgClass} ${provider.borderClass}`
                      }`}
                    >
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white shadow-sm">
                        {provider.icon}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-gray-800">{provider.name}</p>
                        <p className="text-xs text-gray-500">
                          {provider.id === 'payme' ? "Payme ilovasi orqali to'lov" : "Click ilovasi orqali to'lov"}
                        </p>
                      </div>
                      <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedProvider === provider.id
                          ? 'border-[#4f6ef7] bg-[#4f6ef7]'
                          : 'border-gray-300'
                      }`}>
                        {selectedProvider === provider.id && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {error && (
                  <p className="text-xs text-red-500 text-center mb-4">{error}</p>
                )}

                <button
                  onClick={handleContinue}
                  disabled={!selectedProvider || amount < 1000}
                  className={`w-full py-3.5 rounded-xl text-base font-semibold transition-all duration-200 cursor-pointer border-0 ${
                    selectedProvider && amount >= 1000
                      ? 'bg-[#4f6ef7] text-white hover:bg-[#3b5de7] hover:shadow-[0_4px_14px_rgba(79,110,247,0.35)]'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {amount > 0
                    ? `${amount.toLocaleString()} UZS to'lash`
                    : "Summa kiriting"}
                </button>
              </div>
            )}

            {/* Step: Confirm */}
            {step === 'confirm' && (
              <div className="px-6 py-5">
                <div className="bg-gray-50 rounded-2xl p-5 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-500">To'lov summasi</span>
                    <span className="text-2xl font-bold text-[#1a1a2e]">{amount.toLocaleString()} UZS</span>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-500">To'lov usuli</span>
                    <span className="text-sm font-semibold text-gray-800">
                      {selectedProvider === 'payme' ? 'Payme' : 'Click'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Komissiya</span>
                    <span className="text-sm font-semibold text-emerald-600">0 UZS</span>
                  </div>
                  <div className="border-t border-gray-200 mt-3 pt-3 flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-700">Jami to'lanadi</span>
                    <span className="text-lg font-bold text-[#4f6ef7]">{amount.toLocaleString()} UZS</span>
                  </div>
                </div>

                {error && (
                  <p className="text-xs text-red-500 text-center mb-4">{error}</p>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep('select')}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 transition-all cursor-pointer border-0"
                  >
                    Ortga
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={processing}
                    className="flex-1 py-3 bg-[#4f6ef7] text-white text-sm font-semibold rounded-xl hover:bg-[#3b5de7] transition-all cursor-pointer border-0 disabled:opacity-50"
                  >
                    {processing ? 'Yuklanmoqda...' : 'To\'lashni boshlash'}
                  </button>
                </div>

                <p className="text-xs text-gray-400 text-center mt-4">
                  {selectedProvider === 'payme'
                    ? "Payme ilovasi ochiladi va to'lovni amalga oshirasiz"
                    : "Click ilovasi ochiladi va to'lovni amalga oshirasiz"}
                </p>
              </div>
            )}

            {/* Step: Success */}
            {step === 'success' && (
              <div className="px-6 py-8 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[#1a1a2e] mb-2">To'lov yaratildi!</h3>
                <p className="text-sm text-gray-500 mb-2">
                  {selectedProvider === 'payme'
                    ? "Payme ilovasida to'lovni tasdiqlang"
                    : "Click ilovasida to'lovni tasdiqlang"}
                </p>
                <p className="text-3xl font-bold text-[#1a1a2e] mb-6">{amount.toLocaleString()} UZS</p>

                {/* Payment link button */}
                {transaction?.paymentUrl && (
                  <a
                    href={transaction.paymentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 mb-3 bg-[#4f6ef7] text-white rounded-xl font-semibold text-sm hover:bg-[#3b5de7] transition-all no-underline"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                    {selectedProvider === 'payme' ? "Payme'da ochish" : "Click'da ochish"}
                  </a>
                )}

                {/* Simulate button for testing */}
                <button
                  onClick={handleSimulate}
                  disabled={processing}
                  className="block w-full px-6 py-3 bg-emerald-500 text-white rounded-xl font-semibold text-sm hover:bg-emerald-600 transition-all cursor-pointer border-0 disabled:opacity-50"
                >
                  {processing ? 'Jarayonda...' : "To'lovni simulyatsiya qilish (test rejimi)"}
                </button>

                <button
                  onClick={handleClose}
                  className="mt-3 text-sm text-gray-500 hover:text-gray-700 transition-colors cursor-pointer bg-transparent border-0"
                >
                  Yopish
                </button>

                <p className="text-[10px] text-gray-300 mt-6">
                  To'lov amalga oshirilgandan so'ng hisobingiz avtomatik to'ldiriladi
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default TopUpModal
