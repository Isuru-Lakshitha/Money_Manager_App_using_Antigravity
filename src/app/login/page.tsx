"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Wallet, Mail, Lock } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'reset'>('login')
  const [error, setError] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()
  
  // Listen for Password Recovery events (User clicks link in email)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMode('reset')
      }
    })
    return () => subscription.unsubscribe()
  }, [supabase.auth])

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMsg(null)
    
    try {
      // Mock bypass for local testing without a real Supabase backend
      const isMockProject = process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://mockproject.supabase.co';
      if (isMockProject) {
        sessionStorage.setItem('voidledger_tab_session', '1');
        localStorage.setItem('voidledger_last_active', Date.now().toString());
        setTimeout(() => {
          router.push('/dashboard');
        }, 500);
        return;
      }

      if (mode === 'reset') {
        const { error } = await supabase.auth.updateUser({ password })
        if (error) throw error
        sessionStorage.setItem('voidledger_tab_session', '1');
        localStorage.setItem('voidledger_last_active', Date.now().toString());
        setMsg("Password successfully updated. Going to Dashboard...")
        setTimeout(() => window.location.href = '/dashboard', 1500)
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + '/login',
        })
        if (error) throw error
        setMsg("Password reset link sent to your email! Check your inbox.")
      } else if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        sessionStorage.setItem('voidledger_tab_session', '1');
        localStorage.setItem('voidledger_last_active', Date.now().toString());
        setMsg("Authentication successful. Redirecting...")
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 800)
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        sessionStorage.setItem('voidledger_tab_session', '1');
        localStorage.setItem('voidledger_last_active', Date.now().toString());
        setMsg("Account created! Redirecting...")
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 800)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://mockproject.supabase.co') {
        setLoading(false)
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel w-full max-w-md p-8 relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center glow-cyan mb-4">
            <Wallet className="w-8 h-8 text-cyan-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Money Manager</h1>
          <p className="text-gray-400 text-sm focus:outline-none">Sign in to your financial universe</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {mode !== 'reset' && (
            <div>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                  required
                />
              </div>
            </div>
          )}
          {mode !== 'forgot' && (
            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  placeholder={mode === 'reset' ? "New Password" : "Password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all flex-1"
                  required
                />
              </div>
            </div>
          )}

          {msg && (
            <div className="text-green-400 text-sm bg-green-400/10 p-3 rounded-lg border border-green-400/20 text-center">
              {msg}
            </div>
          )}

          {error && (
            <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg border border-red-400/20 text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold py-3 rounded-xl transition-all glow-cyan disabled:opacity-50"
          >
            {loading ? 'Processing...' : (mode === 'reset' ? 'Update Password' : (mode as string) === 'forgot' ? 'Send Reset Link' : mode === 'login' ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        {mode !== 'reset' && (
          <div className="mt-6 flex flex-col items-center space-y-3">
            <button
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-gray-400 hover:text-cyan-400 text-sm transition-colors"
            >
              {mode === 'login' ? "Don't have an account? Sign up" : mode === 'signup' ? "Already have an account? Sign in" : "Back to Sign In"}
            </button>
            <button
              onClick={() => setMode('forgot')}
              className={`text-gray-500 hover:text-cyan-400 text-xs transition-colors ${(mode as string) === 'forgot' ? 'hidden' : 'block'}`}
            >
              Forgot your password?
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}
