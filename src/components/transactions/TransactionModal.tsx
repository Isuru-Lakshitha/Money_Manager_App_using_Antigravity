"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { X, Calendar as CalendarIcon, Hash, Type, ArrowRightLeft, Banknote } from 'lucide-react'
import { format } from 'date-fns'
import { useAppStore, Transaction, TransactionType, Account } from '@/store'
import { v4 as uuidv4 } from 'uuid'

const transactionSchema = z.object({
  type: z.enum(['income', 'expense', 'transfer', 'loan_payment']),
  amount: z.string().min(1, 'Amount is required'),
  fee_amount: z.string().optional(),
  categoryId: z.string().optional(), 
  accountId: z.string().min(1, 'Select an account'),
  toAccountId: z.string().optional(), 
  feeAccountId: z.string().optional(), 
  loanId: z.string().optional(),
  date: z.string(),
  notes: z.string().optional(),
  tags: z.string().optional()
}).superRefine((data, ctx) => {
  if (data.type === 'transfer') {
    if (!data.toAccountId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Destination account is required',
        path: ['toAccountId'],
      });
    }
    if (data.accountId === data.toAccountId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Cannot transfer to the same account',
        path: ['toAccountId'],
      });
    }
  } else if (data.type === 'loan_payment') {
    if (!data.loanId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Selecting a target loan is required',
        path: ['loanId'],
      });
    }
  } else {
    if (!data.categoryId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Category is required',
        path: ['categoryId'],
      });
    }
  }
})

type TransactionForm = z.infer<typeof transactionSchema>

const EXPENSE_CATEGORIES = [
  { id: '1', name: 'Food & Dining', icon: '🍔' },
  { id: '2', name: 'Utilities', icon: '⚡' },
  { id: '3', name: 'Transportation', icon: '🚗' },
  { id: '4', name: 'Housing / Rent', icon: '🏠' },
  { id: '5', name: 'Healthcare', icon: '⚕️' },
  { id: '6', name: 'Entertainment', icon: '🎬' },
  { id: '7', name: 'Education', icon: '📚' },
  { id: '8', name: 'Shopping', icon: '🛍️' },
]

const INCOME_CATEGORIES = [
  { id: '9', name: 'Salary', icon: '💰' },
  { id: '10', name: 'Business', icon: '🏢' },
  { id: '11', name: 'Freelance', icon: '💻' },
  { id: '12', name: 'Investments', icon: '📈' },
  { id: '13', name: 'Gifts', icon: '🎁' },
  { id: '14', name: 'Other', icon: '✨' },
]

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionToEdit?: Transaction | null;
}

export default function TransactionModal({ isOpen, onClose, transactionToEdit }: TransactionModalProps) {
  const accounts = useAppStore(state => state.accounts)
  const transactions = useAppStore(state => state.transactions)
  const loans = useAppStore(state => state.loans)
  
  const addTransaction = useAppStore(state => state.addTransaction)
  const updateTransaction = useAppStore(state => state.updateTransaction)
  const updateAccount = useAppStore(state => state.updateAccount)
  const addLoanPayment = useAppStore(state => state.addLoanPayment)
  const deleteLoanPayment = useAppStore(state => state.deleteLoanPayment)

  const { register, handleSubmit, control, watch, setValue, reset, formState: { errors } } = useForm<TransactionForm>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      date: format(new Date(), 'yyyy-MM-dd'),
      amount: '',
      fee_amount: '',
      accountId: accounts.length > 0 ? accounts[0].id : '',
    }
  })

  useEffect(() => {
    if (isOpen) {
      if (transactionToEdit) {
        setValue('type', transactionToEdit.type)
        setValue('amount', transactionToEdit.amount.toString())
        setValue('fee_amount', transactionToEdit.fee_amount?.toString() || '')
        setValue('accountId', transactionToEdit.account_id)
        if (transactionToEdit.to_account_id) setValue('toAccountId', transactionToEdit.to_account_id)
        if (transactionToEdit.category_id) setValue('categoryId', transactionToEdit.category_id)
        if (transactionToEdit.loan_id) setValue('loanId', transactionToEdit.loan_id)
        setValue('date', transactionToEdit.date)
        setValue('notes', transactionToEdit.notes || '')
      } else {
        reset({
          type: 'expense',
          date: format(new Date(), 'yyyy-MM-dd'),
          amount: '',
          fee_amount: '',
          accountId: accounts.length > 0 ? accounts[0].id : '',
          toAccountId: accounts.length > 1 ? accounts[1].id : undefined,
          categoryId: undefined,
          loanId: undefined,
          notes: '',
          tags: ''
        })
      }
    }
  }, [isOpen, transactionToEdit, accounts, reset, setValue])

  const type = watch('type')
  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  const onSubmit = (data: TransactionForm) => {
    const numericAmount = Number(data.amount.replace(/,/g, ''))
    const numericFee = data.fee_amount ? Number(data.fee_amount.replace(/,/g, '')) : 0

    const newTx: Transaction = {
      id: transactionToEdit ? transactionToEdit.id : uuidv4(),
      type: data.type,
      amount: numericAmount,
      fee_amount: numericFee,
      account_id: data.accountId,
      to_account_id: data.type === 'transfer' ? data.toAccountId : undefined,
      fee_account_id: data.type === 'transfer' && numericFee > 0 ? (data.feeAccountId || data.accountId) : undefined,
      category_id: data.type === 'expense' || data.type === 'income' ? data.categoryId : undefined,
      loan_id: data.type === 'loan_payment' ? data.loanId : undefined,
      date: data.date,
      notes: data.notes || null
    }

    // Calculate net balance changes to prevent overriding state during multiple updates
    const balanceChanges: Record<string, number> = {}

    if (transactionToEdit) {
      // Revert old transaction balances
      if (transactionToEdit.type === 'expense' || transactionToEdit.type === 'loan_payment') {
        balanceChanges[transactionToEdit.account_id] = (balanceChanges[transactionToEdit.account_id] || 0) + transactionToEdit.amount
      } else if (transactionToEdit.type === 'income') {
        balanceChanges[transactionToEdit.account_id] = (balanceChanges[transactionToEdit.account_id] || 0) - transactionToEdit.amount
      } else if (transactionToEdit.type === 'transfer') {
        balanceChanges[transactionToEdit.account_id] = (balanceChanges[transactionToEdit.account_id] || 0) + transactionToEdit.amount
        
        if (transactionToEdit.to_account_id) {
          balanceChanges[transactionToEdit.to_account_id] = (balanceChanges[transactionToEdit.to_account_id] || 0) - transactionToEdit.amount
        }
        
        if (transactionToEdit.fee_amount && transactionToEdit.fee_amount > 0) {
          const feeAccId = transactionToEdit.fee_account_id || transactionToEdit.account_id
          balanceChanges[feeAccId] = (balanceChanges[feeAccId] || 0) + transactionToEdit.fee_amount
        }
      }
    }

    // Apply new transaction balances
    if (data.type === 'expense' || data.type === 'loan_payment') {
      balanceChanges[data.accountId] = (balanceChanges[data.accountId] || 0) - numericAmount
    } else if (data.type === 'income') {
      balanceChanges[data.accountId] = (balanceChanges[data.accountId] || 0) + numericAmount
    } else if (data.type === 'transfer') {
      balanceChanges[data.accountId] = (balanceChanges[data.accountId] || 0) - numericAmount
      
      if (data.toAccountId) {
        balanceChanges[data.toAccountId] = (balanceChanges[data.toAccountId] || 0) + numericAmount
      }
      
      if (numericFee > 0) {
        const feeAccId = data.feeAccountId || data.accountId
        balanceChanges[feeAccId] = (balanceChanges[feeAccId] || 0) - numericFee
      }
    }

    // Apply changes
    Object.entries(balanceChanges).forEach(([accId, change]) => {
      if (change === 0) return
      const acc = accounts.find(a => a.id === accId)
      if (acc) {
        updateAccount(accId, { balance: acc.balance + change })
      }
    })

    if (transactionToEdit) {
      // Clean up orphaned loan payment if type altered from loan_payment to something else
      if (transactionToEdit.type === 'loan_payment' && data.type !== 'loan_payment') {
         deleteLoanPayment(transactionToEdit.id);
      }
      
      updateTransaction(transactionToEdit.id, newTx)
      
      // If changed TO a loan_payment, append to loanPayments (since update fails to map a non-existent item)
      if (transactionToEdit.type !== 'loan_payment' && data.type === 'loan_payment' && data.loanId) {
        addLoanPayment({
           id: newTx.id,
           loanId: data.loanId,
           amount: numericAmount,
           date: data.date
        })
      }
    } else {
      addTransaction(newTx)
      if (data.type === 'loan_payment' && data.loanId) {
        addLoanPayment({
           id: newTx.id,
           loanId: data.loanId,
           amount: numericAmount,
           date: data.date
        })
      }
    }

    onClose()
  }

  const handleFormatAmount = (name: 'amount' | 'fee_amount') => (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9.]/g, '')
    if (value) {
      const parts = value.split('.')
      if (parts.length > 2) return
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")
      if (parts[1] && parts[1].length > 2) parts[1] = parts[1].slice(0, 2)
      value = parts.join('.')
    }
    setValue(name, value, { shouldValidate: true })
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-panel w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh] relative z-50 shadow-2xl"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/5 flex items-center justify-between relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-1 ${type === 'income' ? 'bg-cyan-500 glow-cyan' :
                  type === 'transfer' ? 'bg-blue-500 glow-blue' : type === 'loan_payment' ? 'bg-orange-500 glow-orange' : 'bg-purple-500 glow-purple'
                  }`} />
                <h2 className="text-xl font-bold text-white">
                  {transactionToEdit ? 'Edit Transaction' : 'New Transaction'}
                </h2>
                <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto no-scrollbar">
                <form id="tx-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                  {/* Type Toggle */}
                  <div className="flex bg-black/40 rounded-xl p-1 border border-white/5 relative">
                    <div
                      className="absolute top-1 bottom-1 w-[calc(25%-4px)] rounded-lg transition-all duration-300 ease-in-out"
                      style={{
                        background: type === 'expense' ? 'rgba(139, 92, 246, 0.2)' : type === 'income' ? 'rgba(34, 211, 238, 0.2)' : type === 'transfer' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(249, 115, 22, 0.2)',
                        left: type === 'expense' ? '4px' : type === 'income' ? 'calc(25%)' : type === 'transfer' ? 'calc(50%)' : 'calc(75% - 4px)',
                        boxShadow: type === 'expense' ? '0 0 15px rgba(139, 92, 246, 0.3)' : type === 'income' ? '0 0 15px rgba(34, 211, 238, 0.3)' : type === 'transfer' ? '0 0 15px rgba(59, 130, 246, 0.3)' : '0 0 15px rgba(249, 115, 22, 0.3)'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setValue('type', 'expense')}
                      className={`flex-1 py-2 text-sm font-semibold rounded-lg z-10 transition-colors ${type === 'expense' ? 'text-purple-400' : 'text-gray-400'}`}
                    >
                      Expense
                    </button>
                    <button
                      type="button"
                      onClick={() => setValue('type', 'income')}
                      className={`flex-1 py-2 text-sm font-semibold rounded-lg z-10 transition-colors ${type === 'income' ? 'text-cyan-400' : 'text-gray-400'}`}
                    >
                      Income
                    </button>
                    <button
                      type="button"
                      onClick={() => setValue('type', 'transfer')}
                      className={`flex-1 py-2 text-sm font-semibold rounded-lg z-10 transition-colors ${type === 'transfer' ? 'text-blue-400' : 'text-gray-400'}`}
                    >
                      Transfer
                    </button>
                    <button
                      type="button"
                      onClick={() => setValue('type', 'loan_payment')}
                      className={`flex-1 py-2 text-sm font-semibold rounded-lg z-10 transition-colors ${type === 'loan_payment' ? 'text-orange-400' : 'text-gray-400'}`}
                    >
                      Loan Pay
                    </button>
                  </div>

                  {/* Amounts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Amount</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-gray-500 font-numbers select-none">Rs.</span>
                        <input
                          type="text"
                          {...register('amount')}
                          onChange={handleFormatAmount('amount')}
                          placeholder="0.00"
                          className="w-full bg-transparent border-b-2 border-white/10 py-4 pl-16 pr-4 text-3xl font-numbers text-white placeholder-gray-700 focus:outline-none transition-colors focus:border-white/50"
                        />
                      </div>
                      {errors.amount && <p className="text-red-400 text-xs mt-1">{errors.amount.message}</p>}
                    </div>

                    {type === 'transfer' && (
                      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                        <div>
                          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Transfer Fee (Optional)</label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-gray-500 font-numbers select-none">Rs.</span>
                            <input
                              type="text"
                              {...register('fee_amount')}
                              onChange={handleFormatAmount('fee_amount')}
                              placeholder="0.00"
                              className="w-full bg-transparent border-b-2 border-white/10 py-4 pl-12 pr-4 text-xl font-numbers text-red-400 placeholder-gray-700 focus:outline-none transition-colors focus:border-red-500/50"
                            />
                          </div>
                        </div>

                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Deduct Fee From</label>
                          <select
                            {...register('feeAccountId')}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300 focus:outline-none focus:border-white/30"
                          >
                            <option value="">Same as From Account</option>
                            {accounts.map(acc => (
                              <option key={acc.id} value={acc.id}>{acc.name} (Rs. {acc.balance.toLocaleString()})</option>
                            ))}
                          </select>
                        </motion.div>
                      </motion.div>
                    )}
                  </div>

                  {/* Accounts Flow */}
                  <div className="bg-black/20 p-4 rounded-xl border border-white/5 space-y-4">
                    <div className="flex flex-col md:flex-row items-center gap-4">
                      <div className="w-full">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                          {type === 'transfer' || type === 'loan_payment' ? 'From Account' : 'Account'}
                        </label>
                        <select
                          {...register('accountId')}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30"
                        >
                          <option value="">Select Account</option>
                          {accounts.map(acc => (
                            <option key={acc.id} value={acc.id}>{acc.name} (Rs. {acc.balance.toLocaleString()})</option>
                          ))}
                        </select>
                        {errors.accountId && <p className="text-red-400 text-xs mt-1">{errors.accountId.message}</p>}
                      </div>

                      {type === 'transfer' && (
                        <>
                          <div className="hidden md:flex flex-col items-center justify-center pt-6">
                            <ArrowRightLeft className="text-gray-500 w-5 h-5" />
                          </div>
                          <div className="w-full">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">To Account</label>
                            <select
                              {...register('toAccountId')}
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30"
                            >
                              <option value="">Select Destination</option>
                              {accounts.map(acc => (
                                <option key={acc.id} value={acc.id}>{acc.name} (Rs. {acc.balance.toLocaleString()})</option>
                              ))}
                            </select>
                            {errors.toAccountId && <p className="text-red-400 text-xs mt-1">{errors.toAccountId.message}</p>}
                          </div>
                        </>
                      )}

                      {type === 'loan_payment' && (
                        <>
                          <div className="hidden md:flex flex-col items-center justify-center pt-6">
                            <ArrowRightLeft className="text-gray-500 w-5 h-5" />
                          </div>
                          <div className="w-full">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">To Target Loan</label>
                            <select
                              {...register('loanId')}
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30"
                            >
                              <option value="">Select Loan</option>
                              {loans.filter(l => l.status === 'active').map(l => (
                                <option key={l.id} value={l.id}>{l.name} (Rs. {l.principalAmount.toLocaleString()})</option>
                              ))}
                            </select>
                            {errors.loanId && <p className="text-red-400 text-xs mt-1">{errors.loanId.message}</p>}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Category Grid */}
                  {type !== 'transfer' && type !== 'loan_payment' && (
                    <div>
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 block">Category</label>
                      <div className="grid grid-cols-4 gap-3">
                        {categories.map((cat) => {
                          const isSelected = watch('categoryId') === cat.id
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => setValue('categoryId', cat.id, { shouldValidate: true })}
                              className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${isSelected
                                ? type === 'income' ? 'bg-cyan-500/10 border-cyan-500/50 glow-cyan' : 'bg-purple-500/10 border-purple-500/50 glow-purple'
                                : 'bg-black/20 border-white/5 hover:bg-white/5'
                                }`}
                            >
                              <span className="text-2xl mb-1">{cat.icon}</span>
                              <span className="text-[10px] text-center text-gray-300 truncate w-full">{cat.name}</span>
                            </button>
                          )
                        })}
                      </div>
                      {errors.categoryId && <p className="text-red-400 text-xs mt-1">{errors.categoryId.message}</p>}
                    </div>
                  )}

                  {/* Date & Note Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Date</label>
                      <div className="relative">
                        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="date"
                          {...register('date')}
                          className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white focus:outline-none focus:border-white/30 transition-all font-numbers"
                        />
                      </div>
                    </div>
                    {type !== 'transfer' && type !== 'loan_payment' && (
                      <div>
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Tags</label>
                        <div className="relative">
                          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            {...register('tags')}
                            placeholder="#trip2026 #food"
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/30 transition-all"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Notes</label>
                    <div className="relative">
                      <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        list="past-notes"
                        {...register('notes')}
                        placeholder="Additional details..."
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/30 transition-all font-sans"
                      />
                      <datalist id="past-notes">
                        {Array.from(new Set(transactions.map(t => t.notes).filter(Boolean))).map((note, idx) => (
                          <option key={`note-${idx}`} value={note as string} />
                        ))}
                      </datalist>
                    </div>
                  </div>

                </form>
              </div>

              {/* Footer */}
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
                  form="tx-form"
                  className={`flex-1 py-3 rounded-xl font-semibold text-white transition-all shadow-lg ${type === 'income'
                    ? 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-500/50'
                    : type === 'transfer' ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/50' 
                    : type === 'loan_payment' ? 'bg-orange-600 hover:bg-orange-500 shadow-orange-500/50'
                    : 'bg-purple-600 hover:bg-purple-500 shadow-purple-500/50'
                    }`}
                >
                  {transactionToEdit ? 'Save Changes' : 'Confirm'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
