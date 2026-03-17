"use client"

import { useAppStore, DEFAULT_CATEGORIES } from '@/store'
import { startOfMonth, subMonths, format, endOfMonth, isWithinInterval, parseISO } from 'date-fns'
import { ArrowDownRight, ArrowUpRight, Filter, PieChart as PieChartIcon, TrendingUp, Wallet } from 'lucide-react'
import { useState } from 'react'

export default function ReportsPage() {
    const transactions = useAppStore(state => state.transactions)
    const categories = useAppStore(state => state.categories)
    const [monthOffset, setMonthOffset] = useState(0)

    // Calculate time window
    const baseDate = subMonths(new Date(), monthOffset)
    const monthStart = startOfMonth(baseDate)
    const monthEnd = endOfMonth(baseDate)
    const monthLabel = format(baseDate, 'MMMM yyyy')

    // Filter transactions for the selected month
    const monthTxs = transactions.filter(t => {
        const d = parseISO(t.date)
        return isWithinInterval(d, { start: monthStart, end: monthEnd })
    })

    const incomeTxs = monthTxs.filter(t => t.type === 'income')
    const expenseTxs = monthTxs.filter(t => t.type === 'expense' && t.category_id !== 'goal' && t.category_id !== 'transfer')

    const totalIncome = incomeTxs.reduce((sum, t) => sum + t.amount, 0)
    const totalExpense = expenseTxs.reduce((sum, t) => sum + t.amount, 0)
    const netSavings = totalIncome - totalExpense
    const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : '0.0'

    // Category Breakdown
    const categoryMap: Record<string, { amount: number, count: number }> = {}
    expenseTxs.forEach(t => {
        const catId = t.category_id || 'uncategorized'
        if (!categoryMap[catId]) categoryMap[catId] = { amount: 0, count: 0 }
        categoryMap[catId].amount += t.amount
        categoryMap[catId].count += 1
    })

    const categoryBreakdown = Object.entries(categoryMap)
        .map(([id, data]) => {
            let cat = categories.find(c => c.id === id)
            if (!cat) {
                cat = DEFAULT_CATEGORIES.find(c => c.id === id)
            }
            return {
                id,
                name: cat?.name || 'Uncategorized',
                icon: cat?.icon || '🏷️',
                amount: data.amount,
                count: data.count,
                percent: totalExpense > 0 ? ((data.amount / totalExpense) * 100).toFixed(1) : '0'
            }
        })
        .sort((a, b) => b.amount - a.amount)

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-20">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">Financial Reports</h1>
                    <p className="text-gray-400">Detailed breakdown of your income and expenses.</p>
                </div>
                
                {/* Month Selector */}
                <div className="flex items-center space-x-4 bg-black/40 p-2 rounded-xl border border-white/5">
                    <button 
                        onClick={() => setMonthOffset(prev => prev + 1)}
                        className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                    >
                        &larr; Prev
                    </button>
                    <span className="text-white font-semibold min-w-[120px] text-center">{monthLabel}</span>
                    <button 
                        onClick={() => setMonthOffset(prev => Math.max(0, prev - 1))}
                        disabled={monthOffset === 0}
                        className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors disabled:opacity-30"
                    >
                        Next &rarr;
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="glass-panel p-6 border-cyan-500/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <TrendingUp className="w-16 h-16 text-cyan-500" />
                    </div>
                    <p className="text-sm font-semibold text-cyan-400 uppercase tracking-wider mb-2">Total Income</p>
                    <h3 className="text-3xl font-bold font-numbers text-white">Rs. {totalIncome.toLocaleString()}</h3>
                    <div className="mt-4 flex items-center text-xs text-gray-400">
                        <ArrowUpRight className="w-4 h-4 text-cyan-500 mr-1" />
                        <span>{incomeTxs.length} transactions</span>
                    </div>
                </div>

                <div className="glass-panel p-6 border-purple-500/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Wallet className="w-16 h-16 text-purple-500" />
                    </div>
                    <p className="text-sm font-semibold text-purple-400 uppercase tracking-wider mb-2">Total Expenses</p>
                    <h3 className="text-3xl font-bold font-numbers text-white">Rs. {totalExpense.toLocaleString()}</h3>
                    <div className="mt-4 flex items-center text-xs text-gray-400">
                        <ArrowDownRight className="w-4 h-4 text-purple-500 mr-1" />
                        <span>{expenseTxs.length} transactions</span>
                    </div>
                </div>

                <div className={`glass-panel p-6 relative overflow-hidden ${netSavings >= 0 ? 'border-green-500/20' : 'border-red-500/20'}`}>
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <PieChartIcon className={`w-16 h-16 ${netSavings >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                    </div>
                    <p className={`text-sm font-semibold uppercase tracking-wider mb-2 ${netSavings >= 0 ? 'text-green-400' : 'text-red-400'}`}>Net Savings</p>
                    <h3 className="text-3xl font-bold font-numbers text-white">Rs. {netSavings.toLocaleString()}</h3>
                    <div className="mt-4 flex items-center text-xs text-gray-400">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold mr-2 ${netSavings >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {savingsRate}%
                        </span>
                        <span>Savings Rate</span>
                    </div>
                </div>
            </div>

            {/* Top Categories Table */}
            <div className="glass-panel overflow-hidden border-white/5">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">Expense Breakdown</h2>
                    <span className="text-sm text-gray-400 flex items-center">
                        <Filter className="w-4 h-4 mr-2" />
                        By Category
                    </span>
                </div>
                
                {categoryBreakdown.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-black/20 text-gray-400 text-xs uppercase tracking-wider">
                                    <th className="px-6 py-4 font-semibold">Category</th>
                                    <th className="px-6 py-4 font-semibold text-right">Amount</th>
                                    <th className="px-6 py-4 font-semibold text-center">Transactions</th>
                                    <th className="px-6 py-4 font-semibold text-right">% of Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {categoryBreakdown.map((cat, idx) => (
                                    <tr key={cat.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <span className="text-2xl">{cat.icon}</span>
                                                <span className="font-semibold text-gray-200 group-hover:text-white transition-colors">{cat.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-numbers font-bold text-white">Rs. {cat.amount.toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center text-gray-400">
                                            {cat.count}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end space-x-3">
                                                <span className="text-sm font-semibold text-gray-300 w-12">{cat.percent}%</span>
                                                <div className="w-24 h-2 bg-black/40 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-purple-500 rounded-full" 
                                                        style={{ width: `${cat.percent}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-12 text-center text-gray-500">
                        <p>No expenses recorded for this month.</p>
                    </div>
                )}
            </div>
            
        </div>
    )
}
