import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import GlobalModals from '@/components/layout/GlobalModals'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#0B0F19] flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
      <GlobalModals />
    </div>
  )
}
