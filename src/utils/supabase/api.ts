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
  }
}
