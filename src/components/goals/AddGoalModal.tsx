"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Target, Plus, Download } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { useAppStore, Goal } from '@/store'

interface Props {
  isOpen: boolean
  onClose: () => void
  goalToEdit: Goal | null
}

export default function AddGoalModal({ isOpen, onClose, goalToEdit }: Props) {
  const [name, setName] = useState(goalToEdit?.name || '')
  const [targetAmount, setTargetAmount] = useState(goalToEdit?.targetAmount?.toString() || '')
  const [currentAmount, setCurrentAmount] = useState(goalToEdit?.currentAmount?.toString() || '0')
  const [deadline, setDeadline] = useState(goalToEdit?.deadline || '')
  const [loading, setLoading] = useState(false)

  const addGoal = useAppStore(state => state.addGoal)
  const updateGoal = useAppStore(state => state.updateGoal)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (goalToEdit) {
        await updateGoal(goalToEdit.id, {
          name,
          targetAmount: Number(targetAmount),
          currentAmount: Number(currentAmount),
          deadline: deadline || undefined
        })
      } else {
        await addGoal({
          id: uuidv4(),
          name,
          targetAmount: Number(targetAmount),
          currentAmount: Number(currentAmount),
          deadline: deadline || undefined
        })
      }
      onClose()
    } catch (error: any) {
      console.error(error)
      alert("Failed to save goal. Database error: " + (error?.message || "Verify your Supabase SQL tables are up to date."))
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="glass-panel w-full max-w-md p-6 relative z-10 border-cyan-500/30"
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {goalToEdit ? 'Edit Goal' : 'Create New Goal'}
              </h2>
              <p className="text-sm text-gray-400">Set a target to save towards</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Goal Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                placeholder="e.g. New Car, Vacation"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Target Amount</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={targetAmount}
                  onChange={e => setTargetAmount(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-white font-numbers focus:outline-none focus:border-cyan-500/50 transition-colors"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Starting Amount</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={currentAmount}
                  onChange={e => setCurrentAmount(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-white font-numbers focus:outline-none focus:border-cyan-500/50 transition-colors"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Target Deadline (Optional)</label>
              <input
                type="date"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold py-3 rounded-xl transition-all glow-cyan mt-6 disabled:opacity-50"
            >
              {loading ? 'Saving...' : (goalToEdit ? 'Update Goal' : 'Save Goal')}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
