"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Database, AlertTriangle, CheckCircle, ArrowRight, Loader2 } from 'lucide-react'
import { useAppStore } from '@/store'
import { supabaseApi } from '@/utils/supabase/api'
import { useRouter } from 'next/navigation'

export default function MigrationPage() {
   const [status, setStatus] = useState<'idle' | 'migrating' | 'done' | 'error'>('idle')
   const [log, setLog] = useState<string[]>([])
   const router = useRouter()
   
   const addLog = (msg: string) => {
     setLog(prev => [...prev, msg])
     console.log("[Migration]", msg)
   }
   
   const startMigration = async () => {
     setStatus('migrating')
     addLog("Reading local storage...")
     try {
       const localRaw = localStorage.getItem('money-manager-storage')
       if (!localRaw) {
         addLog("No local data found. You are fully synced!")
         setStatus('done')
         setTimeout(() => router.push('/dashboard'), 2000)
         return 
       }
       
       const parsed = JSON.parse(localRaw)
       const state = parsed.state || {}
       
       // Process sequential uploads to avoid FK constraint errors
       // 1. Categories
       if (state.categories && state.categories.length > 0) {
         addLog(`Processing ${state.categories.length} custom categories...`)
         for (const cat of state.categories) {
            try { await supabaseApi.createCategory(cat) } catch(e: any) { addLog("Category Error: " + e.message) }
         }
       }
       
       // 2. Accounts
       if (state.accounts && state.accounts.length > 0) {
         addLog(`Migrating ${state.accounts.length} accounts...`)
         for (const a of state.accounts) {
            try { await supabaseApi.createAccount(a) } catch(e: any) { addLog("Account Error: " + e.message) }
         }
       }
       
       // 3. Loans
       if (state.loans && state.loans.length > 0) {
         addLog(`Migrating ${state.loans.length} loans...`)
         for (const l of state.loans) {
            try { await supabaseApi.createLoan(l) } catch(e: any) { addLog("Loan Error: " + e.message) }
         }
       }
       
       // 4. Transactions
       if (state.transactions && state.transactions.length > 0) {
         addLog(`Migrating ${state.transactions.length} transactions to cloud ledger...`)
         for (const t of state.transactions) {
            try { await supabaseApi.createTransaction(t) } catch(e: any) { addLog(`Tx Error (${t.amount}): ` + e.message) }
         }
       }
       
       // 5. Loan Payments
       if (state.loanPayments && state.loanPayments.length > 0) {
         addLog(`Migrating ${state.loanPayments.length} loan payment validations...`)
         for (const p of state.loanPayments) {
            try { await supabaseApi.createLoanPayment(p) } catch(e: any) { addLog("Payment Error: " + e.message) }
         }
       }
       
       addLog("Migration completed securely!")
       addLog("Wiping local browser ghost cache to prevent duplication...")
       localStorage.removeItem('money-manager-storage')
       
       setStatus('done')
       
       // Trigger a cloud fetch to visually see it
       useAppStore.getState().fetchGlobalData()
       
       setTimeout(() => router.push('/dashboard'), 3000)
       
     } catch(e: any) {
       addLog("Error reading or pushing: " + e.message)
       setStatus('error')
     }
   }

   return (
     <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 max-w-2xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-8 w-full relative overflow-hidden"
        >
          {/* Header */}
          <div className="text-center mb-8 relative z-10">
            <div className="w-16 h-16 bg-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center mx-auto mb-4 glow-cyan">
               <Database className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Cloud Syncer</h1>
            <p className="text-gray-400">Upgrade your offline browser data precisely to your live Supabase Account so you can access it everywhere.</p>
          </div>

          <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl flex gap-3 text-orange-400 text-sm mb-6 relative z-10">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p>Do not close this page while migration is in progress. A heavy network load is expected during the transaction transfer.</p>
          </div>

          <div className="space-y-4 relative z-10">
            {status === 'idle' && (
              <button
                onClick={startMigration}
                className="w-full py-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-all shadow-lg flex items-center justify-center gap-2 glow-cyan"
              >
                Scan & Execute Sync <ArrowRight className="w-5 h-5" />
              </button>
            )}

            {status !== 'idle' && (
              <div className="bg-black/60 rounded-xl p-4 font-mono text-xs text-cyan-400 space-y-2 h-48 overflow-y-auto mb-4 border border-white/5">
                {log.map((l, i) => (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={i}>
                    <span className="text-gray-500 mr-2">SYS&gt;</span>{l}
                  </motion.div>
                ))}
                {status === 'migrating' && (
                   <div className="flex gap-2 items-center text-gray-500 mt-4">
                     <Loader2 className="w-3 h-3 animate-spin"/> Processing batch transfers...
                   </div>
                )}
              </div>
            )}

            {status === 'done' && (
               <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex justify-center flex-col items-center text-green-400 font-bold gap-2">
                 <CheckCircle className="w-10 h-10 mb-2" />
                 Migration Success! Redirecting...
               </motion.div>
            )}
          </div>
        </motion.div>
     </div>
   )
}
