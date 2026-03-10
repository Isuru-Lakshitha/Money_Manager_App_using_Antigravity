"use client"

import TransactionModal from '@/components/transactions/TransactionModal'
import { useAppStore } from '@/store'

export default function GlobalModals() {
  const isGlobalTxModalOpen = useAppStore(state => state.isGlobalTxModalOpen)
  const setGlobalTxModalOpen = useAppStore(state => state.setGlobalTxModalOpen)
  const globalTxToEdit = useAppStore(state => state.globalTxToEdit)
  const setGlobalTxToEdit = useAppStore(state => state.setGlobalTxToEdit)

  const handleClose = () => {
    setGlobalTxModalOpen(false)
    // Delay clearing the edit state so animation finishes smoothly
    setTimeout(() => {
      setGlobalTxToEdit(null)
    }, 300)
  }

  return (
    <>
      <TransactionModal 
        isOpen={isGlobalTxModalOpen} 
        onClose={handleClose} 
        transactionToEdit={globalTxToEdit}
      />
    </>
  )
}
