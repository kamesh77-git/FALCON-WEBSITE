import axiosInstance from './axiosInstance'
import type {
  ApiResponse,
  DeliveryDateUpdateRequest,
  ShipmentAdminRequest,
  ShipmentAdminResponse,
  ShipmentFinanceRequest,
  ShipmentFinanceResponse,
  ShipmentFullRequest,
  ShipmentFullResponse,
} from '@/types'

// Admin endpoints
export const getShipmentsAdmin = () =>
  axiosInstance.get<ApiResponse<ShipmentAdminResponse[]>>('/api/shipments/admin')
export const getNotDeliveredAdmin = () =>
  axiosInstance.get<ApiResponse<ShipmentAdminResponse[]>>('/api/shipments/not-delivered/admin')
export const getDeliveredAdmin = () =>
  axiosInstance.get<ApiResponse<ShipmentAdminResponse[]>>('/api/shipments/delivered/admin')
export const getShipmentByIdAdmin = (id: number) =>
  axiosInstance.get<ApiResponse<ShipmentAdminResponse>>(`/api/shipments/admin/${id}`)
export const createShipmentAdmin = (data: ShipmentAdminRequest) =>
  axiosInstance.post<ApiResponse<ShipmentAdminResponse>>('/api/shipments/admin', data)
export const updateDeliveryDate = (id: number, data: DeliveryDateUpdateRequest) =>
  axiosInstance.patch<ApiResponse<ShipmentAdminResponse>>(`/api/shipments/${id}/delivery-date`, data)
export const deleteShipment = (id: number) =>
  axiosInstance.delete<ApiResponse<null>>(`/api/shipments/${id}`)

// Full endpoints (SUPER_ADMIN+)
export const getShipmentsFull = () =>
  axiosInstance.get<ApiResponse<ShipmentFullResponse[]>>('/api/shipments/full')
export const getNotDeliveredFull = () =>
  axiosInstance.get<ApiResponse<ShipmentFullResponse[]>>('/api/shipments/not-delivered/full')
export const getDeliveredFull = () =>
  axiosInstance.get<ApiResponse<ShipmentFullResponse[]>>('/api/shipments/delivered/full')
export const getShipmentByIdFull = (id: number) =>
  axiosInstance.get<ApiResponse<ShipmentFullResponse>>(`/api/shipments/full/${id}`)
export const createShipmentFull = (data: ShipmentFullRequest) =>
  axiosInstance.post<ApiResponse<ShipmentFullResponse>>('/api/shipments/full', data)
export const updateShipmentFull = (id: number, data: ShipmentFullRequest) =>
  axiosInstance.put<ApiResponse<ShipmentFullResponse>>(`/api/shipments/${id}/full`, data)

// Finance endpoints (SUPER_ADMIN+)
export const getShipmentsFinance = () =>
  axiosInstance.get<ApiResponse<ShipmentFinanceResponse[]>>('/api/shipments/finance')
export const getNotDeliveredFinance = () =>
  axiosInstance.get<ApiResponse<ShipmentFinanceResponse[]>>('/api/shipments/not-delivered/finance')
export const getDeliveredFinance = () =>
  axiosInstance.get<ApiResponse<ShipmentFinanceResponse[]>>('/api/shipments/delivered/finance')
export const getShipmentByIdFinance = (id: number) =>
  axiosInstance.get<ApiResponse<ShipmentFinanceResponse>>(`/api/shipments/finance/${id}`)
export const updateShipmentFinance = (id: number, data: ShipmentFinanceRequest) =>
  axiosInstance.put<ApiResponse<ShipmentFinanceResponse>>(`/api/shipments/${id}/finance`, data)
