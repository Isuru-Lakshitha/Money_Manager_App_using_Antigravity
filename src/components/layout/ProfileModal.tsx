import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Lock, Save, Camera, Mail, Globe } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useAppStore } from '@/store'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  onAvatarUpdated?: () => void
}

export default function ProfileModal({ isOpen, onClose, onAvatarUpdated }: ProfileModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  // Profile State
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  
  // Security State
  const [newPassword, setNewPassword] = useState('')
  
  // App State
  const baseCurrency = useAppStore(state => state.baseCurrency)
  const updateBaseCurrency = useAppStore(state => state.updateBaseCurrency)
  const [localCurrency, setLocalCurrency] = useState(baseCurrency)

  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const supabase = createClient()

  useEffect(() => {
    if (isOpen) {
      loadProfile()
      setLocalCurrency(baseCurrency)
    }
  }, [isOpen, baseCurrency])

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setEmail(user.email || '')
      setFullName(user.user_metadata?.full_name || '')
      setAvatarUrl(user.user_metadata?.avatar_url || '')
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setLoading(true)
      setMessage(null)
      const file = e.target.files?.[0]
      if (!file) {
        setLoading(false)
        return
      }
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No user detected.")
      
      // 1. Read file manually
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.onload = async () => {
           try {
              // 2. Base64 Compression Canvas
              const canvas = document.createElement('canvas')
              const maxDim = 150
              let width = img.width
              let height = img.height
              if (width > height) {
                if (width > maxDim) { height *= maxDim / width; width = maxDim; }
              } else {
                if (height > maxDim) { width *= maxDim / height; height = maxDim; }
              }
              canvas.width = width
              canvas.height = height
              const ctx = canvas.getContext('2d')
              ctx?.drawImage(img, 0, 0, width, height)
              
              // 3. Compress to lightweight JPEG Base64 payload
              const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
              
              setAvatarUrl(dataUrl)
              
              const { error: uploadError } = await supabase.auth.updateUser({
                 data: { avatar_url: dataUrl }
              })
              if (uploadError) throw new Error(uploadError.message)
              
              setMessage({ type: 'success', text: "Successfully optimized and saved local image directly to your secure profile."})
              if (onAvatarUpdated) onAvatarUpdated()
           } catch (err: any) {
              setMessage({ type: 'error', text: err.message })
           } finally {
              setLoading(false)
           }
        }
        img.src = event.target?.result as string
      }
      reader.readAsDataURL(file)
    } catch(err: any) {
      setMessage({ type: 'error', text: err.message })
      setLoading(false)
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    
    try {
      // Auto generate avatar if none provided
      const finalAvatar = avatarUrl || (fullName ? `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0ea5e9&color=fff&size=200` : '')
      
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          avatar_url: finalAvatar
        }
      })
      
      if (error) throw error
      
      if (localCurrency !== baseCurrency) {
        await updateBaseCurrency(localCurrency)
      }

      setMessage({ type: 'success', text: 'Profile completely updated!' })
      if (onAvatarUpdated) onAvatarUpdated()
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })
      if (error) throw error
      
      setMessage({ type: 'success', text: 'Security credentials updated successfully.' })
      setNewPassword('')
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pb-20 md:pb-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 shadow-2xl rounded-3xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
            <h2 className="text-xl font-bold text-white tracking-wide">Account Settings</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/5">
            <button
              onClick={() => { setActiveTab('profile'); setMessage(null); }}
              className={`flex-1 py-4 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'profile' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-gray-400 hover:text-white'}`}
            >
              Profile
            </button>
            <button
              onClick={() => { setActiveTab('security'); setMessage(null); }}
              className={`flex-1 py-4 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'security' ? 'border-purple-400 text-purple-400' : 'border-transparent text-gray-400 hover:text-white'}`}
            >
              Security
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 pb-32 python-scrollbar">
            {message && (
              <div className={`p-4 rounded-xl text-sm mb-6 ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                {message.text}
              </div>
            )}

            {activeTab === 'profile' && (
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="flex justify-center mb-8">
                  <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-500 p-0.5 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                      <div className="w-full h-full bg-black rounded-full overflow-hidden flex items-center justify-center relative">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-10 h-10 text-gray-400" />
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                           <Camera className="w-6 h-6 text-white mb-1" />
                           <span className="text-[10px] font-bold text-white">UPLOAD</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleAvatarUpload} />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Display Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        placeholder="e.g. Satoshi Nakamoto"
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Email Address (Read Only)</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                      <input
                        type="email"
                        value={email}
                        readOnly
                        className="w-full bg-white/5 border border-white/5 rounded-xl py-3 pl-11 pr-4 text-gray-400 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Avatar Image URL (Optional)</label>
                    <div className="relative">
                      <Camera className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                      <input
                        type="url"
                        value={avatarUrl}
                        onChange={e => setAvatarUrl(e.target.value)}
                        placeholder="https://imgur.com/..."
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50"
                      />
                    </div>
                    <p className="text-[10px] text-gray-500 mt-2">Leave blank to auto-generate from your display name.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Base Currency</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                      <select
                        value={localCurrency}
                        onChange={e => setLocalCurrency(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 appearance-none"
                      >
                        <option value="LKR">LKR - Sri Lankan Rupee</option>
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                        <option value="INR">INR - Indian Rupee</option>
                        <option value="AUD">AUD - Australian Dollar</option>
                        <option value="SGD">SGD - Singapore Dollar</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold py-3 flex justify-center items-center rounded-xl transition-all glow-cyan mt-6"
                >
                  <Save className="w-5 h-5 mr-2" />
                  {loading ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </form>
            )}

            {activeTab === 'security' && (
              <form onSubmit={handleUpdatePassword} className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Enter new strong password"
                      required
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50"
                    />
                  </div>
                  <p className="text-[10px] text-gray-500 mt-2">Minimum 6 characters. You will remain logged in on this device.</p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-purple-500 hover:bg-purple-400 text-black font-semibold py-3 flex justify-center items-center rounded-xl transition-all glow-purple mt-6"
                >
                  <Lock className="w-5 h-5 mr-2" />
                  {loading ? 'Securing...' : 'Deploy New Password'}
                </button>
              </form>
            )}

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
