

const WorkerWalletPage = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1a1a2e] mb-2">Hamyon</h1>
      <p className="text-sm text-gray-500 mb-8">Moliyaviy operatsiyalaringiz</p>
      <div className="bg-white rounded-2xl p-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-gray-500">Jami balans</p>
            <p className="text-3xl font-bold text-[#1a1a2e]">0 SO'M</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#4f6ef7]/10 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4f6ef7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
          </div>
        </div>
        <div className="border-t border-gray-100 pt-6 text-center">
          <p className="text-gray-400 text-sm">Hozircha tranzaksiyalar yo'q</p>
        </div>
      </div>
    </div>
  )
}

export default WorkerWalletPage
