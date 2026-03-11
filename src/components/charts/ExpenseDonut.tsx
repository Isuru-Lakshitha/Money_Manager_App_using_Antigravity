"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { motion } from 'framer-motion'
import { useState } from 'react'

import { useAppStore, DEFAULT_CATEGORIES } from '@/store'
import { startOfMonth, subMonths, format } from 'date-fns'

export default function ExpenseDonut() {
  const [activeIndex, setActiveIndex] = useState(-1)
  const transactions = useAppStore(state => state.transactions)
  const categories = useAppStore(state => state.categories)

  // Get current month's expenses
  const currentMonthPrefix = format(new Date(), 'yyyy-MM')
  const monthlyExpenses = transactions.filter(t => t.type === 'expense' && t.category_id !== 'goal' && t.date.startsWith(currentMonthPrefix))

  // Aggregate by category
  const categoryMap: Record<string, number> = {}
  monthlyExpenses.forEach(t => {
    let name = 'Uncategorized'
    if (t.category_id === 'goal') {
      name = 'Goal Funding'
    } else if (t.category_id) {
      const customCat = categories.find(c => c.id === t.category_id)
      if (customCat) {
        name = customCat.name
      } else {
        const defaultCat = DEFAULT_CATEGORIES.find(c => c.id === t.category_id)
        if (defaultCat) name = defaultCat.name
      }
    }
    categoryMap[name] = (categoryMap[name] || 0) + t.amount
  })

  // Format for Recharts
  const staticColors = ['#00E5FF', '#8B5CF6', '#F59E0B', '#EC4899', '#10B981', '#3B82F6', '#F43F5E']

  const rawData = Object.entries(categoryMap).map(([name, value], index) => {
    return {
      name,
      value,
      color: staticColors[index % staticColors.length]
    }
  }).sort((a, b) => b.value - a.value)

  // If no data, show empty state
  const data = rawData.length > 0 ? rawData : [{ name: 'No Expenses', value: 1, color: '#374151' }]
  const total = rawData.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="glass-panel p-6 h-[400px] flex flex-col relative overflow-hidden">
      <h3 className="text-lg font-bold text-white mb-2 relative z-10">Expense Breakdown</h3>
      <p className="text-xs text-gray-400 mb-4 relative z-10">Monthly view by category</p>

      <div className="flex-1 w-full relative z-10 flex">

        {/* Chart Container */}
        <div className="w-1/2 h-full relative">
          {/* Custom Glow behind the donut */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {activeIndex !== -1 && (
              <div
                className="w-32 h-32 rounded-full opacity-30 blur-2xl transition-all duration-500"
                style={{ backgroundColor: data[activeIndex].color }}
              />
            )}
          </div>

          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.3" />
                </filter>
              </defs>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(-1)}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    style={{
                      filter: activeIndex === index ? 'url(#shadow) brightness(1.2)' : 'none',
                      transition: 'all 0.3s ease',
                      transform: activeIndex === index ? 'scale(1.05)' : 'scale(1)',
                      transformOrigin: '50% 50%'
                    }}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: 'rgba(18,24,38,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(8px)' }}
                itemStyle={{ color: '#fff', fontSize: '14px' }}
                formatter={(value: any) => `Rs. ${Number(value).toLocaleString()}`}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold text-white font-numbers">
              {activeIndex === -1
                ? `Rs.${(total / 1000).toFixed(0)}k`
                : `Rs.${(data[activeIndex].value / 1000).toFixed(0)}k`}
            </span>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">
              {activeIndex === -1 ? 'Total' : data[activeIndex].name}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="w-1/2 flex flex-col justify-center pl-4 space-y-3">
          {data.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(-1)}
              className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${activeIndex === index ? 'bg-white/10' : 'hover:bg-white/5'}`}
            >
              <div className="flex items-center space-x-3 overflow-hidden">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0 shadow-[0_0_10px_rgba(inherit,0.5)]"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-gray-300 truncate">{item.name}</span>
              </div>
              <span className="text-xs font-numbers text-white font-semibold">
                {total > 0 ? Math.round((item.value / total) * 100) : 0}%
              </span>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  )
}
