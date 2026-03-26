"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Target, Plus, TrendingUp, Trophy, Trash2, Edit2 } from 'lucide-react'
import { useAppStore, Goal } from '@/store'
import AddGoalModal from '@/components/goals/AddGoalModal'

export default function GoalsPage() {
  const [mounted, setMounted] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [goalToEdit, setGoalToEdit] = useState<Goal | null>(null)
  
  const goals = useAppStore(state => state.goals)
  const deleteGoal = useAppStore(state => state.deleteGoal)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const openModal = (goal: Goal | null = null) => {
    setGoalToEdit(goal)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setTimeout(() => setGoalToEdit(null), 300)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Savings Goals</h1>
          <p className="text-gray-400">Track and manage your sinking funds for future purchases.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-cyan-500 hover:bg-cyan-400 text-black px-4 py-2 rounded-xl transition-all glow-cyan flex items-center font-semibold"
        >
          <Plus className="w-5 h-5 mr-1" />
          <span className="hidden sm:inline">New Goal</span>
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl flex flex-col items-center justify-center border-dashed border-2 border-white/10">
          <div className="w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center mb-4">
            <Trophy className="w-8 h-8 text-cyan-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Goals Yet</h3>
          <p className="text-gray-400 mb-6 max-w-md text-center">
            Setting aside money for specific future purchases is a great way to stay strictly within your budget. Create your first sinking fund now!
          </p>
          <button
            onClick={() => openModal()}
            className="bg-white/5 hover:bg-white/10 text-white px-6 py-2.5 rounded-xl border border-white/10 transition-colors"
          >
            Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal, idx) => {
            const progress = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100)
            const isCompleted = progress >= 100

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="glass-panel p-6 relative overflow-hidden group"
              >
                {/* Decorative background glow based on completion */}
                <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[50px] pointer-events-none transition-all ${
                  isCompleted ? 'bg-green-500/10 group-hover:bg-green-500/20' : 'bg-cyan-500/10 group-hover:bg-cyan-500/20'
                }`} />

                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      isCompleted ? 'bg-green-500/10' : 'bg-cyan-500/10'
                    }`}>
                      {isCompleted ? <Trophy className="w-6 h-6 text-green-400" /> : <Target className="w-6 h-6 text-cyan-400" />}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white line-clamp-1">{goal.name}</h3>
                      <p className="text-sm font-numbers text-gray-400">Target: Rs. {goal.targetAmount.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => openModal(goal)}
                      className="p-1.5 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => deleteGoal(goal.id)}
                      className="p-1.5 text-red-400/70 hover:text-red-400 bg-red-400/5 hover:bg-red-400/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-numbers">
                    <span className="text-white text-xl font-bold">Rs. {goal.currentAmount.toLocaleString()}</span>
                    <span className={`${isCompleted ? 'text-green-400' : 'text-cyan-400'} font-semibold mt-1`}>
                      {progress.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-3 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className={`h-full rounded-full ${isCompleted ? 'bg-green-500 glow-green' : 'bg-cyan-500 glow-cyan'} relative`}
                    >
                      <div className="absolute top-0 right-0 bottom-0 left-0 bg-gradient-to-r from-transparent to-white/20" />
                    </motion.div>
                  </div>
                  <p className="text-xs text-gray-500 text-right mt-1">
                    {goal.targetAmount > goal.currentAmount 
                      ? `${(goal.targetAmount - goal.currentAmount).toLocaleString()} remaining` 
                      : 'Goal Reached!'}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {isModalOpen && (
        <AddGoalModal 
          isOpen={isModalOpen} 
          onClose={handleCloseModal} 
          goalToEdit={goalToEdit} 
        />
      )}
    </div>
  )
}
