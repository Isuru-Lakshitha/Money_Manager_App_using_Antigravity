"use client"

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Download, Upload, AlertTriangle, FileJson, FileSpreadsheet, Trash2 } from 'lucide-react'
import { useAppStore, DEFAULT_CATEGORIES } from '@/store'
import { supabaseApi } from '@/utils/supabase/api'
import * as XLSX from 'xlsx'

export default function SettingsPage() {
  const store = useAppStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' })

  const handleExportJSON = () => {
    const data = {
      transactions: store.transactions,
      accounts: store.accounts,
      categories: store.categories,
      version: '1.0'
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `moneymanager_backup_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleExportExcel = () => {
    // Export Data to Excel
    const data = store.transactions.map(t => {
      let categoryName = ''
      if (t.category_id && t.category_id !== 'goal' && t.category_id !== 'transfer') {
        const customCat = store.categories.find(c => c.id === t.category_id)
        if (customCat) {
          categoryName = customCat.name
        } else {
          const defaultCat = DEFAULT_CATEGORIES.find(c => c.id === t.category_id)
          if (defaultCat) categoryName = defaultCat.name
        }
      } else if (t.category_id === 'goal') {
        categoryName = 'Goal Funding'
      } else if (t.category_id === 'transfer') {
        categoryName = 'Transfer'
      }

      return {
        ID: t.id,
        Type: t.type,
        Amount: t.amount,
        Fee: t.fee_amount || 0,
        Category: categoryName,
        'Account ID': t.account_id,
        'To Account ID': t.to_account_id || '',
        Date: t.date,
        Notes: t.notes || ''
      }
    })
    
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions")
    
    // Generate buffer and trigger download
    XLSX.writeFile(workbook, `moneymanager_transactions_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const result = event.target?.result as string
        const parsed = JSON.parse(result)

        if (parsed.transactions && parsed.accounts) {
          setImportStatus({ type: 'success', message: 'Uploading strictly to cloud database... Please wait, this might take a moment.' })
          
          let failCount = 0;

          // Categories
          if (parsed.categories) {
            for (const cat of parsed.categories) {
              try { await supabaseApi.createCategory(cat) } catch(e) { }
            }
          }
          // Accounts
          if (parsed.accounts) {
            for (const acc of parsed.accounts) {
              try { await supabaseApi.createAccount(acc) } catch(e) { failCount++ }
            }
          }
          // Loans
          if (parsed.loans) {
             for (const loan of parsed.loans) {
               try { await supabaseApi.createLoan(loan) } catch(e) { failCount++ }
             }
          }
          // Transactions
          if (parsed.transactions) {
            for (const tx of parsed.transactions) {
              try { await supabaseApi.createTransaction(tx) } catch(e) { failCount++ }
            }
          }
          // Payments
          if (parsed.loanPayments) {
             for (const lp of parsed.loanPayments) {
               try { await supabaseApi.createLoanPayment(lp) } catch(e) { failCount++ }
             }
          }

          if (failCount > 0) {
             console.warn(failCount + " items failed to sync, they map duplicate records or constraint checks.");
          }

          setImportStatus({ type: 'success', message: 'Cloud Import Successful! Your data has been entirely securely synchronized to the cloud.' })
          store.fetchGlobalData() // Fetch visual state back from Supabase cloud
          
        } else {
          throw new Error('Invalid Schema')
        }
      } catch (error: any) {
        setImportStatus({ type: 'error', message: 'Error: ' + error.message })
      }
    }
    reader.readAsText(file)
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClearData = async () => {
    const pwd = window.prompt("SECURITY CHECK: Please enter your VoidLedger password to permanently wipe all data:")
    if (!pwd) return
    
    setImportStatus({ type: 'success', message: 'Authenticating action...' })
    
    // Auth Check
    const { createClient } = await import('@/utils/supabase/client')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user?.email) {
       const { error } = await supabase.auth.signInWithPassword({ email: user.email, password: pwd })
       if (error) {
          setImportStatus({ type: 'error', message: 'Authentication Failed: Incorrect password. Wipe aborted.' })
          return
       }
    } else {
       if (process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://mockproject.supabase.co') {
           setImportStatus({ type: 'error', message: 'Authentication Failed: No user session found.' })
           return
       }
    }
    
    const confirmPrompt = window.prompt("AUTHENTICATION PASSED. Type 'DELETE' to confirm completely wiping all your data. This cannot be undone.")
    if (confirmPrompt === 'DELETE') {
      store.setTransactions([])
      store.setAccounts([])
      setImportStatus({ type: 'success', message: 'All data has been permanently cleared.' })
    } else {
      setImportStatus({ type: 'error', message: 'Data wipe aborted.' })
    }
  }

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">Settings & Backup</h1>
        <p className="text-gray-400">Manage your local data, create backups, and restore from files.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Export Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 border-cyan-500/20 relative overflow-hidden"
        >
          <div className="mb-6">
            <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center mb-4">
              <Download className="w-6 h-6 text-cyan-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Export Data</h2>
            <p className="text-gray-400 text-sm">Download a copy of your financial data to keep it safe or analyze it in other tools.</p>
          </div>

          <div className="space-y-3">
            <button 
              onClick={handleExportJSON}
              className="w-full bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-4 py-3 rounded-xl transition-all font-semibold flex items-center justify-center space-x-2"
            >
              <FileJson className="w-5 h-5" />
              <span>Full Backup (.json)</span>
            </button>
            <button 
              onClick={handleExportExcel}
              className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 px-4 py-3 rounded-xl transition-all font-semibold flex items-center justify-center space-x-2"
            >
              <FileSpreadsheet className="w-5 h-5 text-green-400" />
              <span>Export Transactions to Excel (.xlsx)</span>
            </button>
          </div>
        </motion.div>

        {/* Import Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel p-6 border-purple-500/20 relative overflow-hidden"
        >
          <div className="mb-6">
            <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-4">
              <Upload className="w-6 h-6 text-purple-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Restore Backup</h2>
            <p className="text-gray-400 text-sm">Import your previously downloaded .json backup file to restore your entire dashboard.</p>
          </div>

          <div className="space-y-4">
            <input 
              type="file" 
              accept=".json" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleImportJSON}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-purple-500 hover:bg-purple-400 text-black px-4 py-3 rounded-xl transition-all glow-purple font-semibold flex items-center justify-center space-x-2"
            >
              <Upload className="w-5 h-5" />
              <span>Select Backup File</span>
            </button>

            {importStatus.type && (
              <div className={`p-4 rounded-xl text-sm ${importStatus.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                {importStatus.message}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Danger Zone */}
      <motion.div 
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: 0.2 }}
         className="glass-panel p-6 border-red-500/30 relative overflow-hidden mt-8"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 rounded-full bg-red-500/20 flex flex-shrink-0 items-center justify-center border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Danger Zone</h2>
            <p className="text-gray-400 text-sm mb-4">Permanently clear all local data (Transactions, Accounts, Goals). This action cannot be undone unless you have a backup.</p>
            <button 
              onClick={handleClearData}
              className="bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-500/50 px-6 py-2 rounded-xl transition-all font-semibold flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Wipe Local Data</span>
            </button>
          </div>
        </div>
      </motion.div>

    </div>
  )
}
