"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, BrainCircuit, Lightbulb, TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react'
import { useAppStore } from '@/store'
import { startOfMonth, subMonths, format } from 'date-fns'

interface Insight {
    id: string
    type: 'positive' | 'warning' | 'neutral' | 'suggestion'
    title: string
    description: string
    icon: any
    color: string
}

export default function ReportsPage() {
    const transactions = useAppStore(state => state.transactions)
    const categories = useAppStore(state => state.categories)
    const goals = useAppStore(state => state.goals)

    const [insights, setInsights] = useState<Insight[]>([])
    const [isGenerating, setIsGenerating] = useState(false)
    const [hasGenerated, setHasGenerated] = useState(false)

    // Generate Insights based on real data
    const generateInsights = () => {
        setIsGenerating(true)

        // Simulate AI processing time for aesthetic effect
        setTimeout(() => {
            const newInsights: Insight[] = []

            const currentMonthPrefix = format(new Date(), 'yyyy-MM')
            const lastMonthPrefix = format(subMonths(new Date(), 1), 'yyyy-MM')

            const currentExpenses = transactions.filter(t => t.type === 'expense' && t.date.startsWith(currentMonthPrefix)).reduce((s, t) => s + t.amount, 0)
            const lastExpenses = transactions.filter(t => t.type === 'expense' && t.date.startsWith(lastMonthPrefix)).reduce((s, t) => s + t.amount, 0)
            const currentIncome = transactions.filter(t => t.type === 'income' && t.date.startsWith(currentMonthPrefix)).reduce((s, t) => s + t.amount, 0)

            // Insight 1: Spending Trend
            if (lastExpenses > 0) {
                const diff = currentExpenses - lastExpenses
                const percent = ((Math.abs(diff) / lastExpenses) * 100).toFixed(1)
                if (diff > 0) {
                    newInsights.push({
                        id: '1',
                        type: 'warning',
                        title: 'Spending Increased',
                        description: `Your expenses are up ${percent}% compared to last month. Consider reviewing your casual spending.`,
                        icon: AlertTriangle,
                        color: 'text-orange-500'
                    })
                } else {
                    newInsights.push({
                        id: '1',
                        type: 'positive',
                        title: 'Great Savings',
                        description: `You've spent ${percent}% less this month than last month! Keep up the good work.`,
                        icon: ShieldCheck,
                        color: 'text-green-500'
                    })
                }
            }

            // Insight 2: Category Detection
            const categoryMap: Record<string, number> = {}
            transactions.filter(t => t.type === 'expense' && t.date.startsWith(currentMonthPrefix)).forEach(t => {
                categoryMap[t.category_id || ''] = (categoryMap[t.category_id || ''] || 0) + t.amount
            })

            const topCategory = Object.entries(categoryMap).sort((a, b) => b[1] - a[1])[0]
            if (topCategory && currentExpenses > 0) {
                const catName = categories.find(c => c.id === topCategory[0])?.name || 'Unknown'
                const percentOfTotal = ((topCategory[1] / currentExpenses) * 100).toFixed(0)

                if (Number(percentOfTotal) > 40) {
                    newInsights.push({
                        id: '2',
                        type: 'warning',
                        title: 'Category Imbalance',
                        description: `${percentOfTotal}% of your monthly expenses went towards ${catName}. Try diversifying your budget.`,
                        icon: AlertTriangle,
                        color: 'text-orange-500'
                    })
                }
            }

            // Insight 3: Goal Tracking
            const nearingGoal = goals.find(g => (g.current_amount / g.target_amount) > 0.8 && g.current_amount < g.target_amount)
            if (nearingGoal) {
                newInsights.push({
                    id: '3',
                    type: 'positive',
                    title: 'Goal Almost Complete!',
                    description: `You are very close to reaching your "${nearingGoal.name}" goal. You only need Rs. ${(nearingGoal.target_amount - nearingGoal.current_amount).toLocaleString()} more!`,
                    icon: TrendingUp,
                    color: 'text-cyan-400'
                })
            }

            // Default generic positive
            if (newInsights.length === 0) {
                newInsights.push({
                    id: '4',
                    type: 'neutral',
                    title: 'Healthy Finances',
                    description: 'Your financial patterns are stable. Start logging more transactions to receive predictive AI insights!',
                    icon: Lightbulb,
                    color: 'text-blue-400'
                })
            }

            setInsights(newInsights)
            setHasGenerated(true)
            setIsGenerating(false)
        }, 2000)
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-20">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">AI Analyst Reports</h1>
                    <p className="text-gray-400">Get intelligent, actionable insights based on your spending behavior.</p>
                </div>
            </div>

            {!hasGenerated ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-panel p-12 flex flex-col items-center justify-center text-center border border-purple-500/30 glow-[0_0_30px_rgba(139,92,246,0.2)] relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-cyan-500/10 opacity-50 pointer-events-none" />

                    <div className="relative z-10 w-24 h-24 rounded-full bg-black/50 border border-purple-500/50 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(139,92,246,0.4)]">
                        <BrainCircuit className="w-12 h-12 text-purple-400" />

                        {isGenerating && (
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-[-4px] rounded-full border border-t-cyan-400 border-r-purple-400 border-b-transparent border-l-transparent"
                            />
                        )}
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-4 z-10">Generate Deep Analysis</h2>
                    <p className="text-gray-400 max-w-md mb-8 z-10">Our local AI engine will analyze your balances, categories, and historical cashflow to generate custom recommendations.</p>

                    <button
                        onClick={generateInsights}
                        disabled={isGenerating}
                        className="z-10 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white px-8 py-3 rounded-xl font-bold flex items-center space-x-2 transition-all shadow-[0_0_15px_rgba(34,211,238,0.5)] disabled:opacity-50"
                    >
                        <Sparkles className="w-5 h-5" />
                        <span>{isGenerating ? 'Analyzing data...' : 'Run Neural Analysis'}</span>
                    </button>
                </motion.div>
            ) : (
                <div className="space-y-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-white">Your Insights</h2>
                        <button
                            onClick={generateInsights}
                            className="text-cyan-400 text-sm hover:text-cyan-300 font-semibold flex items-center space-x-1"
                        >
                            <Sparkles className="w-4 h-4" />
                            <span>Regenerate Focus</span>
                        </button>
                    </div>

                    <div className="grid gap-4">
                        {insights.map((insight, idx) => (
                            <motion.div
                                key={insight.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.2 }}
                                className="glass-panel p-6 border-l-4 relative overflow-hidden group"
                                style={{
                                    borderLeftColor: insight.type === 'positive' ? '#22c55e' : insight.type === 'warning' ? '#f97316' : '#38bdf8'
                                }}
                            >
                                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex items-start space-x-4 relative z-10">
                                    <div className={`mt-1 bg-black/40 p-3 rounded-full border border-white/5 shadow-md`}>
                                        <insight.icon className={`w-6 h-6 ${insight.color}`} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-1">{insight.title}</h3>
                                        <p className="text-gray-300 leading-relaxed text-sm">{insight.description}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="mt-8 glass p-6 rounded-2xl border border-white/5 bg-black/40 text-center"
                    >
                        <p className="text-sm text-gray-400 italic">Insights are generated based on your local transaction history. More regular logging results in more accurate predictive suggestions.</p>
                    </motion.div>
                </div>
            )}

        </div>
    )
}
