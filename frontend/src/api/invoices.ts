import axiosInstance from './axiosInstance'
import type { ApiResponse, InvoiceRequest, InvoiceResponse } from '@/types'

export const getAllInvoices = () =>
  axiosInstance.get<ApiResponse<InvoiceResponse[]>>('/api/invoices')
export const getInvoiceById = (id: number) =>
  axiosInstance.get<ApiResponse<InvoiceResponse>>(`/api/invoices/${id}`)
export const createInvoice = (shipmentId: number, data: InvoiceRequest) =>
  axiosInstance.post<ApiResponse<InvoiceResponse>>(`/api/invoices/shipment/${shipmentId}`, data)
