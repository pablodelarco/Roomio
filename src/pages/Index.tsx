import { useState } from "react"
import { Building2, Users, DollarSign, TrendingUp, AlertTriangle, Calendar, Plus, Home, UserPlus, Receipt, ChevronDown, Check, X, Edit } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useApartments, useTenants, useRentPayments, useUpdateRentPayment } from "@/hooks/use-apartments"
import { EditTenantDialog } from "@/components/forms/EditTenantDialog"
import { PaymentStatusPopover } from "@/components/PaymentStatusPopover"
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
  
  const totalRentDue = pendingPayments.reduce((sum, p) => sum + p.amount, 0)
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
      <div className="min-h-screen bg-background text-foreground">
      {/* Header with prominent month display */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">
            August 2025
          </h1>
        </div>

        {/* Apartment Selector */}
        {apartments.length > 0 && (
          <div className="mb-4">
            <Select value={selectedApartmentId} onValueChange={setSelectedApartmentId}>
              <SelectTrigger className="w-48 bg-card border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
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
          <div className="bg-card rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Tenant Rent Status</h2>
              <span className="text-muted-foreground text-sm">August 2025</span>
            </div>
            
            <div className="space-y-2">
              {apartmentTenants.map((tenant) => {
                const tenantPayment = currentMonthPayments.find(p => p.tenant_id === tenant.id)
                const isRentPaid = tenantPayment?.is_paid || false
                const isUtilitiesPaid = tenantPayment?.utilities_paid || false
                const amount = tenant.rooms.monthly_rent
                
                return (
                  <div key={tenant.id} className="bg-muted rounded-lg p-3 flex items-center justify-between">
                    <EditTenantDialog tenant={tenant}>
                      <div className="flex items-center gap-3 cursor-pointer flex-1 hover:bg-muted/70 transition-colors p-2 rounded">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                          {tenant.first_name[0]}{tenant.last_name[0]}
                        </div>
                        <div>
                          <div className="font-medium text-foreground text-sm">{tenant.first_name} {tenant.last_name}</div>
                          <div className="text-muted-foreground text-xs">Room {tenant.rooms.room_number} • €{amount}.00/month</div>
                        </div>
                      </div>
                    </EditTenantDialog>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-bold text-foreground text-sm">€{amount}.00</div>
                        <div className="text-xs text-muted-foreground">
                          Rent: <span className={isRentPaid ? 'text-green-500' : 'text-red-500'}>
                            {isRentPaid ? 'Paid' : 'Pending'}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Utils: <span className={isUtilitiesPaid ? 'text-blue-500' : 'text-orange-500'}>
                            {isUtilitiesPaid ? 'Paid' : 'Pending'}
                          </span>
                        </div>
                      </div>
                      
                      {tenantPayment && (
                        <PaymentStatusPopover
                          paymentId={tenantPayment.id}
                          isRentPaid={isRentPaid}
                          isUtilitiesPaid={isUtilitiesPaid}
                          tenantName={`${tenant.first_name} ${tenant.last_name}`}
                        />
                      )}
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
          <div className="bg-card rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Bills Status</h2>
              <span className="text-muted-foreground text-sm">August 2025</span>
            </div>
            
            <div className="space-y-2">
              {mockBills.map((bill) => {
                const isPaid = bill.status === 'paid'
                const isOverdue = new Date(bill.dueDate) < new Date() && !isPaid
                
                return (
                  <div key={bill.id} className="bg-muted rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted-foreground/20 flex items-center justify-center text-foreground font-bold text-xs">
                        {bill.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-foreground text-sm">{bill.name}</div>
                        <div className="text-muted-foreground text-xs">{bill.type} • Due {format(new Date(bill.dueDate), "M/d/yyyy")}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-foreground text-sm">€{bill.amount}</div>
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
                  <Receipt className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground text-sm">No bills for this property</p>
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
