"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowDownRight, Activity, Plus, Wallet, MoreVertical } from 'lucide-react'

// Components
import CashflowChart from '@/components/charts/CashflowChart'
import ExpenseDonut from '@/components/charts/ExpenseDonut'
import MoneyFlowSankey from '@/components/charts/MoneyFlowSankey'
import { useAppStore } from '@/store'
import { format } from 'date-fns'
import Link from 'next/link'

export default function DashboardPage() {
  const setGlobalTxModalOpen = useAppStore(state => state.setGlobalTxModalOpen)
  const setGlobalTxToEdit = useAppStore(state => state.setGlobalTxToEdit)
  const globalSearchTerm = useAppStore(state => state.globalSearchTerm)

  const accounts = useAppStore(state => state.accounts)
  const transactions = useAppStore(state => state.transactions)
  const categories = useAppStore(state => state.categories)

  // Calcs
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0)

  const currentMonthPrefix = format(new Date(), 'yyyy-MM')
  const monthlyTxs = transactions.filter(t => t.date.startsWith(currentMonthPrefix))

  const monthlyIncome = monthlyTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const monthlyExpense = monthlyTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)

  const getAccountName = (id: string) => {
    const acc = accounts.find(a => a.id === id)
    return acc ? acc.name : 'Deleted Account'
  }

  const getCategoryName = (id?: string | null) => {
    if (!id) return 'Uncategorized'
    const cat = categories.find(c => c.id === id)
    return cat ? cat.name : 'Other'
  }

  // Filter transactions based on search term
  const filteredTxs = transactions.filter(tx => {
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

  // We will display filteredTxs in the redesign

  // Calculate mockup score for redesign
  const score = 92
  const scoreColor = score > 90 ? 'text-green-400' : 'text-yellow-400'
  const savings = monthlyIncome - monthlyExpense

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Financial Overview</h1>
          <p className="text-gray-400">Welcome back. Here's your current money flow.</p>
        </div>
        <button
          onClick={() => {
            setGlobalTxToEdit(null)
            setGlobalTxModalOpen(true)
          }}
          className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-4 py-2 rounded-xl transition-all glow-cyan sm:hidden"
        >
          Add Tx
        </button>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Total Balance Card (Large Green) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-4 rounded-3xl p-6 relative overflow-hidden group border border-green-500/20 shadow-[0_0_40px_rgba(16,185,129,0.15)] bg-gradient-to-br from-[#0F2E1E] to-[#0A1A12]"
        >
          {/* Abstract background shapes */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-green-500/20 rounded-full blur-[60px] pointer-events-none group-hover:bg-green-500/30 transition-all opacity-50" />
          <div className="absolute bottom-0 right-0 w-full h-1/2 bg-gradient-to-t from-green-500/10 to-transparent pointer-events-none" />

          <div className="flex justify-between items-start mb-6 relative z-10">
            <p className="text-gray-300 font-semibold text-lg">Total Balance</p>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-black hover:scale-105 transition-transform">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="relative z-10">
            <h2 className="text-4xl lg:text-5xl font-bold text-white font-numbers tracking-tight mb-6">
              ${totalBalance.toLocaleString()} <span className="text-sm font-sans text-gray-400 font-normal">LKR</span>
            </h2>
          </div>

          <div className="flex gap-3 relative z-10">
            <button className="flex-1 bg-white text-black py-2.5 rounded-full font-bold text-sm hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Deposit
            </button>
            <button className="flex-1 bg-[#0A1A12] text-white py-2.5 rounded-full font-bold text-sm border border-green-500/30 hover:bg-green-500/10 transition-colors flex items-center justify-center gap-1">
              Send <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* AI Enhancements (Middle) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-5 glass-panel p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-white font-bold">AI Enhancements</h3>
            <button className="text-xs text-green-400 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20 hover:bg-green-500/20 transition-colors flex items-center gap-1">
              <Plus className="w-3 h-3" /> Add Enhancements
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Income stat */}
            <div className="bg-black/40 border border-white/5 rounded-2xl p-4 transition-all hover:bg-white/5">
              <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold mb-2">
                <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center">
                  <ArrowDownRight className="w-3 h-3 text-green-400" />
                </div>
                Income
              </div>
              <p className="text-lg font-bold text-white font-numbers">Rs.{monthlyIncome.toLocaleString()}</p>
            </div>

            {/* Expense stat */}
            <div className="bg-black/40 border border-white/5 rounded-2xl p-4 transition-all hover:bg-white/5">
              <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold mb-2">
                <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-green-400 font-bold text-[10px]">$</span>
                </div>
                Expense
              </div>
              <p className="text-lg font-bold text-white font-numbers">Rs.{monthlyExpense.toLocaleString()}</p>
            </div>

            {/* Savings stat */}
            <div className="bg-black/40 border border-white/5 rounded-2xl p-4 transition-all hover:bg-white/5">
              <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold mb-2">
                <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <Wallet className="w-3 h-3 text-green-400" />
                </div>
                Savings
              </div>
              <p className="text-lg font-bold text-white font-numbers">Rs.{savings.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>

        {/* Finance Score (Right) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3 glass-panel p-6 flex flex-col justify-between"
        >
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-white font-bold">Finance Score</h3>
            <button className="text-gray-500 hover:text-white transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>

          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Finance Quality</p>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold text-white">{score > 90 ? 'Excellent' : score > 70 ? 'Good' : 'Fair'}</span>
              <span className={`text-2xl font-bold font-numbers ${scoreColor}`}>{score}%</span>
            </div>

            <div className="flex gap-2 mt-4">
              <div className="h-4 bg-[#0A1A12] border border-green-500/30 rounded-full flex-grow relative overflow-hidden">
                <div className="absolute left-0 top-0 h-full bg-green-500" style={{ width: `${score}%` }} />
              </div>
              <div className="h-4 w-12 bg-green-500/20 border border-green-500/50 rounded-full" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-7"
        >
          <CashflowChart />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-5"
        >
          <MoneyFlowSankey />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-8">
        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-8 glass-panel p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-white font-bold">Recent Transactions</h3>
            <Link href="/dashboard/transactions" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
              View All
            </Link>
          </div>

          <div className="space-y-4">
            {filteredTxs.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">No transactions found.</p>
            ) : (
              filteredTxs.slice(0, 5).map(tx => {
                const isIncome = tx.type === 'income'
                const isTransfer = tx.type === 'transfer'
                const catName = isTransfer ? 'Transfer' : getCategoryName(tx.category_id)
                const accName = getAccountName(tx.account_id)

                return (
                  <div key={tx.id} className="flex items-center justify-between p-3 rounded-2xl bg-black/20 hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 group">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isIncome ? 'bg-cyan-500/10 text-cyan-400' : isTransfer ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>
                        {isIncome ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">{catName}</p>
                        <p className="text-gray-500 text-xs">{accName} • {format(new Date(tx.date), 'MMM dd')}</p>
                      </div>
                    </div>
                    <div className={`font-bold font-numbers ${isIncome ? 'text-cyan-400' : 'text-white'}`}>
                      {isIncome ? '+' : '-'}${tx.amount.toLocaleString()}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </motion.div>

        {/* Stats Donut */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-4"
        >
          <ExpenseDonut />
        </motion.div>
      </div>
    </div>
  )
}
