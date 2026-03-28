"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, Activity, Download, Plus, DollarSign, ArrowUpRight, ArrowDownRight, Trash2 } from 'lucide-react'
import { useAppStore } from '@/store'
import AddAssetModal from '@/components/investments/AddAssetModal'

export default function InvestmentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [livePrices, setLivePrices] = useState<Record<string, number>>({})
  const [isFetching, setIsFetching] = useState(true)
  const { assets, deleteAsset } = useAppStore()

  useEffect(() => {
    const fetchPrices = async () => {
      if (assets.length === 0) {
        setIsFetching(false)
        return
      }
      setIsFetching(true)
      try {
        const symbols = Array.from(new Set(assets.map(a => a.symbol)))
        const res = await fetch('/api/prices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ symbols })
        })
        const data = await res.json()
        if (data.prices) {
          setLivePrices(data.prices)
        }
      } catch (error) {
        console.error("Failed to fetch live prices", error)
      } finally {
        setIsFetching(false)
      }
    }
    fetchPrices()
    
    // Auto refresh every 60 seconds
    const interval = setInterval(fetchPrices, 60000)
    return () => clearInterval(interval)
  }, [assets])

  // Calculate totals
  let totalCurrentValue = 0
  let totalInvested = 0

  assets.forEach(asset => {
    const livePrice = livePrices[asset.symbol] || asset.averageBuyPrice
    totalCurrentValue += (livePrice * asset.quantity)
    totalInvested += (asset.averageBuyPrice * asset.quantity)
  })

  const totalGainLoss = totalCurrentValue - totalInvested
  const totalGainLossPercent = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0
  const isPositive = totalGainLoss >= 0

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Investment Portfolio</h1>
          <p className="text-gray-400">Track your diverse assets, stocks, and crypto holdings.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-cyan-500 hover:bg-cyan-400 text-black px-4 py-2 rounded-xl transition-all glow-cyan flex items-center font-semibold hover:scale-105 active:scale-95"
        >
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
          <p className="text-3xl font-bold text-white mb-2 font-numbers">${totalCurrentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <div className="flex items-center text-sm">
             <span className={`font-semibold bg-white/5 px-2 py-0.5 rounded-md flex items-center ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
               {isPositive ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
               {Math.abs(totalGainLossPercent).toFixed(2)}%
             </span>
             <span className="text-gray-500 ml-2">All time return</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-6 relative overflow-hidden group border-purple-500/20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[40px] group-hover:bg-purple-500/20 transition-colors" />
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium tracking-wide text-sm">Total Profit / Loss</h3>
            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
              <Activity className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <p className={`text-3xl font-bold mb-2 font-numbers drop-shadow-lg ${isPositive ? 'text-green-400 glow-green' : 'text-red-400 glow-red'}`}>
             {isPositive ? '+' : '-'}${Math.abs(totalGainLoss).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="flex items-center text-sm">
             <span className="text-gray-500">Based on Global Market Averages</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} 
           onClick={() => alert('Broker API Integration (Robinhood, Binance, etc.) is currently in development and will be available in a future update!')}
           className="glass-panel p-6 flex flex-col items-center justify-center text-center border-dashed border-2 border-white/10 hover:border-cyan-500/50 transition-colors cursor-pointer group hover:bg-cyan-500/5">
           <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
             <Download className="w-6 h-6 text-gray-400 group-hover:text-cyan-400" />
           </div>
           <p className="text-white font-medium">Sync Broker API</p>
           <p className="text-xs text-gray-500 mt-1">Connect Robinhood, Binance, etc.</p>
        </motion.div>
      </div>

      <h2 className="text-xl font-bold text-white mb-4 mt-8 flex items-center">
        Your Assets 
        {isFetching && <span className="ml-3 px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full border border-cyan-500/30 animate-pulse font-semibold">Live Syncing...</span>}
      </h2>

      {assets.length === 0 ? (
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
              onClick={() => setIsModalOpen(true)}
              className="bg-white hover:bg-gray-100 text-black px-6 py-3 rounded-xl transition-all font-bold shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95"
            >
              Manually Add Asset
            </button>
          </motion.div>
        </div>
      ) : (
        <div className="grid gap-4">
          <AnimatePresence>
            {assets.map((asset) => {
              const livePrice = livePrices[asset.symbol] || asset.averageBuyPrice
              const currentValue = livePrice * asset.quantity
              const totalCost = asset.averageBuyPrice * asset.quantity
              const gainLoss = currentValue - totalCost
              const gainLossPercent = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0
              const isProfit = gainLoss >= 0

              return (
                <motion.div
                  key={asset.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="glass-panel p-5 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between group hover:border-cyan-500/30 transition-all duration-300 relative overflow-hidden"
                >
                  {/* Subtle Background Red/Green Indicator */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${isProfit ? 'bg-green-500 glow-green' : 'bg-red-500 glow-red'}`} />

                  <div className="flex items-center space-x-4 mb-4 md:mb-0 ml-2">
                    <div className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center border border-white/5 shrink-0 shadow-lg">
                      <DollarSign className={`w-6 h-6 ${isProfit ? 'text-green-400' : 'text-red-400'}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white uppercase tracking-wider">{asset.symbol}</h3>
                      <p className="text-sm text-gray-400">{asset.name.length > 20 ? asset.name.substring(0, 17) + '...' : asset.name}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 w-full md:w-auto flex-1 md:ml-12 items-center">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Holdings</p>
                      <p className="text-white font-numbers font-medium">{asset.quantity.toLocaleString(undefined, { maximumFractionDigits: 4 })}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Avg Buy</p>
                      <p className="text-white font-numbers font-medium">${asset.averageBuyPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-cyan-400/80 uppercase tracking-widest font-bold mb-1">Live Price</p>
                      <p className="text-cyan-400 font-numbers font-bold text-lg">${livePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <div className="text-right md:pr-10">
                      <p className="text-white font-bold font-numbers text-xl tracking-tight">${currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      <p className={`text-sm font-bold flex items-center justify-end ${isProfit ? 'text-green-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'text-red-400'}`}>
                        {isProfit ? '+' : '-'}${Math.abs(gainLoss).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        <span className="ml-1 opacity-75">({Math.abs(gainLossPercent).toFixed(2)}%)</span>
                      </p>
                    </div>
                  </div>

                  <button 
                    onClick={() => deleteAsset(asset.id)}
                    className="absolute top-4 right-4 md:absolute md:top-1/2 md:-translate-y-1/2 md:right-4 p-2.5 text-red-500/50 hover:text-red-400 bg-red-400/5 hover:bg-red-400/10 rounded-full transition-all md:opacity-0 group-hover:opacity-100 hover:scale-110"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {isModalOpen && (
        <AddAssetModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  )
}
