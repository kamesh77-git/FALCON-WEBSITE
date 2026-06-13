import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Eye, Truck, FileText, Trash2, Package } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { canAccessFinance, isCeoAdmin, formatCurrency, formatDate } from '@/utils'
import {
  getShipmentsAdmin, getNotDeliveredAdmin, getDeliveredAdmin,
  getShipmentsFull, getNotDeliveredFull, getDeliveredFull,
  getShipmentsFinance,
  deleteShipment,
} from '@/api/shipments'
import Button from '@/components/ui/Button'
import Table from '@/components/ui/Table'
import type { Column } from '@/components/ui/Table'
import { StatusBadge } from '@/components/ui/Badge'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import DeliveryDateModal from '@/components/shipments/DeliveryDateModal'
import InvoiceModal from '@/components/invoices/InvoiceModal'
import { useToast } from '@/context/ToastContext'
import type { ShipmentAdminResponse, ShipmentFinanceResponse, ShipmentFullResponse } from '@/types'

type Filter = 'all' | 'not-delivered' | 'delivered' | 'finance'

export default function ShipmentsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [filter, setFilter] = useState<Filter>('all')
  const [shipments, setShipments] = useState<ShipmentAdminResponse[]>([])
  const [financeShipments, setFinanceShipments] = useState<ShipmentFinanceResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [deliveryModal, setDeliveryModal] = useState<{ id: number; gcNo: string } | null>(null)
  const [invoiceModal, setInvoiceModal] = useState<ShipmentAdminResponse | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const isFinance = canAccessFinance(user?.roles ?? [])
  const isCeo = isCeoAdmin(user?.roles ?? [])

  const load = async () => {
    if (!user) return
    setIsLoading(true)
    try {
      if (filter === 'finance') {
        const res = await getShipmentsFinance()
        setFinanceShipments(res.data.data)
      } else {
        let res
        if (isFinance) {
          res = filter === 'not-delivered' ? await getNotDeliveredFull()
             : filter === 'delivered'     ? await getDeliveredFull()
             : await getShipmentsFull()
        } else {
          res = filter === 'not-delivered' ? await getNotDeliveredAdmin()
             : filter === 'delivered'     ? await getDeliveredAdmin()
             : await getShipmentsAdmin()
        }
        setShipments(res.data.data as ShipmentAdminResponse[])
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { load() }, [filter, user])

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      await deleteShipment(deleteId)
      showToast('Shipment deleted', 'success')
      setDeleteId(null)
      load()
    } catch {
      showToast('Failed to delete shipment', 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  const actionsCol: Column<ShipmentAdminResponse> = {
    key: 'actions',
    header: 'Actions',
    className: 'w-32',
    render: row => (
      <div className="flex items-center gap-1">
        <button onClick={() => navigate(`/shipments/${row.id}`)} title="View" className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
          <Eye size={15} />
        </button>
        {row.status === 'NOT_DELIVERED' && (
          <button onClick={() => setDeliveryModal({ id: row.id, gcNo: row.gcNo })} title="Mark Delivered" className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
            <Truck size={15} />
          </button>
        )}
        {isFinance && row.status === 'DELIVERED' && (
          <button onClick={() => setInvoiceModal(row)} title="Generate Invoice" className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <FileText size={15} />
          </button>
        )}
        {isCeo && (
          <button onClick={() => setDeleteId(row.id)} title="Delete" className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 size={15} />
          </button>
        )}
      </div>
    ),
  }

  const baseColumns: Column<ShipmentAdminResponse>[] = [
    { key: 'month', header: 'Month', render: r => r.month || '—' },
    { key: 'gcNo', header: 'GC No', render: r => <span className="font-medium text-gray-900">{r.gcNo}</span> },
    { key: 'customer', header: 'Customer' },
    { key: 'destination', header: 'Destination' },
    { key: 'shipmentDate', header: 'Shipment Date', render: r => formatDate(r.shipmentDate) },
    { key: 'truckNo', header: 'Truck No' },
    { key: 'totalFreight', header: 'Total Freight', render: r => formatCurrency(r.totalFreight) },
    { key: 'status', header: 'Status', render: r => <StatusBadge status={r.status} /> },
  ]

  const financeExtraColumns: Column<ShipmentAdminResponse>[] = [
    { key: 'income', header: 'Income', render: r => formatCurrency((r as unknown as ShipmentFullResponse).income) },
    { key: 'balance', header: 'Balance', render: r => formatCurrency((r as unknown as ShipmentFullResponse).balance) },
  ]

  const financeOnlyColumns: Column<ShipmentFinanceResponse>[] = [
    { key: 'gcNo', header: 'GC No', render: r => <span className="font-medium">{r.gcNo}</span> },
    { key: 'customer', header: 'Customer' },
    { key: 'destination', header: 'Destination' },
    { key: 'totalFreight', header: 'Total Freight', render: r => formatCurrency(r.totalFreight) },
    { key: 'vendorFreight', header: 'Vendor Freight', render: r => formatCurrency(r.vendorFreight) },
    { key: 'loadingCharge', header: 'Loading', render: r => formatCurrency(r.loadingCharge) },
    { key: 'unloadingCharge', header: 'Unloading', render: r => formatCurrency(r.unloadingCharge) },
    { key: 'diesel', header: 'Diesel', render: r => formatCurrency(r.diesel) },
    { key: 'income', header: 'Income', render: r => formatCurrency(r.income) },
    { key: 'balance', header: 'Balance', render: r => formatCurrency(r.balance) },
    { key: 'status', header: 'Status', render: r => <StatusBadge status={r.status} /> },
  ]

  const columns = isFinance && filter !== 'finance'
    ? [...baseColumns, ...financeExtraColumns, actionsCol]
    : [...baseColumns, actionsCol]

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'not-delivered', label: 'Not Delivered' },
    { key: 'delivered', label: 'Delivered' },
    ...(isFinance ? [{ key: 'finance' as Filter, label: 'Finance View' }] : []),
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f.key ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <Button leftIcon={<Plus size={16} />} onClick={() => navigate('/shipments/new')}>
          Add Shipment
        </Button>
      </div>

      {filter === 'finance' ? (
        <Table
          columns={financeOnlyColumns}
          data={financeShipments}
          isLoading={isLoading}
          emptyMessage="No shipments found"
          emptyIcon={<Package size={40} />}
        />
      ) : (
        <Table
          columns={columns}
          data={shipments}
          isLoading={isLoading}
          onRowClick={row => navigate(`/shipments/${row.id}`)}
          emptyMessage="No shipments found"
          emptyIcon={<Package size={40} />}
        />
      )}

      {deliveryModal && (
        <DeliveryDateModal
          shipmentId={deliveryModal.id}
          gcNo={deliveryModal.gcNo}
          isOpen
          onClose={() => setDeliveryModal(null)}
          onSuccess={load}
        />
      )}

      {invoiceModal && (
        <InvoiceModal
          shipmentId={invoiceModal.id}
          gcNo={invoiceModal.gcNo}
          customer={invoiceModal.customer}
          destination={invoiceModal.destination}
          totalFreight={invoiceModal.totalFreight}
          isOpen
          onClose={() => setInvoiceModal(null)}
          onSuccess={load}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Shipment"
        message="This action cannot be undone. The shipment record will be permanently deleted."
        confirmLabel="Delete"
        isDestructive
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
