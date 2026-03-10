"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar as CalendarIcon, Target, Award } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAppStore, Goal } from '@/store'
import { v4 as uuidv4 } from 'uuid'
import { format, differenceInDays } from 'date-fns'

const goalSchema = z.object({
  name: z.string().min(1, 'Goal name is required').max(50),
  target_amount: z.string().min(1, 'Target amount is required'),
  current_amount: z.string().min(1, 'Current amount is required'),
  deadline: z.string().min(1, 'Deadline is required'),
  color: z.string(),
  icon: z.string()
}).refine((data) => {
  const target = Number(data.target_amount.replace(/,/g, ''))
  const current = Number(data.current_amount.replace(/,/g, ''))
  return current <= target
}, {
  message: "Current amount cannot exceed target",
  path: ["current_amount"]
})

type GoalFormData = z.infer<typeof goalSchema>

interface GoalModalProps {
  isOpen: boolean
  onClose: () => void
  goalToEdit?: Goal | null
}

const GOAL_COLORS = ['#00E5FF', '#10B981', '#8B5CF6', '#F43F5E', '#F59E0B', '#3B82F6']
const GOAL_ICONS = ['💻', '🛡️', '✈️', '🚗', '🏠', '🎓', '🏥', '🎉']

export default function GoalModal({ isOpen, onClose, goalToEdit }: GoalModalProps) {
  const addGoal = useAppStore(state => state.addGoal)
  const updateGoal = useAppStore(state => state.updateGoal)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      color: GOAL_COLORS[0],
      icon: GOAL_ICONS[0],
      deadline: format(new Date(new Date().setMonth(new Date().getMonth() + 6)), 'yyyy-MM-dd')
    }
  })

  useEffect(() => {
    if (goalToEdit) {
      setValue('name', goalToEdit.name)
      setValue('target_amount', goalToEdit.target_amount.toString())
      setValue('current_amount', goalToEdit.current_amount.toString())
      setValue('deadline', goalToEdit.deadline)
      setValue('color', goalToEdit.color)
      setValue('icon', goalToEdit.icon)
    } else {
      reset({
        name: '',
        target_amount: '',
        current_amount: '0',
        deadline: format(new Date(new Date().setMonth(new Date().getMonth() + 6)), 'yyyy-MM-dd'),
        color: GOAL_COLORS[0],
        icon: GOAL_ICONS[0]
      })
    }
  }, [goalToEdit, isOpen, setValue, reset])

  const onSubmit = (data: GoalFormData) => {
    const target = Number(data.target_amount.replace(/,/g, ''))
    const current = Number(data.current_amount.replace(/,/g, ''))

    if (goalToEdit) {
      updateGoal(goalToEdit.id, {
        name: data.name,
        target_amount: target,
        current_amount: current,
        deadline: data.deadline,
        color: data.color,
        icon: data.icon
      })
    } else {
      addGoal({
        id: uuidv4(),
        name: data.name,
        target_amount: target,
        current_amount: current,
        deadline: data.deadline,
        color: data.color,
        icon: data.icon
      })
    }

    onClose()
  }

  const handleAmountChange = (field: 'current_amount' | 'target_amount') => (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9.]/g, '')
    if (value) {
      const parts = value.split('.')
      if (parts.length > 2) return
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")
      if (parts[1] && parts[1].length > 2) parts[1] = parts[1].slice(0, 2)
      value = parts.join('.')
    }
    setValue(field, value, { shouldValidate: true })
  }

  const selectedColor = watch('color')
  const selectedIcon = watch('icon')

  const targetAmountWatched = watch('target_amount')
  const currentAmountWatched = watch('current_amount')
  const deadlineWatched = watch('deadline')

  // Calculate savings needs
  const tAmount = Number((targetAmountWatched || '0').replace(/,/g, ''))
  const cAmount = Number((currentAmountWatched || '0').replace(/,/g, ''))
  const remainingAmount = Math.max(0, tAmount - cAmount)

  const daysRemaining = Math.max(1, differenceInDays(new Date(deadlineWatched || new Date()), new Date()))

  const dailyNeed = remainingAmount / daysRemaining
  const weeklyNeed = dailyNeed * 7
  const monthlyNeed = dailyNeed * 30.44

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-panel w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] relative z-50 shadow-2xl"
            >
              <div
                className="absolute top-0 left-0 w-full h-1 transition-colors"
                style={{ backgroundColor: selectedColor }}
              />

              <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
                <h2 className="text-xl font-bold text-white">
                  {goalToEdit ? 'Edit Goal' : 'New Goal'}
                </h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto no-scrollbar">
                <form id="goal-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                  {/* Name */}
                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Goal Name</label>
                    <input
                      {...register('name')}
                      autoComplete="off"
                      placeholder="e.g. New Car, Emergency Fund"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-all focus:border-white/30"
                    />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                  </div>

                  {/* Amounts */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Target</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold select-none text-sm">Rs.</span>
                        <input
                          {...register('target_amount')}
                          onChange={handleAmountChange('target_amount')}
                          placeholder="0"
                          className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-3 text-lg font-bold font-numbers text-white placeholder-gray-600 focus:outline-none transition-all focus:border-white/30"
                        />
                      </div>
                      {errors.target_amount && <p className="text-xs text-red-500 mt-1">{errors.target_amount.message}</p>}
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Saved</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold select-none text-sm">Rs.</span>
                        <input
                          {...register('current_amount')}
                          onChange={handleAmountChange('current_amount')}
                          placeholder="0"
                          className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-3 text-lg font-bold font-numbers text-white placeholder-gray-600 focus:outline-none transition-all focus:border-white/30"
                        />
                      </div>
                      {errors.current_amount && <p className="text-xs text-red-500 mt-1">{errors.current_amount.message}</p>}
                    </div>
                  </div>

                  {/* Deadline */}
                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Target Date</label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        {...register('deadline')}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-white/30 transition-all font-numbers"
                      />
                    </div>
                  </div>

                  {/* Customization */}
                  <div className="space-y-4 pt-2">
                    <div>
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Color</label>
                      <div className="flex space-x-3">
                        {GOAL_COLORS.map(color => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setValue('color', color)}
                            className={`w-8 h-8 rounded-full transition-transform ${selectedColor === color ? 'scale-125 ring-2 ring-white/50' : 'hover:scale-110'}`}
                            style={{ backgroundColor: color, boxShadow: selectedColor === color ? `0 0 10px ${color}80` : 'none' }}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Icon</label>
                      <div className="flex space-x-2 bg-black/20 p-2 rounded-xl border border-white/5 overflow-x-auto no-scrollbar">
                        {GOAL_ICONS.map(icon => (
                          <button
                            key={icon}
                            type="button"
                            onClick={() => setValue('icon', icon)}
                            className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-lg text-xl transition-colors ${selectedIcon === icon ? 'bg-white/10 shadow-inner' : 'hover:bg-white/5'}`}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Savings Projection */}
                  {remainingAmount > 0 && daysRemaining > 1 && (
                    <div className="bg-black/30 border border-white/5 rounded-xl p-4">
                      <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center">
                        <Target className="w-4 h-4 mr-2" style={{ color: selectedColor }} />
                        Required Savings to Reach Goal
                      </h3>
                      <div className="grid grid-cols-3 gap-2 text-center divide-x divide-white/10">
                        <div>
                          <p className="text-xs text-gray-500 uppercase">Daily</p>
                          <p className="text-sm font-bold text-white mt-1 font-numbers" style={{ color: selectedColor }}>Rs. {dailyNeed.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase">Weekly</p>
                          <p className="text-sm font-bold text-white mt-1 font-numbers" style={{ color: selectedColor }}>Rs. {weeklyNeed.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase">Monthly</p>
                          <p className="text-sm font-bold text-white mt-1 font-numbers" style={{ color: selectedColor }}>Rs. {monthlyNeed.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                        </div>
                      </div>
                    </div>
                  )}

                </form>
              </div>

              <div className="p-6 border-t border-white/5 bg-black/20 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="goal-form"
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-xl font-semibold text-black transition-all disabled:opacity-50"
                  style={{ backgroundColor: selectedColor, boxShadow: `0 0 20px ${selectedColor}60` }}
                >
                  {isSubmitting ? 'Saving...' : goalToEdit ? 'Save Changes' : 'Create Goal'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
