"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
    <nav className="fixed bottom-4 left-4 right-4 md:right-auto md:left-6 md:top-1/2 md:-translate-y-1/2 md:bottom-auto z-50 bg-[#0A0A0A]/90 backdrop-blur-xl border border-cyan-500/20 shadow-[0_8px_32px_rgba(6,182,212,0.2)] rounded-2xl md:rounded-[32px] overflow-hidden pb-safe md:pb-0 transition-transform duration-500">
      <div className="flex flex-row md:flex-col overflow-x-auto hide-scrollbar px-1 md:px-2 py-1.5 md:py-4 items-center justify-between md:justify-center gap-1 md:gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          
          return (
            <Link key={item.name} href={item.href} className="flex-shrink-0 group">
              <div
                title={item.name}
                className={`flex flex-col items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-xl relative transition-all duration-300 ${
                  isActive ? 'text-cyan-400 font-bold' : 'text-gray-500 hover:text-cyan-200'
                }`}
              >
                <div
                  className={`absolute inset-0 bg-cyan-500/20 border border-cyan-400/30 rounded-xl md:rounded-2xl shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}
                />
                
                <item.icon className={`w-5 h-5 md:w-6 md:h-6 relative z-10 transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]' : 'group-hover:-translate-y-1 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.3)]'}`} />
              </div>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
