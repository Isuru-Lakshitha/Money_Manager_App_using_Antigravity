"use client"

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Banknote, Calendar, TrendingUp, AlertCircle, X, ChevronRight } from 'lucide-react'
import { useAppStore, Loan, LoanPayment } from '@/store'
import { v4 as uuidv4 } from 'uuid'
import { differenceInDays, isAfter, isBefore, addMonths, format, parseISO } from 'date-fns'

// Central Math Logic for Loans
export function calculateLoanDetails(loan: Loan, payments: LoanPayment[], asOfDate: Date = new Date()) {
  let remainingPrincipal = loan.principalAmount;
  let accumulatedInterest = 0;
  
  // Sort payments chronologically
  const sortedPayments = [...payments].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  let lastDate = new Date(loan.startDate);
  const dailyRate = (loan.annualInterestRate / 100) / 365;

  for (const payment of sortedPayments) {
    const paymentDate = new Date(payment.date);
    
    // Add interest from lastDate to paymentDate
    if (isBefore(lastDate, paymentDate)) {
      const daysElapsed = differenceInDays(paymentDate, lastDate);
      if (daysElapsed > 0) {
        accumulatedInterest += remainingPrincipal * dailyRate * daysElapsed;
      }
    }
    
    // Apply payment
    if (payment.amount >= accumulatedInterest) {
      const leftover = payment.amount - accumulatedInterest;
      accumulatedInterest = 0;
      remainingPrincipal -= leftover;
    } else {
      accumulatedInterest -= payment.amount;
    }
    
    // If payment was made before loan start date (edge case), just clamp lastDate
    lastDate = isAfter(paymentDate, lastDate) ? paymentDate : lastDate;
  }

  // Calculate interest from last payment up to 'asOfDate'
  if (isBefore(lastDate, asOfDate)) {
    const daysElapsed = differenceInDays(asOfDate, lastDate);
    accumulatedInterest += remainingPrincipal * dailyRate * daysElapsed;
  }

  // Calculate next payment date
  // Based strictly on the last payment date (or start date if no payments made)
  const nextPaymentDate = addMonths(lastDate, 1);

  return {
    remainingPrincipal: Math.max(0, remainingPrincipal),
    accumulatedInterest: Math.max(0, accumulatedInterest),
    totalDebt: Math.max(0, remainingPrincipal + accumulatedInterest),
    nextPaymentDate
  };
}


export default function LoansPage() {
  const { loans, loanPayments, addLoan, addLoanPayment, deleteLoan } = useAppStore()
  
  const [isAddLoanModalOpen, setIsAddLoanModalOpen] = useState(false)
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)

  // Add Loan Form State
  const [newLoanName, setNewLoanName] = useState('')
  const [newLoanPrincipal, setNewLoanPrincipal] = useState('')
  const [newLoanRate, setNewLoanRate] = useState('')
  const [newLoanDate, setNewLoanDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  // Payment Form State
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentDate, setPaymentDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  const handleAddLoan = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newLoanName || !newLoanPrincipal || !newLoanRate || !newLoanDate) return

    const loan: Loan = {
      id: uuidv4(),
      name: newLoanName,
      principalAmount: parseFloat(newLoanPrincipal),
      annualInterestRate: parseFloat(newLoanRate),
      startDate: newLoanDate,
      status: 'active'
    }

    addLoan(loan)
    setIsAddLoanModalOpen(false)
    setNewLoanName('')
    setNewLoanPrincipal('')
    setNewLoanRate('')
  }

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedLoan || !paymentAmount || !paymentDate) return

    const payment: LoanPayment = {
      id: uuidv4(),
      loanId: selectedLoan.id,
      amount: parseFloat(paymentAmount),
      date: paymentDate
    }

    addLoanPayment(payment)
    setIsPaymentModalOpen(false)
    setPaymentAmount('')
  }


  const loansWithDetails = useMemo(() => {
    return loans.map(loan => {
      const payments = loanPayments.filter(p => p.loanId === loan.id)
      const details = calculateLoanDetails(loan, payments, new Date())
      return { loan, payments, details }
    })
  }, [loans, loanPayments])

  const totalBorrowed = loansWithDetails.reduce((sum, current) => sum + current.loan.principalAmount, 0)
  const totalRemainingDebt = loansWithDetails.reduce((sum, current) => sum + current.details.totalDebt, 0)

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
            Loan Management
          </h1>
          <p className="text-gray-400 mt-1">Track your loans, calculate exact interest, and manage payments.</p>
        </div>
        <button
          onClick={() => setIsAddLoanModalOpen(true)}
          className="bg-cyan-600 hover:bg-cyan-500 shadow-cyan-500/50 shadow-lg text-white transition-all py-3 px-6 rounded-xl font-semibold flex items-center gap-2 w-full md:w-auto justify-center"
        >
          <Plus className="w-5 h-5" />
          Add New Loan
        </button>
      </motion.div>

      {/* Summary Cards */}
      <motion.div 
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.1 } }
        }}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
         <motion.div
           variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } }}
           className="glass-panel p-6 flex items-center space-x-4"
         >
           <div className="w-12 h-12 rounded-full flex items-center justify-center bg-cyan-500/20 text-cyan-400">
             <Banknote className="w-6 h-6" />
           </div>
           <div>
             <p className="text-gray-400 text-sm">Active Loans</p>
             <p className="text-2xl font-bold font-mono text-white">{loans.length}</p>
           </div>
         </motion.div>

         <motion.div
           variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } }}
           className="glass-panel p-6 flex items-center space-x-4"
         >
           <div className="w-12 h-12 rounded-full flex items-center justify-center bg-purple-500/20 text-purple-400">
             <TrendingUp className="w-6 h-6" />
           </div>
           <div>
             <p className="text-gray-400 text-sm">Total Borrowed Principal</p>
             <p className="text-2xl font-bold font-mono text-white">
               Rs. {totalBorrowed.toLocaleString(undefined, { minimumFractionDigits: 2 })}
             </p>
           </div>
         </motion.div>

         <motion.div
           variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } }}
           className="glass-panel p-6 flex items-center space-x-4"
         >
           <div className="w-12 h-12 rounded-full flex items-center justify-center bg-rose-500/20 text-rose-400">
             <AlertCircle className="w-6 h-6" />
           </div>
           <div>
             <p className="text-gray-400 text-sm">Total Current Debt (w/ Int.)</p>
             <p className="text-2xl font-bold font-mono text-rose-400">
               Rs. {totalRemainingDebt.toLocaleString(undefined, { minimumFractionDigits: 2 })}
             </p>
           </div>
         </motion.div>
      </motion.div>

      {/* Loans List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white mb-4">Your Loans</h2>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {loansWithDetails.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="col-span-1 xl:col-span-2 text-center py-12 glass-panel"
            >
              <Banknote className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No active loans. Click 'Add New Loan' to get started.</p>
            </motion.div>
          ) : (
             loansWithDetails.map(({ loan, details, payments }, index) => (
               <motion.div 
                 key={loan.id}
                 layoutId={`loan-${loan.id}`}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: index * 0.05, type: 'spring', stiffness: 300, damping: 24 }}
                 className="glass-panel p-6 relative overflow-hidden group cursor-pointer hover:border-cyan-500/30 transition-colors"
                 onClick={() => setSelectedLoan(loan)}
               >
                 <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-500 to-blue-600" />
                 
                 <div className="flex justify-between items-start mb-4">
                   <div>
                     <h3 className="text-xl font-bold text-white">{loan.name}</h3>
                     <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                       <Calendar className="w-3 h-3" /> Started {format(parseISO(loan.startDate), 'MMM d, yyyy')}
                     </p>
                   </div>
                   <div className="text-right">
                     <p className="text-rose-400 font-mono font-bold text-xl">
                       Rs. {details.totalDebt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                     </p>
                     <p className="text-xs text-gray-500">Current Debt</p>
                   </div>
                 </div>

                 <div className="grid grid-cols-3 gap-4 mb-4 py-4 border-y border-white/5">
                   <div>
                     <p className="text-xs text-gray-500 uppercase tracking-wider">Interest Rate</p>
                     <p className="text-sm text-cyan-400 font-medium">{loan.annualInterestRate}% / yr</p>
                   </div>
                   <div>
                     <p className="text-xs text-gray-500 uppercase tracking-wider">Accum. Interest</p>
                     <p className="text-sm text-orange-400 font-medium">
                       Rs. {details.accumulatedInterest.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                     </p>
                   </div>
                   <div>
                     <p className="text-xs text-gray-500 uppercase tracking-wider">Remaining Principal</p>
                     <p className="text-sm text-gray-300 font-medium">
                       Rs. {details.remainingPrincipal.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                     </p>
                   </div>
                 </div>

                 <div className="flex justify-between items-center text-sm">
                   <div className="bg-white/5 px-3 py-1.5 rounded-lg flex gap-2 items-center">
                     <ClockIcon className="w-4 h-4 text-cyan-400" />
                     <span className="text-gray-300">Next Payment: <span className="text-white font-medium">{format(details.nextPaymentDate, 'MMM d, yyyy')}</span></span>
                   </div>
                   <span className="text-cyan-400 flex items-center group-hover:translate-x-1 transition-transform">
                     View Details <ChevronRight className="w-4 h-4 ml-1" />
                   </span>
                 </div>
               </motion.div>
             ))
          )}
        </div>
      </div>

      {/* Add Loan Modal */}
      <AnimatePresence>
        {isAddLoanModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel p-6 w-full max-w-md relative"
            >
              <button
                onClick={() => setIsAddLoanModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-2xl font-bold text-white mb-6">Add New Loan</h2>

              <form onSubmit={handleAddLoan} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Loan Name / Purpose</label>
                  <input
                    type="text"
                    required
                    value={newLoanName}
                    onChange={(e) => setNewLoanName(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/30 transition-all"
                    placeholder="e.g. Gold Loan, Car Leasing"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Principal Amount (Rs.)</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    value={newLoanPrincipal}
                    onChange={(e) => setNewLoanPrincipal(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/30 transition-all"
                    placeholder="1000.00"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Annual Interest (%)</label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      min="0"
                      value={newLoanRate}
                      onChange={(e) => setNewLoanRate(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/30 transition-all"
                      placeholder="12"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Start Date</label>
                    <input
                      type="date"
                      required
                      value={newLoanDate}
                      onChange={(e) => setNewLoanDate(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/30 transition-all"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 shadow-cyan-500/50 shadow-lg text-white transition-all py-3 px-6 rounded-xl font-semibold w-full">
                    Create Loan
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loan Details & Payment Modal */}
      <AnimatePresence>
        {selectedLoan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              layoutId={`loan-${selectedLoan.id}`}
              className="glass-panel p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <button
                onClick={() => setSelectedLoan(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white bg-white/5 rounded-full p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6 border-b border-white/10 pb-4 pr-8">
                <h2 className="text-2xl font-bold text-white">{selectedLoan.name}</h2>
                <div className="flex gap-4 mt-2 text-sm text-gray-400">
                  <span>Started: {format(parseISO(selectedLoan.startDate), 'MMM d, yyyy')}</span>
                  <span>•</span>
                  <span>{selectedLoan.annualInterestRate}% Annual Interest Rate</span>
                  <span>•</span>
                  <span>Original: Rs. {selectedLoan.principalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="bg-cyan-600 hover:bg-cyan-500 shadow-cyan-500/50 shadow-lg text-white transition-all py-3 px-6 rounded-xl font-semibold flex-1"
                >
                  Make a Payment
                </button>
                <button
                  onClick={() => {
                    const confirm = window.confirm("Are you sure you want to delete this loan?")
                    if (confirm) {
                      deleteLoan(selectedLoan.id)
                      setSelectedLoan(null)
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors border border-red-500/20"
                >
                  Delete
                </button>
              </div>

               {/* Add Payment Sub-Modal embedded playfully */}
              <AnimatePresence>
               {isPaymentModalOpen && (
                 <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mb-6"
                 >
                   <form onSubmit={handleAddPayment} className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-4">
                     <h4 className="font-semibold text-cyan-400 flex justify-between">
                       Record Payment
                       <X className="w-4 h-4 cursor-pointer text-gray-400 hover:text-white" onClick={() => setIsPaymentModalOpen(false)} />
                     </h4>
                     <div className="grid grid-cols-2 gap-4">
                       <div>
                         <label className="block text-xs text-gray-400 mb-1">Payment Amount</label>
                         <input
                           type="number"
                           step="0.01"
                           min="0"
                           required
                           value={paymentAmount}
                           onChange={(e) => setPaymentAmount(e.target.value)}
                           className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/30 transition-all"
                           placeholder="Enter amount"
                         />
                         <p className="text-[10px] text-gray-500 mt-1">First pays interest, then principal.</p>
                       </div>
                       <div>
                         <label className="block text-xs text-gray-400 mb-1">Date Paid</label>
                         <input
                           type="date"
                           required
                           value={paymentDate}
                           onChange={(e) => setPaymentDate(e.target.value)}
                           className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/30 transition-all"
                         />
                       </div>
                     </div>
                     <button type="submit" className="w-full bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 py-2 rounded-lg transition-colors font-medium">
                       Confirm Payment
                     </button>
                   </form>
                 </motion.div>
               )}
              </AnimatePresence>


              {/* History */}
              <h3 className="text-lg font-semibold text-white mb-4">Payment History</h3>
              {(() => {
                const payments = loanPayments.filter(p => p.loanId === selectedLoan.id)
                if (payments.length === 0) {
                  return <p className="text-gray-400 text-sm">No payments recorded yet.</p>
                }
                
                // Sort descending for history view
                const sortedPayments = [...payments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

                return (
                  <div className="space-y-3">
                    {sortedPayments.map(payment => (
                      <div key={payment.id} className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-green-500/20 text-green-400 flex items-center justify-center">
                            <Banknote className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-white">Rs. {payment.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                            <p className="text-xs text-gray-400">{format(parseISO(payment.date), 'MMM d, yyyy')}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}

function ClockIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}
