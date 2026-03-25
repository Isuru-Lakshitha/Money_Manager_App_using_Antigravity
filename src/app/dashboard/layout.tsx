import TopBar from '@/components/layout/TopBar'
import GlobalModals from '@/components/layout/GlobalModals'
import DataInitializer from '@/components/layout/DataInitializer'
import BottomNav from '@/components/layout/BottomNav'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#0B0F19] flex">
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-4 pb-32 md:p-8 md:pl-28 md:pb-8 overflow-y-auto python-scrollbar">
          {children}
        </main>
      </div>
      <BottomNav />
      <GlobalModals />
      <DataInitializer />
    </div>
  )
}
