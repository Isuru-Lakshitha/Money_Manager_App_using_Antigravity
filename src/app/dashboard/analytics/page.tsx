"use client"

import { motion } from 'framer-motion'
import { PieChart, TrendingUp, TrendingDown, Activity, ArrowRightLeft } from 'lucide-react'
import { useAppStore } from '@/store'

// Components
import DailySpendingTracker from '@/components/charts/DailySpendingTracker'
import ExpenseDonut from '@/components/charts/ExpenseDonut'
import IncomeExpenseBarChart from '@/components/charts/IncomeExpenseBarChart'
import MoneyFlowSankey from '@/components/charts/MoneyFlowSankey'

export default function AnalyticsPage() {
  const transactions = useAppStore(state => state.transactions)

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0)
  const totalExpense = transactions.filter(t => t.type === 'expense' && t.category_id !== 'goal' && t.category_id !== 'transfer').reduce((acc, curr) => acc + curr.amount, 0)
  const totalTransfers = transactions.filter(t => t.type === 'transfer').reduce((acc, curr) => acc + curr.amount, 0)

  const savingsRate = totalIncome > 0 ? (((totalIncome - totalExpense) / totalIncome) * 100).toFixed(1) : '0.0'

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Financial Analytics</h1>
          <p className="text-gray-400">Deep dive into your spending patterns and cashflow analysis.</p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 relative overflow-hidden group border-cyan-500/20"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-[50px] pointer-events-none group-hover:bg-cyan-500/20 transition-all" />
          <div className="flex justify-between items-start mb-4">
            <p className="text-gray-400 font-semibold">Total Income</p>
            <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white font-numbers tracking-tight mb-2">Rs. {(totalIncome / 1000).toFixed(1)}k</h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel p-6 relative overflow-hidden group border-purple-500/20"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[50px] pointer-events-none group-hover:bg-purple-500/20 transition-all" />
          <div className="flex justify-between items-start mb-4">
            <p className="text-gray-400 font-semibold">Total Expense</p>
            <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-purple-400" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white font-numbers tracking-tight mb-2">Rs. {(totalExpense / 1000).toFixed(1)}k</h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel p-6 relative overflow-hidden group border-blue-500/20"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[50px] pointer-events-none group-hover:bg-blue-500/20 transition-all" />
          <div className="flex justify-between items-start mb-4">
            <p className="text-gray-400 font-semibold">Total Transfers</p>
            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
              <ArrowRightLeft className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white font-numbers tracking-tight mb-2">Rs. {(totalTransfers / 1000).toFixed(1)}k</h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-panel p-6 relative overflow-hidden group border-green-500/20"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-[50px] pointer-events-none group-hover:bg-green-500/20 transition-all" />
          <div className="flex justify-between items-start mb-4">
            <p className="text-gray-400 font-semibold">Savings Rate</p>
            <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
              <Activity className="w-4 h-4 text-green-400" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white font-numbers tracking-tight mb-2">{savingsRate}%</h2>
        </motion.div>
      </div>

      {/* Advanced Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="w-full"
        >
          <MoneyFlowSankey />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="w-full"
        >
          <DailySpendingTracker />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-1"
        >
          <ExpenseDonut />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="lg:col-span-2"
        >
          <IncomeExpenseBarChart />
        </motion.div>
      </div>

    </div>
  )
}
