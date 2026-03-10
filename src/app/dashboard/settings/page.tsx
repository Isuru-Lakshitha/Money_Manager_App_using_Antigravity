"use client"

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Download, Upload, AlertTriangle, FileJson, FileSpreadsheet, Trash2 } from 'lucide-react'
import { useAppStore } from '@/store'

export default function SettingsPage() {
  const store = useAppStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' })

  const handleExportJSON = () => {
    const data = {
      transactions: store.transactions,
      accounts: store.accounts,
      goals: store.goals,
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

  const handleExportCSV = () => {
    // Basic CSV Export for Transactions
    const headers = ['ID', 'Type', 'Amount', 'Fee', 'Account ID', 'To Account ID', 'Date', 'Notes']
    const rows = store.transactions.map(t => [
      t.id, t.type, t.amount.toString(), (t.fee_amount || 0).toString(), t.account_id, t.to_account_id || '', t.date, `"${t.notes || ''}"`
    ])
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `moneymanager_transactions_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const result = event.target?.result as string
        const parsed = JSON.parse(result)

        if (parsed.transactions && parsed.accounts && parsed.goals) {
          store.setTransactions(parsed.transactions)
          store.setAccounts(parsed.accounts)
          store.setGoals(parsed.goals)
          if (parsed.categories) store.setCategories(parsed.categories)
          
          setImportStatus({ type: 'success', message: 'Data successfully restored!' })
        } else {
          throw new Error('Invalid backup file format.')
        }
      } catch (error) {
        setImportStatus({ type: 'error', message: 'Failed to parse JSON file. Ensure it is a valid MoneyManager backup.' })
      }
    }
    reader.readAsText(file)
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClearData = () => {
    const confirmPrompt = window.prompt("Type 'DELETE' to confirm wiping all your data. This cannot be undone.")
    if (confirmPrompt === 'DELETE') {
      store.setTransactions([])
      store.setAccounts([])
      store.setGoals([])
      setImportStatus({ type: 'success', message: 'All data has been permanently cleared.' })
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
              onClick={handleExportCSV}
              className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 px-4 py-3 rounded-xl transition-all font-semibold flex items-center justify-center space-x-2"
            >
              <FileSpreadsheet className="w-5 h-5 text-green-400" />
              <span>Export Transactions to Excel (.csv)</span>
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
