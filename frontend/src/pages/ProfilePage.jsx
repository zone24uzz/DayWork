import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

const ProfilePage = () => {
  const { user, updateProfile, changePassword } = useAuth()

  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({
    name: user?.name || '',
    surname: user?.surname || '',
    age: user?.age || '',
    gender: user?.gender || 'Erkak',
    phone: user?.phone || '',
    company: user?.company || '',
    position: user?.position || '',
    passport: user?.passport || '',
    jshshir: user?.jshshir || '',
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

  const [notifications, setNotifications] = useState({
    newJobs: true,
    messages: true,
    payments: false,
  })

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    setError('')
    setSuccess('')
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      await updateProfile({
        name: form.name,
        surname: form.surname,
        age: form.age ? Number(form.age) : undefined,
        gender: form.gender,
        phone: form.phone,
        company: form.company,
        position: form.position,
        passport: form.passport,
        jshshir: form.jshshir,
      })
      setSuccess('Profil muvaffaqiyatli yangilandi!')
      setIsEditing(false)
    } catch (err) {
      setError(err.message || 'Saqlashda xatolik')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setForm({
      name: user?.name || '',
      surname: user?.surname || '',
      age: user?.age || '',
      gender: user?.gender || 'Erkak',
      phone: user?.phone || '',
      company: user?.company || '',
      position: user?.position || '',
      passport: user?.passport || '',
      jshshir: user?.jshshir || '',
    })
    setIsEditing(false)
    setError('')
    setSuccess('')
  }

  const handlePasswordChange = async () => {
    setPasswordError('')
    setPasswordSuccess('')

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setPasswordError('Joriy va yangi parolni kiriting')
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Yangi parollar mos kelmaydi')
      return
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('Yangi parol kamida 6 belgi bo\'lishi kerak')
      return
    }

    setChangingPassword(true)
    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword)
      setPasswordSuccess('Parol muvaffaqiyatli o\'zgartirildi!')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setPasswordError(err.message || 'Parol o\'zgartirishda xatolik')
    } finally {
      setChangingPassword(false)
    }
  }

  const toggleNotification = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const userName = form.name || user?.name || 'Foydalanuvchi'

  const inputClass = "w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-[#4f6ef7] focus:bg-white transition-all placeholder:text-gray-400"
  const labelClass = "block text-xs text-gray-400 mb-1"

  useEffect(() => {
    document.title = 'DayWork — Profil'
  }, [])

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1a1a2e]">Mening Profiligim</h1>
        <p className="text-sm text-gray-500 mt-1">
          Shaxsiy ma'lumotlaringizni boshqaring va xavfsizlik sozlamalarini yangilang
        </p>
      </div>

      {/* Success/Error messages */}
      {success && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-600">{success}</div>
      )}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Personal & Passport Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shaxsiy Ma'lumotlar */}
          <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[#1a1a2e]">Shaxsiy Ma'lumotlar</h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#4f6ef7] bg-[#4f6ef7]/5 hover:bg-[#4f6ef7]/10 rounded-xl transition-colors cursor-pointer border-0"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Tahrirlash
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer border-0"
                  >
                    Bekor qilish
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#4f6ef7] hover:bg-[#3b5de7] rounded-xl transition-colors cursor-pointer border-0 disabled:opacity-50"
                  >
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                        <polyline points="17 21 17 13 7 13 7 21" />
                        <polyline points="7 3 7 8 15 8" />
                      </svg>
                    )}
                    Saqlash
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {userName[0]?.toUpperCase() || 'U'}
                </div>
                <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#4f6ef7] rounded-full flex items-center justify-center text-white shadow-lg hover:bg-[#3b5de7] transition-colors cursor-pointer border-2 border-white">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </button>
              </div>

              {/* Info Grid */}
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Ism</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={form.name}
                      onChange={handleChange('name')}
                      className={inputClass}
                      placeholder="Ismingiz"
                    />
                  ) : (
                    <p className="text-sm font-medium text-[#1a1a2e]">{userName}</p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>Familiya</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={form.surname}
                      onChange={handleChange('surname')}
                      className={inputClass}
                      placeholder="Familiyangiz"
                    />
                  ) : (
                    <p className="text-sm font-medium text-[#1a1a2e]">{user?.surname || '—'}</p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>Yosh</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={form.age}
                      onChange={handleChange('age')}
                      className={inputClass}
                      placeholder="Yoshingiz"
                      min="0"
                      max="120"
                    />
                  ) : (
                    <p className="text-sm font-medium text-[#1a1a2e]">{user?.age || '—'}</p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>Jins</label>
                  {isEditing ? (
                    <select
                      value={form.gender}
                      onChange={handleChange('gender')}
                      className={inputClass}
                    >
                      <option value="Erkak">Erkak</option>
                      <option value="Ayol">Ayol</option>
                    </select>
                  ) : (
                    <p className="text-sm font-medium text-[#1a1a2e]">{user?.gender || '—'}</p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>Telefon</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={handleChange('phone')}
                      className={inputClass}
                      placeholder="+998 XX XXX XX XX"
                    />
                  ) : (
                    <p className="text-sm font-medium text-[#1a1a2e]">{user?.phone || '—'}</p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <p className="text-sm font-medium text-[#1a1a2e]">{user?.email || '—'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pasport Ma'lumotlari */}
          <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <h2 className="text-lg font-semibold text-[#1a1a2e] mb-6">Pasport Ma'lumotlari</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Seriya va Raqam</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={form.passport}
                    onChange={handleChange('passport')}
                    className={inputClass}
                    placeholder="AA 1234567"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-[#1a1a2e]">{user?.passport || '—'}</p>
                    {user?.passport && (
                      <span className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className={labelClass}>JSHSHIR</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={form.jshshir}
                    onChange={handleChange('jshshir')}
                    className={inputClass}
                    placeholder="31201940123456"
                  />
                ) : (
                  <p className="text-sm font-medium text-[#1a1a2e]">{user?.jshshir || '—'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Ish beruvchi ma'lumotlari (faqat employer uchun) */}
          {user?.userType === 'employer' && (
            <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
              <h2 className="text-lg font-semibold text-[#1a1a2e] mb-6">Ish Beruvchi Ma'lumotlari</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Kompaniya</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={form.company}
                      onChange={handleChange('company')}
                      className={inputClass}
                      placeholder="Kompaniya nomi"
                    />
                  ) : (
                    <p className="text-sm font-medium text-[#1a1a2e]">{user?.company || '—'}</p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>Lavozim</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={form.position}
                      onChange={handleChange('position')}
                      className={inputClass}
                      placeholder="Lavozimingiz"
                    />
                  ) : (
                    <p className="text-sm font-medium text-[#1a1a2e]">{user?.position || '—'}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Security & Notifications */}
        <div className="space-y-6">
          {/* Xavfsizlik */}
          <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <h2 className="text-lg font-semibold text-[#1a1a2e] mb-6">Xavfsizlik</h2>

            {passwordError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">{passwordError}</div>
            )}
            {passwordSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-600">{passwordSuccess}</div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-2">Joriy Parol</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => { setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value })); setPasswordError(''); setPasswordSuccess(''); }}
                  placeholder="Joriy parolni kiriting"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-2">Yangi Parol</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => { setPasswordForm(prev => ({ ...prev, newPassword: e.target.value })); setPasswordError(''); setPasswordSuccess(''); }}
                  placeholder="Yangi parolni kiriting"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-2">Parolni Tasdiqlash</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => { setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value })); setPasswordError(''); setPasswordSuccess(''); }}
                  placeholder="Yangi parolni qayta kiriting"
                  className={inputClass}
                />
              </div>
              <button
                onClick={handlePasswordChange}
                disabled={changingPassword}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#4f6ef7] hover:bg-[#3b5de7] text-white text-sm font-medium rounded-xl transition-colors cursor-pointer border-0 disabled:opacity-50"
              >
                {changingPassword ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                )}
                Parolni O'zgartirish
              </button>
            </div>
          </div>

          {/* Bildirishnomalar */}
          <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <h2 className="text-lg font-semibold text-[#1a1a2e] mb-6">Bildirishnomalar</h2>
            <div className="space-y-4">
              {/* Yangi Ishlar */}
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="text-sm font-medium text-[#1a1a2e]">Yangi Ishlar</p>
                  <p className="text-xs text-gray-400 mt-0.5">Yangi ish e'lonlari haqida xabarlar</p>
                </div>
                <button
                  onClick={() => toggleNotification('newJobs')}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-200 cursor-pointer border-0 ${
                    notifications.newJobs ? 'bg-[#4f6ef7]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                      notifications.newJobs ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Xabarlar */}
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="text-sm font-medium text-[#1a1a2e]">Xabarlar</p>
                  <p className="text-xs text-gray-400 mt-0.5">Ish beruvchilardan xabarlar</p>
                </div>
                <button
                  onClick={() => toggleNotification('messages')}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-200 cursor-pointer border-0 ${
                    notifications.messages ? 'bg-[#4f6ef7]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                      notifications.messages ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* To'lovlar */}
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-[#1a1a2e]">To'lovlar</p>
                  <p className="text-xs text-gray-400 mt-0.5">Muvaffaqiyatli to'lovlar</p>
                </div>
                <button
                  onClick={() => toggleNotification('payments')}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-200 cursor-pointer border-0 ${
                    notifications.payments ? 'bg-[#4f6ef7]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                      notifications.payments ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
