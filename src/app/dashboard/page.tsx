"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react'

// Components
import DailySpendingTracker from '@/components/charts/DailySpendingTracker'
import ExpenseDonut from '@/components/charts/ExpenseDonut'
import IncomeExpenseBarChart from '@/components/charts/IncomeExpenseBarChart'
import MoneyFlowSankey from '@/components/charts/MoneyFlowSankey'
import { useAppStore } from '@/store'
import { format } from 'date-fns'

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)
  const setGlobalTxModalOpen = useAppStore(state => state.setGlobalTxModalOpen)
  const setGlobalTxToEdit = useAppStore(state => state.setGlobalTxToEdit)

  const accounts = useAppStore(state => state.accounts)
  const transactions = useAppStore(state => state.transactions)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Calcs
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0)

  const currentMonthPrefix = format(new Date(), 'yyyy-MM')
  const monthlyTxs = transactions.filter(t => t.date.startsWith(currentMonthPrefix))

  const monthlyIncome = monthlyTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const monthlyExpense = monthlyTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)

  if (!mounted) return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>

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

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Balance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 relative overflow-hidden group border-cyan-500/20"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-[50px] pointer-events-none group-hover:bg-cyan-500/20 transition-all" />
          <div className="flex justify-between items-start mb-4">
            <p className="text-gray-400 font-semibold">Total Balance</p>
            <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center">
              <Activity className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white font-numbers tracking-tight mb-2">Rs. {totalBalance.toLocaleString()}</h2>
          <div className="flex items-center text-cyan-400 text-sm">
            <ArrowUpRight className="w-4 h-4 mr-1" />
            <span>Updated live from accounts</span>
          </div>
        </motion.div>

        {/* Monthly Income */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel p-6 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[50px] pointer-events-none group-hover:bg-purple-500/20 transition-all" />
          <div className="flex justify-between items-start mb-4">
            <p className="text-gray-400 font-semibold">Monthly Income</p>
            <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4 text-purple-400" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white font-numbers tracking-tight mb-2">Rs. {monthlyIncome.toLocaleString()}</h2>
          <div className="flex items-center text-gray-500 text-sm">
            <span>This month's earnings</span>
          </div>
        </motion.div>

        {/* Monthly Expenses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel p-6 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-[50px] pointer-events-none group-hover:bg-orange-500/20 transition-all" />
          <div className="flex justify-between items-start mb-4">
            <p className="text-gray-400 font-semibold">Monthly Expenses</p>
            <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4 text-orange-400" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white font-numbers tracking-tight mb-2">Rs. {monthlyExpense.toLocaleString()}</h2>
          <div className="flex items-center text-gray-500 text-sm">
            <span>This month's spending</span>
          </div>
        </motion.div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <DailySpendingTracker />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <MoneyFlowSankey />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <ExpenseDonut />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <IncomeExpenseBarChart />
        </motion.div>
      </div>
    </div>
  )
}
