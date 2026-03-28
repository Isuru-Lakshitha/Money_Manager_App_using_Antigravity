"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Target, Plus, TrendingUp, Trophy, Trash2, Edit2, Calendar, AlertCircle } from 'lucide-react'
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
          className="bg-cyan-500 hover:bg-cyan-400 text-black px-4 py-2 rounded-xl transition-all glow-cyan flex items-center font-semibold hover:scale-105 active:scale-95"
        >
          <Plus className="w-5 h-5 mr-1" />
          <span className="hidden sm:inline">New Goal</span>
        </button>
      </div>

      {goals.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-12 text-center rounded-3xl flex flex-col items-center justify-center border-dashed border-2 border-white/10"
        >
          <div className="w-20 h-20 rounded-full bg-cyan-500/10 flex items-center justify-center mb-6">
            <Trophy className="w-10 h-10 text-cyan-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">No Goals Yet</h3>
          <p className="text-gray-400 mb-8 max-w-md text-center leading-relaxed">
            Setting aside money for specific future purchases is a great way to stay strictly within your budget. Create your first sinking fund now!
          </p>
          <button
            onClick={() => openModal()}
            className="bg-white hover:bg-gray-100 text-black px-8 py-3 rounded-xl transition-all font-bold shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95"
          >
            Create Your First Goal
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {goals.map((goal, idx) => {
              const progress = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100)
              const isCompleted = progress >= 100
              const remaining = Math.max(0, goal.targetAmount - goal.currentAmount)
              
              let daysLeft = 0;
              let reqDaily = 0;
              let reqMonthly = 0;
              let isOverdue = false;

              if (goal.deadline && !isCompleted) {
                const diffTime = new Date(goal.deadline).getTime() - new Date().getTime();
                daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (daysLeft > 0) {
                  reqDaily = remaining / daysLeft;
                  reqMonthly = remaining / (daysLeft / 30.44); // Approx days in a month
                } else {
                  isOverdue = true;
                }
              }

              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  transition={{ delay: idx * 0.05, type: 'spring', bounce: 0.4 }}
                  className="glass-panel p-6 relative overflow-hidden group hover:border-cyan-500/30 transition-colors duration-500 rounded-3xl"
                >
                  {/* Decorative background glow based on completion */}
                  <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-[60px] pointer-events-none transition-all duration-700 ${
                    isCompleted ? 'bg-green-500/20 group-hover:bg-green-500/30' : 
                    isOverdue ? 'bg-red-500/20 group-hover:bg-red-500/30' : 
                    'bg-cyan-500/10 group-hover:bg-cyan-500/20'
                  }`} />

                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center space-x-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors duration-500 ${
                        isCompleted ? 'bg-green-500/10 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 
                        isOverdue ? 'bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.2)]' :
                        'bg-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                      }`}>
                        {isCompleted ? <Trophy className="w-7 h-7 text-green-400" /> : 
                         isOverdue ? <AlertCircle className="w-7 h-7 text-red-400" /> : 
                         <Target className="w-7 h-7 text-cyan-400" />}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white line-clamp-1 group-hover:text-cyan-100 transition-colors">{goal.name}</h3>
                        <div className="flex flex-col gap-1 mt-1">
                          <p className="text-sm font-numbers text-gray-400">Target: Rs. {goal.targetAmount.toLocaleString()}</p>
                          {goal.deadline && (
                            <div className={`flex items-center text-xs px-2 py-0.5 rounded-md w-max ${
                              isCompleted ? 'bg-green-500/10 text-green-400' :
                              isOverdue ? 'bg-red-500/10 text-red-400 font-bold' : 'bg-cyan-500/10 text-cyan-400'
                            }`}>
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(goal.deadline).toLocaleDateString()}
                              {!isCompleted && daysLeft > 0 && ` (${daysLeft} days left)`}
                              {isOverdue && !isCompleted && ' (Overdue)'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex space-x-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openModal(goal)}
                        className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors hover:scale-105"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => deleteGoal(goal.id)}
                        className="p-2 text-red-400/70 hover:text-red-400 bg-red-400/5 hover:bg-red-400/10 rounded-xl transition-colors hover:scale-105"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <span className="text-white text-3xl font-bold font-numbers tracking-tight">
                          Rs. {goal.currentAmount.toLocaleString()}
                        </span>
                      </div>
                      <span className={`text-lg font-bold ${isCompleted ? 'text-green-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'text-cyan-400'}`}>
                        {progress.toFixed(1)}%
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="relative pt-1">
                      <div className="h-4 w-full bg-black/50 rounded-full overflow-hidden border border-white/5 shadow-inner">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1.5, ease: 'easeOut', type: "spring", bounce: 0.2 }}
                          className={`h-full rounded-full ${
                            isCompleted ? 'bg-green-500 glow-green' : 
                            isOverdue ? 'bg-red-500 glow-red' : 
                            'bg-cyan-500 glow-cyan'
                          } relative`}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/30" />
                          {/* Animated shimmer effect */}
                          <motion.div 
                            animate={{ x: ['-100%', '200%'] }}
                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                            className="absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
                          />
                        </motion.div>
                      </div>
                    </div>

                    <div className="flex justify-between text-xs text-gray-500 font-medium">
                      <span>{progress === 0 ? "Just started" : "Keep going!"}</span>
                      <span>
                        {goal.targetAmount > goal.currentAmount 
                          ? `${remaining.toLocaleString()} remaining` 
                          : 'Goal Reached! 🎉'}
                      </span>
                    </div>
                    
                    {/* Daily / Monthly requirements breakdown */}
                    {goal.deadline && !isCompleted && daysLeft > 0 && (
                      <div className="mt-4 pt-4 border-t border-white/5 border-dashed">
                        <p className="text-xs text-gray-400 mb-2 font-medium">Required to hit goal on time:</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-white/5 rounded-xl p-2.5 flex flex-col justify-center items-center">
                            <span className="text-gray-500 text-[10px] uppercase tracking-wider font-bold mb-1">Daily Save</span>
                            <span className="text-cyan-300 font-numbers text-sm font-semibold">Rs. {Math.ceil(reqDaily).toLocaleString()}</span>
                          </div>
                          <div className="bg-white/5 rounded-xl p-2.5 flex flex-col justify-center items-center">
                            <span className="text-gray-500 text-[10px] uppercase tracking-wider font-bold mb-1">Monthly Save</span>
                            <span className="text-cyan-300 font-numbers text-sm font-semibold">
                              {daysLeft < 30 ? "N/A" : `Rs. ${Math.ceil(reqMonthly).toLocaleString()}`}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
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
