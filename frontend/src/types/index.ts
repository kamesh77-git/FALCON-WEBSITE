export type ShipmentStatus = 'NOT_DELIVERED' | 'DELIVERED' | 'INVOICED'
export type RoleName = 'ROLE_ADMIN' | 'ROLE_SUPER_ADMIN' | 'ROLE_CEO_ADMIN'

// ─── Auth ───────────────────────────────────────────────────────────────────

export interface AuthUser {
  token: string
  email: string
  name: string
  roles: RoleName[]
}

export interface LoginRequest {
  email: string
  password: string
}

// ─── API Wrapper ─────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  timestamp?: string
}

// ─── Users ───────────────────────────────────────────────────────────────────

export interface UserResponse {
  id: number
  name: string
  email: string
  isActive: boolean
  roles: RoleName[]
  createdAt: string
}

export interface CreateUserRequest {
  name: string
  email: string
  password: string
  role: RoleName
}

export interface UpdateUserRequest {
  name?: string
  email?: string
}

export interface UpdateUserRoleRequest {
  role: RoleName
}

// ─── Shipments ───────────────────────────────────────────────────────────────

export interface ShipmentAdminResponse {
  id: number
  month: string
  customer: string
  bookingPlace: string
  vendorName: string
  shipmentDate: string | null
  truckNo: string
  gcNo: string
  deliveryDate: string | null
  destination: string
  truckType: string
  freight: number
  additionalCharges: number
  totalFreight: number
  status: ShipmentStatus
}

export interface ShipmentFinanceResponse {
  id: number
  gcNo: string
  customer: string
  destination: string
  totalFreight: number
  loadingCharge: number
  vendorFreight: number
  haltCharge: number
  unloadingCharge: number
  diesel: number
  rtgsAmount: number
  rtgsDate: string | null
  mamul: number
  balance: number
  income: number
  status: ShipmentStatus
}

export interface ShipmentFullResponse {
  id: number
  month: string
  customer: string
  bookingPlace: string
  vendorName: string
  shipmentDate: string | null
  truckNo: string
  gcNo: string
  deliveryDate: string | null
  destination: string
  truckType: string
  freight: number
  additionalCharges: number
  totalFreight: number
  loadingCharge: number
  vendorFreight: number
  haltCharge: number
  unloadingCharge: number
  diesel: number
  rtgsAmount: number
  rtgsDate: string | null
  mamul: number
  balance: number
  income: number
  status: ShipmentStatus
  createdByName: string
  createdAt: string
  updatedAt: string
}

export interface ShipmentAdminRequest {
  month: string
  customer: string
  bookingPlace?: string
  vendorName?: string
  shipmentDate?: string
  truckNo?: string
  gcNo: string
  destination?: string
  truckType?: string
  freight?: number
  additionalCharges?: number
  totalFreight?: number
}

export interface ShipmentFinanceRequest {
  loadingCharge?: number
  vendorFreight?: number
  haltCharge?: number
  unloadingCharge?: number
  diesel?: number
  rtgsAmount?: number
  rtgsDate?: string
  mamul?: number
  balance?: number
  income?: number
}

export interface ShipmentFullRequest extends ShipmentAdminRequest, ShipmentFinanceRequest {
  deliveryDate?: string
}

export interface DeliveryDateUpdateRequest {
  deliveryDate: string
}

// ─── Invoices ─────────────────────────────────────────────────────────────────

export interface InvoiceResponse {
  id: number
  invoiceNumber: string
  shipmentId: number
  gcNo: string
  invoiceDate: string
  invoiceAmount: number
  remarks: string
  generatedByName: string
  createdAt: string
  customer: string
  destination: string
  totalFreight: number
}

export interface InvoiceRequest {
  invoiceNumber: string
  invoiceDate: string
  invoiceAmount?: number
  remarks?: string
}
