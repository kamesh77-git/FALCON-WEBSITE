import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Truck, FileText, Trash2, Calendar, MapPin, Package } from 'lucide-react'
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

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
      <p className={`text-sm font-semibold text-gray-900 ${mono ? 'font-mono' : ''}`}>{value || '—'}</p>
    </div>
  )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-50 bg-gray-50/50">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">{title}</h3>
      </div>
      <div className="p-5">
        {children}
      </div>
    </div>
  )
}

export default function ShipmentDetailPage() {
  const { id }         = useParams<{ id: string }>()
  const navigate       = useNavigate()
  const { user }       = useAuth()
  const { showToast }  = useToast()
  const isFinance      = canAccessFinance(user?.roles ?? [])
  const isCeo          = isCeoAdmin(user?.roles ?? [])

  const [shipment, setShipment]   = useState<ShipmentFullResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showDelivery, setShowDelivery] = useState(false)
  const [showInvoice, setShowInvoice]   = useState(false)
  const [showDelete, setShowDelete]     = useState(false)
  const [isDeleting, setIsDeleting]     = useState(false)

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
    } catch { showToast('Failed to delete', 'error') }
    finally { setIsDeleting(false) }
  }

  if (isLoading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!shipment) return (
    <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
      <Package size={40} className="opacity-30" />
      <p className="text-sm font-medium">Shipment not found</p>
      <button onClick={() => navigate('/shipments')} className="text-sm text-primary-600 font-semibold hover:underline cursor-pointer">
        ← Back to shipments
      </button>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header bar */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/shipments')}
            aria-label="Back"
            className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-bold text-gray-900">GC# {shipment.gcNo}</h2>
              <StatusBadge status={shipment.status} />
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 font-medium">
              <span className="flex items-center gap-1"><Package size={12} /> {shipment.customer}</span>
              {shipment.destination && (
                <span className="flex items-center gap-1"><MapPin size={12} /> {shipment.destination}</span>
              )}
              {shipment.shipmentDate && (
                <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(shipment.shipmentDate)}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {shipment.status === 'NOT_DELIVERED' && (
            <Button variant="secondary" size="sm" leftIcon={<Truck size={14} />} onClick={() => setShowDelivery(true)}>
              Mark Delivered
            </Button>
          )}
          {isFinance && shipment.status === 'DELIVERED' && (
            <Button size="sm" leftIcon={<FileText size={14} />} onClick={() => setShowInvoice(true)}>
              Generate Invoice
            </Button>
          )}
          {isCeo && (
            <Button variant="danger" size="sm" leftIcon={<Trash2 size={14} />} onClick={() => setShowDelete(true)}>
              Delete
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Shipment details */}
        <SectionCard title="Shipment Details">
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            <Field label="Month"          value={shipment.month} />
            <Field label="GC No"          value={shipment.gcNo} mono />
            <Field label="Customer"       value={shipment.customer} />
            <Field label="Destination"    value={shipment.destination} />
            <Field label="Booking Place"  value={shipment.bookingPlace} />
            <Field label="Vendor Name"    value={shipment.vendorName} />
            <Field label="Shipment Date"  value={formatDate(shipment.shipmentDate)} />
            <Field label="Delivery Date"  value={formatDate(shipment.deliveryDate)} />
            <Field label="Truck No"       value={shipment.truckNo} mono />
            <Field label="Truck Type"     value={shipment.truckType} />
          </div>
        </SectionCard>

        {/* Finance details */}
        {isFinance ? (
          <SectionCard title="Finance Details">
            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
              <Field label="Freight"          value={formatCurrency(shipment.freight)} />
              <Field label="Addl. Charges"    value={formatCurrency(shipment.additionalCharges)} />
              <Field label="Total Freight"    value={formatCurrency(shipment.totalFreight)} />
              <Field label="Loading Charge"   value={formatCurrency(shipment.loadingCharge)} />
              <Field label="Vendor Freight"   value={formatCurrency(shipment.vendorFreight)} />
              <Field label="Halt Charge"      value={formatCurrency(shipment.haltCharge)} />
              <Field label="Unloading"        value={formatCurrency(shipment.unloadingCharge)} />
              <Field label="Diesel"           value={formatCurrency(shipment.diesel)} />
              <Field label="RTGS Amount"      value={formatCurrency(shipment.rtgsAmount)} />
              <Field label="RTGS Date"        value={formatDate(shipment.rtgsDate)} />
              <Field label="Mamul"            value={formatCurrency(shipment.mamul)} />
              <Field label="Balance"          value={formatCurrency(shipment.balance)} />
              <div className="col-span-2">
                <Field label="Income"         value={formatCurrency(shipment.income)} />
              </div>
            </div>
          </SectionCard>
        ) : (
          <SectionCard title="Freight Summary">
            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
              <Field label="Freight"         value={formatCurrency(shipment.freight)} />
              <Field label="Addl. Charges"   value={formatCurrency(shipment.additionalCharges)} />
              <Field label="Total Freight"   value={formatCurrency(shipment.totalFreight)} />
            </div>
          </SectionCard>
        )}
      </div>

      {isFinance && shipment.createdByName && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card px-5 py-4 flex items-center gap-4">
          <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
            <span className="text-primary-700 text-xs font-bold">
              {shipment.createdByName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </span>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Created by</p>
            <p className="text-sm font-semibold text-gray-900">{shipment.createdByName}</p>
          </div>
          {shipment.createdAt && (
            <div className="ml-auto text-right">
              <p className="text-xs text-gray-400 font-medium">Created at</p>
              <p className="text-sm font-semibold text-gray-700">{formatDate(shipment.createdAt)}</p>
            </div>
          )}
        </div>
      )}

      <DeliveryDateModal
        shipmentId={shipment.id} gcNo={shipment.gcNo}
        isOpen={showDelivery} onClose={() => setShowDelivery(false)} onSuccess={load}
      />
      {showInvoice && (
        <InvoiceModal
          shipmentId={shipment.id} gcNo={shipment.gcNo}
          customer={shipment.customer} destination={shipment.destination}
          totalFreight={shipment.totalFreight}
          isOpen onClose={() => setShowInvoice(false)} onSuccess={load}
        />
      )}
      <ConfirmDialog
        isOpen={showDelete} title="Delete Shipment"
        message={`Permanently delete GC# ${shipment.gcNo}? This cannot be undone.`}
        confirmLabel="Delete" isDestructive isLoading={isDeleting}
        onConfirm={handleDelete} onCancel={() => setShowDelete(false)}
      />
    </div>
  )
}
