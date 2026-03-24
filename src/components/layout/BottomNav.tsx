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
  Search,
  FileText,
  Settings
} from 'lucide-react'

const navItems = [
  { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Transact', href: '/dashboard/transactions', icon: ArrowLeftRight },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Accounts', href: '/dashboard/accounts', icon: Wallet },
  { name: 'Loans', href: '/dashboard/loans', icon: Banknote },
  { name: 'Search', href: '/dashboard/search', icon: Search },
  { name: 'Reports', href: '/dashboard/reports', icon: FileText },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-white/10 pb-safe">
      <div className="flex overflow-x-auto hide-scrollbar px-2 py-2 items-center justify-start gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          
          return (
            <Link key={item.name} href={item.href} className="flex-shrink-0">
              <div
                className={`flex flex-col items-center justify-center w-16 h-14 rounded-2xl relative transition-all ${
                  isActive ? 'text-cyan-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-active-nav"
                    className="absolute inset-0 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl glow-blue"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                
                <item.icon className="w-5 h-5 mb-1 relative z-10" />
                <span className="text-[10px] font-medium relative z-10">{item.name}</span>
              </div>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
