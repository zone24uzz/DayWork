import { useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'

const slides = [
  {
    id: 1,
    title: '👋 Assalomu alaykum!',
    subtitle: 'DayWork platformasiga xush kelibsiz!',
    description:
      'Bu yerda siz kunlik ishlarni tez va oson topishingiz yoki ishonchli ishchilarni bir necha daqiqada topishingiz mumkin.',
    icon: (
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="40" cy="40" r="40" fill="url(#g1)" opacity="0.15" />
        <circle cx="40" cy="40" r="28" fill="url(#g1)" opacity="0.25" />
        <path d="M40 22C30.06 22 22 30.06 22 40C22 49.94 30.06 58 40 58C49.94 58 58 49.94 58 40C58 30.06 49.94 22 40 22ZM40 54C32.28 54 26 47.72 26 40C26 32.28 32.28 26 40 26C47.72 26 54 32.28 54 40C54 47.72 47.72 54 40 54Z" fill="#4F6EF7"/>
        <path d="M40 30C38.34 30 37 31.34 37 33V40C37 40.74 37.31 41.44 37.86 41.93L43.36 46.93C44.16 47.64 45.39 47.56 46.09 46.76C46.79 45.96 46.72 44.74 45.93 44.04L41 39.62V33C41 31.34 39.66 30 38 30H40Z" fill="#4F6EF7"/>
        <defs>
          <linearGradient id="g1" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
            <stop stopColor="#4F6EF7"/>
            <stop offset="1" stopColor="#764ba2"/>
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    id: 2,
    title: '🔎 Platforma imkoniyatlari',
    icon: (
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="10" width="60" height="60" rx="16" fill="url(#g2)" opacity="0.15" />
        <circle cx="38" cy="30" r="8" fill="#4F6EF7" opacity="0.3" />
        <circle cx="38" cy="30" r="5" fill="#4F6EF7" />
        <rect x="26" y="44" width="24" height="3" rx="1.5" fill="#4F6EF7" opacity="0.5" />
        <rect x="26" y="50" width="18" height="3" rx="1.5" fill="#4F6EF7" opacity="0.3" />
        <defs>
          <linearGradient id="g2" x1="10" y1="10" x2="70" y2="70" gradientUnits="userSpaceOnUse">
            <stop stopColor="#4F6EF7"/>
            <stop offset="1" stopColor="#667eea"/>
          </linearGradient>
        </defs>
      </svg>
    ),
    features: [
      { text: 'Yaqin atrofdagi ishlarni topish', icon: '📍' },
      { text: 'Ish beruvchilar bilan tez bog\'lanish', icon: '💬' },
      { text: 'Ichki real-time chat', icon: '⚡' },
      { text: 'Tezkor bildirishnomalar', icon: '🔔' },
      { text: 'Qulay va xavfsiz ish jarayoni', icon: '🛡️' },
    ],
  },
  {
    id: 3,
    title: '⭐ Nega aynan DayWork?',
    icon: (
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M40 8L48.28 28.72L72 31.28L54 47.44L58.56 70L40 58.56L21.44 70L26 47.44L8 31.28L31.72 28.72L40 8Z" fill="url(#g3)" opacity="0.2" />
        <path d="M40 15L46.28 29.72L64 31.78L50 44.42L53.12 62L40 53.48L26.88 62L30 44.42L16 31.78L33.72 29.72L40 15Z" fill="#4F6EF7" />
        <defs>
          <linearGradient id="g3" x1="8" y1="8" x2="72" y2="70" gradientUnits="userSpaceOnUse">
            <stop stopColor="#667eea"/>
            <stop offset="1" color="#764ba2"/>
          </linearGradient>
        </defs>
      </svg>
    ),
    benefits: [
      { text: 'Zamonaviy platforma', icon: '✨' },
      { text: 'Oson foydalanish', icon: '👍' },
      { text: 'Tezkor ishlash', icon: '🚀' },
      { text: 'Ishchilar va ish beruvchilar uchun qulay', icon: '🤝' },
      { text: 'Xavfsiz va ishonchli tizim', icon: '🔒' },
    ],
  },
  {
    id: 4,
    title: '🎉 Boshlashga tayyormisiz?',
    subtitle: 'DayWork sizga yangi imkoniyatlarni ochadi.',
    description:
      'Ish toping, ishchi toping va hamkorlikni bir necha daqiqada boshlang.\n\nSizga omad tilaymiz!',
    icon: (
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="40" cy="40" r="32" fill="url(#g4)" opacity="0.15" />
        <path d="M28 40L36 48L52 32" stroke="#4F6EF7" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="40" cy="40" r="20" stroke="#4F6EF7" strokeWidth="3" opacity="0.3" />
        <defs>
          <linearGradient id="g4" x1="8" y1="8" x2="72" y2="72" gradientUnits="userSpaceOnUse">
            <stop stopColor="#4F6EF7"/>
            <stop offset="1" color="#764ba2"/>
          </linearGradient>
        </defs>
      </svg>
    ),
  },
]

const Onboarding = ({ onComplete }) => {
  const { markOnboardingSeen } = useAuth()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [direction, setDirection] = useState(1) // 1 for next, -1 for prev
  const [animating, setAnimating] = useState(false)
  const totalSlides = slides.length

  const goToSlide = useCallback(
    (index) => {
      if (animating || index === currentSlide || index < 0 || index >= totalSlides) return
      setDirection(index > currentSlide ? 1 : -1)
      setAnimating(true)
      setCurrentSlide(index)
      setTimeout(() => setAnimating(false), 400)
    },
    [currentSlide, animating, totalSlides]
  )

  const handleNext = () => goToSlide(currentSlide + 1)

  const handlePrev = () => goToSlide(currentSlide - 1)

  const handleComplete = async () => {
    // Mark onboarding as seen in local storage immediately
    localStorage.setItem('daywork_onboarding_seen', 'true')
    // Also mark in backend if logged in
    await markOnboardingSeen()
    onComplete()
  }

  const slide = slides[currentSlide]

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-[#f5f6fa] via-white to-[#f0f2ff] flex items-center justify-center overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-[#4f6ef7]/10 to-[#764ba2]/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-gradient-to-tr from-[#667eea]/10 to-[#4f6ef7]/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[radial-gradient(circle,_rgba(79,110,247,0.03)_0%,_transparent_70%)]" />

      <div className="relative w-full max-w-lg mx-auto px-5 sm:px-8">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => goToSlide(i)}
              className={`transition-all duration-500 cursor-pointer border-0 ${
                i === currentSlide
                  ? 'w-10 h-2.5 rounded-full bg-gradient-to-r from-[#4f6ef7] to-[#667eea] shadow-[0_0_10px_rgba(79,110,247,0.4)]'
                  : i < currentSlide
                    ? 'w-2.5 h-2.5 rounded-full bg-[#4f6ef7]/40'
                    : 'w-2.5 h-2.5 rounded-full bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Counter */}
        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/70 backdrop-blur-sm rounded-full text-xs font-medium text-[#4f6ef7] shadow-sm border border-gray-100">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {currentSlide + 1} / {totalSlides}
          </span>
        </div>

        {/* Slide content */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.06)] border border-gray-100/50 p-8 sm:p-10 relative overflow-hidden">
          {/* Inner glow */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-[#4f6ef7]/5 to-transparent rounded-full" />

          <div
            className="relative transition-all duration-400 ease-out"
            style={{
              opacity: animating ? 0 : 1,
              transform: animating
                ? `translateX(${direction * 20}px) scale(0.98)`
                : 'translateX(0) scale(1)',
            }}
          >
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                {slide.icon}
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent rounded-full" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-[#1a1a2e] mb-4 leading-tight">
              {slide.title}
            </h2>

            {/* Slide 1 - Subtitle */}
            {slide.subtitle && (
              <p className="text-base text-gray-600 text-center mb-3 font-medium">
                {slide.subtitle}
              </p>
            )}

            {/* Slide 1 - Description */}
            {slide.description && (
              <p className="text-sm text-gray-500 text-center leading-relaxed whitespace-pre-line">
                {slide.description}
              </p>
            )}

            {/* Slide 2 - Features */}
            {slide.features && (
              <div className="space-y-3 mt-6">
                {slide.features.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-4 py-3 bg-[#f5f6fa]/70 rounded-2xl border border-gray-100/50 transition-all duration-300 hover:bg-[#f0f2ff] hover:border-[#4f6ef7]/20 group"
                    style={{
                      opacity: animating ? 0 : 1,
                      transform: animating ? `translateX(${direction * 10}px)` : 'translateX(0)',
                      transitionDelay: `${i * 60}ms`,
                    }}
                  >
                    <span className="text-lg shrink-0">{f.icon}</span>
                    <span className="text-sm text-gray-700 font-medium">{f.text}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Slide 3 - Benefits */}
            {slide.benefits && (
              <div className="grid grid-cols-1 gap-3 mt-6">
                {slide.benefits.map((b, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-4 py-3 bg-[#f5f6fa]/70 rounded-2xl border border-gray-100/50 transition-all duration-300 hover:bg-[#f0f2ff] hover:border-[#4f6ef7]/20"
                    style={{
                      opacity: animating ? 0 : 1,
                      transform: animating ? `translateX(${direction * 10}px)` : 'translateX(0)',
                      transitionDelay: `${i * 60}ms`,
                    }}
                  >
                    <span className="text-lg shrink-0">{b.icon}</span>
                    <span className="text-sm text-gray-700 font-medium">{b.text}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Slide 4 - Final description */}
            {currentSlide === 3 && slide.description && (
              <p className="text-sm text-gray-500 text-center leading-relaxed mt-4 whitespace-pre-line">
                {slide.description}
              </p>
            )}
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-8 gap-4">
          {/* Back button (hidden on first slide) */}
          {currentSlide > 0 ? (
            <button
              onClick={handlePrev}
              className="flex items-center gap-2 px-5 py-3 text-sm font-medium text-gray-600 hover:text-[#4f6ef7] bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200 hover:border-[#4f6ef7]/30 transition-all duration-200 cursor-pointer hover:shadow-[0_4px_14px_rgba(79,110,247,0.1)]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Ortga
            </button>
          ) : (
            <div /> /* Spacer */
          )}

          {/* Next / Start button */}
          {currentSlide < totalSlides - 1 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#4f6ef7] to-[#667eea] text-white text-sm font-semibold rounded-2xl shadow-[0_4px_14px_rgba(79,110,247,0.35)] hover:shadow-[0_6px_20px_rgba(79,110,247,0.45)] transition-all duration-200 cursor-pointer border-0 hover:-translate-y-0.5 active:translate-y-0"
            >
              Davom etish
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="flex items-center gap-2 px-7 py-3 bg-gradient-to-r from-[#4f6ef7] to-[#667eea] text-white text-sm font-bold rounded-2xl shadow-[0_4px_14px_rgba(79,110,247,0.35)] hover:shadow-[0_6px_24px_rgba(79,110,247,0.5)] transition-all duration-200 cursor-pointer border-0 hover:-translate-y-0.5 active:translate-y-0 animate-pulse-glow"
            >
              🚀 Ishni boshlash
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          )}
        </div>

        {/* Skip button */}
        <div className="text-center mt-5">
          <button
            onClick={handleComplete}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors cursor-pointer border-0 bg-transparent underline-offset-2 hover:underline"
          >
            O'tkazib yuborish
          </button>
        </div>
      </div>
    </div>
  )
}

export default Onboarding
