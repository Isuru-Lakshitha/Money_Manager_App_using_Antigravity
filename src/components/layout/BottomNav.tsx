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
    <nav className="md:hidden fixed bottom-4 left-4 right-4 z-50 bg-[#0A0A0A]/80 backdrop-blur-2xl border border-cyan-500/20 shadow-[0_8px_32px_rgba(6,182,212,0.2)] rounded-3xl overflow-hidden pb-safe">
      <div className="flex overflow-x-auto hide-scrollbar px-3 py-2 items-center justify-start gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          
          return (
            <Link key={item.name} href={item.href} className="flex-shrink-0">
              <div
                className={`flex flex-col items-center justify-center w-16 h-14 rounded-2xl relative transition-all ${
                  isActive ? 'text-cyan-400 font-bold' : 'text-gray-500 hover:text-cyan-200'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-active-nav"
                    className="absolute inset-0 bg-cyan-500/20 border border-cyan-400/30 rounded-2xl shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                
                <item.icon className={`w-5 h-5 mb-1 relative z-10 transition-transform ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]' : ''}`} />
                <span className="text-[10px] relative z-10">{item.name}</span>
              </div>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
