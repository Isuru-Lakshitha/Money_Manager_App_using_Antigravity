"use client"

import { Search, Bell, Plus, User, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/store'

export default function TopBar() {
  const setGlobalTxModalOpen = useAppStore(state => state.setGlobalTxModalOpen)
  const setGlobalTxToEdit = useAppStore(state => state.setGlobalTxToEdit)
  const globalSearchTerm = useAppStore(state => state.globalSearchTerm)
  const setGlobalSearchTerm = useAppStore(state => state.setGlobalSearchTerm)

  return (
    <header className="h-20 border-b border-white/5 glass-panel rounded-none flex items-center justify-between px-8 sticky top-0 z-40">

      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-hover:text-cyan-400 transition-colors" />
          <input
            type="text"
            value={globalSearchTerm}
            onChange={(e) => setGlobalSearchTerm(e.target.value)}
            placeholder="Search transactions by name, category, account..."
            className="w-full bg-black/40 border border-white/10 rounded-full py-2.5 pl-12 pr-10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-sans"
          />
          <AnimatePresence>
            {globalSearchTerm && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setGlobalSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                title="Clear Search"
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-6 ml-4">

        {/* Add Transaction Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setGlobalTxToEdit(null)
            setGlobalTxModalOpen(true)
          }}
          className="bg-cyan-500 hover:bg-cyan-400 text-black px-4 py-2 rounded-full font-semibold flex items-center space-x-2 glow-cyan transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Add Transaction</span>
        </motion.button>

        <div className="flex items-center space-x-4 border-l border-white/10 pl-6">
          <button className="relative text-gray-400 hover:text-white transition-colors">
            <Bell className="w-5 h-5" />
          </button>

          <button className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-500 p-0.5 glow-blue overflow-hidden cursor-pointer">
            <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-gray-300" />
            </div>
          </button>
        </div>

      </div>
    </header>
  )
}
