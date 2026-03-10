"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Wallet, Landmark, Smartphone, CreditCard } from 'lucide-react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm as useHookForm } from 'react-hook-form'
import { useAppStore, Account, AccountType } from '@/store'
import { v4 as uuidv4 } from 'uuid'

const accountSchema = z.object({
  name: z.string().min(1, 'Account name is required').max(50),
  type: z.enum(['cash', 'bank', 'mobile', 'credit']),
  balance: z.string().min(1, 'Initial balance is required').refine(val => !isNaN(Number(val.replace(/,/g, ''))), 'Must be a valid number'),
})

type AccountFormData = z.infer<typeof accountSchema>

interface AccountModalProps {
  isOpen: boolean
  onClose: () => void
  accountToEdit?: Account | null
}

const ACCOUNT_TYPES: { id: AccountType; label: string; icon: any; color: string }[] = [
  { id: 'cash', label: 'Cash', icon: Wallet, color: '#10B981' }, // emerald
  { id: 'bank', label: 'Bank', icon: Landmark, color: '#3B82F6' }, // blue
  { id: 'mobile', label: 'Mobile Wallet', icon: Smartphone, color: '#8B5CF6' }, // purple
  { id: 'credit', label: 'Credit Card', icon: CreditCard, color: '#F43F5E' }, // rose
]

export default function AccountModal({ isOpen, onClose, accountToEdit }: AccountModalProps) {
  const addAccount = useAppStore(state => state.addAccount)
  const updateAccount = useAppStore(state => state.updateAccount)
  const [selectedType, setSelectedType] = useState<AccountType>('cash')

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useHookForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      type: 'cash',
      balance: '',
    }
  })

  useEffect(() => {
    if (accountToEdit) {
      setValue('name', accountToEdit.name)
      setValue('type', accountToEdit.type)
      setValue('balance', accountToEdit.balance.toString())
      setSelectedType(accountToEdit.type)
    } else {
      reset({ type: 'cash', balance: '' })
      setSelectedType('cash')
    }
  }, [accountToEdit, isOpen, setValue, reset])

  const onSubmit = async (data: AccountFormData) => {
    try {
      const numericBalance = Number(data.balance.replace(/,/g, ''))

      if (accountToEdit) {
        updateAccount(accountToEdit.id, {
          name: data.name,
          type: data.type,
          balance: numericBalance
        })
      } else {
        addAccount({
          id: uuidv4(),
          name: data.name,
          type: data.type,
          balance: numericBalance
        })
      }

      onClose()
      reset()
    } catch (error) {
      console.error(error)
    }
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9.]/g, '')

    // Prevent multiple decimals
    const parts = value.split('.')
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('')
    }

    // Limit to 2 decimal places
    if (parts[1] && parts[1].length > 2) {
      value = `${parts[0]}.${parts[1].slice(0, 2)}`
    }

    // Format with commas, but preserve trailing decimal
    if (value) {
      const [whole, decimal] = value.split('.')
      const formattedWhole = Number(whole).toLocaleString('en-US')

      if (decimal !== undefined) {
        setValue('balance', `${formattedWhole}.${decimal}`)
      } else {
        setValue('balance', formattedWhole)
      }
    } else {
      setValue('balance', '')
    }
  }

  const currentTypeConfig = ACCOUNT_TYPES.find(t => t.id === selectedType) || ACCOUNT_TYPES[0]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-panel w-full max-w-md pointer-events-auto relative overflow-hidden shadow-2xl"
            >
              <div
                className="absolute top-0 left-0 w-full h-1"
                style={{ backgroundColor: currentTypeConfig.color }}
              />

              <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
                <h2 className="text-xl font-bold text-white">
                  {accountToEdit ? 'Edit Account' : 'Add New Account'}
                </h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">

                {/* Account Type Selector */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-400">Account Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    {ACCOUNT_TYPES.map((type) => {
                      const isSelected = selectedType === type.id
                      const Icon = type.icon
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => {
                            setSelectedType(type.id)
                            setValue('type', type.id)
                          }}
                          className={`flex items-center space-x-3 p-3 rounded-xl border transition-all ${isSelected
                              ? `bg-white/10 border-[${type.color}] shadow-[0_0_15px_${type.color}40]`
                              : 'bg-black/30 border-white/5 hover:border-white/20'
                            }`}
                          style={{ borderColor: isSelected ? type.color : undefined }}
                        >
                          <div className={`p-2 rounded-lg ${isSelected ? 'bg-black/20' : 'bg-black/40'}`}>
                            <Icon className="w-4 h-4" style={{ color: type.color }} />
                          </div>
                          <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                            {type.label}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Account Name */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-400">Account Name</label>
                  <input
                    {...register('name')}
                    autoComplete="off"
                    placeholder="e.g. Main Wallet, Commercial Bank"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-all"
                    style={{
                      boxShadow: errors.name ? '0 0 0 1px #ef4444' : undefined,
                      borderColor: errors.name ? '#ef4444' : undefined
                    }}
                  />
                  {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                </div>

                {/* Initial Balance */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-400">Initial Balance</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold select-none">Rs.</span>
                    <input
                      {...register('balance')}
                      onChange={handleAmountChange}
                      autoComplete="off"
                      placeholder="0.00"
                      className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-2xl font-bold font-numbers text-white placeholder-gray-600 focus:outline-none transition-all"
                      style={{
                        boxShadow: errors.balance ? '0 0 0 1px #ef4444' : undefined,
                        borderColor: errors.balance ? '#ef4444' : undefined
                      }}
                    />
                  </div>
                  {errors.balance && <p className="text-xs text-red-500">{errors.balance.message}</p>}
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
                    className="flex-1 py-3 rounded-xl text-black font-semibold transition-all hover:brightness-110 disabled:opacity-50"
                    style={{ backgroundColor: currentTypeConfig.color, boxShadow: `0 0 20px ${currentTypeConfig.color}60` }}
                  >
                    {isSubmitting ? 'Saving...' : accountToEdit ? 'Save Changes' : 'Add Account'}
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
