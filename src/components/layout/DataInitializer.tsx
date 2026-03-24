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
         return
      }
      
      // Auto-logout inactivity logic
      let timeoutId: NodeJS.Timeout | undefined
      const resetTimer = () => {
        if (timeoutId) clearTimeout(timeoutId)
        timeoutId = setTimeout(async () => {
          if (!isMockProject) {
             await supabase.auth.signOut()
             router.push('/login')
          }
        }, 15 * 60 * 1000) // 15 minutes of absolute inactivity
      }
      
      window.addEventListener('mousemove', resetTimer)
      window.addEventListener('keydown', resetTimer)
      window.addEventListener('touchstart', resetTimer)
      resetTimer()

      // If the user navigates to the Migration Page directly, don't overwrite the initial state
      if (!pathname.includes('migrate') && mounted) {
        fetchGlobalData()
      }

      return { timeoutId, resetTimer }
    }
    
    let cleanupFuncs: { timeoutId?: NodeJS.Timeout, resetTimer: () => void } | undefined;
    init().then(res => { cleanupFuncs = res })
    
    return () => { 
      mounted = false 
      if (cleanupFuncs) {
        if (cleanupFuncs.timeoutId) clearTimeout(cleanupFuncs.timeoutId)
        window.removeEventListener('mousemove', cleanupFuncs.resetTimer)
        window.removeEventListener('keydown', cleanupFuncs.resetTimer)
        window.removeEventListener('touchstart', cleanupFuncs.resetTimer)
      }
    }
  }, [fetchGlobalData, pathname, router])

  return null
}
