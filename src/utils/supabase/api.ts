import { createClient } from './client'
import { Account, Category, Transaction, Loan, LoanPayment } from '@/store'

// Helper to get user ID safely
async function getUserId() {
  const supabase = createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) throw new Error("User not authenticated")
  return data.user.id
}

export const supabaseApi = {

  // ================= CATEGORIES =================
  async getCategories() {
    const supabase = createClient()
    const { data, error } = await supabase.from('categories').select('*').order('created_at', { ascending: true })
    if (error) throw error
    return data as Category[]
  },
  async createCategory(cat: Category) {
    const supabase = createClient()
    const userId = await getUserId()
    const { error } = await supabase.from('categories').insert({
      id: cat.id,
      user_id: userId,
      name: cat.name,
      type: cat.type,
      icon: cat.icon
    })
    if (error) throw error
  },

  // ================= ACCOUNTS =================
  async getAccounts() {
    const supabase = createClient()
    const { data, error } = await supabase.from('accounts').select('*').order('created_at', { ascending: true })
    if (error) throw error
    return (data || []).map(row => ({
      ...row,
      balance: Number(row.balance)
    })) as Account[]
  },
  async createAccount(acc: Account) {
    const supabase = createClient()
    const userId = await getUserId()
    const { error } = await supabase.from('accounts').insert({
      id: acc.id,
      user_id: userId,
      name: acc.name,
      type: acc.type,
      balance: acc.balance
    })
    if (error) throw error
  },
  async updateAccount(id: string, updates: Partial<Account>) {
    const supabase = createClient()
    const { error } = await supabase.from('accounts').update(updates).eq('id', id)
    if (error) throw error
  },
  async deleteAccount(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from('accounts').delete().eq('id', id)
    if (error) throw error
  },

  // ================= TRANSACTIONS =================
  async getTransactions() {
    const supabase = createClient()
    const { data, error } = await supabase.from('transactions').select('*').order('date', { ascending: false }).order('created_at', { ascending: false })
    if (error) throw error
    return (data || []).map(row => ({
      ...row,
      amount: Number(row.amount),
      fee_amount: Number(row.fee_amount || 0)
    })) as Transaction[]
  },
  async createTransaction(tx: Transaction) {
    const supabase = createClient()
    const userId = await getUserId()
    const { error } = await supabase.from('transactions').insert({
      id: tx.id,
      user_id: userId,
      type: tx.type,
      amount: tx.amount,
      fee_amount: tx.fee_amount || 0,
      account_id: tx.account_id,
      to_account_id: tx.to_account_id,
      category_id: tx.category_id,
      date: tx.date,
      notes: tx.notes
    })
    if (error) throw error
  },
  async updateTransaction(id: string, updates: Partial<Transaction>) {
    const supabase = createClient()
    const { error } = await supabase.from('transactions').update(updates).eq('id', id)
    if (error) throw error
  },
  async deleteTransaction(id: string) {
    const supabase = createClient()
    // Manual cascade to matching loan_payment ID to prevent calculation orphans
    await supabase.from('loan_payments').delete().eq('id', id)
    
    // Cascades will handle transaction_tags if any natively
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (error) throw error
  },

  // ================= LOANS =================
  async getLoans() {
    const supabase = createClient()
    const { data, error } = await supabase.from('loans').select('*').order('created_at', { ascending: true })
    if (error) throw error
    // Map snake_case from DB to camelCase for Zustand store
    return (data || []).map(row => ({
      id: row.id,
      name: row.name,
      principalAmount: Number(row.principal_amount),
      annualInterestRate: Number(row.annual_interest_rate),
      startDate: row.start_date,
      status: row.status,
      notes: row.notes
    })) as Loan[]
  },
  async createLoan(loan: Loan) {
    const supabase = createClient()
    const userId = await getUserId()
    const { error } = await supabase.from('loans').insert({
      id: loan.id,
      user_id: userId,
      name: loan.name,
      principal_amount: loan.principalAmount,
      annual_interest_rate: loan.annualInterestRate,
      start_date: loan.startDate,
      status: loan.status,
      notes: loan.notes
    })
    if (error) throw error
  },
  async updateLoan(id: string, updates: Partial<Loan>) {
    const supabase = createClient()
    const dbUpdates: any = {}
    if (updates.name !== undefined) dbUpdates.name = updates.name
    if (updates.principalAmount !== undefined) dbUpdates.principal_amount = updates.principalAmount
    if (updates.annualInterestRate !== undefined) dbUpdates.annual_interest_rate = updates.annualInterestRate
    if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate
    if (updates.status !== undefined) dbUpdates.status = updates.status
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes

    const { error } = await supabase.from('loans').update(dbUpdates).eq('id', id)
    if (error) throw error
  },
  async deleteLoan(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from('loans').delete().eq('id', id)
    if (error) throw error
  },

  // ================= LOAN PAYMENTS =================
  async getLoanPayments() {
    const supabase = createClient()
    const { data, error } = await supabase.from('loan_payments').select('*').order('date', { ascending: true })
    if (error) throw error
    return (data || []).map(row => ({
      id: row.id,
      loanId: row.loan_id,
      amount: Number(row.amount),
      date: row.date
    })) as LoanPayment[]
  },
  async createLoanPayment(payment: LoanPayment) {
    const supabase = createClient()
    const userId = await getUserId()
    const { error } = await supabase.from('loan_payments').insert({
      id: payment.id,
      user_id: userId,
      loan_id: payment.loanId,
      amount: payment.amount,
      date: payment.date
    })
    if (error) throw error
  },
  async deleteLoanPayment(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from('loan_payments').delete().eq('id', id)
    if (error) throw error
  },

  // ================= GOALS =================
  async getGoals() {
    const supabase = createClient()
    const { data, error } = await supabase.from('goals').select('*').order('created_at', { ascending: true })
    if (error) throw error
    return (data || []).map(row => ({
      id: row.id,
      name: row.name,
      targetAmount: Number(row.target_amount),
      currentAmount: Number(row.current_amount),
      deadline: row.deadline
    }))
  },
  async createGoal(goal: any) {
    const supabase = createClient()
    const userId = await getUserId()
    const { error } = await supabase.from('goals').insert({
      id: goal.id,
      user_id: userId,
      name: goal.name,
      target_amount: goal.targetAmount,
      current_amount: goal.currentAmount,
      deadline: goal.deadline
    })
    if (error) throw error
  },
  async updateGoal(id: string, updates: any) {
    const supabase = createClient()
    const dbUpdates: any = {}
    if (updates.name !== undefined) dbUpdates.name = updates.name
    if (updates.targetAmount !== undefined) dbUpdates.target_amount = updates.targetAmount
    if (updates.currentAmount !== undefined) dbUpdates.current_amount = updates.currentAmount
    if (updates.deadline !== undefined) dbUpdates.deadline = updates.deadline

    const { error } = await supabase.from('goals').update(dbUpdates).eq('id', id)
    if (error) throw error
  },
  async deleteGoal(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from('goals').delete().eq('id', id)
    if (error) throw error
  },

  // ================= RECURRING TRANSACTIONS =================
  async getRecurringTransactions() {
    const supabase = createClient()
    const { data, error } = await supabase.from('recurring_transactions').select('*').order('created_at', { ascending: true })
    if (error) throw error
    return (data || []).map(row => ({
      id: row.id,
      name: row.name,
      amount: Number(row.amount),
      type: row.type,
      categoryId: row.category_id,
      accountId: row.account_id,
      toAccountId: row.to_account_id,
      frequency: row.frequency,
      nextDate: row.next_date,
      notes: row.notes,
      isActive: row.is_active
    }))
  },
  async createRecurringTransaction(rt: any) {
    const supabase = createClient()
    const userId = await getUserId()
    const { error } = await supabase.from('recurring_transactions').insert({
      id: rt.id,
      user_id: userId,
      name: rt.name,
      amount: rt.amount,
      type: rt.type,
      category_id: rt.categoryId,
      account_id: rt.accountId,
      to_account_id: rt.toAccountId,
      frequency: rt.frequency,
      next_date: rt.nextDate,
      notes: rt.notes,
      is_active: rt.isActive
    })
    if (error) throw error
  },
  async updateRecurringTransaction(id: string, updates: any) {
    const supabase = createClient()
    const dbUpdates: any = {}
    if (updates.name !== undefined) dbUpdates.name = updates.name
    if (updates.amount !== undefined) dbUpdates.amount = updates.amount
    if (updates.type !== undefined) dbUpdates.type = updates.type
    if (updates.categoryId !== undefined) dbUpdates.category_id = updates.categoryId
    if (updates.accountId !== undefined) dbUpdates.account_id = updates.accountId
    if (updates.toAccountId !== undefined) dbUpdates.to_account_id = updates.toAccountId
    if (updates.frequency !== undefined) dbUpdates.frequency = updates.frequency
    if (updates.nextDate !== undefined) dbUpdates.next_date = updates.nextDate
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive

    const { error } = await supabase.from('recurring_transactions').update(dbUpdates).eq('id', id)
    if (error) throw error
  },
  async deleteRecurringTransaction(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from('recurring_transactions').delete().eq('id', id)
    if (error) throw error
  },

  // ================= USER SETTINGS (MULTI-CURRENCY) =================
  async getUserSettings() {
    const supabase = createClient()
    const userId = await getUserId()
    const { data, error } = await supabase.from('user_settings').select('*').eq('user_id', userId).single()
    if (error && error.code !== 'PGRST116') throw error // PGRST116 is not found
    
    if (!data) {
      // Create default settings if not exists
      const { data: newData, error: insertError } = await supabase.from('user_settings').insert({
        user_id: userId,
        base_currency: 'LKR'
      }).select().single()
      if (insertError) throw insertError
      return { baseCurrency: newData.base_currency }
    }
    
    return { baseCurrency: data.base_currency }
  },
  
  async updateUserSettings(settings: { baseCurrency: string }) {
    const supabase = createClient()
    const userId = await getUserId()
    const { error } = await supabase.from('user_settings').upsert({
      user_id: userId,
      base_currency: settings.baseCurrency,
      created_at: new Date().toISOString()
    })
    if (error) throw error
  }
}
