"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Repeat, Plus, Trash2, Edit2, Play, Pause } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { useAppStore, RecurringTransaction, Frequency } from '@/store'
import { format } from 'date-fns'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function RecurringModal({ isOpen, onClose }: Props) {
  const recurringTxs = useAppStore(state => state.recurringTransactions)
  const addRT = useAppStore(state => state.addRecurringTransaction)
  const updateRT = useAppStore(state => state.updateRecurringTransaction)
  const deleteRT = useAppStore(state => state.deleteRecurringTransaction)
  const accounts = useAppStore(state => state.accounts)
  const categories = Object.values(useAppStore(state => state.categories))

  const [mode, setMode] = useState<'list' | 'edit'>('list')
  const [editItem, setEditItem] = useState<Partial<RecurringTransaction> | null>(null)
  const [loading, setLoading] = useState(false)

  const handleCreateNew = () => {
    setEditItem({
      name: '',
      amount: 0,
      type: 'expense',
      accountId: accounts[0]?.id || '',
      frequency: 'monthly',
      nextDate: new Date().toISOString().split('T')[0],
      isActive: true,
      notes: ''
    })
    setMode('edit')
  }

  const handleEdit = (rt: RecurringTransaction) => {
    setEditItem(rt)
    setMode('edit')
  }

  const handleToggleActive = async (rt: RecurringTransaction) => {
    await updateRT(rt.id, { isActive: !rt.isActive })
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editItem) return
    setLoading(true)

    try {
      if (editItem.id) {
        await updateRT(editItem.id, editItem)
      } else {
        await addRT({
          ...editItem,
          id: uuidv4(),
        } as RecurringTransaction)
      }
      setMode('list')
      setEditItem(null)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
          className="glass-panel w-full max-w-2xl p-6 relative z-10 border-purple-500/30 overflow-y-auto max-h-[90vh] python-scrollbar"
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Repeat className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Recurring Transactions
              </h2>
              <p className="text-sm text-gray-400">Automate your regular income and expenses</p>
            </div>
          </div>

          {mode === 'list' ? (
            <div className="space-y-4">
              <button
                onClick={handleCreateNew}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 border-dashed rounded-xl py-4 flex items-center justify-center space-x-2 text-purple-400 hover:text-purple-300 transition-colors font-semibold"
              >
                <Plus className="w-5 h-5" />
                <span>Create New Recurring Rule</span>
              </button>

              <div className="space-y-3 mt-4">
                {recurringTxs.length === 0 ? (
                  <p className="text-center text-gray-500 py-6">No recurring transactions set up yet.</p>
                ) : (
                  recurringTxs.map(rt => (
                    <div key={rt.id} className={`glass-panel p-4 rounded-xl border-l-4 ${rt.isActive ? 'border-l-purple-500' : 'border-l-gray-600 opacity-60'} flex justify-between items-center transition-opacity`}>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-bold text-white">{rt.name}</h4>
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-gray-300">
                            {rt.frequency}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 font-numbers">
                          {rt.type === 'income' ? '+' : '-'} Rs. {rt.amount.toLocaleString()} • Next: {format(new Date(rt.nextDate), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleToggleActive(rt)}
                          className={`p-2 rounded-lg transition-colors ${rt.isActive ? 'text-green-400 hover:bg-green-400/10' : 'text-gray-400 hover:bg-white/10'}`}
                          title={rt.isActive ? 'Pause' : 'Resume'}
                        >
                          {rt.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleEdit(rt)}
                          className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteRT(rt.id)}
                          className="p-2 text-red-400/70 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Name</label>
                <input
                  type="text"
                  required
                  value={editItem?.name}
                  onChange={e => setEditItem({ ...editItem, name: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-purple-500/50"
                  placeholder="Netflix Subscription, Salary, Rent..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editItem?.amount}
                    onChange={e => setEditItem({ ...editItem, amount: Number(e.target.value) })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-white font-numbers focus:outline-none focus:border-purple-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Type</label>
                  <select
                    value={editItem?.type}
                    onChange={e => setEditItem({ ...editItem, type: e.target.value as any, categoryId: '' })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-purple-500/50"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                    <option value="transfer">Transfer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Account</label>
                  <select
                    value={editItem?.accountId}
                    onChange={e => setEditItem({ ...editItem, accountId: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-purple-500/50"
                    required
                  >
                    <option value="" disabled>Select Account</option>
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
                
                {editItem?.type === 'transfer' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">To Account</label>
                    <select
                      value={editItem?.toAccountId || ''}
                      onChange={e => setEditItem({ ...editItem, toAccountId: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-purple-500/50"
                      required
                    >
                      <option value="" disabled>Select Destination</option>
                      {accounts.filter(a => a.id !== editItem?.accountId).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Category</label>
                    <select
                      value={editItem?.categoryId || ''}
                      onChange={e => setEditItem({ ...editItem, categoryId: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-purple-500/50"
                    >
                      <option value="" disabled>Select Category</option>
                      {categories.filter(c => c.type === editItem?.type).map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Frequency</label>
                  <select
                    value={editItem?.frequency}
                    onChange={e => setEditItem({ ...editItem, frequency: e.target.value as Frequency })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-purple-500/50"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Next Date</label>
                  <input
                    type="date"
                    required
                    value={editItem?.nextDate}
                    onChange={e => setEditItem({ ...editItem, nextDate: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-purple-500/50"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setMode('list')}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-purple-500 hover:bg-purple-400 text-white font-semibold py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)] disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Rule'}
                </button>
              </div>
            </form>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  )
}
