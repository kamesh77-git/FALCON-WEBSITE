import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import ProtectedRoute from '@/components/ProtectedRoute'
import AppLayout from '@/components/layout/AppLayout'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import ShipmentsPage from '@/pages/ShipmentsPage'
import ShipmentDetailPage from '@/pages/ShipmentDetailPage'
import CreateShipmentPage from '@/pages/CreateShipmentPage'
import InvoicesPage from '@/pages/InvoicesPage'
import UsersPage from '@/pages/UsersPage'
import type { ReactNode } from 'react'

function PublicRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return null
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/shipments" element={<ShipmentsPage />} />
        <Route path="/shipments/new" element={<CreateShipmentPage />} />
        <Route path="/shipments/:id" element={<ShipmentDetailPage />} />
        <Route
          path="/invoices"
          element={
            <ProtectedRoute roles={['ROLE_SUPER_ADMIN', 'ROLE_CEO_ADMIN']}>
              <InvoicesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute roles={['ROLE_CEO_ADMIN']}>
              <UsersPage />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
