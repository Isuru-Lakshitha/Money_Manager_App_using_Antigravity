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
      
      // If the user navigates to the Migration Page directly, don't overwrite the initial state
      if (!pathname.includes('migrate') && mounted) {
        fetchGlobalData()
      }
    }
    
    init()
    
    return () => { mounted = false }
  }, [fetchGlobalData, pathname, router])

  return null
}
