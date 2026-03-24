"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  ArrowLeftRight,
  BarChart3,
  Target,
  PieChart,
  FileText,
  Settings,
  Wallet,
  Search,
  Banknote
} from 'lucide-react'

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Transactions', href: '/dashboard/transactions', icon: ArrowLeftRight },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Accounts', href: '/dashboard/accounts', icon: Wallet },
  { name: 'Loans', href: '/dashboard/loans', icon: Banknote },
  { name: 'Advanced Search', href: '/dashboard/search', icon: Search },
  { name: 'Reports', href: '/dashboard/reports', icon: FileText },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-72 bg-[#050505]/95 backdrop-blur-xl border-r border-cyan-900/30 hidden md:flex flex-col h-screen sticky top-0 shadow-[4px_0_24px_rgba(6,182,212,0.05)]">
      <div className="p-8 flex items-center space-x-4 mb-2">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)]">
          <span className="text-cyan-400 font-black text-2xl tracking-tighter">M</span>
        </div>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 font-black text-xl tracking-widest uppercase select-none">VoidLedger</span>
      </div>

      <div className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href

          return (
            <Link key={item.name} href={item.href}>
              <div
                className={`flex items-center space-x-4 px-6 py-4 transition-all relative group overflow-hidden ${isActive
                    ? 'text-cyan-300 font-bold'
                    : 'text-gray-500 hover:text-gray-200'
                  }`}
              >
                {isActive && (
                  <>
                    <motion.div
                      layoutId="active-nav-bg"
                      className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                    <motion.div 
                      layoutId="active-nav-border"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,1)]"
                    />
                  </>
                )}

                <item.icon className={`w-5 h-5 relative z-10 transition-transform duration-300 ${isActive ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] scale-110' : 'group-hover:text-cyan-500 group-hover:scale-110'}`} />
                <span className="relative z-10 tracking-wide text-sm">{item.name}</span>
              </div>
            </Link>
          )
        })}
      </div>

    </aside>
  )
}
