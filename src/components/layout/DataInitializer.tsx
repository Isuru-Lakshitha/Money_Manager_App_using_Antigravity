"use client"

import { useEffect } from 'react'
import { useAppStore } from '@/store'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function DataInitializer() {
  const fetchGlobalData = useAppStore(state => state.fetchGlobalData)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    let mounted = true
    
    const init = async () => {
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      const isMockProject = process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://mockproject.supabase.co'
      
      if (!data.user && !isMockProject) {
         if (mounted) router.push('/login')
         return { resetTimer: () => {} }
      }
      
      // Security: Verify existing cross-tab inactivity BEFORE resetting timer on refresh
      const existingLastActive = parseInt(localStorage.getItem('voidledger_last_active') || '0')
      if (existingLastActive > 0 && Date.now() - existingLastActive > 5 * 60 * 1000) {
         if (!isMockProject) {
            await supabase.auth.signOut()
            localStorage.removeItem('voidledger_last_active')
            router.push('/login')
            return { resetTimer: () => {} } // Security lock aborts init
         }
      }

      // Auto-logout robust global inactivity logic (5 Min)
      localStorage.setItem('voidledger_last_active', Date.now().toString())
      const checkInterval = setInterval(async () => {
         const lastActive = parseInt(localStorage.getItem('voidledger_last_active') || '0')
         if (lastActive > 0 && Date.now() - lastActive > 5 * 60 * 1000) {
            if (!isMockProject) {
               await supabase.auth.signOut()
               localStorage.removeItem('voidledger_last_active')
               router.push('/login')
            }
         }
      }, 30000) // check every 30 seconds
      
      const resetTimer = () => {
         localStorage.setItem('voidledger_last_active', Date.now().toString())
      }
      
      window.addEventListener('mousemove', resetTimer)
      window.addEventListener('keydown', resetTimer)
      window.addEventListener('touchstart', resetTimer)

      // If the user navigates to the Migration Page directly, don't overwrite the initial state
      if (!pathname.includes('migrate') && mounted) {
        fetchGlobalData()
      }

      return { checkInterval, resetTimer }
    }
    
    let cleanupFuncs: { checkInterval?: NodeJS.Timeout, resetTimer: () => void } | undefined;
    init().then(res => { cleanupFuncs = res })
    
    return () => { 
      mounted = false 
      if (cleanupFuncs) {
        if (cleanupFuncs.checkInterval) clearInterval(cleanupFuncs.checkInterval)
        window.removeEventListener('mousemove', cleanupFuncs.resetTimer)
        window.removeEventListener('keydown', cleanupFuncs.resetTimer)
        window.removeEventListener('touchstart', cleanupFuncs.resetTimer)
      }
    }
  }, [fetchGlobalData, pathname, router])

  return null
}
