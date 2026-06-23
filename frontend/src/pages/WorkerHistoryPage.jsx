const WorkerHistoryPage = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1a1a2e] mb-2">Tarix</h1>
      <p className="text-sm text-gray-500 mb-8">O'tgan ishlaringiz tarixi</p>
      <div className="bg-white rounded-2xl p-12 shadow-[0_2px_12px_rgba(0,0,0,0.04)] text-center">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <p className="text-gray-400 text-sm">Hozircha tarix yo'q</p>
      </div>
    </div>
  )
}

export default WorkerHistoryPage
