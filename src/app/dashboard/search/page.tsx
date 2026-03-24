"use client"

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Calendar, Hash, ArrowUpRight, ArrowDownRight, ArrowRightLeft, X } from 'lucide-react'
import { format } from 'date-fns'
import { useAppStore, Transaction, DEFAULT_CATEGORIES } from '@/store'
import TransactionModal from '@/components/transactions/TransactionModal'

export default function AdvancedSearchPage() {
  const transactions = useAppStore(state => state.transactions)
  const categories = useAppStore(state => state.categories)
  const accounts = useAppStore(state => state.accounts)

  const [mounted, setMounted] = useState(false)
  const [isTxModalOpen, setIsTxModalOpen] = useState(false)
  const [txToEdit, setTxToEdit] = useState<Transaction | null>(null)

  // Filters state
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [accountFilter, setAccountFilter] = useState<string>('all')
  const [minAmount, setMinAmount] = useState('')
  const [maxAmount, setMaxAmount] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    setMounted(true)
  }, [])

  const getCategoryName = (id?: string | null) => {
    if (!id) return 'Uncategorized'
    const customCat = categories.find(c => c.id === id)
    if (customCat) return customCat.name

    const defaultCat = DEFAULT_CATEGORIES.find(c => c.id === id)
    return defaultCat ? defaultCat.name : 'Other'
  }

  const getAccountName = (id: string) => {
    const acc = accounts.find(a => a.id === id)
    return acc ? acc.name : 'Deleted Account'
  }

  const clearFilters = () => {
    setSearchTerm('')
    setTypeFilter('all')
    setCategoryFilter('all')
    setAccountFilter('all')
    setMinAmount('')
    setMaxAmount('')
    setStartDate('')
    setEndDate('')
  }

  // Filter Logic
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      // Search Term
      const term = searchTerm.toLowerCase()
      const matchesSearch = term === '' || 
        getCategoryName(tx.category_id).toLowerCase().includes(term) ||
        getAccountName(tx.account_id).toLowerCase().includes(term) ||
        (tx.to_account_id ? getAccountName(tx.to_account_id).toLowerCase().includes(term) : false) ||
        (tx.notes || '').toLowerCase().includes(term) ||
        tx.amount.toString().includes(term)

      if (!matchesSearch) return false

      // Type
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false

      // Category
      if (categoryFilter !== 'all' && tx.category_id !== categoryFilter) return false

      // Account
      if (accountFilter !== 'all' && tx.account_id !== accountFilter && tx.to_account_id !== accountFilter) return false

      // Amount Range
      const min = parseFloat(minAmount)
      const max = parseFloat(maxAmount)
      if (!isNaN(min) && tx.amount < min) return false
      if (!isNaN(max) && tx.amount > max) return false

      // Date Range
      if (startDate && tx.date < startDate) return false
      if (endDate && tx.date > endDate) return false

      return true
    })
  }, [transactions, searchTerm, typeFilter, categoryFilter, accountFilter, minAmount, maxAmount, startDate, endDate, categories, accounts])

  const totalFilteredIncome = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const totalFilteredExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)

  if (!mounted) return <div className="p-8 text-center text-gray-500">Loading search...</div>

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Advanced Search</h1>
          <p className="text-gray-400">Deeply filter and analyze your transactions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-white flex items-center gap-2"><Filter className="w-4 h-4"/> Filters</h3>
              <button onClick={clearFilters} className="text-xs text-cyan-400 hover:text-cyan-300">Clear All</button>
            </div>

            <div className="space-y-5">
              {/* Search Phrase */}
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Search Text</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="e.g. dinner, salary..." 
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-10 pr-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                  />
                </div>
              </div>

              {/* Transaction Type */}
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Type</label>
                <select 
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                >
                  <option value="all">All Types</option>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                  <option value="transfer">Transfer</option>
                </select>
              </div>

              {/* Amount Range */}
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Amount Range</label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
                    <input 
                      type="number" 
                      value={minAmount}
                      onChange={(e) => setMinAmount(e.target.value)}
                      placeholder="Min" 
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-8 pr-2 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors font-numbers"
                    />
                  </div>
                  <span className="text-gray-500">-</span>
                  <div className="relative flex-1">
                    <input 
                      type="number" 
                      value={maxAmount}
                      onChange={(e) => setMaxAmount(e.target.value)}
                      placeholder="Max" 
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors font-numbers"
                    />
                  </div>
                </div>
              </div>

              {/* Date Range */}
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Date Range</label>
                <div className="space-y-2">
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                      type="date" 
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-10 pr-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors font-numbers"
                    />
                  </div>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                      type="date" 
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-10 pr-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors font-numbers"
                    />
                  </div>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Category</label>
                <select 
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                >
                  <option value="all">All Categories</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Account */}
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Account</label>
                <select 
                  value={accountFilter}
                  onChange={(e) => setAccountFilter(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                >
                  <option value="all">All Accounts</option>
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>

            </div>
          </div>
        </div>

        {/* Results Area */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-panel p-4 border-cyan-500/20">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Found Income</p>
              <p className="text-2xl font-bold text-cyan-400 font-numbers">Rs. {totalFilteredIncome.toLocaleString()}</p>
            </div>
            <div className="glass-panel p-4 border-purple-500/20">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Found Expenses</p>
              <p className="text-2xl font-bold text-purple-400 font-numbers">Rs. {totalFilteredExpense.toLocaleString()}</p>
            </div>
          </div>

          <div className="glass-panel overflow-hidden">
            <div className="p-4 border-b border-white/5 bg-black/20 flex justify-between items-center">
              <h3 className="font-semibold text-white">Results ({filteredTransactions.length})</h3>
            </div>
            
            {filteredTransactions.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center">
                <Search className="w-12 h-12 text-gray-600 mb-4" />
                <h3 className="text-white font-semibold text-lg mb-2">No results found</h3>
                <p className="text-gray-400 text-sm max-w-sm">Try adjusting your filters or clearing them to see more transactions.</p>
              </div>
            ) : (
              <div className="overflow-x-auto no-scrollbar max-h-[600px] overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-[#0B0F19] z-10">
                    <tr className="border-b border-white/5 text-xs uppercase tracking-wider text-gray-400">
                      <th className="p-4 font-semibold">Date</th>
                      <th className="p-4 font-semibold">Details</th>
                      <th className="p-4 font-semibold">Account</th>
                      <th className="p-4 font-semibold text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredTransactions.map((tx, idx) => {
                      const isIncome = tx.type === 'income'
                      const isTransfer = tx.type === 'transfer'
                      const Icon = isIncome ? ArrowUpRight : isTransfer ? ArrowRightLeft : ArrowDownRight
                      const colorClass = isIncome ? 'text-cyan-400' : isTransfer ? 'text-blue-400' : 'text-purple-400'
                      const bgClass = isIncome ? 'bg-cyan-500/10' : isTransfer ? 'bg-blue-500/10' : 'bg-purple-500/10'

                      return (
                        <motion.tr
                          key={tx.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="hover:bg-white/5 transition-colors cursor-pointer"
                          onClick={() => {
                            setTxToEdit(tx)
                            setIsTxModalOpen(true)
                          }}
                        >
                          <td className="p-4 align-top whitespace-nowrap">
                            <div className="text-sm text-gray-300 font-numbers">{format(new Date(tx.date), 'MMM dd, yyyy')}</div>
                          </td>

                          <td className="p-4 align-top">
                            <div className="flex items-start space-x-3">
                              <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${bgClass} ${colorClass}`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="text-white font-semibold text-sm">
                                  {isTransfer ? 'Transfer' : getCategoryName(tx.category_id)}
                                </div>
                                {tx.notes && <div className="text-xs text-gray-400 mt-1 max-w-xs truncate">{tx.notes}</div>}
                              </div>
                            </div>
                          </td>

                          <td className="p-4 align-top">
                            <div className="text-sm text-gray-300">
                              {isTransfer ? (
                                <span>{getAccountName(tx.account_id)} <ArrowRightLeft className="inline w-3 h-3 text-gray-500 mx-1" /> {tx.to_account_id ? getAccountName(tx.to_account_id) : 'Unknown'}</span>
                              ) : (
                                getAccountName(tx.account_id)
                              )}
                            </div>
                          </td>

                          <td className="p-4 align-top text-right">
                            <div className={`text-sm font-bold font-numbers ${colorClass}`}>
                              {isIncome ? '+' : isTransfer ? '' : '-'} Rs. {tx.amount.toLocaleString()}
                            </div>
                            {isTransfer && tx.fee_amount ? (
                              <div className="text-xs text-red-400 mt-1 font-numbers">Fee: Rs. {tx.fee_amount}</div>
                            ) : null}
                          </td>
                        </motion.tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <TransactionModal 
        isOpen={isTxModalOpen} 
        onClose={() => setIsTxModalOpen(false)} 
        transactionToEdit={txToEdit} 
      />
    </div>
  )
}
