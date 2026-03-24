"use client"

import { motion } from 'framer-motion'
import { Wallet, Play, Tags } from 'lucide-react'
import { useAppStore, DEFAULT_CATEGORIES } from '@/store'

export default function MoneyFlowSankey() {
  const transactions = useAppStore(state => state.transactions)
  const categories = useAppStore(state => state.categories)

  // Calculate Total Income
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)

  // Get Top 3 Expense Categories
  const categoryMap: Record<string, number> = {}
  transactions.filter(t => t.type === 'expense' && t.category_id !== 'goal' && t.category_id !== 'transfer').forEach(t => {
    const catId = t.category_id || 'uncategorized'
    categoryMap[catId] = (categoryMap[catId] || 0) + t.amount
  })

  const topExpenses = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([catId, amount], index) => {
      let name = 'Other'
      let icon = '🏷️'

      if (catId === 'goal') {
        name = 'Goal Funding'
        icon = '🎯'
      } else {
        const customCat = categories.find(c => c.id === catId)
        if (customCat) {
          name = customCat.name
          icon = customCat.icon || '🏷️'
        } else {
          const defaultCat = DEFAULT_CATEGORIES.find(c => c.id === catId)
          if (defaultCat) {
            name = defaultCat.name
            icon = defaultCat.icon || '🏷️'
          }
        }
      }
      // Colors sequence: Purple, Cyan, Orange
      const colors = [
        { stroke: 'rgba(139, 92, 246, 0.2)', dot: '#8B5CF6', text: 'text-purple-400', border: 'border-purple-500/30' },
        { stroke: 'rgba(34, 211, 238, 0.2)', dot: '#00E5FF', text: 'text-cyan-400', border: 'border-cyan-500/30' },
        { stroke: 'rgba(245, 158, 11, 0.2)', dot: '#F59E0B', text: 'text-orange-400', border: 'border-orange-500/30' }
      ]
      return {
        id: catId,
        name,
        amount,
        icon,
        style: colors[index % colors.length] // Fallback safe
      }
    })

  // If no income/expenses
  if (totalIncome === 0 && topExpenses.length === 0) {
    return (
      <div className="glass-panel p-6 h-[400px] flex flex-col items-center justify-center text-gray-500">
        <p>No transactions yet to visualize flow.</p>
      </div>
    )
  }

  return (
    <div className="glass-panel p-6 h-[400px] flex flex-col relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="mb-6 relative z-10 flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold text-white">Money Flow</h3>
          <p className="text-xs text-gray-400">Interactive live income distribution</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center glow-cyan">
          <Play className="w-4 h-4 text-cyan-400 ml-0.5" />
        </div>
      </div>

      <div className="flex-1 w-full relative z-10 flex items-center justify-between px-4 sm:px-12 object-contain">

        {/* Source Node */}
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center border-cyan-500/50 glow-cyan relative z-20 bg-black/40 xl:w-20 xl:h-20">
            <Wallet className="w-8 h-8 text-cyan-400" />

            {/* Pulsing rings */}
            <motion.div
              animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
              className="absolute inset-0 border border-cyan-400 rounded-2xl"
            />
          </div>
          <div className="mt-3 text-center">
            <h4 className="text-white font-bold">Total Income</h4>
            <p className="text-sm font-numbers text-cyan-400">Rs. {topExpenses.length > 0 ? (totalIncome / 1000).toFixed(0) + 'k' : '0'}</p>
          </div>
        </div>

        {/* Connections SVG */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center w-full z-10 overflow-visible">
          <svg className="w-full h-full" viewBox="0 0 500 400" preserveAspectRatio="none">
            {topExpenses.map((exp, i) => {
              // Y positions distributed across the 400px height based on flex layout
              const yDest = i === 0 ? 80 : i === 1 ? 200 : 320

              // Base thickness on ratio of amount to total income
              const ratio = Math.min(exp.amount / (totalIncome || 1), 1)
              const thickness = Math.max(ratio * 20, 4)
              const dur = Math.max(4 - (ratio * 2), 1.5) // faster for larger amounts

              return (
                <g key={exp.id}>
                  <motion.path
                    d={`M 150 200 C 250 200, 350 ${yDest}, 480 ${yDest}`}
                    stroke={exp.style.stroke}
                    strokeWidth={thickness}
                    fill="none"
                    strokeDasharray={`${thickness * 2} ${thickness * 2}`}
                    animate={{ strokeDashoffset: [0, -thickness * 4] }}
                    transition={{ repeat: Infinity, duration: dur * 1.5, ease: "linear" }}
                  />
                  <motion.circle r={Math.max(thickness / 1.5, 3)} fill={exp.style.dot} style={{ filter: `drop-shadow(0 0 ${thickness}px ${exp.style.dot})` }}>
                    <animateMotion
                      dur={`${dur + 1}s`}
                      repeatCount="indefinite"
                      path={`M 150 200 C 250 200, 350 ${yDest}, 480 ${yDest}`}
                    />
                  </motion.circle>
                </g>
              )
            })}
          </svg>
        </div>

        {/* Destination Nodes */}
        <div className="absolute right-4 sm:right-12 inset-y-0 w-32 md:w-48 pointer-events-none">
          {topExpenses.map((exp, i) => {
            // Must perfectly match the SVG logic:
            // Top 3 yDest points across exactly 400px viewBox coordinate space: 80, 200, 320.
            // But viewBox is 500x400 stretched. Let's position relatively by percentages!
            // 80/400 = 20%, 200/400 = 50%, 320/400 = 80%
            const topPercent = i === 0 ? 20 : i === 1 ? 50 : 80;

            return (
              <div
                key={exp.id}
                className="absolute right-0 flex items-center space-x-4 bg-black/40 pr-4 rounded-xl backdrop-blur-sm border border-white/5 pb-1 pt-1 pl-1 pointer-events-auto transform -translate-y-1/2"
                style={{ top: `${topPercent}%` }}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${exp.style.border} shadow-[0_0_15px_rgba(0,0,0,0.5)] bg-black/60 shrink-0 text-xl`}>
                  {exp.icon}
                </div>
                <div>
                  <h4 className="text-gray-200 font-semibold text-sm max-w-[80px] truncate" title={exp.name}>{exp.name}</h4>
                  <p className={`text-xs font-numbers ${exp.style.text}`}>Rs. {(exp.amount / 1000).toFixed(0)}k</p>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}
