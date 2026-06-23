import { useLocation, useNavigate } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { motion, AnimatePresence } from 'framer-motion'
import LoginForm from '../components/LoginForm'
import RegisterForm from '../components/RegisterForm'

// Requires a Google Cloud Console OAuth 2.0 Client ID
// Set VITE_GOOGLE_CLIENT_ID in .env file
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
if (!GOOGLE_CLIENT_ID) {
  console.warn('VITE_GOOGLE_CLIENT_ID not set in .env — Google login will not work')
}

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.1 + i * 0.08, duration: 0.35, ease: 'easeOut' },
  }),
}

/**
 * Card flip variants — each card enters and exits from the same side:
 * Login from/to left (-90°), Register from/to right (90°)
 */
const cardVariants = {
  login: {
    initial: { rotateY: -90, opacity: 0 },
    animate: {
      rotateY: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] },
    },
    exit: {
      rotateY: -90,
      opacity: 0,
      transition: { duration: 0.4, ease: 'easeInOut' },
    },
  },
  register: {
    initial: { rotateY: 90, opacity: 0 },
    animate: {
      rotateY: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] },
    },
    exit: {
      rotateY: 90,
      opacity: 0,
      transition: { duration: 0.4, ease: 'easeInOut' },
    },
  },
}

const AuthPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const isLogin = location.pathname === '/login'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#667eea] to-[#764ba2] p-5">
      <div className="w-full max-w-[440px]">
        {/* Logo */}
        <motion.div
          className="flex items-center justify-center gap-2.5 mb-6"
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <rect width="36" height="36" rx="18" fill="#4F6EF7" />
            <path d="M10 26V10h6l4 8 4-8h6v16h-5V17l-3 5-3-5v9h-5z" fill="white" />
          </svg>
          <h1 className="text-[28px] font-bold text-white tracking-tight">DayWork</h1>
        </motion.div>

        {/* Toggle Buttons — always fixed, never animate out */}
        <motion.div
          className="flex bg-white/15 backdrop-blur-sm rounded-xl p-1 mb-6"
          variants={fadeUp}
          custom={0}
          initial="hidden"
          animate="visible"
        >
          <button
            onClick={() => navigate('/login')}
            className={`flex-1 py-2.5 text-center text-sm font-semibold rounded-lg transition-all duration-300 cursor-pointer ${
              isLogin
                ? 'text-white bg-[#4f6ef7] shadow-[0_2px_8px_rgba(79,110,247,0.3)]'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            Kirish
          </button>
          <button
            onClick={() => navigate('/register')}
            className={`flex-1 py-2.5 text-center text-sm font-semibold rounded-lg transition-all duration-300 cursor-pointer ${
              !isLogin
                ? 'text-white bg-[#4f6ef7] shadow-[0_2px_8px_rgba(79,110,247,0.3)]'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            Ro'yxatdan o'tish
          </button>
        </motion.div>

        {/* Animated Card Container */}
        <div style={{ perspective: '1200px' }}>
          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.div
                key="login"
                variants={cardVariants.login}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <div className="bg-white rounded-2xl p-10 shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
                  <motion.div
                    className="text-center mb-8"
                    variants={fadeUp}
                    custom={1}
                    initial="hidden"
                    animate="visible"
                  >
                    <h2 className="text-2xl font-semibold text-[#1a1a2e] mb-2">
                      Tizimga kirish
                    </h2>
                    <p className="text-sm text-gray-500">
                      Hisobingizga kirish uchun ma'lumotlaringizni kiriting
                    </p>
                  </motion.div>

                  <motion.div
                    variants={fadeUp}
                    custom={2}
                    initial="hidden"
                    animate="visible"
                  >
                    {GOOGLE_CLIENT_ID ? (
                      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                        <LoginForm />
                      </GoogleOAuthProvider>
                    ) : (
                      <LoginForm />
                    )}
                  </motion.div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="register"
                variants={cardVariants.register}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <div className="bg-white rounded-2xl p-9 px-10 shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
                  <motion.div
                    className="text-center mb-5"
                    variants={fadeUp}
                    custom={1}
                    initial="hidden"
                    animate="visible"
                  >
                    <h2 className="text-2xl font-semibold text-[#1a1a2e] mb-2">
                      Ro'yxatdan o'tish
                    </h2>
                    <p className="text-sm text-gray-500">
                      Ro'yxatdan o'tish orqali sarguzashtingizni boshlang
                    </p>
                  </motion.div>

                  <motion.div
                    variants={fadeUp}
                    custom={2}
                    initial="hidden"
                    animate="visible"
                  >
                    <RegisterForm />
                  </motion.div>

                  <motion.p
                    className="text-center text-sm text-gray-500 mt-5"
                    variants={fadeUp}
                    custom={3}
                    initial="hidden"
                    animate="visible"
                  >
                    Akkountingiz bormi?{' '}
                    <button
                      onClick={() => navigate('/login')}
                      className="text-[#4f6ef7] font-semibold hover:underline bg-transparent border-none cursor-pointer text-sm"
                    >
                      Kirish
                    </button>
                  </motion.p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default AuthPage
