import { useState } from "react"
import { Building2, Users, DollarSign, TrendingUp, AlertTriangle, Calendar, Plus, Home, UserPlus, Receipt, ChevronDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useApartments, useTenants, useRentPayments } from "@/hooks/use-apartments"
import { AddTenantDialog } from "@/components/forms/AddTenantDialog"
import { AddApartmentDialog } from "@/components/forms/AddApartmentDialog"
import { format } from "date-fns"

const Index = () => {
  const { data: apartments = [] } = useApartments()
  const { data: tenants = [] } = useTenants()
  const { data: payments = [] } = useRentPayments()
  const [selectedApartmentId, setSelectedApartmentId] = useState<string>("all")

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
      <div className="px-8 pt-8 pb-6">
        <h1 className="text-4xl font-bold text-white mb-8">
          August 2025
        </h1>

        {/* Apartment Selector */}
        {apartments.length > 0 && (
          <div className="mb-6">
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
        <div className="grid grid-cols-5 gap-6 mb-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">€{totalRentDue.toLocaleString()}</div>
            <div className="text-gray-400 text-sm">Rent Due</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-500">€{totalReceived.toLocaleString()}</div>
            <div className="text-gray-400 text-sm">Received</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-500">€{totalBillsDue.toLocaleString()}</div>
            <div className="text-gray-400 text-sm">Bills Due</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-500">{overdueCount}</div>
            <div className="text-gray-400 text-sm">Overdue</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-500">{occupancyRate}%</div>
            <div className="text-gray-400 text-sm">Occupancy</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-2 gap-8">
          {/* Tenant Rent Status */}
          <div className="bg-[#1a1a1a] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Tenant Rent Status</h2>
              <span className="text-gray-400 text-sm">August 2025</span>
            </div>
            
            <div className="space-y-4">
              {apartmentTenants.map((tenant) => {
                const tenantPayment = currentMonthPayments.find(p => p.tenant_id === tenant.id)
                const isPaid = tenantPayment?.is_paid || false
                const amount = tenant.rooms.monthly_rent
                
                return (
                  <div key={tenant.id} className="bg-[#2a2a2a] rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                        {tenant.first_name[0]}{tenant.last_name[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{tenant.first_name} {tenant.last_name}</div>
                        <div className="text-gray-400 text-sm">Room {tenant.rooms.room_number} • €{amount}.00/month</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-bold text-white">€{amount}.00</div>
                        <div className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${
                          isPaid ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {isPaid && <div className="w-2 h-2 rounded-full bg-green-500"></div>}
                          {isPaid ? 'Paid' : 'Pending'}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
              
              {apartmentTenants.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No tenants in this property</p>
                </div>
              )}
            </div>
          </div>

          {/* Bills Status */}
          <div className="bg-[#1a1a1a] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Bills Status</h2>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Bill
              </Button>
            </div>
            
            <div className="space-y-4">
              {mockBills.map((bill) => {
                const isPaid = bill.status === 'paid'
                const isOverdue = new Date(bill.dueDate) < new Date() && !isPaid
                
                return (
                  <div key={bill.id} className="bg-[#2a2a2a] rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold text-sm">
                        {bill.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{bill.name}</div>
                        <div className="text-gray-400 text-sm">{bill.type} • Due {format(new Date(bill.dueDate), "M/d/yyyy")}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-bold text-white">€{bill.amount}</div>
                        <div className={`text-xs px-2 py-1 rounded ${
                          isPaid ? 'text-green-500' : isOverdue ? 'text-red-500' : 'text-orange-500'
                        }`}>
                          {isPaid ? 'Paid' : isOverdue ? 'Overdue' : 'Pending'}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
              
              {mockBills.length === 0 && (
                <div className="text-center py-8">
                  <Receipt className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No bills for this property</p>
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
