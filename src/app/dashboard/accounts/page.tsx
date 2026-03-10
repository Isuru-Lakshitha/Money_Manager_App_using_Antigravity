"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Wallet, Landmark, Smartphone, CreditCard, MoreVertical, Edit2, Trash2 } from 'lucide-react'
import { useAppStore, Account, AccountType } from '@/store'
import AccountModal from '@/components/accounts/AccountModal'

const ACCOUNT_ICONS: Record<AccountType, any> = {
  cash: Wallet,
  bank: Landmark,
  mobile: Smartphone,
  credit: CreditCard,
}

const ACCOUNT_COLORS: Record<AccountType, string> = {
  cash: '#10B981', // emerald
  bank: '#3B82F6', // blue
  mobile: '#8B5CF6', // purple
  credit: '#F43F5E', // rose
}

export default function AccountsPage() {
  const accounts = useAppStore(state => state.accounts)
  const deleteAccount = useAppStore(state => state.deleteAccount)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [accountToEdit, setAccountToEdit] = useState<Account | null>(null)

  // Dropdown state for individual cards
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  const totalBalance = accounts.reduce((acc, curr) => acc + (curr.type === 'credit' ? -curr.balance : curr.balance), 0)

  const handleEdit = (account: Account) => {
    setAccountToEdit(account)
    setOpenMenuId(null)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this account? This will not delete its historical transactions, but balances will no longer be tracked here.")) {
      deleteAccount(id)
      setOpenMenuId(null)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Accounts</h1>
          <p className="text-gray-400">Manage your wallets, banks, and credit cards.</p>
        </div>

        <div className="flex items-center space-x-6 bg-black/40 p-4 rounded-2xl border border-white/5">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Net Worth</p>
            <p className="text-2xl font-bold font-numbers text-white">Rs. {totalBalance.toLocaleString()}</p>
          </div>
          <button
            onClick={() => { setAccountToEdit(null); setIsModalOpen(true) }}
            className="bg-cyan-500 hover:bg-cyan-400 text-black px-4 py-3 rounded-xl transition-all glow-cyan font-semibold flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Add Account</span>
          </button>
        </div>
      </div>

      {accounts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-12 text-center flex flex-col items-center justify-center border-dashed border-2 border-white/10"
        >
          <div className="w-20 h-20 rounded-full glass bg-white/5 flex items-center justify-center mb-6">
            <Wallet className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No Accounts Found</h2>
          <p className="text-gray-400 mb-6 max-w-md">Connect your real-world wallets by adding your first account to start tracking your net worth accurately.</p>
          <button
            onClick={() => { setAccountToEdit(null); setIsModalOpen(true) }}
            className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-xl border border-white/20 transition-all font-semibold"
          >
            Create Account
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account, idx) => {
            const Icon = ACCOUNT_ICONS[account.type]
            const color = ACCOUNT_COLORS[account.type]
            const isCredit = account.type === 'credit'
            const formattedBalance = account.balance.toLocaleString()

            return (
              <motion.div
                key={account.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className={`glass-panel p-6 relative group overflow-visible transition-colors ${openMenuId === account.id ? 'z-50 ring-1 ring-white/20' : 'z-0'}`}
              >
                {/* Glow Background */}
                <div
                  className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[50px] pointer-events-none opacity-20 transition-opacity group-hover:opacity-40"
                  style={{ backgroundColor: color }}
                />

                <div className="flex justify-between items-start mb-8 relative z-10">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                      style={{ backgroundColor: `${color}20`, border: `1px solid ${color}40` }}
                    >
                      <Icon className="w-6 h-6" style={{ color }} />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg truncate max-w-[120px]" title={account.name}>{account.name}</h3>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">{account.type}</p>
                    </div>
                  </div>

                  {/* Options Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === account.id ? null : account.id)}
                      className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    {openMenuId === account.id && (
                      <div className="absolute right-0 top-8 mt-1 w-36 bg-[#1A2235] border border-white/10 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden z-[100]">
                        <button
                          onClick={() => handleEdit(account)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white flex items-center space-x-2 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(account.id)}
                          className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/20 flex items-center space-x-2 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="relative z-10">
                  <p className="text-sm text-gray-400 mb-1">{isCredit ? 'Outstanding Balance' : 'Available Balance'}</p>
                  <p className="text-3xl font-bold font-numbers text-white tracking-tight">
                    <span className="text-xl text-gray-500 mr-1">Rs.</span>
                    {formattedBalance}
                  </p>
                </div>

                {/* Decorative Line */}
                <div
                  className="absolute bottom-0 left-0 w-full h-[2px] opacity-50"
                  style={{ background: `linear-gradient(to right, ${color}, transparent)` }}
                />
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Account Modal */}
      <AccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        accountToEdit={accountToEdit}
      />

      {/* Click outside to close menu overlay */}
      {openMenuId && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpenMenuId(null)}
        />
      )}
    </div>
  )
}
