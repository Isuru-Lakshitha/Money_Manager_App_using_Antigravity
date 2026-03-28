"use client"

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X, Send, Bot, User, Loader2 } from 'lucide-react'
import { useAppStore } from '@/store'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am **Void**, your AI Economist. Ask me anything about your current balances, spending habits, or financial goals!' }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Grab real-time data from global store to feed the AI
  const { transactions, accounts, goals, baseCurrency } = useAppStore()

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setIsLoading(true)

    // Compress financial context to avoid blowing up token limits
    const safeTransactions = transactions.slice(0, 100).map(t => ({
      amount: t.amount,
      type: t.type,
      date: t.date,
      category_id: t.category_id,
      notes: t.notes
    }))

    const contextObject = {
      currency: baseCurrency,
      accounts: accounts.map(a => ({ name: a.name, type: a.type, balance: a.balance })),
      goals: goals.map(g => ({ name: g.name, target: g.targetAmount, current: g.currentAmount, deadline: g.deadline })),
      recent_100_transactions: safeTransactions
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMsg }],
          financialContext: JSON.stringify(contextObject)
        })
      })

      const data = await res.json()
      
      if (!res.ok) {
         setMessages(prev => [...prev, { role: 'assistant', content: `**Error:** ${data.error || 'Failed to reach AI server.'}` }])
      } else {
         setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: '**Error:** Network issue occurred.' }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-50">
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, y: [0, -10, 0] }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ 
                duration: 0.5, 
                type: 'spring',
                y: { repeat: Infinity, duration: 3, ease: 'easeInOut' } 
              }}
              onClick={() => setIsOpen(true)}
              className="w-14 h-14 md:w-16 md:h-16 bg-cyan-500 rounded-full flex items-center justify-center glow-cyan hover:scale-110 active:scale-95 transition-transform shadow-[0_0_30px_rgba(6,182,212,0.5)] z-50 border-2 border-cyan-300/50"
            >
              <Bot className="w-8 h-8 text-black" />
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', bounce: 0.3 }}
              className="absolute bottom-0 right-0 w-[calc(100vw-32px)] md:w-[400px] h-[550px] max-h-[80vh] glass-panel border border-cyan-500/30 rounded-3xl overflow-hidden flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50"
            >
              {/* Header */}
              <div className="bg-black/60 backdrop-blur-md border-b border-white/10 p-4 flex justify-between items-center z-10">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
                    <Bot className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold tracking-wide">Void Assistant</h3>
                    <p className="text-cyan-400/80 text-xs font-semibold flex items-center">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 mr-1.5 animate-pulse" /> Online
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Chat Log */}
              <div className="flex-1 overflow-y-auto python-scrollbar p-4 space-y-4 bg-gradient-to-b from-transparent to-black/40">
                {messages.map((m, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring' }}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] rounded-2xl p-3.5 text-sm leading-relaxed ${
                      m.role === 'user' 
                        ? 'bg-cyan-500/20 border border-cyan-500/30 text-white rounded-tr-none' 
                        : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-none hover:bg-white/10 transition-colors'
                    }`}>
                      {m.role === 'assistant' ? (
                        <div className="whitespace-pre-wrap">
                          {m.content}
                        </div>
                      ) : (
                        m.content
                      )}
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none p-4 flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                      <span className="text-gray-400 text-sm">Void is analyzing...</span>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-black/60 backdrop-blur-xl border-t border-white/10">
                <form onSubmit={handleSend} className="relative flex items-center">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about your finances..."
                    disabled={isLoading}
                    className="w-full bg-white/5 border border-white/10 focus:border-cyan-500/50 rounded-full py-3 pl-4 pr-12 text-sm text-white placeholder-gray-500 focus:outline-none transition-all disabled:opacity-50"
                  />
                  <button 
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="absolute right-2 p-2 bg-cyan-500 hover:bg-cyan-400 text-black rounded-full disabled:opacity-50 transition-colors glow-cyan disabled:shadow-none"
                  >
                    <Send className="w-4 h-4 translate-x-px -translate-y-px" />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
