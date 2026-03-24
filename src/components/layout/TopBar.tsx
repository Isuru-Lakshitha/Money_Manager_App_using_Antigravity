"use client"

import { useState, useRef, useEffect } from 'react'
import { Search, Bell, Plus, User, X, ArrowUpRight, ArrowDownRight, ArrowRightLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/store'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ProfileModal from './ProfileModal'

export default function TopBar() {
  const router = useRouter()
  const setGlobalTxModalOpen = useAppStore(state => state.setGlobalTxModalOpen)
  const setGlobalTxToEdit = useAppStore(state => state.setGlobalTxToEdit)
  const globalSearchTerm = useAppStore(state => state.globalSearchTerm)
  const setGlobalSearchTerm = useAppStore(state => state.setGlobalSearchTerm)

  const transactions = useAppStore(state => state.transactions)
  const categories = useAppStore(state => state.categories)
  const accounts = useAppStore(state => state.accounts)
  const loans = useAppStore(state => state.loans)
  const loanPayments = useAppStore(state => state.loanPayments)

  const [isFocused, setIsFocused] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [userMeta, setUserMeta] = useState<{ full_name?: string, avatar_url?: string } | null>(null)
  
  const searchRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)

  // Handle clicking outside to close suggestions
  useEffect(() => {
    async function loadUser() {
      try {
        const { createClient } = await import('@/utils/supabase/client')
        const supabase = createClient()
        const { data } = await supabase.auth.getUser()
        if (data.user) {
          setUserMeta(data.user.user_metadata as any)
        }
      } catch (e) {}
    }
    loadUser()

    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const getCategoryName = (id?: string | null) => {
    if (!id) return 'Uncategorized'

    // First check custom categories in store
    const cat = categories.find(c => c.id === id)
    if (cat) return cat.name

    // Fallback names for default app categories
    const defaultCategories: Record<string, string> = {
      '1': 'Food & Dining', '2': 'Utilities', '3': 'Transportation', '4': 'Housing / Rent',
      '5': 'Healthcare', '6': 'Entertainment', '7': 'Education', '8': 'Shopping',
      '9': 'Salary', '10': 'Business', '11': 'Freelance', '12': 'Investments',
      '13': 'Gifts', '14': 'Other'
    }
    return defaultCategories[id] || 'Other'
  }

  const getAccountName = (id: string) => {
    const acc = accounts.find(a => a.id === id)
    return acc ? acc.name : 'Deleted Account'
  }

  // Calculate suggestions and totals
  const allMatches = globalSearchTerm.trim() === '' ? [] : transactions.filter(tx => {
    const term = globalSearchTerm.toLowerCase()
    const catName = getCategoryName(tx.category_id).toLowerCase()
    const accName = getAccountName(tx.account_id).toLowerCase()
    const toAccName = tx.to_account_id ? getAccountName(tx.to_account_id).toLowerCase() : ''
    const notesStr = (tx.notes || '').toLowerCase()
    const amountStr = tx.amount.toString()

    return catName.includes(term) ||
      accName.includes(term) ||
      toAccName.includes(term) ||
      notesStr.includes(term) ||
      amountStr.includes(term) ||
      tx.type.includes(term)
  })

  const suggestions = allMatches.slice(0, 5) // Show top 5 matches

  const totalMatches = allMatches.length
  const totalIncome = allMatches.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = allMatches.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)

  // Calculate dynamic notifications for upcoming bills (Loans)
  const upcomingLoans = loans.filter(l => {
    if (l.status === 'paid_off') return false
    
    // Deriving exact Next Payment Date by traversing payments
    const payments = loanPayments.filter(p => p.loanId === l.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    const anchorDate = payments.length > 0 ? new Date(payments[0].date) : new Date(l.startDate)
    
    const nextDate = new Date(anchorDate)
    nextDate.setMonth(nextDate.getMonth() + 1)
    
    const diff = nextDate.getTime() - Date.now()
    const days = diff / (1000 * 3600 * 24)
    
    return days >= 0 && days <= 7
  })

  return (
    <header className="h-20 border-b border-white/5 glass-panel rounded-none flex items-center justify-between px-8 sticky top-0 z-40">

      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <div ref={searchRef} className="relative group z-50">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-hover:text-cyan-400 transition-colors z-10" />
          <input
            type="text"
            value={globalSearchTerm}
            onChange={(e) => setGlobalSearchTerm(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder="Search transactions..."
            className="w-full bg-black/40 border border-white/10 rounded-full py-2.5 pl-12 pr-10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-sans relative z-10"
          />
          <AnimatePresence>
            {globalSearchTerm && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setGlobalSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors z-10"
                title="Clear Search"
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Suggestions Dropdown */}
          <AnimatePresence>
            {isFocused && globalSearchTerm && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-12 left-0 w-full bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-xl overflow-hidden shadow-cyan-500/10 z-50"
              >
                {suggestions.length > 0 ? (
                  <div className="max-h-[28rem] overflow-y-auto python-scrollbar py-2">

                    {/* Summary Analytics block */}
                    <div className="px-4 pb-3 mb-2 border-b border-white/5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Search Insights</span>
                        <span className="text-xs text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full">{totalMatches} {totalMatches === 1 ? 'Match' : 'Matches'}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-black/40 rounded-lg p-2 border border-cyan-500/10">
                          <p className="text-[10px] text-gray-500 uppercase">Total Income</p>
                          <p className="font-numbers text-cyan-400 font-semibold">Rs. {totalIncome.toLocaleString()}</p>
                        </div>
                        <div className="bg-black/40 rounded-lg p-2 border border-purple-500/10">
                          <p className="text-[10px] text-gray-500 uppercase">Total Expenses</p>
                          <p className="font-numbers text-purple-400 font-semibold">Rs. {totalExpense.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    <div className="px-4 py-2 text-xs text-gray-500 font-semibold uppercase tracking-wider">Top Results</div>
                    {suggestions.map(tx => {
                      const isIncome = tx.type === 'income'
                      const isTransfer = tx.type === 'transfer'
                      const Icon = isIncome ? ArrowUpRight : isTransfer ? ArrowRightLeft : ArrowDownRight
                      const colorClass = isIncome ? 'text-cyan-400' : isTransfer ? 'text-blue-400' : 'text-purple-400'
                      const bgClass = isIncome ? 'bg-cyan-500/10' : isTransfer ? 'bg-blue-500/10' : 'bg-purple-500/10'

                      return (
                        <button
                          key={tx.id}
                          onClick={() => {
                            setGlobalTxToEdit(tx)
                            setGlobalTxModalOpen(true)
                            setIsFocused(false)
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${bgClass}`}>
                              <Icon className={`w-4 h-4 ${colorClass}`} />
                            </div>
                            <div>
                              <p className="text-white text-sm font-medium">{getCategoryName(tx.category_id)}</p>
                              <p className="text-gray-500 text-xs">{getAccountName(tx.account_id)} • {tx.notes || 'No note'}</p>
                            </div>
                          </div>
                          <div className={`font-numbers font-medium ${isIncome ? 'text-cyan-400' : 'text-gray-300'}`}>
                            {isIncome ? '+' : '-'}${tx.amount.toLocaleString()}
                          </div>
                        </button>
                      )
                    })}
                    {totalMatches > 5 && (
                      <div className="px-4 py-2 border-t border-white/5 mt-2">
                        <button
                          onClick={() => {
                            setIsFocused(false)
                            router.push('/dashboard/transactions')
                          }}
                          className="text-cyan-400 text-sm hover:text-cyan-300 transition-colors flex items-center gap-2 w-full justify-center"
                        >
                          View all {totalMatches} matching transactions &rarr;
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-6 text-center text-gray-500 text-sm">
                    No transactions found matching "{globalSearchTerm}"
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-6 ml-4">

        {/* Add Transaction Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setGlobalTxToEdit(null)
            setGlobalTxModalOpen(true)
          }}
          className="bg-cyan-500 hover:bg-cyan-400 text-black px-4 py-2 rounded-full font-semibold flex items-center space-x-2 glow-cyan transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Add Transaction</span>
        </motion.button>

        <div className="flex items-center space-x-4 border-l border-white/10 pl-6">
          
          {/* Notifications Dropdown */}
          <div ref={notificationsRef} className="relative">
            <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} 
              className="relative text-gray-400 hover:text-white transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-500 rounded-full border border-[#0B0F19] shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
            </button>
            <AnimatePresence>
              {isNotificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-4 w-80 bg-[#0A0A0A]/95 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-50 overflow-hidden"
                >
                  <div className="p-4 border-b border-white/5 bg-white/5">
                    <h3 className="text-white font-semibold">Notifications</h3>
                  </div>
                  <div className="p-2 max-h-[300px] overflow-y-auto python-scrollbar">
                     
                     {upcomingLoans.map(loan => (
                        <div key={loan.id} onClick={() => { setIsNotificationsOpen(false); router.push('/dashboard/loans') }} className="p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20 mb-2 hover:bg-yellow-500/20 transition-colors cursor-pointer">
                           <p className="text-sm text-yellow-500 font-medium">Payment Approaching</p>
                           <p className="text-xs text-yellow-500/70 mt-1">Your payment for <strong>{loan.name}</strong> is due within the next 7 days.</p>
                        </div>
                     ))}

                     <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20 mb-2">
                        <p className="text-sm text-white font-medium">Welcome to VoidLedger!</p>
                        <p className="text-xs text-gray-400 mt-1">Your futuristic financial hub is completely synced and secure in the cloud.</p>
                     </div>
                     <div onClick={() => { setIsNotificationsOpen(false); router.push('/dashboard/settings') }} className="p-3 hover:bg-white/5 rounded-xl transition-colors cursor-pointer">
                        <p className="text-sm text-gray-300 font-medium">Cloud Defense Active</p>
                        <p className="text-xs text-gray-500 mt-1">Multi-tenant Row Level Security is actively protecting your telemetry. View backup settings.</p>
                     </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Dropdown */}
          <div ref={profileRef} className="relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-500 p-0.5 glow-blue overflow-hidden cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            >
              <div className="w-full h-full bg-black rounded-full flex items-center justify-center transition-colors hover:bg-black/50 overflow-hidden">
                {userMeta?.avatar_url ? (
                  <img src={userMeta.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-gray-300" />
                )}
              </div>
            </button>
            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-4 w-56 bg-[#0A0A0A]/95 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-50 overflow-hidden"
                >
                  <div className="p-4 border-b border-white/5 flex items-center gap-3 bg-white/5">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-500 p-0.5 shadow-[0_0_10px_rgba(6,182,212,0.3)] overflow-hidden shrink-0">
                      <div className="w-full h-full bg-black rounded-full flex items-center justify-center overflow-hidden">
                        {userMeta?.avatar_url ? (
                          <img src={userMeta.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-gray-300" />
                        )}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-white font-semibold tracking-wide truncate">{userMeta?.full_name || 'Commander'}</p>
                      <p className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold">Pro Level</p>
                    </div>
                  </div>
                  <div className="p-2 space-y-1">
                    <button onClick={() => { setIsProfileModalOpen(true); setIsProfileOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white rounded-xl transition-colors font-medium">
                      Edit Profile
                    </button>
                    <button onClick={() => { setIsProfileModalOpen(true); setIsProfileOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white rounded-xl transition-colors font-medium">
                      Security & Password
                    </button>
                    <div className="h-px bg-white/5 my-1" />
                    <button onClick={async () => {
                       const { createClient } = await import('@/utils/supabase/client')
                       const supabase = createClient()
                       await supabase.auth.signOut()
                       router.push('/login')
                    }} className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors font-medium">
                      Disconnect Session
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>

      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
        onAvatarUpdated={async () => {
          const { createClient } = await import('@/utils/supabase/client')
          const supabase = createClient()
          const { data } = await supabase.auth.getUser()
          if (data.user) {
            setUserMeta(data.user.user_metadata as any)
          }
        }} 
      />
    </header>
  )
}
