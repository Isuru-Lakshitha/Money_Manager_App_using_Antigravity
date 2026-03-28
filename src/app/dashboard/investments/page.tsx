"use client"

import { motion } from 'framer-motion'
import { TrendingUp, Activity, Download, Plus } from 'lucide-react'

export default function InvestmentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Investment Portfolio</h1>
          <p className="text-gray-400">Track your diverse assets, stocks, and crypto holdings.</p>
        </div>
        <button className="bg-cyan-500 hover:bg-cyan-400 text-black px-4 py-2 rounded-xl transition-all glow-cyan flex items-center font-semibold">
          <Plus className="w-5 h-5 mr-1" />
          <span className="hidden sm:inline">Add Asset</span>
        </button>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 relative overflow-hidden group border-cyan-500/20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-[40px] group-hover:bg-cyan-500/20 transition-colors" />
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium tracking-wide text-sm">Total Portfolio</h3>
            <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white mb-2 font-numbers">$0.00</p>
          <div className="flex items-center text-sm">
             <span className="text-gray-400 font-semibold bg-white/5 px-2 py-0.5 rounded-md flex items-center">
               <TrendingUp className="w-3 h-3 mr-1" /> 0.0%
             </span>
             <span className="text-gray-500 ml-2">Empty state</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-6 relative overflow-hidden group border-purple-500/20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[40px] group-hover:bg-purple-500/20 transition-colors" />
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium tracking-wide text-sm">Day's Gain/Loss</h3>
            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
              <Activity className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white mb-2 font-numbers">$0.00</p>
          <div className="flex items-center text-sm">
             <span className="text-gray-400 font-semibold bg-white/5 px-2 py-0.5 rounded-md flex items-center">
               <TrendingUp className="w-3 h-3 mr-1" /> 0.0%
             </span>
             <span className="text-gray-500 ml-2">Empty state</span>
          </div>
        </motion.div>

        <motion.div 
           initial={{ opacity: 0, y: 20 }} 
           animate={{ opacity: 1, y: 0 }} 
           transition={{ delay: 0.2 }} 
           onClick={() => alert('Broker API Integration (Robinhood, Binance, etc.) is currently in development and will be available in a future update!')}
           className="glass-panel p-6 flex flex-col items-center justify-center text-center border-dashed border-2 border-white/10 hover:border-cyan-500/50 transition-colors cursor-pointer group hover:bg-cyan-500/5"
        >
           <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
             <Download className="w-6 h-6 text-gray-400 group-hover:text-cyan-400" />
           </div>
           <p className="text-white font-medium">Sync Broker API</p>
           <p className="text-xs text-gray-500 mt-1">Connect Robinhood, Binance, etc.</p>
        </motion.div>
      </div>

      {/* Empty State / Coming Soon */}
      <h2 className="text-xl font-bold text-white mb-4 mt-8">Your Assets</h2>
      <div className="glass-panel p-10 flex flex-col items-center justify-center text-center border-dashed border-2 border-white/5 rounded-3xl pb-16">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ type: "spring", bounce: 0.5, delay: 0.3 }}
          className="w-24 h-24 rounded-full bg-cyan-500/10 flex items-center justify-center mb-6"
        >
          <Activity className="w-12 h-12 text-cyan-400 opacity-80" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h3 className="text-2xl font-bold text-white mb-2">No Assets Tracked Yet</h3>
          <p className="text-gray-400 px-4 md:px-0 max-w-sm mb-8 mx-auto leading-relaxed">
            Your portfolio is completely clean. Connect your broker APIs or add your first stock, crypto, or real-estate asset manually to visualize your growth.
          </p>
          <button 
            onClick={() => alert('Manual Asset entering is coming soon! Check back on the next update.')}
            className="bg-white hover:bg-gray-100 text-black px-6 py-3 rounded-xl transition-all font-bold shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95"
          >
            Manually Add Asset
          </button>
        </motion.div>
      </div>
    </div>
  )
}
