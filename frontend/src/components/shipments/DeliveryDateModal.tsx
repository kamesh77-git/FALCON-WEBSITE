import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { updateDeliveryDate } from '@/api/shipments'
import { useToast } from '@/context/ToastContext'

interface Props {
  shipmentId: number
  gcNo: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function DeliveryDateModal({ shipmentId, gcNo, isOpen, onClose, onSuccess }: Props) {
  const [date, setDate] = useState('')
  const [loading, setLoading] = useState(false)
  const { showToast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!date) return
    setLoading(true)
    try {
      await updateDeliveryDate(shipmentId, { deliveryDate: date })
      showToast(`Delivery date set for GC# ${gcNo}`, 'success')
      onSuccess()
      onClose()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      showToast(msg ?? 'Failed to update delivery date', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Mark as Delivered" size="sm">
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <p className="text-sm text-gray-500">Set the delivery date for shipment <strong>{gcNo}</strong>.</p>
        <Input
          label="Delivery Date"
          type="date"
          required
          value={date}
          onChange={e => setDate(e.target.value)}
        />
        <div className="flex justify-end gap-3">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={loading}>Save</Button>
        </div>
      </form>
    </Modal>
  )
}
