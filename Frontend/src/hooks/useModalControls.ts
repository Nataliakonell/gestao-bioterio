import { useState, useCallback } from "react"

/**
 * Hook padrao para modais clinicos/consulta.
 * Centraliza `saving` + `showCancelModal` + logica de dirty->confirm.
 * `isDirty` vem de fora (cada modal calcula diferente).
 */
export function useModalControls(isDirty: boolean, onClose: () => void) {
  const [saving, setSaving] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)

  const handleAttemptClose = useCallback(() => {
    if (isDirty) setShowCancelModal(true)
    else onClose()
  }, [isDirty, onClose])

  const handleConfirmCancel = useCallback(() => {
    setShowCancelModal(false)
    onClose()
  }, [onClose])

  const closeCancelModal = useCallback(() => setShowCancelModal(false), [])

  return {
    saving,
    setSaving,
    showCancelModal,
    setShowCancelModal,
    handleAttemptClose,
    handleConfirmCancel,
    closeCancelModal,
  }
}
