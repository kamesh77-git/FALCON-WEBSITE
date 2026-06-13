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

const filterConfig: { key: Filter; label: string }[] = [
  { key: 'all',           label: 'All' },
  { key: 'not-delivered', label: 'Not Delivered' },
  { key: 'delivered',     label: 'Delivered' },
]

export default function ShipmentsPage() {
  const { user }        = useAuth()
  const navigate        = useNavigate()
  const { showToast }   = useToast()
  const [filter, setFilter]               = useState<Filter>('all')
  const [shipments, setShipments]         = useState<ShipmentAdminResponse[]>([])
  const [financeRows, setFinanceRows]     = useState<ShipmentFinanceResponse[]>([])
  const [isLoading, setIsLoading]         = useState(true)
  const [deliveryModal, setDeliveryModal] = useState<{ id: number; gcNo: string } | null>(null)
  const [invoiceModal, setInvoiceModal]   = useState<ShipmentAdminResponse | null>(null)
  const [deleteId, setDeleteId]           = useState<number | null>(null)
  const [isDeleting, setIsDeleting]       = useState(false)

  const isFinance = canAccessFinance(user?.roles ?? [])
  const isCeo     = isCeoAdmin(user?.roles ?? [])

  const filters = [
    ...filterConfig,
    ...(isFinance ? [{ key: 'finance' as Filter, label: 'Finance View' }] : []),
  ]

  const load = async () => {
    if (!user) return
    setIsLoading(true)
    try {
      if (filter === 'finance') {
        const res = await getShipmentsFinance()
        setFinanceRows(res.data.data)
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
    } catch { showToast('Failed to delete', 'error') }
    finally { setIsDeleting(false) }
  }

  const ActionBtn = ({ title, onClick, color }: { title: string; onClick: () => void; color: string }) => (
    <button
      onClick={e => { e.stopPropagation(); onClick() }}
      title={title}
      aria-label={title}
      className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors duration-150 cursor-pointer ${color}`}
    >
      {title === 'View'             && <Eye      size={14} />}
      {title === 'Mark Delivered'   && <Truck    size={14} />}
      {title === 'Generate Invoice' && <FileText size={14} />}
      {title === 'Delete'           && <Trash2   size={14} />}
    </button>
  )

  const actionsCol: Column<ShipmentAdminResponse> = {
    key: 'actions', header: 'Actions', className: 'w-36',
    render: row => (
      <div className="flex items-center gap-0.5">
        <ActionBtn title="View" onClick={() => navigate(`/shipments/${row.id}`)} color="text-gray-400 hover:text-primary-600 hover:bg-primary-50" />
        {row.status === 'NOT_DELIVERED' && (
          <ActionBtn title="Mark Delivered" onClick={() => setDeliveryModal({ id: row.id, gcNo: row.gcNo })} color="text-gray-400 hover:text-green-700 hover:bg-green-50" />
        )}
        {isFinance && row.status === 'DELIVERED' && (
          <ActionBtn title="Generate Invoice" onClick={() => setInvoiceModal(row)} color="text-gray-400 hover:text-blue-600 hover:bg-blue-50" />
        )}
        {isCeo && (
          <ActionBtn title="Delete" onClick={() => setDeleteId(row.id)} color="text-gray-400 hover:text-red-600 hover:bg-red-50" />
        )}
      </div>
    ),
  }

  const baseColumns: Column<ShipmentAdminResponse>[] = [
    { key: 'month',        header: 'Month',    render: r => <span className="text-gray-500 text-xs font-medium">{r.month || '—'}</span> },
    { key: 'gcNo',         header: 'GC No',    render: r => <span className="font-bold text-gray-900 text-xs">{r.gcNo}</span> },
    { key: 'customer',     header: 'Customer', render: r => <span className="font-semibold text-gray-800">{r.customer}</span> },
    { key: 'destination',  header: 'Destination' },
    { key: 'shipmentDate', header: 'Date',     render: r => formatDate(r.shipmentDate) },
    { key: 'truckNo',      header: 'Truck No', render: r => <span className="text-gray-500 font-mono text-xs">{r.truckNo || '—'}</span> },
    { key: 'totalFreight', header: 'Freight',  render: r => <span className="font-semibold text-gray-900">{formatCurrency(r.totalFreight)}</span> },
    { key: 'status',       header: 'Status',   render: r => <StatusBadge status={r.status} /> },
  ]

  const financeExtraCols: Column<ShipmentAdminResponse>[] = [
    { key: 'income',  header: 'Income',  render: r => <span className="font-semibold text-green-700">{formatCurrency((r as unknown as ShipmentFullResponse).income)}</span> },
    { key: 'balance', header: 'Balance', render: r => <span className="font-semibold">{formatCurrency((r as unknown as ShipmentFullResponse).balance)}</span> },
  ]

  const financeOnlyColumns: Column<ShipmentFinanceResponse>[] = [
    { key: 'gcNo',            header: 'GC No',         render: r => <span className="font-bold text-xs">{r.gcNo}</span> },
    { key: 'customer',        header: 'Customer' },
    { key: 'destination',     header: 'Destination' },
    { key: 'totalFreight',    header: 'Total Freight', render: r => formatCurrency(r.totalFreight) },
    { key: 'vendorFreight',   header: 'Vendor',        render: r => formatCurrency(r.vendorFreight) },
    { key: 'loadingCharge',   header: 'Loading',       render: r => formatCurrency(r.loadingCharge) },
    { key: 'unloadingCharge', header: 'Unloading',     render: r => formatCurrency(r.unloadingCharge) },
    { key: 'diesel',          header: 'Diesel',        render: r => formatCurrency(r.diesel) },
    { key: 'income',          header: 'Income',        render: r => <span className="font-semibold text-green-700">{formatCurrency(r.income)}</span> },
    { key: 'balance',         header: 'Balance',       render: r => formatCurrency(r.balance) },
    { key: 'status',          header: 'Status',        render: r => <StatusBadge status={r.status} /> },
  ]

  const columns = isFinance && filter !== 'finance'
    ? [...baseColumns, ...financeExtraCols, actionsCol]
    : [...baseColumns, actionsCol]

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 p-1 bg-white border border-gray-200 rounded-xl shadow-card">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 cursor-pointer ${
                filter === f.key
                  ? 'bg-primary-600 text-white shadow-button'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <Button leftIcon={<Plus size={15} />} onClick={() => navigate('/shipments/new')}>
          New Shipment
        </Button>
      </div>

      {/* Count label */}
      <p className="text-xs text-gray-400 font-medium">
        {isLoading ? 'Loading…' : `${filter === 'finance' ? financeRows.length : shipments.length} record${(filter === 'finance' ? financeRows.length : shipments.length) !== 1 ? 's' : ''}`}
      </p>

      {filter === 'finance' ? (
        <Table columns={financeOnlyColumns} data={financeRows} isLoading={isLoading}
          emptyMessage="No shipments" emptyIcon={<Package size={36} />} />
      ) : (
        <Table columns={columns} data={shipments} isLoading={isLoading}
          onRowClick={row => navigate(`/shipments/${row.id}`)}
          emptyMessage="No shipments found" emptyIcon={<Package size={36} />} />
      )}

      {deliveryModal && (
        <DeliveryDateModal
          shipmentId={deliveryModal.id} gcNo={deliveryModal.gcNo}
          isOpen onClose={() => setDeliveryModal(null)} onSuccess={load}
        />
      )}
      {invoiceModal && (
        <InvoiceModal
          shipmentId={invoiceModal.id} gcNo={invoiceModal.gcNo}
          customer={invoiceModal.customer} destination={invoiceModal.destination}
          totalFreight={invoiceModal.totalFreight}
          isOpen onClose={() => setInvoiceModal(null)} onSuccess={load}
        />
      )}
      <ConfirmDialog
        isOpen={!!deleteId} title="Delete Shipment"
        message="This will permanently delete the shipment record and cannot be undone."
        confirmLabel="Delete" isDestructive isLoading={isDeleting}
        onConfirm={handleDelete} onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
