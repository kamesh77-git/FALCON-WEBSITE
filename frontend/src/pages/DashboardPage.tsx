import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, Clock, CheckCircle, FileCheck, TrendingUp, Users } from 'lucide-react'
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
        const [shipRes] = await Promise.all([
          canAccessFinance(user.roles) ? getShipmentsFull() : getShipmentsAdmin(),
        ])
        setShipments(shipRes.data.data as ShipmentAdminResponse[])

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

  const total = shipments.length
  const notDelivered = shipments.filter(s => s.status === 'NOT_DELIVERED').length
  const delivered = shipments.filter(s => s.status === 'DELIVERED').length
  const invoiced = shipments.filter(s => s.status === 'INVOICED').length

  const totalIncome = canAccessFinance(user?.roles ?? [])
    ? (shipments as unknown as ShipmentFullResponse[]).reduce((sum, s) => sum + (s.income ?? 0), 0)
    : 0
  const totalFreight = shipments.reduce((sum, s) => sum + (s.totalFreight ?? 0), 0)

  const recent = [...shipments].reverse().slice(0, 5)

  const recentColumns: Column<ShipmentAdminResponse>[] = [
    { key: 'gcNo', header: 'GC No', render: r => <span className="font-medium text-gray-900">{r.gcNo}</span> },
    { key: 'customer', header: 'Customer' },
    { key: 'destination', header: 'Destination' },
    { key: 'shipmentDate', header: 'Date', render: r => formatDate(r.shipmentDate) },
    { key: 'totalFreight', header: 'Freight', render: r => formatCurrency(r.totalFreight) },
    { key: 'status', header: 'Status', render: r => <StatusBadge status={r.status} /> },
  ]

  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Shipments"
          value={isLoading ? '...' : total}
          icon={<Package size={22} className="text-primary-600" />}
          iconBg="bg-primary-50"
        />
        <StatsCard
          title="Not Delivered"
          value={isLoading ? '...' : notDelivered}
          icon={<Clock size={22} className="text-amber-600" />}
          iconBg="bg-amber-50"
        />
        <StatsCard
          title="Delivered"
          value={isLoading ? '...' : delivered}
          icon={<CheckCircle size={22} className="text-green-600" />}
          iconBg="bg-green-50"
        />
        {canAccessFinance(user?.roles ?? []) ? (
          <StatsCard
            title="Invoiced"
            value={isLoading ? '...' : invoiced}
            icon={<FileCheck size={22} className="text-purple-600" />}
            iconBg="bg-purple-50"
          />
        ) : (
          <StatsCard
            title="Invoiced"
            value={isLoading ? '...' : invoiced}
            icon={<FileCheck size={22} className="text-purple-600" />}
            iconBg="bg-purple-50"
          />
        )}
      </div>

      {/* Finance + Users stats (SUPER_ADMIN+) */}
      {canAccessFinance(user?.roles ?? []) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatsCard
            title="Total Freight"
            value={isLoading ? '...' : formatCurrency(totalFreight)}
            icon={<TrendingUp size={22} className="text-blue-600" />}
            iconBg="bg-blue-50"
          />
          <StatsCard
            title="Total Income"
            value={isLoading ? '...' : formatCurrency(totalIncome)}
            icon={<TrendingUp size={22} className="text-green-600" />}
            iconBg="bg-green-50"
          />
          {canManageUsers(user?.roles ?? []) && userCount !== null && (
            <StatsCard
              title="Team Members"
              value={userCount}
              icon={<Users size={22} className="text-indigo-600" />}
              iconBg="bg-indigo-50"
            />
          )}
        </div>
      )}

      {/* Recent shipments */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Recent Shipments</h3>
          <button onClick={() => navigate('/shipments')} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            View all →
          </button>
        </div>
        <Table
          columns={recentColumns}
          data={recent}
          isLoading={isLoading}
          onRowClick={row => navigate(`/shipments/${row.id}`)}
          emptyMessage="No shipments yet"
          emptyIcon={<Package size={40} />}
        />
      </div>
    </div>
  )
}
