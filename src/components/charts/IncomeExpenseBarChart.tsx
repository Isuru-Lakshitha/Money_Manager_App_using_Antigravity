"use client"

import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

import { useAppStore } from '@/store'
import { startOfWeek, endOfWeek, subWeeks, format, isWithinInterval, parseISO } from 'date-fns'

export default function IncomeExpenseBarChart() {
  const transactions = useAppStore(state => state.transactions)

  // Generate data for the last 4 weeks
  const data = Array.from({ length: 4 }).map((_, i) => {
    // 3, 2, 1, 0 weeks ago
    const weeksAgo = 3 - i
    const start = startOfWeek(subWeeks(new Date(), weeksAgo), { weekStartsOn: 1 })
    const end = endOfWeek(start, { weekStartsOn: 1 })

    // Filter transactions within this week window
    const weekTxs = transactions.filter(t => {
      const txDate = parseISO(t.date)
      return isWithinInterval(txDate, { start, end })
    })

    const income = weekTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
    const expense = weekTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)

    return {
      name: `Week ${weeksAgo === 0 ? 'Current' : weeksAgo === 1 ? 'Last' : format(start, 'dd MMM')}`,
      income,
      expense
    }
  })

  return (
    <div className="glass-panel p-6 h-[400px] flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="flex justify-between items-center mb-6 relative z-10">
        <div>
          <h3 className="text-lg font-bold text-white">Income vs Expense</h3>
          <p className="text-xs text-gray-400">Weekly comparison</p>
        </div>
      </div>

      <div className="flex-1 w-full relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={12}>
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
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              contentStyle={{ backgroundColor: 'rgba(18,24,38,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(8px)' }}
              itemStyle={{ color: '#fff', fontSize: '14px' }}
            />
            <Legend
              iconType="circle"
              wrapperStyle={{ fontSize: '12px', color: '#9ca3af', paddingTop: '10px' }}
            />
            <Bar dataKey="income" name="Income" fill="#00E5FF" radius={[4, 4, 4, 4]} />
            <Bar dataKey="expense" name="Expense" fill="#8B5CF6" radius={[4, 4, 4, 4]} />
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
