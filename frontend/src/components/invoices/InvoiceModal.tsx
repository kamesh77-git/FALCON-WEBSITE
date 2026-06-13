import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { createInvoice } from '@/api/invoices'
import { useToast } from '@/context/ToastContext'
import { formatCurrency } from '@/utils'

const schema = z.object({
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  invoiceDate: z.string().min(1, 'Invoice date is required'),
  invoiceAmount: z.preprocess(v => v === '' || v == null ? undefined : Number(v), z.number().optional()),
  remarks: z.string().optional(),
})
type FormData = {
  invoiceNumber: string
  invoiceDate: string
  invoiceAmount?: number
  remarks?: string
}

interface Props {
  shipmentId: number
  gcNo: string
  customer: string
  destination: string
  totalFreight: number
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function InvoiceModal({ shipmentId, gcNo, customer, destination, totalFreight, isOpen, onClose, onSuccess }: Props) {
  const { showToast } = useToast()
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: { invoiceAmount: totalFreight },
  })

  const onSubmit = async (data: FormData) => {
    try {
      await createInvoice(shipmentId, data)
      showToast(`Invoice created for GC# ${gcNo}`, 'success')
      reset()
      onSuccess()
      onClose()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      showToast(msg ?? 'Failed to create invoice', 'error')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generate Invoice" size="md">
      <div className="p-5 space-y-4">
        {/* Shipment summary */}
        <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-3 text-sm">
          <div><p className="text-gray-500">GC No</p><p className="font-medium text-gray-900">{gcNo}</p></div>
          <div><p className="text-gray-500">Customer</p><p className="font-medium text-gray-900">{customer}</p></div>
          <div><p className="text-gray-500">Destination</p><p className="font-medium text-gray-900">{destination}</p></div>
          <div><p className="text-gray-500">Total Freight</p><p className="font-semibold text-primary-600">{formatCurrency(totalFreight)}</p></div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Invoice Number" required error={errors.invoiceNumber?.message} {...register('invoiceNumber')} placeholder="INV-001" />
            <Input label="Invoice Date" type="date" required error={errors.invoiceDate?.message} {...register('invoiceDate')} />
          </div>
          <Input label="Invoice Amount" type="number" step="0.01" error={errors.invoiceAmount?.message} {...register('invoiceAmount')} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Remarks</label>
            <textarea
              {...register('remarks')}
              rows={2}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
              placeholder="Optional remarks..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" isLoading={isSubmitting}>Generate Invoice</Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
