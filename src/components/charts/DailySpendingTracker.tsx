"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'
import { useAppStore } from '@/store'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isBefore, isToday, parseISO } from 'date-fns'

export default function DailySpendingTracker() {
    const transactions = useAppStore(state => state.transactions)

    // Generate data for the current month up to today
    const today = new Date()
    const monthStart = startOfMonth(today)
    const monthEnd = endOfMonth(today)
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

    let cumulativeSpending = 0

    const data = daysInMonth.map(day => {
        // Only calculate for days up to today
        if (isBefore(day, today) || isToday(day)) {
            // Find expenses for this specific day (excluding goals)
            const dayExpenses = transactions
                .filter(t => t.type === 'expense' && t.category_id !== 'goal')
                .filter(t => t.date.startsWith(format(day, 'yyyy-MM-dd')))
                .reduce((sum, t) => sum + t.amount, 0)

            cumulativeSpending += dayExpenses

            return {
                date: format(day, 'MMM dd'),
                daily: dayExpenses,
                cumulative: cumulativeSpending,
                isFuture: false
            }
        } else {
            // Future days in the month
            return {
                date: format(day, 'MMM dd'),
                daily: null,
                cumulative: null,
                isFuture: true
            }
        }
    })

    // Calculate current total
    const totalSpent = cumulativeSpending

    return (
        <div className="glass-panel p-6 h-[400px] flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                    <h3 className="text-lg font-bold text-white">Daily Spending Tracker</h3>
                    <p className="text-xs text-gray-400">Daily expenses for {format(today, 'MMMM')}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Total Spent</p>
                    <p className="text-xl font-numbers font-bold text-purple-400">Rs. {totalSpent.toLocaleString()}</p>
                </div>
            </div>

            <div className="flex-1 w-full min-h-0 relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                            </linearGradient>
                            <filter id="glowTracker">
                                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis
                            dataKey="date"
                            stroke="#6b7280"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                            minTickGap={20}
                        />
                        <YAxis
                            stroke="#8B5CF6"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `Rs.${(value / 1000).toFixed(0)}k`}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: 'rgba(18,24,38,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(8px)' }}
                            itemStyle={{ color: '#fff', fontSize: '14px', fontFamily: 'var(--font-rajdhani)' }}
                            labelStyle={{ color: '#9ca3af', fontSize: '12px', marginBottom: '4px' }}
                            cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                            formatter={(value: any, name: any) => [`Rs. ${Number(value).toLocaleString()}`, name === 'cumulative' ? 'Total Spent So Far' : 'Spent This Day']}
                        />
                        <Area
                            type="monotoneX"
                            dataKey="daily"
                            name="daily"
                            stroke="#8B5CF6"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorCumulative)"
                            activeDot={{ r: 6, fill: '#8B5CF6', stroke: '#fff', strokeWidth: 2 }}
                            style={{ filter: "url(#glowTracker)" }}
                            connectNulls={false}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
