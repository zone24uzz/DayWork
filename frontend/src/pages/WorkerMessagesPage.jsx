

const WorkerMessagesPage = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1a1a2e] mb-2">Xabarlar</h1>
      <p className="text-sm text-gray-500 mb-8">Ish beruvchilar bilan suhbatlaringiz</p>
      <div className="bg-white rounded-2xl p-12 shadow-[0_2px_12px_rgba(0,0,0,0.04)] text-center">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <p className="text-gray-400 text-sm">Hozircha xabarlar yo'q</p>
      </div>
    </div>
  )
}

export default WorkerMessagesPage
