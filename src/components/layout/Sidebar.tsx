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
  Wallet
} from 'lucide-react'

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Transactions', href: '/dashboard/transactions', icon: ArrowLeftRight },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Accounts', href: '/dashboard/accounts', icon: Wallet },
  { name: 'Goals', href: '/dashboard/goals', icon: Target },
  { name: 'Reports', href: '/dashboard/reports', icon: FileText },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 glass-panel border-l-0 border-y-0 border-r border-white/5 hidden md:flex flex-col h-screen sticky top-0">
      <div className="p-6 flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 rounded-xl glass flex items-center justify-center glow-cyan">
          <span className="text-cyan-400 font-bold text-xl">M</span>
        </div>
        <span className="text-white font-bold text-lg tracking-wide select-none">MoneyManager</span>
      </div>

      <div className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href

          return (
            <Link key={item.name} href={item.href}>
              <div
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all relative group overflow-hidden ${isActive
                    ? 'text-cyan-400 font-semibold'
                    : 'text-gray-400 hover:text-white'
                  }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav"
                    className="absolute inset-0 bg-cyan-500/10 border border-cyan-500/20 rounded-xl glow-blue"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                <item.icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-cyan-400' : 'group-hover:text-cyan-400 transition-colors'}`} />
                <span className="relative z-10">{item.name}</span>
              </div>
            </Link>
          )
        })}
      </div>

    </aside>
  )
}
