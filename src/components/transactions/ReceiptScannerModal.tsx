"use client"

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Camera, Upload, ScanLine, CheckCircle2 } from 'lucide-react'
import { useAppStore } from '@/store'

interface Props {
  isOpen: boolean
  onClose: () => void
  onScanComplete: (amount: number, suggestedNotes: string, categoryId?: string, accountId?: string) => void
}

export default function ReceiptScannerModal({ isOpen, onClose, onScanComplete }: Props) {
  const [image, setImage] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [statusText, setStatusText] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const accounts = useAppStore(state => state.accounts)
  const categories = useAppStore(state => state.categories)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const performScan = async () => {
    if (!image) return
    setIsScanning(true)
    setProgress(30)
    setStatusText('Processing Image...')

    try {
      const res = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image })
      })

      if (!res.ok) {
        throw new Error('Scan failed')
      }

      setProgress(80)
      setStatusText('Processing Results...')

      const data = await res.json()
      
      let matchedCategoryId = undefined
      if (data.category && typeof data.category === 'string') {
        const term = data.category.toLowerCase().split(' ')[0]
        const found = categories.find(c => c.name.toLowerCase().includes(term))
        if (found) matchedCategoryId = found.id
      }

      let matchedAccountId = undefined
      if (data.sourceAccount && typeof data.sourceAccount === 'string') {
        const found = accounts.find(c => c.name.toLowerCase().includes(data.sourceAccount.toLowerCase()) || data.sourceAccount.toLowerCase().includes(c.type))
        if (found) matchedAccountId = found.id
      }

      setProgress(100)
      setStatusText('Done!')

      setTimeout(() => {
        setIsScanning(false)
        onScanComplete(Number(data.amount) || 0, data.notes || '', matchedCategoryId, matchedAccountId)
        onClose()
      }, 800)

    } catch (error) {
      console.error(error)
      setStatusText('Error scanning receipt')
      setIsScanning(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="glass-panel w-full max-w-md p-6 relative z-10 border-cyan-500/30"
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors z-20"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-4 relative overflow-hidden">
              {isScanning && (
                <motion.div 
                  initial={{ top: '-10%' }}
                  animate={{ top: '110%' }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="absolute left-0 right-0 h-1 bg-cyan-400 glow-cyan z-10"
                />
              )}
              <ScanLine className="w-8 h-8 text-cyan-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-1">OCR Receipt Scanner</h2>
            <p className="text-sm text-gray-400 text-center">Upload a receipt to automatically extract the total amount.</p>
          </div>

          {!image ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-cyan-500/30 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-cyan-500/5 transition-colors group"
            >
              <Upload className="w-8 h-8 text-gray-400 group-hover:text-cyan-400 mb-2 transition-colors" />
              <p className="text-sm font-semibold text-gray-300">Click to upload receipt</p>
              <p className="text-xs text-gray-500 mt-1">Supports JPG, PNG</p>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="relative rounded-xl overflow-hidden bg-black/50 aspect-[3/4] flex items-center justify-center border border-white/10">
                <img src={image} alt="Receipt" className="object-contain w-full h-full opacity-50" />
                {isScanning && (
                  <motion.div 
                    initial={{ top: '0%' }}
                    animate={{ top: '100%' }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    className="absolute left-0 right-0 h-16 bg-gradient-to-b from-transparent via-cyan-500/20 to-cyan-500/40 border-b-2 border-cyan-400 z-10"
                  />
                )}
              </div>

              {isScanning ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-cyan-400 font-semibold mb-1">
                    <span>{statusText}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className="h-full rounded-full bg-cyan-500 glow-cyan transition-all duration-300"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex space-x-3">
                  <button
                    onClick={() => setImage(null)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white font-semibold py-3 rounded-xl transition-colors"
                  >
                    Retake
                  </button>
                  <button
                    onClick={performScan}
                    className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold py-3 rounded-xl transition-all glow-cyan flex items-center justify-center space-x-2"
                  >
                    <ScanLine className="w-5 h-5" />
                    <span>Scan Now</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
