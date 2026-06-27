import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

const staggerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
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

const LoginForm = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      setError('Iltimos, email va parolni kiriting')
      return
    }
    if (!agreeToTerms) {
      setError('Iltimos, foydalanish shartlariga rozilik bildiring')
      return
    }
    setError('')
    setIsLoading(true)

    try {
      const data = await login(email, password)
      if (data.user.userType === 'employer') {
        navigate('/employer')
      } else {
        navigate('/worker')
      }
    } catch (err) {
      setError(err.message || 'Kirishda xatolik')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.form
      className="flex flex-col gap-5"
      onSubmit={handleSubmit}
      variants={staggerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="flex flex-col gap-1.5" variants={fieldVariants}>
        <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
        <input
          id="email"
          type="email"
          placeholder="Email manzilingiz"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          className="w-full px-3.5 py-3 border border-gray-200 rounded-xl text-[15px] text-gray-800 bg-gray-50 outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-[#4f6ef7] focus:bg-white focus:shadow-[0_0_0_3px_rgba(79,110,247,0.1)]"
          required
        />
      </motion.div>

      <motion.div className="flex flex-col gap-1.5" variants={fieldVariants}>
        <label htmlFor="password" className="text-sm font-medium text-gray-700">Parol</label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Parol"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="w-full px-3.5 py-3 pr-11 border border-gray-200 rounded-xl text-[15px] text-gray-800 bg-gray-50 outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-[#4f6ef7] focus:bg-white focus:shadow-[0_0_0_3px_rgba(79,110,247,0.1)]"
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
      </motion.div>

      {error && (
        <motion.p
          className="text-xs text-red-500 text-center -mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {error}
        </motion.p>
      )}

      <motion.div className="flex items-center justify-between" variants={fieldVariants}>
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="w-[18px] h-[18px] cursor-pointer"
          />
          Eslab qolish
        </label>
        <a href="#" className="text-sm text-[#4f6ef7] no-underline font-medium hover:text-[#3b5de7] hover:underline transition-colors">Parolni unutdingizmi?</a>
      </motion.div>

      <motion.div variants={fieldVariants}>
        <label className="flex items-start gap-2.5 text-sm text-gray-500 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={agreeToTerms}
            onChange={(e) => { setAgreeToTerms(e.target.checked); setError('') }}
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
          {isLoading ? 'Yuklanmoqda...' : 'Kirish'}
        </button>
      </motion.div>

      <motion.p className="text-center text-sm text-gray-500 mt-1" variants={fieldVariants}>
        Akkountingiz yo'qmi?{' '}
        <Link to="/register" className="text-[#4f6ef7] no-underline font-medium hover:underline">Ro'yxatdan o'tish</Link>
      </motion.p>
    </motion.form>
  )
}

export default LoginForm