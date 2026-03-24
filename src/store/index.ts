import { create } from 'zustand'
import { supabaseApi } from '@/utils/supabase/api'

export type TransactionType = 'income' | 'expense' | 'transfer' | 'loan_payment'
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
  loan_id?: string | null
  date: string
  notes: string | null
}

export interface Loan {
  id: string
  name: string
  principalAmount: number
  annualInterestRate: number
  startDate: string // ISO string
  status: 'active' | 'paid_off'
  notes?: string
}

export interface LoanPayment {
  id: string
  loanId: string
  date: string // ISO string
  amount: number
}

interface AppState {
  transactions: Transaction[]
  categories: Category[]
  accounts: Account[]
  loans: Loan[]
  loanPayments: LoanPayment[]

  isLoading: boolean
  isGlobalTxModalOpen: boolean
  globalTxToEdit: Transaction | null
  globalSearchTerm: string

  setTransactions: (t: Transaction[]) => void
  setCategories: (c: Category[]) => void
  setAccounts: (a: Account[]) => void

  setLoading: (l: boolean) => void
  setGlobalTxModalOpen: (open: boolean) => void
  setGlobalTxToEdit: (tx: Transaction | null) => void
  setGlobalSearchTerm: (term: string) => void

  // Cloud Sync
  fetchGlobalData: () => Promise<void>

  // Async CRUD
  addTransaction: (t: Transaction) => Promise<void>
  updateTransaction: (id: string, t: Partial<Transaction>) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>

  addAccount: (a: Account) => Promise<void>
  updateAccount: (id: string, a: Partial<Account>) => Promise<void>
  deleteAccount: (id: string) => Promise<void>

  addCategory: (c: Category) => Promise<void>

  addLoan: (l: Loan) => Promise<void>
  updateLoan: (id: string, l: Partial<Loan>) => Promise<void>
  deleteLoan: (id: string) => Promise<void>

  addLoanPayment: (p: LoanPayment) => Promise<void>
  deleteLoanPayment: (id: string) => Promise<void>
}

export const useAppStore = create<AppState>()((set, get) => ({
  transactions: [],
  categories: [],
  accounts: [],
  loans: [],
  loanPayments: [],

  isLoading: true, // Start loading initially
  isGlobalTxModalOpen: false,
  globalTxToEdit: null,
  globalSearchTerm: '',

  setTransactions: (transactions) => set({ transactions }),
  setCategories: (categories) => set({ categories }),
  setAccounts: (accounts) => set({ accounts }),

  setLoading: (isLoading) => set({ isLoading }),
  setGlobalTxModalOpen: (isGlobalTxModalOpen) => set({ isGlobalTxModalOpen }),
  setGlobalTxToEdit: (globalTxToEdit) => set({ globalTxToEdit }),
  setGlobalSearchTerm: (globalSearchTerm) => set({ globalSearchTerm }),

  fetchGlobalData: async () => {
    set({ isLoading: true })
    try {
      const [accounts, categories, transactions, loans, loanPayments] = await Promise.all([
        supabaseApi.getAccounts().catch(e => { throw new Error("Accounts table: " + e.message) }),
        supabaseApi.getCategories().catch(e => { throw new Error("Categories table: " + e.message) }),
        supabaseApi.getTransactions().catch(e => { throw new Error("Transactions table: " + e.message) }),
        supabaseApi.getLoans().catch(e => { throw new Error("Loans table: " + e.message) }),
        supabaseApi.getLoanPayments().catch(e => { throw new Error("LoanPayments table: " + e.message) })
      ])
      
      set({
        accounts,
        categories: categories.length > 0 ? categories : DEFAULT_CATEGORIES,
        transactions,
        loans,
        loanPayments,
        isLoading: false
      })
    } catch (error: any) {
      console.error("Cloud Sync Failed! Error details: ", error.message || error)
      set({ isLoading: false })
    }
  },

  addTransaction: async (transaction) => {
    // Optimistic Update
    set((state) => ({ transactions: [transaction, ...state.transactions] }))
    try {
      await supabaseApi.createTransaction(transaction)
    } catch (error) {
      console.error("Cloud push failed", error)
      // Revert optimism if needed
      set((state) => ({ transactions: state.transactions.filter(t => t.id !== transaction.id) }))
    }
  },
  
  updateTransaction: async (id, updated) => {
    const previousState = get().transactions.find(t => t.id === id)
    const previousPayment = get().loanPayments.find(p => p.id === id)
    
    // Optimistic Update
    set((state) => ({
      transactions: state.transactions.map(t => t.id === id ? { ...t, ...updated } : t),
      loanPayments: state.loanPayments.map(p => p.id === id ? {
        ...p,
        amount: updated.amount !== undefined ? updated.amount : p.amount,
        date: updated.date !== undefined ? updated.date : p.date
      } : p)
    }))
    
    try {
      await supabaseApi.updateTransaction(id, updated)
    } catch (error) {
      console.error("Cloud push failed", error)
      // Needs complex revert if failed, ignored for simplicity in optimistic UI
      if (previousState) {
         set((state) => ({
            transactions: state.transactions.map(t => t.id === id ? previousState : t)
         }))
      }
    }
  },

  deleteTransaction: async (id) => {
    const previousState = get().transactions.find(t => t.id === id)
    set((state) => ({
      transactions: state.transactions.filter(t => t.id !== id),
      loanPayments: state.loanPayments.filter(p => p.id !== id)
    }))
    try {
      await supabaseApi.deleteTransaction(id)
    } catch (error) {
      console.error("Cloud push failed", error)
      if (previousState) {
         set((state) => ({ transactions: [previousState, ...state.transactions] }))
      }
    }
  },

  addAccount: async (account) => {
    set((state) => ({ accounts: [...state.accounts, account] }))
    try {
      await supabaseApi.createAccount(account)
    } catch (error) {
      console.error(error)
      set((state) => ({ accounts: state.accounts.filter(a => a.id !== account.id) }))
    }
  },

  updateAccount: async (id, updated) => {
    set((state) => ({
      accounts: state.accounts.map(a => a.id === id ? { ...a, ...updated } : a)
    }))
    try {
      await supabaseApi.updateAccount(id, updated)
    } catch (error) {
      console.error(error)
    }
  },

  deleteAccount: async (id) => {
    const previous = get().accounts.find(a => a.id === id)
    set((state) => ({
      accounts: state.accounts.filter(a => a.id !== id)
    }))
    try {
      await supabaseApi.deleteAccount(id)
    } catch (error) {
      console.error(error)
      if (previous) {
        set((state) => ({ accounts: [...state.accounts, previous] }))
      }
    }
  },

  addCategory: async (category) => {
    set((state) => ({ categories: [...state.categories, category] }))
    try {
      await supabaseApi.createCategory(category)
    } catch (error) {
      console.error(error)
      set((state) => ({ categories: state.categories.filter(c => c.id !== category.id) }))
    }
  },

  addLoan: async (loan) => {
    set((state) => ({ loans: [loan, ...state.loans] }))
    try {
      await supabaseApi.createLoan(loan)
    } catch (error) {
      console.error(error)
      set((state) => ({ loans: state.loans.filter(l => l.id !== loan.id) }))
    }
  },
  
  updateLoan: async (id, updated) => {
    const previous = get().loans.find(l => l.id === id)
    set((state) => ({
      loans: state.loans.map(l => l.id === id ? { ...l, ...updated } : l)
    }))
    try {
      await supabaseApi.updateLoan(id, updated)
    } catch(e) {
      console.error(e)
      if (previous) set((state) => ({ loans: state.loans.map(l => l.id === id ? previous : l) }))
    }
  },

  deleteLoan: async (id) => {
    const previous = get().loans.find(l => l.id === id)
    set((state) => ({
      loans: state.loans.filter(l => l.id !== id),
      loanPayments: state.loanPayments.filter(p => p.loanId !== id) // Optimistic cascade wipe
    }))
    try {
      await supabaseApi.deleteLoan(id)
    } catch (error) {
      console.error(error)
      if (previous) {
         set((state) => ({ loans: [...state.loans, previous] }))
         // We do not revert loan payments cascade, keep simple optimist UI.
      }
    }
  },

  addLoanPayment: async (payment) => {
    set((state) => ({ loanPayments: [payment, ...state.loanPayments] }))
    try {
       await supabaseApi.createLoanPayment(payment)
    } catch (error) {
       console.error(error)
       set((state) => ({ loanPayments: state.loanPayments.filter(p => p.id !== payment.id) }))
    }
  },

  deleteLoanPayment: async (id) => {
    set((state) => ({
      loanPayments: state.loanPayments.filter(p => p.id !== id)
    }))
    try {
      await supabaseApi.deleteLoanPayment(id)
    } catch (error) {
      console.error(error)
    }
  }
}))
