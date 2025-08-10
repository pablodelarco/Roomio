import { useState } from "react"
import { Building2, Users, DollarSign, TrendingUp, AlertTriangle, Calendar, Plus, Home, UserPlus, Receipt, ChevronDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useApartments, useTenants, useRentPayments, useUpdateRentPayment } from "@/hooks/use-apartments"
import { AddTenantDialog } from "@/components/forms/AddTenantDialog"
import { AddApartmentDialog } from "@/components/forms/AddApartmentDialog"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

const Index = () => {
  const { data: apartments = [] } = useApartments()
  const { data: tenants = [] } = useTenants()
  const { data: payments = [] } = useRentPayments()
  const updatePayment = useUpdateRentPayment()
  const { toast } = useToast()
  const [selectedApartmentId, setSelectedApartmentId] = useState<string>("all")

  const handlePaymentToggle = async (tenantId: string, currentStatus: boolean) => {
    const payment = currentMonthPayments.find(p => p.tenant_id === tenantId)
    if (payment) {
      try {
        await updatePayment.mutateAsync({
          id: payment.id,
          is_paid: !currentStatus,
          paid_date: !currentStatus ? new Date().toISOString().split('T')[0] : undefined
        })
        toast({
          title: "Success",
          description: `Payment marked as ${!currentStatus ? 'paid' : 'pending'}`,
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update payment status",
          variant: "destructive",
        })
      }
    }
  }

  // Filter data by selected apartment
  const selectedApartment = apartments.find(apt => apt.id === selectedApartmentId)
  const apartmentTenants = tenants.filter(tenant => 
    selectedApartmentId === "all" ? true : tenant.rooms.apartment_id === selectedApartmentId
  )

  // Calculate dashboard statistics
  const totalRooms = selectedApartment ? selectedApartment.total_rooms : apartments.reduce((sum, apt) => sum + apt.total_rooms, 0)
  const occupancyRate = totalRooms > 0 ? Math.round((apartmentTenants.length / totalRooms) * 100) : 0
  
  const currentMonth = new Date().toISOString().slice(0, 7)
  const currentMonthPayments = payments.filter(p => {
    const paymentTenant = tenants.find(t => t.id === p.tenant_id)
    return p.due_date.startsWith(currentMonth) && 
           (selectedApartmentId === "all" ? true : paymentTenant?.rooms.apartment_id === selectedApartmentId)
  })
  const paidPayments = currentMonthPayments.filter(p => p.is_paid)
  const pendingPayments = currentMonthPayments.filter(p => !p.is_paid)
  
  const totalRentDue = currentMonthPayments.reduce((sum, p) => sum + p.amount, 0)
  const totalReceived = paidPayments.reduce((sum, p) => sum + p.amount, 0)
  const totalBillsDue = selectedApartment ? selectedApartment.monthly_bills : apartments.reduce((sum, apt) => sum + apt.monthly_bills, 0)
  const overdueCount = pendingPayments.filter(p => new Date(p.due_date) < new Date()).length

  const currentMonthName = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  // Mock bills data for the selected apartment
  const mockBills = selectedApartment ? [
    { id: 1, name: "Water Company", type: "Water", amount: 85.50, dueDate: "2025-08-15", status: "pending" },
    { id: 2, name: "Electricity Provider", type: "Electricity", amount: 156.80, dueDate: "2025-08-20", status: "paid" },
    { id: 3, name: "Gas Natural", type: "Gas", amount: 89.50, dueDate: "2025-08-25", status: "pending" },
    { id: 4, name: "Internet ISP", type: "Internet", amount: 45.00, dueDate: "2025-08-10", status: "paid" }
  ] : []

  return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header with prominent month display */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">
            August 2025
          </h1>
          <div className="flex items-center gap-3">
            <AddApartmentDialog />
            <AddTenantDialog />
          </div>
        </div>

        {/* Apartment Selector */}
        {apartments.length > 0 && (
          <div className="mb-4">
            <Select value={selectedApartmentId} onValueChange={setSelectedApartmentId}>
              <SelectTrigger className="w-48 bg-[#1a1a1a] border-[#333] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-[#333]">
                <SelectItem value="all">All Apartments</SelectItem>
                {apartments.map((apt) => (
                  <SelectItem key={apt.id} value={apt.id}>{apt.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">€{totalRentDue.toLocaleString()}</div>
            <div className="text-gray-400 text-xs">Rent Due</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">€{totalReceived.toLocaleString()}</div>
            <div className="text-gray-400 text-xs">Received</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500">€{totalBillsDue.toLocaleString()}</div>
            <div className="text-gray-400 text-xs">Bills Due</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-500">{overdueCount}</div>
            <div className="text-gray-400 text-xs">Overdue</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">{occupancyRate}%</div>
            <div className="text-gray-400 text-xs">Occupancy</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-2 gap-6">
          {/* Tenant Rent Status */}
          <div className="bg-[#1a1a1a] rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Tenant Rent Status</h2>
              <span className="text-gray-400 text-sm">August 2025</span>
            </div>
            
            <div className="space-y-2">
              {apartmentTenants.map((tenant) => {
                const tenantPayment = currentMonthPayments.find(p => p.tenant_id === tenant.id)
                const isPaid = tenantPayment?.is_paid || false
                const amount = tenant.rooms.monthly_rent
                
                return (
                  <div 
                    key={tenant.id} 
                    className="bg-[#2a2a2a] rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-[#333] transition-colors"
                    onClick={() => handlePaymentToggle(tenant.id, isPaid)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                        {tenant.first_name[0]}{tenant.last_name[0]}
                      </div>
                      <div>
                        <div className="font-medium text-white text-sm">{tenant.first_name} {tenant.last_name}</div>
                        <div className="text-gray-400 text-xs">Room {tenant.rooms.room_number} • €{amount}.00/month</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-white text-sm">€{amount}.00</div>
                      <div className={`text-xs px-2 py-1 rounded ${
                        isPaid ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {isPaid ? 'Paid' : 'Pending'}
                      </div>
                    </div>
                  </div>
                )
              })}
              
              {apartmentTenants.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">No tenants in this property</p>
                </div>
              )}
            </div>
          </div>

          {/* Bills Status */}
          <div className="bg-[#1a1a1a] rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Bills Status</h2>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg flex items-center gap-2 text-sm">
                <Plus className="h-3 w-3" />
                Add Bill
              </Button>
            </div>
            
            <div className="space-y-2">
              {mockBills.map((bill) => {
                const isPaid = bill.status === 'paid'
                const isOverdue = new Date(bill.dueDate) < new Date() && !isPaid
                
                return (
                  <div key={bill.id} className="bg-[#2a2a2a] rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold text-xs">
                        {bill.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-white text-sm">{bill.name}</div>
                        <div className="text-gray-400 text-xs">{bill.type} • Due {format(new Date(bill.dueDate), "M/d/yyyy")}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-white text-sm">€{bill.amount}</div>
                      <div className={`text-xs px-2 py-1 rounded ${
                        isPaid ? 'text-green-500' : isOverdue ? 'text-red-500' : 'text-orange-500'
                      }`}>
                        {isPaid ? 'Paid' : isOverdue ? 'Overdue' : 'Pending'}
                      </div>
                    </div>
                  </div>
                )
              })}
              
              {mockBills.length === 0 && (
                <div className="text-center py-8">
                  <Receipt className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">No bills for this property</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
};

export default Index;
