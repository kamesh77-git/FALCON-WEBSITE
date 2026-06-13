import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Truck, FileText, Trash2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { canAccessFinance, isCeoAdmin, formatCurrency, formatDate } from '@/utils'
import { getShipmentByIdAdmin, getShipmentByIdFull, deleteShipment } from '@/api/shipments'
import Button from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/Badge'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import DeliveryDateModal from '@/components/shipments/DeliveryDateModal'
import InvoiceModal from '@/components/invoices/InvoiceModal'
import { useToast } from '@/context/ToastContext'
import type { ShipmentFullResponse } from '@/types'

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="mt-0.5 text-sm text-gray-900 font-medium">{value}</p>
    </div>
  )
}

export default function ShipmentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showToast } = useToast()
  const isFinance = canAccessFinance(user?.roles ?? [])
  const isCeo = isCeoAdmin(user?.roles ?? [])

  const [shipment, setShipment] = useState<ShipmentFullResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showDelivery, setShowDelivery] = useState(false)
  const [showInvoice, setShowInvoice] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const load = async () => {
    if (!id) return
    setIsLoading(true)
    try {
      const res = isFinance
        ? await getShipmentByIdFull(Number(id))
        : await getShipmentByIdAdmin(Number(id))
      setShipment(res.data.data as ShipmentFullResponse)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  const handleDelete = async () => {
    if (!shipment) return
    setIsDeleting(true)
    try {
      await deleteShipment(shipment.id)
      showToast('Shipment deleted', 'success')
      navigate('/shipments')
    } catch {
      showToast('Failed to delete shipment', 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!shipment) {
    return <div className="text-center py-20 text-gray-500">Shipment not found</div>
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/shipments')} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-900">GC# {shipment.gcNo}</h2>
              <StatusBadge status={shipment.status} />
            </div>
            <p className="text-sm text-gray-500">{shipment.customer} · {shipment.destination}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {shipment.status === 'NOT_DELIVERED' && (
            <Button variant="secondary" size="sm" leftIcon={<Truck size={15} />} onClick={() => setShowDelivery(true)}>
              Mark Delivered
            </Button>
          )}
          {isFinance && shipment.status === 'DELIVERED' && (
            <Button size="sm" leftIcon={<FileText size={15} />} onClick={() => setShowInvoice(true)}>
              Generate Invoice
            </Button>
          )}
          {isCeo && (
            <Button variant="danger" size="sm" leftIcon={<Trash2 size={15} />} onClick={() => setShowDelete(true)}>
              Delete
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Admin details */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-100">Shipment Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Month" value={shipment.month || '—'} />
            <Field label="GC No" value={shipment.gcNo} />
            <Field label="Customer" value={shipment.customer} />
            <Field label="Destination" value={shipment.destination || '—'} />
            <Field label="Booking Place" value={shipment.bookingPlace || '—'} />
            <Field label="Vendor Name" value={shipment.vendorName || '—'} />
            <Field label="Shipment Date" value={formatDate(shipment.shipmentDate)} />
            <Field label="Delivery Date" value={formatDate(shipment.deliveryDate)} />
            <Field label="Truck No" value={shipment.truckNo || '—'} />
            <Field label="Truck Type" value={shipment.truckType || '—'} />
            <Field label="Freight" value={formatCurrency(shipment.freight)} />
            <Field label="Additional Charges" value={formatCurrency(shipment.additionalCharges)} />
            <Field label="Total Freight" value={formatCurrency(shipment.totalFreight)} />
            {isFinance && <Field label="Created By" value={(shipment as ShipmentFullResponse).createdByName || '—'} />}
          </div>
        </div>

        {/* Finance details (SUPER_ADMIN+) */}
        {isFinance && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-100">Finance Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Loading Charge" value={formatCurrency(shipment.loadingCharge)} />
              <Field label="Vendor Freight" value={formatCurrency(shipment.vendorFreight)} />
              <Field label="Halt Charge" value={formatCurrency(shipment.haltCharge)} />
              <Field label="Unloading Charge" value={formatCurrency(shipment.unloadingCharge)} />
              <Field label="Diesel" value={formatCurrency(shipment.diesel)} />
              <Field label="RTGS Amount" value={formatCurrency(shipment.rtgsAmount)} />
              <Field label="RTGS Date" value={formatDate(shipment.rtgsDate)} />
              <Field label="Mamul" value={formatCurrency(shipment.mamul)} />
              <Field label="Balance" value={formatCurrency(shipment.balance)} />
              <Field label="Income" value={formatCurrency(shipment.income)} />
            </div>
          </div>
        )}
      </div>

      <DeliveryDateModal
        shipmentId={shipment.id}
        gcNo={shipment.gcNo}
        isOpen={showDelivery}
        onClose={() => setShowDelivery(false)}
        onSuccess={load}
      />

      {showInvoice && (
        <InvoiceModal
          shipmentId={shipment.id}
          gcNo={shipment.gcNo}
          customer={shipment.customer}
          destination={shipment.destination}
          totalFreight={shipment.totalFreight}
          isOpen
          onClose={() => setShowInvoice(false)}
          onSuccess={load}
        />
      )}

      <ConfirmDialog
        isOpen={showDelete}
        title="Delete Shipment"
        message={`Permanently delete shipment GC# ${shipment.gcNo}? This cannot be undone.`}
        confirmLabel="Delete"
        isDestructive
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  )
}
