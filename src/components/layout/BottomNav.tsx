"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  ArrowLeftRight,
  BarChart3,
  Wallet,
  Banknote,
  Target,
  Search,
  FileText,
  Settings,
  TrendingUp
} from 'lucide-react'

const navItems = [
  { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Transact', href: '/dashboard/transactions', icon: ArrowLeftRight },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Accounts', href: '/dashboard/accounts', icon: Wallet },
  { name: 'Loans', href: '/dashboard/loans', icon: Banknote },
  { name: 'Goals', href: '/dashboard/goals', icon: Target },
  { name: 'Invest', href: '/dashboard/investments', icon: TrendingUp },
  { name: 'Search', href: '/dashboard/search', icon: Search },
  { name: 'Reports', href: '/dashboard/reports', icon: FileText },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 md:right-auto md:left-6 md:top-1/2 md:-translate-y-1/2 md:translate-x-0 md:bottom-auto bg-black/40 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-[2rem] overflow-hidden max-w-[95vw]">
      <div className="flex flex-row md:flex-col overflow-x-auto overflow-y-hidden hide-scrollbar px-3 py-3 md:px-4 md:py-6 items-center gap-2 snap-x snap-mandatory">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          
          return (
            <Link key={item.name} href={item.href} className="flex-shrink-0 relative group snap-center" title={item.name}>
              <motion.div
                whileHover={{ scale: 1.15, y: -2 }}
                whileTap={{ scale: 0.9 }}
                className={`flex flex-col items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-2xl relative z-10 transition-colors duration-300 ${
                  isActive ? 'text-white font-bold' : 'text-gray-500 group-hover:text-cyan-300'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="mac-dock-pill"
                    className="absolute inset-0 bg-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.4)] border border-cyan-400/30 rounded-2xl md:rounded-[1.25rem] z-0"
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  />
                )}
                
                <item.icon className={`w-5 h-5 md:w-6 md:h-6 relative z-10 transition-transform duration-300 ${isActive ? 'drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]' : ''}`} />
              </motion.div>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
