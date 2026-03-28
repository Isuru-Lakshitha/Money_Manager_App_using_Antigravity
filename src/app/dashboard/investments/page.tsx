"use client"

import { motion } from 'framer-motion'
import { TrendingUp, PieChart, Activity, Download, Plus, DollarSign, Bitcoin, LineChart } from 'lucide-react'

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
          <p className="text-3xl font-bold text-white mb-2 font-numbers">$142,500.00</p>
          <div className="flex items-center text-sm">
             <span className="text-green-400 font-semibold bg-green-400/10 px-2 py-0.5 rounded-md flex items-center">
               <TrendingUp className="w-3 h-3 mr-1" /> +12.5%
             </span>
             <span className="text-gray-500 ml-2">All time</span>
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
          <p className="text-3xl font-bold text-white mb-2 font-numbers">+$1,240.50</p>
          <div className="flex items-center text-sm">
             <span className="text-green-400 font-semibold bg-green-400/10 px-2 py-0.5 rounded-md flex items-center">
               <TrendingUp className="w-3 h-3 mr-1" /> +0.8%
             </span>
             <span className="text-gray-500 ml-2">Today</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel p-6 flex flex-col items-center justify-center text-center border-dashed border-2 border-white/10 hover:border-cyan-500/50 transition-colors cursor-pointer group">
           <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
             <Download className="w-6 h-6 text-gray-400 group-hover:text-cyan-400" />
           </div>
           <p className="text-white font-medium">Sync Broker API</p>
           <p className="text-xs text-gray-500 mt-1">Connect Robinhood, Binance, etc.</p>
        </motion.div>
      </div>

      {/* Placeholder Assets List */}
      <h2 className="text-xl font-bold text-white mb-4 mt-8">Your Assets</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { name: 'S&P 500 Index ETF', symbol: 'VOO', amount: '$45,200', change: '+1.2%', up: true, icon: LineChart },
          { name: 'Bitcoin', symbol: 'BTC', amount: '$62,400', change: '+5.4%', up: true, icon: Bitcoin },
          { name: 'Apple Inc.', symbol: 'AAPL', amount: '$15,800', change: '-0.4%', up: false, icon: DollarSign },
          { name: 'Real Estate Fund', symbol: 'VNQ', amount: '$19,100', change: '+0.1%', up: true, icon: PieChart },
        ].map((asset, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + (i * 0.1) }} className="glass-panel p-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer group">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/5 group-hover:bg-cyan-500/10 transition-colors">
                 <asset.icon className="w-6 h-6 text-gray-300 group-hover:text-cyan-400 transition-colors" />
              </div>
              <div>
                <p className="text-white font-bold">{asset.symbol}</p>
                <p className="text-xs text-gray-400">{asset.name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white font-numbers font-medium">{asset.amount}</p>
              <p className={`text-xs font-semibold mt-1 ${asset.up ? 'text-green-400' : 'text-red-400'}`}>{asset.change}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
