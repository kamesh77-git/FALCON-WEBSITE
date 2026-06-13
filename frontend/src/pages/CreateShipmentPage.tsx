import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { canAccessFinance } from '@/utils'
import { createShipmentAdmin, createShipmentFull } from '@/api/shipments'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { useToast } from '@/context/ToastContext'

const fullSchema = z.object({
  month: z.string().min(1, 'Month is required'),
  customer: z.string().min(1, 'Customer is required'),
  bookingPlace: z.string().optional(),
  vendorName: z.string().optional(),
  shipmentDate: z.string().optional(),
  truckNo: z.string().optional(),
  gcNo: z.string().min(1, 'GC No is required'),
  destination: z.string().optional(),
  truckType: z.string().optional(),
  freight: z.preprocess(v => v === '' || v == null ? undefined : Number(v), z.number().optional()),
  additionalCharges: z.preprocess(v => v === '' || v == null ? undefined : Number(v), z.number().optional()),
  totalFreight: z.preprocess(v => v === '' || v == null ? undefined : Number(v), z.number().optional()),
  deliveryDate: z.string().optional(),
  loadingCharge: z.preprocess(v => v === '' || v == null ? undefined : Number(v), z.number().optional()),
  vendorFreight: z.preprocess(v => v === '' || v == null ? undefined : Number(v), z.number().optional()),
  haltCharge: z.preprocess(v => v === '' || v == null ? undefined : Number(v), z.number().optional()),
  unloadingCharge: z.preprocess(v => v === '' || v == null ? undefined : Number(v), z.number().optional()),
  diesel: z.preprocess(v => v === '' || v == null ? undefined : Number(v), z.number().optional()),
  rtgsAmount: z.preprocess(v => v === '' || v == null ? undefined : Number(v), z.number().optional()),
  rtgsDate: z.string().optional(),
  mamul: z.preprocess(v => v === '' || v == null ? undefined : Number(v), z.number().optional()),
  balance: z.preprocess(v => v === '' || v == null ? undefined : Number(v), z.number().optional()),
  income: z.preprocess(v => v === '' || v == null ? undefined : Number(v), z.number().optional()),
})

type FormData = {
  month: string
  customer: string
  gcNo: string
  bookingPlace?: string
  vendorName?: string
  shipmentDate?: string
  truckNo?: string
  destination?: string
  truckType?: string
  freight?: number
  additionalCharges?: number
  totalFreight?: number
  deliveryDate?: string
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

const truckTypes = [
  { value: 'Full Load', label: 'Full Load' },
  { value: 'Part Load', label: 'Part Load' },
  { value: 'Open', label: 'Open' },
  { value: 'Container', label: 'Container' },
]

export default function CreateShipmentPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const isFinance = canAccessFinance(user?.roles ?? [])
  const [activeTab, setActiveTab] = useState<'admin' | 'finance'>('admin')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(fullSchema) as any,
  })

  const onSubmit = async (data: FormData) => {
    try {
      if (isFinance) {
        await createShipmentFull(data)
      } else {
        await createShipmentAdmin({
          month: data.month,
          customer: data.customer,
          gcNo: data.gcNo,
          bookingPlace: data.bookingPlace,
          vendorName: data.vendorName,
          shipmentDate: data.shipmentDate,
          truckNo: data.truckNo,
          destination: data.destination,
          truckType: data.truckType,
          freight: data.freight,
          additionalCharges: data.additionalCharges,
          totalFreight: data.totalFreight,
        })
      }
      showToast('Shipment created successfully', 'success')
      navigate('/shipments')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      showToast(msg ?? 'Failed to create shipment', 'error')
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/shipments')} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-900">New Shipment</h2>
          <p className="text-sm text-gray-500">Fill in the shipment details below</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        {isFinance && (
          <div className="flex border-b border-gray-100 px-5 pt-4">
            {(['admin', 'finance'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px capitalize ${
                  activeTab === tab ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'admin' ? 'Shipment Details' : 'Finance Details'}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-5">
          {(!isFinance || activeTab === 'admin') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input label="Month" required error={errors.month?.message} {...register('month')} placeholder="e.g. Jan 2025" />
              <Input label="Customer" required error={errors.customer?.message} {...register('customer')} placeholder="Customer name" />
              <Input label="GC No" required error={errors.gcNo?.message} {...register('gcNo')} placeholder="GC number" />
              <Input label="Booking Place" {...register('bookingPlace')} placeholder="City" />
              <Input label="Vendor Name" {...register('vendorName')} placeholder="Vendor" />
              <Input label="Shipment Date" type="date" {...register('shipmentDate')} />
              <Input label="Truck No" {...register('truckNo')} placeholder="MH XX 0000" />
              <Input label="Destination" {...register('destination')} placeholder="Destination city" />
              <Select label="Truck Type" options={truckTypes} placeholder="Select type" {...register('truckType')} />
              <Input label="Freight (₹)" type="number" step="0.01" {...register('freight')} placeholder="0.00" />
              <Input label="Additional Charges (₹)" type="number" step="0.01" {...register('additionalCharges')} placeholder="0.00" />
              <Input label="Total Freight (₹)" type="number" step="0.01" {...register('totalFreight')} placeholder="0.00" />
            </div>
          )}

          {isFinance && activeTab === 'finance' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input label="Delivery Date" type="date" {...register('deliveryDate')} />
              <Input label="Loading Charge (₹)" type="number" step="0.01" {...register('loadingCharge')} placeholder="0.00" />
              <Input label="Vendor Freight (₹)" type="number" step="0.01" {...register('vendorFreight')} placeholder="0.00" />
              <Input label="Halt Charge (₹)" type="number" step="0.01" {...register('haltCharge')} placeholder="0.00" />
              <Input label="Unloading Charge (₹)" type="number" step="0.01" {...register('unloadingCharge')} placeholder="0.00" />
              <Input label="Diesel (₹)" type="number" step="0.01" {...register('diesel')} placeholder="0.00" />
              <Input label="RTGS Amount (₹)" type="number" step="0.01" {...register('rtgsAmount')} placeholder="0.00" />
              <Input label="RTGS Date" type="date" {...register('rtgsDate')} />
              <Input label="Mamul (₹)" type="number" step="0.01" {...register('mamul')} placeholder="0.00" />
              <Input label="Balance (₹)" type="number" step="0.01" {...register('balance')} placeholder="0.00" />
              <Input label="Income (₹)" type="number" step="0.01" {...register('income')} placeholder="0.00" />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <Button variant="secondary" type="button" onClick={() => navigate('/shipments')}>Cancel</Button>
            <Button type="submit" isLoading={isSubmitting}>Create Shipment</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
