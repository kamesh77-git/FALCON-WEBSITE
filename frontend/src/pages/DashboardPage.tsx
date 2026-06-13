import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, Clock, CheckCircle2, FileCheck2, TrendingUp, Users, ArrowRight } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { canAccessFinance, canManageUsers, formatCurrency, formatDate } from '@/utils'
import { getShipmentsAdmin, getShipmentsFull } from '@/api/shipments'
import { getAllUsers } from '@/api/users'
import StatsCard from '@/components/ui/StatsCard'
import Table from '@/components/ui/Table'
import { StatusBadge } from '@/components/ui/Badge'
import type { Column } from '@/components/ui/Table'
import type { ShipmentAdminResponse, ShipmentFullResponse } from '@/types'

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [shipments, setShipments] = useState<ShipmentAdminResponse[]>([])
  const [userCount, setUserCount] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const load = async () => {
      try {
        const res = canAccessFinance(user.roles)
          ? await getShipmentsFull()
          : await getShipmentsAdmin()
        setShipments(res.data.data as ShipmentAdminResponse[])
        if (canManageUsers(user.roles)) {
          const uRes = await getAllUsers()
          setUserCount(uRes.data.data.length)
        }
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [user])

  const total        = shipments.length
  const notDelivered = shipments.filter(s => s.status === 'NOT_DELIVERED').length
  const delivered    = shipments.filter(s => s.status === 'DELIVERED').length
  const invoiced     = shipments.filter(s => s.status === 'INVOICED').length

  const totalIncome  = canAccessFinance(user?.roles ?? [])
    ? (shipments as unknown as ShipmentFullResponse[]).reduce((s, r) => s + (r.income ?? 0), 0)
    : 0
  const totalFreight = shipments.reduce((s, r) => s + (r.totalFreight ?? 0), 0)

  const recent = [...shipments].reverse().slice(0, 6)

  const recentColumns: Column<ShipmentAdminResponse>[] = [
    { key: 'gcNo',         header: 'GC No',     render: r => <span className="font-bold text-gray-900 text-xs">{r.gcNo}</span> },
    { key: 'customer',     header: 'Customer',  render: r => <span className="font-medium text-gray-700">{r.customer || '—'}</span> },
    { key: 'destination',  header: 'To',        render: r => <span className="text-gray-500">{r.destination || '—'}</span> },
    { key: 'shipmentDate', header: 'Date',      render: r => <span className="text-gray-500">{formatDate(r.shipmentDate)}</span> },
    { key: 'totalFreight', header: 'Freight',   render: r => <span className="font-semibold text-gray-900">{formatCurrency(r.totalFreight)}</span> },
    { key: 'status',       header: 'Status',    render: r => <StatusBadge status={r.status} /> },
  ]

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h2 className="text-lg font-bold text-gray-900">Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋</h2>
        <p className="text-sm text-gray-500 mt-0.5">Here's what's happening with your shipments today.</p>
      </div>

      {/* Primary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          title="Total Shipments"
          value={isLoading ? '—' : total}
          icon={<Package size={20} className="text-primary-600" />}
          iconBg="bg-primary-50"
        />
        <StatsCard
          title="Not Delivered"
          value={isLoading ? '—' : notDelivered}
          icon={<Clock size={20} className="text-amber-600" />}
          iconBg="bg-amber-50"
          subtitle={total ? `${Math.round(notDelivered / total * 100)}% of total` : undefined}
        />
        <StatsCard
          title="Delivered"
          value={isLoading ? '—' : delivered}
          icon={<CheckCircle2 size={20} className="text-green-600" />}
          iconBg="bg-green-50"
        />
        <StatsCard
          title="Invoiced"
          value={isLoading ? '—' : invoiced}
          icon={<FileCheck2 size={20} className="text-purple-600" />}
          iconBg="bg-purple-50"
        />
      </div>

      {/* Finance + users stats */}
      {canAccessFinance(user?.roles ?? []) && (
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${canManageUsers(user?.roles ?? []) && userCount !== null ? 'xl:grid-cols-3' : ''} gap-4`}>
          <StatsCard
            title="Total Freight"
            value={isLoading ? '—' : formatCurrency(totalFreight)}
            icon={<TrendingUp size={20} className="text-blue-600" />}
            iconBg="bg-blue-50"
          />
          <StatsCard
            title="Total Income"
            value={isLoading ? '—' : formatCurrency(totalIncome)}
            icon={<TrendingUp size={20} className="text-emerald-600" />}
            iconBg="bg-emerald-50"
          />
          {canManageUsers(user?.roles ?? []) && userCount !== null && (
            <StatsCard
              title="Team Members"
              value={userCount}
              icon={<Users size={20} className="text-indigo-600" />}
              iconBg="bg-indigo-50"
            />
          )}
        </div>
      )}

      {/* Recent shipments */}
      <div className="bg-white rounded-2xl border border-blue-100 shadow-card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Recent Shipments</h3>
            <p className="text-xs text-gray-400 mt-0.5">Latest {recent.length} entries</p>
          </div>
          <button
            onClick={() => navigate('/shipments')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors cursor-pointer"
          >
            View all <ArrowRight size={13} />
          </button>
        </div>
        <Table
          columns={recentColumns}
          data={recent}
          isLoading={isLoading}
          onRowClick={row => navigate(`/shipments/${row.id}`)}
          emptyMessage="No shipments yet. Create your first shipment."
          emptyIcon={<Package size={36} />}
        />
      </div>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
