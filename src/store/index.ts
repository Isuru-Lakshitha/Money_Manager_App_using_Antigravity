import { create } from 'zustand'
import { supabaseApi } from '@/utils/supabase/api'
import { v4 as uuidv4 } from 'uuid'

export type TransactionType = 'income' | 'expense' | 'transfer' | 'loan_payment'
export type AccountType = 'cash' | 'bank' | 'mobile' | 'credit'

export interface Category {
  id: string
  name: string
  type: 'income' | 'expense'
  icon: string | null
}

export const DEFAULT_CATEGORIES: Category[] = [
  // Core Expenses
  { id: '1', name: 'Food & Dining', type: 'expense', icon: '🍔' },
  { id: '2', name: 'Utilities', type: 'expense', icon: '⚡' },
  { id: '3', name: 'Transportation', type: 'expense', icon: '🚗' },
  { id: '4', name: 'Housing / Rent', type: 'expense', icon: '🏠' },
  { id: '5', name: 'Healthcare', type: 'expense', icon: '⚕️' },
  { id: '6', name: 'Entertainment', type: 'expense', icon: '🎬' },
  { id: '7', name: 'Education', type: 'expense', icon: '📚' },
  { id: '8', name: 'Shopping', type: 'expense', icon: '🛍️' },
  
  // Extended Expenses
  { id: '15', name: 'Groceries', type: 'expense', icon: '🛒' },
  { id: '16', name: 'Coffee & Snacks', type: 'expense', icon: '☕' },
  { id: '17', name: 'Fuel / Gas', type: 'expense', icon: '⛽' },
  { id: '18', name: 'Maintenance & Repairs', type: 'expense', icon: '🔧' },
  { id: '19', name: 'Internet & Wifi', type: 'expense', icon: '🌐' },
  { id: '20', name: 'Mobile & Telecom', type: 'expense', icon: '📱' },
  { id: '21', name: 'Subscriptions', type: 'expense', icon: '🔄' },
  { id: '22', name: 'Fitness & Gym', type: 'expense', icon: '🏋️' },
  { id: '23', name: 'Personal Care', type: 'expense', icon: '💆' },
  { id: '24', name: 'Clothing & Apparel', type: 'expense', icon: '👕' },
  { id: '25', name: 'Travel & Vacations', type: 'expense', icon: '✈️' },
  { id: '26', name: 'Insurance', type: 'expense', icon: '🛡️' },
  { id: '27', name: 'Taxes', type: 'expense', icon: '🏛️' },
  { id: '28', name: 'Debt Repayment', type: 'expense', icon: '💳' },
  { id: '29', name: 'Kids & Family', type: 'expense', icon: '👶' },
  { id: '30', name: 'Pets', type: 'expense', icon: '🐾' },
  { id: '31', name: 'Charity & Donations', type: 'expense', icon: '❤️' },
  { id: '32', name: 'Fees & Bank Charges', type: 'expense', icon: '🏦' },
  { id: '40', name: 'Games', type: 'expense', icon: '🎮' },
  { id: '41', name: 'Other', type: 'expense', icon: '🤔' },

  // Core Incomes
  { id: '9', name: 'Salary', type: 'income', icon: '💰' },
  { id: '10', name: 'Business', type: 'income', icon: '🏢' },
  { id: '11', name: 'Freelance', type: 'income', icon: '💻' },
  { id: '12', name: 'Investments', type: 'income', icon: '📈' },
  { id: '13', name: 'Gifts', type: 'income', icon: '🎁' },
  { id: '14', name: 'Other', type: 'income', icon: '✨' },

  // Extended Incomes
  { id: '33', name: 'Bonuses', type: 'income', icon: '🎊' },
  { id: '34', name: 'Side Hustle', type: 'income', icon: '🚀' },
  { id: '35', name: 'Rentals', type: 'income', icon: '🔑' },
  { id: '36', name: 'Dividends & Interest', type: 'income', icon: '💸' },
  { id: '37', name: 'Reimbursements', type: 'income', icon: '🧾' },
  { id: '38', name: 'Refunds', type: 'income', icon: '↩️' },
  { id: '39', name: 'Awards & Prizes', type: 'income', icon: '🏆' },
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

export interface Goal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline?: string
}

export type Frequency = 'daily' | 'weekly' | 'monthly' | 'yearly'

export const getCurrencySymbol = (currency: string) => {
  switch (currency) {
    case 'USD': return '$'
    case 'EUR': return '€'
    case 'GBP': return '£'
    case 'INR': return '₹'
    case 'AUD': return 'A$'
    case 'SGD': return 'S$'
    case 'LKR': default: return 'Rs.'
  }
}

export interface RecurringTransaction {
  id: string
  name: string
  amount: number
  type: TransactionType
  categoryId?: string | null
  accountId: string
  toAccountId?: string | null
  frequency: Frequency
  nextDate: string
  notes?: string
  isActive: boolean
}

interface AppState {
  transactions: Transaction[]
  categories: Category[]
  accounts: Account[]
  loans: Loan[]
  loanPayments: LoanPayment[]
  goals: Goal[]
  recurringTransactions: RecurringTransaction[]
  baseCurrency: string

  isLoading: boolean
  isGlobalTxModalOpen: boolean
  globalTxToEdit: Transaction | null
  globalSearchTerm: string

  setTransactions: (t: Transaction[]) => void
  setCategories: (c: Category[]) => void
  setAccounts: (a: Account[]) => void
  setGoals: (g: Goal[]) => void
  setRecurringTransactions: (r: RecurringTransaction[]) => void
  setBaseCurrency: (c: string) => void

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

  addGoal: (g: Goal) => Promise<void>
  updateGoal: (id: string, g: Partial<Goal>) => Promise<void>
  deleteGoal: (id: string) => Promise<void>

  addRecurringTransaction: (rt: RecurringTransaction) => Promise<void>
  updateRecurringTransaction: (id: string, rt: Partial<RecurringTransaction>) => Promise<void>
  deleteRecurringTransaction: (id: string) => Promise<void>

  updateBaseCurrency: (currency: string) => Promise<void>
}

export const useAppStore = create<AppState>()((set, get) => ({
  transactions: [],
  categories: [],
  accounts: [],
  loans: [],
  loanPayments: [],
  goals: [],
  recurringTransactions: [],
  baseCurrency: 'LKR',

  isLoading: true, // Start loading initially
  isGlobalTxModalOpen: false,
  globalTxToEdit: null,
  globalSearchTerm: '',

  setTransactions: (transactions) => set({ transactions }),
  setCategories: (categories) => set({ categories }),
  setAccounts: (accounts) => set({ accounts }),
  setGoals: (goals) => set({ goals }),
  setRecurringTransactions: (recurringTransactions) => set({ recurringTransactions }),
  setBaseCurrency: (baseCurrency) => set({ baseCurrency }),

  setLoading: (isLoading) => set({ isLoading }),
  setGlobalTxModalOpen: (isGlobalTxModalOpen) => set({ isGlobalTxModalOpen }),
  setGlobalTxToEdit: (globalTxToEdit) => set({ globalTxToEdit }),
  setGlobalSearchTerm: (globalSearchTerm) => set({ globalSearchTerm }),

  fetchGlobalData: async () => {
    set({ isLoading: true })
    try {
      const [accounts, categories, transactions, loans, loanPayments, goals, recurringTransactions, userSettings] = await Promise.all([
        supabaseApi.getAccounts().catch(e => { throw new Error("Accounts table: " + e.message) }),
        supabaseApi.getCategories().catch(e => { throw new Error("Categories table: " + e.message) }),
        supabaseApi.getTransactions().catch(e => { throw new Error("Transactions table: " + e.message) }),
        supabaseApi.getLoans().catch(e => { console.warn("Loans table:", e.message); return [] }),
        supabaseApi.getLoanPayments().catch(e => { console.warn("LoanPayments table:", e.message); return [] }),
        supabaseApi.getGoals().catch(e => { console.warn("Goals table:", e.message); return [] }),
        supabaseApi.getRecurringTransactions().catch(e => { console.warn("Recurring txs:", e.message); return [] }),
        supabaseApi.getUserSettings().catch(e => { return { baseCurrency: 'LKR' } }) // fallback to LKR if error
      ])
      
      // Intelligently merge new hardcoded default categories with cloud-fetched categories
      // This maps by NAME, ensuring valid UUIDs and preventing duplicates if users manually made them
      const mergedCategories = [...categories]
      const missingCategories: Category[] = []
      
      for (const defaultCat of DEFAULT_CATEGORIES) {
        if (!mergedCategories.some(c => c.name.toLowerCase() === defaultCat.name.toLowerCase())) {
          const newCat = { ...defaultCat, id: uuidv4() }
          mergedCategories.push(newCat)
          missingCategories.push(newCat)
        }
      }

      // Concurrently push any locally injected default categories straight to Supabase
      // SO THEY EXIST IN THE DB (Preventing Foreign Key crashes on saving Transactions)
      if (missingCategories.length > 0) {
        await Promise.all(missingCategories.map(cat => supabaseApi.createCategory(cat).catch(console.error)))
      }

      set({
        accounts,
        categories: mergedCategories,
        transactions,
        loans,
        loanPayments,
        goals,
        recurringTransactions,
        baseCurrency: userSettings?.baseCurrency || 'LKR',
        isLoading: false
      })

      // Client-side auto-generation of due recurring transactions
      // To prevent infinite loops or double-charging, we check date and update the nextDate
      const dueRecurrings = recurringTransactions.filter(rt => rt.isActive && new Date(rt.nextDate) <= new Date());
      
      for (const rt of dueRecurrings) {
        // Create the transaction
        const newTx: Transaction = {
          id: uuidv4(),
          amount: rt.amount,
          type: rt.type,
          account_id: rt.accountId,
          to_account_id: rt.toAccountId,
          category_id: rt.categoryId,
          date: new Date().toISOString().split('T')[0], // Today's date
          notes: `[Auto] ${rt.name} ${rt.notes ? '- ' + rt.notes : ''}`
        }
        
        // Calculate new nextDate
        const curDate = new Date(rt.nextDate)
        if (rt.frequency === 'daily') curDate.setDate(curDate.getDate() + 1)
        if (rt.frequency === 'weekly') curDate.setDate(curDate.getDate() + 7)
        if (rt.frequency === 'monthly') curDate.setMonth(curDate.getMonth() + 1)
        if (rt.frequency === 'yearly') curDate.setFullYear(curDate.getFullYear() + 1)
        
        await supabaseApi.createTransaction(newTx);
        await supabaseApi.updateRecurringTransaction(rt.id, { nextDate: curDate.toISOString().split('T')[0] })
        
        // Push to local state optimistically
        set(state => ({
          transactions: [newTx, ...state.transactions],
          recurringTransactions: state.recurringTransactions.map(r => r.id === rt.id ? { ...r, nextDate: curDate.toISOString().split('T')[0] } : r)
        }))
      }

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
    if (typeof window !== 'undefined' && !window.confirm("Are you sure you want to permanently delete this transaction?")) return;
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
    if (typeof window !== 'undefined' && !window.confirm("Are you sure you want to permanently delete this account? It will be removed from all reports.")) return;
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
    if (typeof window !== 'undefined' && !window.confirm("Are you sure you want to permanently delete this loan mapping?")) return;
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
    if (typeof window !== 'undefined' && !window.confirm("Are you sure you want to permanently delete this payment?")) return;
    set((state) => ({
      loanPayments: state.loanPayments.filter(p => p.id !== id)
    }))
    try {
      await supabaseApi.deleteLoanPayment(id)
    } catch (error) {
      console.error(error)
    }
  },

  addGoal: async (goal) => {
    set((state) => ({ goals: [...state.goals, goal] }))
    try {
      await supabaseApi.createGoal(goal)
    } catch (error) {
      console.error(error)
      set((state) => ({ goals: state.goals.filter(g => g.id !== goal.id) }))
    }
  },

  updateGoal: async (id, updated) => {
    set((state) => ({
      goals: state.goals.map(g => g.id === id ? { ...g, ...updated } : g)
    }))
    try {
      await supabaseApi.updateGoal(id, updated)
    } catch (error) {
      console.error(error)
    }
  },

  deleteGoal: async (id) => {
    if (typeof window !== 'undefined' && !window.confirm("Are you sure you want to delete this goal?")) return;
    const previous = get().goals.find(g => g.id === id)
    set((state) => ({ goals: state.goals.filter(g => g.id !== id) }))
    try {
      await supabaseApi.deleteGoal(id)
    } catch (error) {
      console.error(error)
      if (previous) {
        set((state) => ({ goals: [...state.goals, previous] }))
      }
    }
  },

  addRecurringTransaction: async (rt) => {
    set((state) => ({ recurringTransactions: [...state.recurringTransactions, rt] }))
    try {
      await supabaseApi.createRecurringTransaction(rt)
    } catch (error) {
      console.error(error)
      set((state) => ({ recurringTransactions: state.recurringTransactions.filter(r => r.id !== rt.id) }))
    }
  },

  updateRecurringTransaction: async (id, updated) => {
    set((state) => ({
      recurringTransactions: state.recurringTransactions.map(r => r.id === id ? { ...r, ...updated } : r)
    }))
    try {
      await supabaseApi.updateRecurringTransaction(id, updated)
    } catch (error) {
      console.error(error)
    }
  },

  deleteRecurringTransaction: async (id) => {
    if (typeof window !== 'undefined' && !window.confirm("Are you sure you want to delete this recurring transaction?")) return;
    set((state) => ({
      recurringTransactions: state.recurringTransactions.filter(r => r.id !== id)
    }))
    try {
      await supabaseApi.deleteRecurringTransaction(id)
    } catch (error) {
      console.error(error)
    }
  },

  updateBaseCurrency: async (currency) => {
    const prev = get().baseCurrency
    set({ baseCurrency: currency })
    try {
      await supabaseApi.updateUserSettings({ baseCurrency: currency })
    } catch (error) {
      console.error(error)
      set({ baseCurrency: prev })
    }
  }
}))
