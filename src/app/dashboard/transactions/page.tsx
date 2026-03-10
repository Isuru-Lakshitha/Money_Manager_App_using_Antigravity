"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, ArrowDownRight, ArrowUpRight, ArrowRightLeft, Edit2, Trash2, MoreVertical } from 'lucide-react'
import { format } from 'date-fns'
import { useAppStore, Transaction } from '@/store'

export default function TransactionsPage() {
  const transactions = useAppStore(state => state.transactions)
  const categories = useAppStore(state => state.categories)
  const accounts = useAppStore(state => state.accounts)
  const deleteTransaction = useAppStore(state => state.deleteTransaction)
  const updateAccount = useAppStore(state => state.updateAccount)
  const globalSearchTerm = useAppStore(state => state.globalSearchTerm)

  const setGlobalTxModalOpen = useAppStore(state => state.setGlobalTxModalOpen)
  const setGlobalTxToEdit = useAppStore(state => state.setGlobalTxToEdit)

  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  const handleEdit = (tx: Transaction) => {
    setGlobalTxToEdit(tx)
    setOpenMenuId(null)
    setGlobalTxModalOpen(true)
  }

  const handleDelete = (tx: Transaction) => {
    if (confirm("Are you sure you want to delete this transaction? This will automatically reverse its impact on your account balances.")) {

      // Reverse balance logic
      const fromAcc = accounts.find(a => a.id === tx.account_id)
      if (fromAcc) {
        if (tx.type === 'expense') updateAccount(fromAcc.id, { balance: fromAcc.balance + tx.amount })
        if (tx.type === 'income') updateAccount(fromAcc.id, { balance: fromAcc.balance - tx.amount })
        if (tx.type === 'transfer') updateAccount(fromAcc.id, { balance: fromAcc.balance + tx.amount + (tx.fee_amount || 0) })
      }

      if (tx.type === 'transfer' && tx.to_account_id) {
        const toAcc = accounts.find(a => a.id === tx.to_account_id)
        if (toAcc) {
          updateAccount(toAcc.id, { balance: toAcc.balance - tx.amount })
        }
      }

      deleteTransaction(tx.id)
      setOpenMenuId(null)
    }
  }

  const getCategoryName = (id?: string | null) => {
    if (!id) return 'Uncategorized'
    // Fallback names for hardcoded mockup categories if not found in store
    const mockNames: Record<string, string> = {
      '1': 'Food & Dining', '2': 'Utilities', '3': 'Transportation', '4': 'Housing',
      '5': 'Healthcare', '6': 'Entertainment', '7': 'Education', '8': 'Shopping',
      '9': 'Salary', '10': 'Business', '11': 'Freelance', '12': 'Investments'
    }
    return mockNames[id] || 'Other'
  }

  const getAccountName = (id: string) => {
    const acc = accounts.find(a => a.id === id)
    return acc ? acc.name : 'Deleted Account'
  }

  const filteredTransactions = transactions.filter(tx => {
    if (!globalSearchTerm) return true

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

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Transactions</h1>
          <p className="text-gray-400">View and manage your entire financial history.</p>
        </div>

        <button
          onClick={() => {
            setGlobalTxToEdit(null)
            setGlobalTxModalOpen(true)
          }}
          className="bg-cyan-500 hover:bg-cyan-400 text-black px-4 py-3 rounded-xl transition-all glow-cyan font-semibold flex items-center justify-center space-x-2 w-full md:w-auto"
        >
          <Plus className="w-5 h-5" />
          <span>New Transaction</span>
        </button>
      </div>

      <div className="glass-panel overflow-hidden">
        {transactions.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full glass bg-white/5 flex items-center justify-center mb-4">
              <ArrowRightLeft className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">No Transactions Yet</h3>
            <p className="text-gray-400 text-sm max-w-sm mb-6">Start tracking your income, expenses, and transfers to see them appear here.</p>
            <button
              onClick={() => {
                setGlobalTxToEdit(null)
                setGlobalTxModalOpen(true)
              }}
              className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
            >
              + Create your first transaction
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-black/20 text-xs uppercase tracking-wider text-gray-400">
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">Details</th>
                  <th className="p-4 font-semibold">Account</th>
                  <th className="p-4 font-semibold text-right">Amount</th>
                  <th className="p-4 font-semibold w-12 flex justify-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredTransactions.map((tx, idx) => {
                  const isIncome = tx.type === 'income'
                  const isTransfer = tx.type === 'transfer'
                  const Icon = isIncome ? ArrowUpRight : isTransfer ? ArrowRightLeft : ArrowDownRight
                  const colorClass = isIncome ? 'text-cyan-400' : isTransfer ? 'text-blue-400' : 'text-purple-400'
                  const bgClass = isIncome ? 'bg-cyan-500/10' : isTransfer ? 'bg-blue-500/10' : 'bg-purple-500/10'

                  return (
                    <motion.tr
                      key={tx.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className="hover:bg-white/5 transition-colors group"
                    >
                      <td className="p-4 align-top whitespace-nowrap">
                        <div className="text-sm text-gray-300 font-numbers">{format(new Date(tx.date), 'MMM dd, yyyy')}</div>
                      </td>

                      <td className="p-4 align-top">
                        <div className="flex items-start space-x-3">
                          <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${bgClass} ${colorClass}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-white font-semibold text-sm">
                              {isTransfer ? 'Transfer' : getCategoryName(tx.category_id)}
                            </div>
                            {tx.notes && <div className="text-xs text-gray-400 mt-1 max-w-xs truncate">{tx.notes}</div>}
                          </div>
                        </div>
                      </td>

                      <td className="p-4 align-top">
                        <div className="text-sm text-gray-300">
                          {isTransfer ? (
                            <span>{getAccountName(tx.account_id)} <ArrowRightLeft className="inline w-3 h-3 text-gray-500 mx-1" /> {tx.to_account_id ? getAccountName(tx.to_account_id) : 'Unknown'}</span>
                          ) : (
                            getAccountName(tx.account_id)
                          )}
                        </div>
                      </td>

                      <td className="p-4 align-top text-right">
                        <div className={`text-sm font-bold font-numbers ${colorClass}`}>
                          {isIncome ? '+' : isTransfer ? '' : '-'} Rs. {tx.amount.toLocaleString()}
                        </div>
                        {isTransfer && tx.fee_amount ? (
                          <div className="text-xs text-red-400 mt-1 font-numbers">Fee: Rs. {tx.fee_amount}</div>
                        ) : null}
                      </td>

                      <td className="p-4 align-top relative">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === tx.id ? null : tx.id)}
                          className="p-1 rounded-md text-gray-500 hover:text-white hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {openMenuId === tx.id && (
                          <div className="absolute right-8 top-4 mt-0 w-32 bg-[#1A2235] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                            <button
                              onClick={() => handleEdit(tx)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white flex items-center space-x-2 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDelete(tx)}
                              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/20 flex items-center space-x-2 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Click outside to close menu overlay md */}
      {openMenuId && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpenMenuId(null)}
        />
      )}
    </div>
  )
}
