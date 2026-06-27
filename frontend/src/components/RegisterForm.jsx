import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

const staggerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
}

const fieldVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
}

const RegisterForm = () => {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    company: '',
    position: '',
    phone: '',
    userType: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [termsError, setTermsError] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!agreeToTerms) {
      setTermsError('Iltimos, foydalanish shartlariga rozilik bildiring')
      return
    }
    if (!formData.userType) {
      setError('Iltimos, ishchi yoki ish beruvchi ekanligingizni tanlang')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Parollar mos kelmaydi')
      return
    }
    setTermsError('')
    setError('')
    setIsLoading(true)

    try {
      await register({
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        company: formData.company,
        position: formData.position,
        userType: formData.userType,
      })

      if (formData.userType === 'employer') {
        navigate('/employer')
      } else {
        navigate('/worker')
      }
    } catch (err) {
      setError(err.message || 'Ro\'yxatdan o\'tishda xatolik')
    } finally {
      setIsLoading(false)
    }
  }

  const inputClass = "w-full py-2.5 pr-9 border-0 border-b-[1.5px] border-gray-200 text-sm text-gray-800 bg-transparent outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-[#4f6ef7] focus:shadow-none focus:bg-transparent"

  return (
    <motion.form
      className="flex flex-col gap-4"
      onSubmit={handleSubmit}
      variants={staggerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="flex flex-col gap-1" variants={fieldVariants}>
        <label htmlFor="fullName" className="text-xs font-medium text-gray-500">To'liq ism</label>
        <input
          id="fullName"
          type="text"
          placeholder="To'liq ismingiz"
          value={formData.fullName}
          onChange={handleChange('fullName')}
          autoComplete="name"
          className={inputClass}
          required
        />
      </motion.div>

      <motion.div className="flex flex-col gap-1" variants={fieldVariants}>
        <label htmlFor="regEmail" className="text-xs font-medium text-gray-500">Email</label>
        <input
          id="regEmail"
          type="email"
          placeholder="Email manzilingiz"
          value={formData.email}
          onChange={handleChange('email')}
          autoComplete="email"
          className={inputClass}
          required
        />
      </motion.div>

      <motion.div className="grid grid-cols-2 gap-4" variants={fieldVariants}>
        <div className="flex flex-col gap-1">
          <label htmlFor="company" className="text-xs font-medium text-gray-500">Kompaniya</label>
          <input
            id="company"
            type="text"
            placeholder="Kompaniya nomi"
            value={formData.company}
            onChange={handleChange('company')}
            autoComplete="organization"
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="position" className="text-xs font-medium text-gray-500">Lavozim</label>
          <input
            id="position"
            type="text"
            placeholder="Lavozimingiz"
            value={formData.position}
            onChange={handleChange('position')}
            autoComplete="organization-title"
            className={inputClass}
          />
        </div>
      </motion.div>

      <motion.div className="flex flex-col gap-1" variants={fieldVariants}>
        <label htmlFor="phone" className="text-xs font-medium text-gray-500">Telefon raqam</label>
        <input
          id="phone"
          type="tel"
          placeholder="+998 XX XXX XX XX"
          value={formData.phone}
          onChange={handleChange('phone')}
          autoComplete="tel"
          className={inputClass}
        />
      </motion.div>

      <motion.div className="flex flex-col gap-1" variants={fieldVariants}>
        <label className="text-xs font-medium text-gray-500">Siz kimsiz?</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, userType: 'worker' }))}
            aria-label="Men ishchiman"
            className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
              formData.userType === 'worker'
                ? 'border-[#4f6ef7] bg-[#4f6ef7]/5'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={formData.userType === 'worker' ? '#4f6ef7' : '#6b7280'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span className={`text-sm font-medium ${formData.userType === 'worker' ? 'text-[#4f6ef7]' : 'text-gray-600'}`}>Men ishchiman</span>
          </button>
          <button
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, userType: 'employer' }))}
            aria-label="Men ish beruvchiman"
            className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
              formData.userType === 'employer'
                ? 'border-[#4f6ef7] bg-[#4f6ef7]/5'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={formData.userType === 'employer' ? '#4f6ef7' : '#6b7280'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
            <span className={`text-sm font-medium ${formData.userType === 'employer' ? 'text-[#4f6ef7]' : 'text-gray-600'}`}>Men ish beruvchiman</span>
          </button>
        </div>
      </motion.div>

      <motion.div className="grid grid-cols-2 gap-4" variants={fieldVariants}>
        <div className="flex flex-col gap-1">
          <label htmlFor="regPassword" className="text-xs font-medium text-gray-500">Parol</label>
          <div className="relative">
            <input
              id="regPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="Parol"
              value={formData.password}
              onChange={handleChange('password')}
              autoComplete="new-password"
              className={inputClass}
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Parolni yashirish' : 'Parolni ko\'rsatish'}
              tabIndex={-1}
            >
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="confirmPassword" className="text-xs font-medium text-gray-500">Parolni tasdiqlash</label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirm ? 'text' : 'password'}
              placeholder="Parolni qayta kiriting"
              value={formData.confirmPassword}
              onChange={handleChange('confirmPassword')}
              autoComplete="new-password"
              className={inputClass}
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowConfirm(!showConfirm)}
              aria-label={showConfirm ? 'Parolni yashirish' : 'Parolni ko\'rsatish'}
              tabIndex={-1}
            >
              {showConfirm ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {error && (
        <motion.p
          className="text-xs text-red-500 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {error}
        </motion.p>
      )}

      <motion.div variants={fieldVariants}>
        <label className="flex items-start gap-2.5 text-sm text-gray-500 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={agreeToTerms}
            onChange={(e) => { setAgreeToTerms(e.target.checked); setTermsError('') }}
            className="mt-0.5 w-[18px] h-[18px] cursor-pointer shrink-0"
          />
          <span>
            Men{' '}
            <a href="#" className="text-[#4f6ef7] no-underline font-medium hover:underline">Foydalanish shartlari</a>
            {' '}va{' '}
            <a href="#" className="text-[#4f6ef7] no-underline font-medium hover:underline">Maxfiylik siyosati</a>
            {' '}bilan tanishdim va roziman
          </span>
        </label>
        {termsError && (
          <motion.p
            className="text-xs text-red-500 mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {termsError}
          </motion.p>
        )}
      </motion.div>

      <motion.div variants={fieldVariants}>
        <button
          type="submit"
          disabled={!agreeToTerms || isLoading}
          className={`w-full py-3.5 text-white border-none rounded-xl text-base font-semibold transition-all duration-200 active:translate-y-[1px] ${
            agreeToTerms && !isLoading
              ? 'bg-[#4f6ef7] hover:bg-[#3b5de7] hover:shadow-[0_4px_14px_rgba(79,110,247,0.35)] cursor-pointer'
              : 'bg-[#4f6ef7]/50 cursor-not-allowed'
          }`}
        >
          {isLoading ? 'Yuklanmoqda...' : 'Akkount yaratish'}
        </button>
      </motion.div>
    </motion.form>
  )
}

export default RegisterForm