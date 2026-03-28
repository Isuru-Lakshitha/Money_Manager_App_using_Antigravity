"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, TrendingUp, DollarSign, Wallet } from 'lucide-react'
import { useAppStore, Asset } from '@/store'
import { v4 as uuidv4 } from 'uuid'

interface AddAssetModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AddAssetModal({ isOpen, onClose }: AddAssetModalProps) {
  const [symbol, setSymbol] = useState('')
  const [name, setName] = useState('')
  const [assetType, setAssetType] = useState('stock')
  const [quantity, setQuantity] = useState('')
  const [averageBuyPrice, setAverageBuyPrice] = useState('')
  const [loading, setLoading] = useState(false)

  const addAsset = useAppStore(state => state.addAsset)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await addAsset({
        id: uuidv4(),
        symbol: symbol.toUpperCase(),
        name: name || symbol.toUpperCase(), // fallback
        assetType,
        quantity: Number(quantity),
        averageBuyPrice: Number(averageBuyPrice)
      })
      onClose()
    } catch (error: any) {
      console.error(error)
      alert("Failed to save asset: " + (error?.message || "Unknown error. Check Supabase SQL."))
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md glass-panel p-6 rounded-3xl shadow-2xl overflow-hidden border border-cyan-500/30"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 rounded-full blur-[50px] pointer-events-none" />
        
        <div className="flex justify-between items-center mb-6 relative z-10">
          <div>
            <h2 className="text-2xl font-bold text-white">Add Asset</h2>
            <p className="text-sm text-gray-400">Track your crypto or stocks</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Ticker Symbol</label>
              <div className="relative">
                <TrendingUp className="absolute left-3 top-3.5 w-4 h-4 text-cyan-500" />
                <input
                  type="text"
                  required
                  placeholder="BTC, AAPL..."
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 uppercase"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Asset Type</label>
              <select
                value={assetType}
                onChange={(e) => setAssetType(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-[11px] px-4 text-white focus:outline-none focus:border-cyan-500/50 appearance-none"
              >
                <option value="stock">Stock/ETF</option>
                <option value="crypto">Cryptocurrency</option>
                <option value="real_estate">Real Estate</option>
                <option value="other">Other Asset</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Asset Name (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Bitcoin, Apple Inc."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Quantity Owned</label>
              <div className="relative">
                <Wallet className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="0.00"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
             </div>
             
             <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Avg Buy Price (USD)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3.5 w-4 h-4 text-green-400" />
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="0.00"
                  value={averageBuyPrice}
                  onChange={(e) => setAverageBuyPrice(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
             </div>
          </div>

          <div className="pt-4 mt-6 border-t border-white/5">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3.5 rounded-xl transition-all glow-cyan disabled:opacity-50"
            >
              {loading ? 'Securing Asset...' : 'Add to Portfolio'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
