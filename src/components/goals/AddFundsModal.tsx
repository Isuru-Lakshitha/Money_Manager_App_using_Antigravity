"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Wallet } from 'lucide-react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm as useHookForm } from 'react-hook-form'
import { useAppStore, Goal, AccountType } from '@/store'
import { v4 as uuidv4 } from 'uuid'

const addFundsSchema = z.object({
    amount: z.string().min(1, 'Amount is required').refine(val => !isNaN(Number(val.replace(/,/g, ''))) && Number(val.replace(/,/g, '')) > 0, 'Must be a valid positive number'),
    notes: z.string().max(100).optional(),
})

type AddFundsFormData = z.infer<typeof addFundsSchema>

interface AddFundsModalProps {
    isOpen: boolean
    onClose: () => void
    goal: Goal
}

export default function AddFundsModal({ isOpen, onClose, goal }: AddFundsModalProps) {
    const updateGoal = useAppStore(state => state.updateGoal)
    const addTransaction = useAppStore(state => state.addTransaction)

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors, isSubmitting },
    } = useHookForm<AddFundsFormData>({
        resolver: zodResolver(addFundsSchema),
        defaultValues: {
            amount: '',
            notes: `Funded towards: ${goal.name}`,
        }
    })

    useEffect(() => {
        setValue('notes', `Funded towards: ${goal.name}`)
    }, [goal.name, setValue])

    const onSubmit = async (data: AddFundsFormData) => {
        try {
            const numericAmount = Number(data.amount.replace(/,/g, ''))

            // 1. Update Goal Amount
            updateGoal(goal.id, {
                current_amount: goal.current_amount + numericAmount
            })

            // 2. Record as Expense/Transfer-like Transaction
            // Using type 'expense' so it counts as money spent towards a goal,
            // but without deducting from a specific real account.
            addTransaction({
                id: uuidv4(),
                amount: numericAmount,
                type: 'expense',
                account_id: 'goal_funding',
                category_id: 'goal',
                date: new Date().toISOString(),
                notes: data.notes || `Funded towards: ${goal.name}`,
            })

            onClose()
            reset()
        } catch (error) {
            console.error(error)
        }
    }

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/[^0-9.]/g, '')
        const parts = value.split('.')
        if (parts.length > 2) value = parts[0] + '.' + parts.slice(1).join('')
        if (parts[1] && parts[1].length > 2) value = `${parts[0]}.${parts[1].slice(0, 2)}`

        if (value) {
            const [whole, decimal] = value.split('.')
            const formattedWhole = Number(whole).toLocaleString('en-US')
            setValue('amount', decimal !== undefined ? `${formattedWhole}.${decimal}` : formattedWhole)
        } else {
            setValue('amount', '')
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="glass-panel w-full max-w-md pointer-events-auto relative overflow-hidden shadow-2xl"
                        >
                            <div
                                className="absolute top-0 left-0 w-full h-1"
                                style={{ backgroundColor: goal.color }}
                            />

                            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
                                <div>
                                    <h2 className="text-xl font-bold text-white">Add Funds</h2>
                                    <p className="text-xs text-gray-400 mt-1">Targeting: <span style={{ color: goal.color }}>{goal.name}</span></p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">

                                {/* Amount */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-400">Funding Amount</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold select-none">Rs.</span>
                                        <input
                                            {...register('amount')}
                                            onChange={handleAmountChange}
                                            autoComplete="off"
                                            placeholder="0.00"
                                            className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-2xl font-bold font-numbers text-white placeholder-gray-600 focus:outline-none transition-all focus:border-cyan-500/50"
                                        />
                                    </div>
                                    {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
                                </div>

                                {/* Notes */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-400">Transaction Note</label>
                                    <input
                                        {...register('notes')}
                                        autoComplete="off"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-all"
                                    />
                                </div>

                                <div className="pt-4 flex space-x-3">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 py-3 rounded-xl border border-white/10 text-white font-semibold hover:bg-white/5 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 py-3 rounded-xl text-black font-semibold transition-all hover:brightness-110 disabled:opacity-50 flex flex-center items-center justify-center"
                                        style={{ backgroundColor: goal.color, boxShadow: `0 0 20px ${goal.color}60` }}
                                    >
                                        {isSubmitting ? 'Funding...' : 'Add to Goal'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}
