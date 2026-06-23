import { Link } from 'react-router-dom'

const WorkerMyJobsPage = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1a1a2e] mb-2">Mening ishlarim</h1>
      <p className="text-sm text-gray-500 mb-8">Qabul qilgan va bajarayotgan ishlar</p>
      <div className="bg-white rounded-2xl p-12 shadow-[0_2px_12px_rgba(0,0,0,0.04)] text-center">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
        <p className="text-gray-400 text-sm">Hozircha ishlar yo'q</p>
        <Link to="/worker/search" className="inline-block mt-4 px-5 py-2.5 bg-[#4f6ef7] text-white text-sm font-medium rounded-xl no-underline hover:bg-[#3b5de7] transition-colors">
          Ish qidirish
        </Link>
      </div>
    </div>
  )
}

export default WorkerMyJobsPage
