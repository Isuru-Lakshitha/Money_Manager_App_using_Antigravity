"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Target, Award, MoreVertical, Edit2, Trash2, CheckCircle } from 'lucide-react'
import { useAppStore, Goal } from '@/store'
import GoalModal from '@/components/goals/GoalModal'
import AddFundsModal from '@/components/goals/AddFundsModal'
import { differenceInDays } from 'date-fns'

export default function GoalsPage() {
  const goals = useAppStore(state => state.goals)
  const deleteGoal = useAppStore(state => state.deleteGoal)
  const updateGoal = useAppStore(state => state.updateGoal)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [goalToEdit, setGoalToEdit] = useState<Goal | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  const [isFundModalOpen, setIsFundModalOpen] = useState(false)
  const [targetFundGoal, setTargetFundGoal] = useState<Goal | null>(null)

  const handleEdit = (goal: Goal) => {
    setGoalToEdit(goal)
    setOpenMenuId(null)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this goal?")) {
      deleteGoal(id)
      setOpenMenuId(null)
    }
  }

  const handleComplete = (goal: Goal) => {
    updateGoal(goal.id, { current_amount: goal.target_amount })
    setOpenMenuId(null)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Financial Goals</h1>
          <p className="text-gray-400">Set targets and track your saving progress.</p>
        </div>
        <button
          onClick={() => { setGoalToEdit(null); setIsModalOpen(true) }}
          className="bg-purple-500 hover:bg-purple-400 text-black px-4 py-3 md:py-2 rounded-xl transition-all glow-purple font-semibold flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">New Goal</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal, idx) => {
          const percentage = Math.min((goal.current_amount / goal.target_amount) * 100, 100)
          const isCompleted = percentage >= 100

          const remainingAmount = Math.max(0, goal.target_amount - goal.current_amount)
          const daysRemaining = Math.max(1, differenceInDays(new Date(goal.deadline), new Date()))
          const dailyNeed = remainingAmount / daysRemaining

          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className={`glass-panel p-6 relative group flex flex-col h-full ${isCompleted ? 'border-yellow-500/30 glow-yellow overflow-hidden' : 'overflow-visible'} transition-colors ${openMenuId === goal.id ? 'z-50 ring-1 ring-white/20' : 'z-0'}`}
            >
              <div
                className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[50px] pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity"
                style={{ backgroundColor: isCompleted ? '#EAB308' : goal.color }}
              />

              <div className={`flex justify-between items-start mb-6 relative ${openMenuId === goal.id ? 'z-30' : 'z-10'}`}>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-lg border border-white/10" style={{ backgroundColor: `${goal.color}20` }}>
                    {isCompleted ? <Award className="w-6 h-6 text-yellow-400" /> : goal.icon}
                  </div>
                  <div className="bg-black/40 px-3 py-1 rounded-full border border-white/5 text-xs text-gray-400 font-semibold flex items-center space-x-1">
                    <Target className="w-3 h-3" />
                    <span>{new Date(goal.deadline).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>

                {/* Options Menu */}
                <div className="relative">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === goal.id ? null : goal.id)}
                    className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>

                  {openMenuId === goal.id && (
                    <div className="absolute right-0 top-8 mt-1 w-48 bg-[#1A2235] border border-white/10 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden z-[100]">
                      {!isCompleted && (
                        <>
                          <button
                            onClick={() => {
                              setTargetFundGoal(goal)
                              setIsFundModalOpen(true)
                              setOpenMenuId(null)
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-cyan-400 hover:bg-cyan-500/20 flex items-center space-x-2 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Add Funds</span>
                          </button>
                          <button
                            onClick={() => handleComplete(goal)}
                            className="w-full text-left px-4 py-2 text-sm text-yellow-400 hover:bg-yellow-500/20 flex items-center space-x-2 transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Mark Complete</span>
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleEdit(goal)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white flex items-center space-x-2 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                        <span>Edit Goal</span>
                      </button>
                      <button
                        onClick={() => handleDelete(goal.id)}
                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/20 flex items-center space-x-2 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete Goal</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 relative z-10 pointer-events-none">
                <h3 className="text-white font-bold text-lg mb-1 truncate pr-2" title={goal.name}>{goal.name}</h3>
                <div className="flex items-end mb-2">
                  <span className="text-2xl font-bold font-numbers text-white">Rs. {goal.current_amount >= 1000 ? (goal.current_amount / 1000).toFixed(1) + 'k' : goal.current_amount}</span>
                  <span className="text-sm text-gray-500 font-numbers ml-1 mb-1">/ {goal.target_amount >= 1000 ? (goal.target_amount / 1000).toFixed(1) + 'k' : goal.target_amount}</span>
                </div>
                {!isCompleted && remainingAmount > 0 && (
                  <p className="text-xs font-semibold" style={{ color: goal.color }}>
                    Goal: <span className="font-numbers">Rs. {dailyNeed.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span> / Day
                  </p>
                )}
              </div>

              <div className="relative z-10 mt-auto pointer-events-none">
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-gray-400">{isCompleted ? 'Goal Reached!' : 'Progress'}</span>
                  <span style={{ color: isCompleted ? '#EAB308' : goal.color }} className="font-numbers">{percentage.toFixed(0)}%</span>
                </div>

                <div className="h-2.5 bg-black/50 rounded-full overflow-hidden border border-white/5 relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full rounded-full relative"
                    style={{
                      backgroundColor: isCompleted ? '#EAB308' : goal.color,
                      boxShadow: `0 0 10px ${isCompleted ? '#EAB308' : goal.color}80`
                    }}
                  >
                    {!isCompleted && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-full h-full -translate-x-[100%] animate-[shimmer_2s_infinite]" />}
                  </motion.div>
                </div>
              </div>

              {isCompleted && (
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent" />
              )}
            </motion.div>
          )
        })}

        {/* Add New Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: goals.length * 0.1 }}
          onClick={() => { setGoalToEdit(null); setIsModalOpen(true) }}
          className="glass-panel p-6 border-dashed border-2 border-white/10 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 hover:border-cyan-500/50 transition-all group min-h-[250px]"
        >
          <div className="w-16 h-16 rounded-full glass bg-black/40 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Plus className="w-8 h-8 text-gray-400 group-hover:text-cyan-400" />
          </div>
          <h3 className="text-gray-400 font-semibold group-hover:text-cyan-400 transition-colors">Create New Goal</h3>
        </motion.div>
      </div>

      <GoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        goalToEdit={goalToEdit}
      />

      {/* Click outside to close menu overlay */}
      {openMenuId && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpenMenuId(null)}
        />
      )}

      {targetFundGoal && (
        <AddFundsModal
          isOpen={isFundModalOpen}
          onClose={() => setIsFundModalOpen(false)}
          goal={targetFundGoal}
        />
      )}
    </div>
  )
}
