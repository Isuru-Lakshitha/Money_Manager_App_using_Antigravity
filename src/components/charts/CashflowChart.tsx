"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { motion } from 'framer-motion'

import { useAppStore } from '@/store'
import { format, subMonths, parseISO, startOfMonth, startOfDay } from 'date-fns'

export default function CashflowChart() {
  const transactions = useAppStore(state => state.transactions)
  // For net worth we could simplify by taking current account balances 
  // and walking backwards through transactions to reconstruct history.
  const currentAccounts = useAppStore(state => state.accounts)

  const currentNetWorth = currentAccounts.reduce((sum, acc) => sum + acc.balance, 0)

  // Generate last 6 months data
  const data = Array.from({ length: 6 }).map((_, i) => {
    const d = subMonths(new Date(), 5 - i)
    return {
      name: format(d, 'MMM'),
      monthKey: format(d, 'yyyy-MM'),
      balance: 0,
      netWorth: 0
    }
  })

  // We'll calculate net worth retrospectively
  let runningNetWorth = currentNetWorth

  // Group transactions by month for the 'balance' line (which we'll treat as monthly net cashflow + baseline)
  // Actually, standardizing Cashflow to mean "Income - Expenses" for that month:
  // Net Worth is the cumulative total

  for (let i = 5; i >= 0; i--) {
    const targetMonth = data[i].monthKey

    // Calculate net cashflow for this specific month
    const monthTxs = transactions.filter(t => t.date.startsWith(targetMonth))
    const monthIncome = monthTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
    const monthExpense = monthTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)

    // Net flow for the month
    const netFlow = monthIncome - monthExpense

    // Set data points
    data[i].netWorth = runningNetWorth
    data[i].balance = netFlow > 0 ? netFlow : 0 // Just showing positive cashflow trend for aesthetic

    // To get previous month's net worth, subtract this month's net cash flow
    // (If I gained 500 this month and have 1000 now, last month I had 500)
    runningNetWorth -= netFlow
  }
  return (
    <div className="glass-panel p-6 h-[400px] flex flex-col relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="flex justify-between items-center mb-6 relative z-10">
        <div>
          <h3 className="text-lg font-bold text-white">Cashflow & Net Worth</h3>
          <p className="text-xs text-gray-400">Monthly balance trend in LKR</p>
        </div>
        <div className="flex space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-cyan-400 glow-cyan"></div>
            <span className="text-xs text-gray-300">Balance</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-purple-500 glow-purple"></div>
            <span className="text-xs text-gray-300">Net Worth</span>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0 relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00E5FF" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `Rs.${value / 1000}k`}
            />
            <Tooltip
              contentStyle={{ backgroundColor: 'rgba(18,24,38,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(8px)' }}
              itemStyle={{ color: '#fff', fontSize: '14px' }}
              cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
            />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="#00E5FF"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorBalance)"
              activeDot={{ r: 6, fill: '#00E5FF', stroke: '#fff', strokeWidth: 2 }}
              style={{ filter: "url(#glow)" }}
            />
            <Area
              type="monotone"
              dataKey="netWorth"
              stroke="#8B5CF6"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorNetWorth)"
              activeDot={{ r: 6, fill: '#8B5CF6', stroke: '#fff', strokeWidth: 2 }}
              style={{ filter: "url(#glow)" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
