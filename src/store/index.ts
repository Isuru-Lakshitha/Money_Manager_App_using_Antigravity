import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type TransactionType = 'income' | 'expense' | 'transfer'
export type AccountType = 'cash' | 'bank' | 'mobile' | 'credit'

export interface Category {
  id: string
  name: string
  type: 'income' | 'expense'
  icon: string | null
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Food & Dining', type: 'expense', icon: '🍔' },
  { id: '2', name: 'Utilities', type: 'expense', icon: '⚡' },
  { id: '3', name: 'Transportation', type: 'expense', icon: '🚗' },
  { id: '4', name: 'Housing / Rent', type: 'expense', icon: '🏠' },
  { id: '5', name: 'Healthcare', type: 'expense', icon: '⚕️' },
  { id: '6', name: 'Entertainment', type: 'expense', icon: '🎬' },
  { id: '7', name: 'Education', type: 'expense', icon: '📚' },
  { id: '8', name: 'Shopping', type: 'expense', icon: '🛍️' },
  { id: '9', name: 'Salary', type: 'income', icon: '💰' },
  { id: '10', name: 'Business', type: 'income', icon: '🏢' },
  { id: '11', name: 'Freelance', type: 'income', icon: '💻' },
  { id: '12', name: 'Investments', type: 'income', icon: '📈' },
  { id: '13', name: 'Gifts', type: 'income', icon: '🎁' },
  { id: '14', name: 'Other', type: 'income', icon: '✨' },
]

export interface Account {
  id: string
  name: string
  type: AccountType
  balance: number
}

export interface Transaction {
  id: string
  amount: number
  fee_amount?: number
  type: TransactionType
  category_id?: string | null
  account_id: string
  to_account_id?: string | null
  fee_account_id?: string | null
  date: string
  notes: string | null
}

export interface Goal {
  id: string
  name: string
  target_amount: number
  current_amount: number
  deadline: string
  color: string
  icon: string
}

interface AppState {
  transactions: Transaction[]
  categories: Category[]
  accounts: Account[]
  goals: Goal[]
  isLoading: boolean
  isGlobalTxModalOpen: boolean
  globalTxToEdit: Transaction | null
  globalSearchTerm: string

  setTransactions: (t: Transaction[]) => void
  setCategories: (c: Category[]) => void
  setAccounts: (a: Account[]) => void
  setGoals: (g: Goal[]) => void
  setLoading: (l: boolean) => void
  setGlobalTxModalOpen: (open: boolean) => void
  setGlobalTxToEdit: (tx: Transaction | null) => void
  setGlobalSearchTerm: (term: string) => void

  addGoal: (g: Goal) => void
  updateGoal: (id: string, g: Partial<Goal>) => void
  deleteGoal: (id: string) => void

  addTransaction: (t: Transaction) => void
  updateTransaction: (id: string, t: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void

  addAccount: (a: Account) => void
  updateAccount: (id: string, a: Partial<Account>) => void
  deleteAccount: (id: string) => void

  addCategory: (c: Category) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      transactions: [],
      categories: [],
      accounts: [],
      goals: [],
      isLoading: false,
      isGlobalTxModalOpen: false,
      globalTxToEdit: null,
      globalSearchTerm: '',

      setTransactions: (transactions) => set({ transactions }),
      setCategories: (categories) => set({ categories }),
      setAccounts: (accounts) => set({ accounts }),
      setGoals: (goals) => set({ goals }),
      setLoading: (isLoading) => set({ isLoading }),
      setGlobalTxModalOpen: (isGlobalTxModalOpen) => set({ isGlobalTxModalOpen }),
      setGlobalTxToEdit: (globalTxToEdit) => set({ globalTxToEdit }),
      setGlobalSearchTerm: (globalSearchTerm) => set({ globalSearchTerm }),

      addTransaction: (transaction) => set((state) => ({ transactions: [transaction, ...state.transactions] })),
      updateTransaction: (id, updated) => set((state) => ({
        transactions: state.transactions.map(t => t.id === id ? { ...t, ...updated } : t)
      })),
      deleteTransaction: (id) => set((state) => ({
        transactions: state.transactions.filter(t => t.id !== id)
      })),

      addAccount: (account) => set((state) => ({ accounts: [...state.accounts, account] })),
      updateAccount: (id, updated) => set((state) => ({
        accounts: state.accounts.map(a => a.id === id ? { ...a, ...updated } : a)
      })),
      deleteAccount: (id) => set((state) => ({
        accounts: state.accounts.filter(a => a.id !== id)
      })),

      addGoal: (goal) => set((state) => ({ goals: [...state.goals, goal] })),
      updateGoal: (id, updated) => set((state) => ({
        goals: state.goals.map(g => g.id === id ? { ...g, ...updated } : g)
      })),
      deleteGoal: (id) => set((state) => ({
        goals: state.goals.filter(g => g.id !== id)
      })),

      addCategory: (category) => set((state) => ({ categories: [...state.categories, category] }))
    }),
    {
      name: 'money-manager-storage',
      partialize: (state) => ({
        transactions: state.transactions,
        categories: state.categories,
        accounts: state.accounts,
        goals: state.goals
        // We do not persist isLoading or isGlobalTxModalOpen
      }),
    }
  )
)
