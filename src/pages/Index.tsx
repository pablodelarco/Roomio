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
    <div className="min-h-screen bg-background">
      {/* Header with Apartment Selector and Quick Actions */}
      <div className="flex items-center justify-between mb-6 p-4 border-b border-border">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {selectedApartment ? selectedApartment.name : "All Properties"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {currentMonthName} • {apartmentTenants.length}/{totalRooms} rooms occupied
            </p>
          </div>
          
          {apartments.length > 1 && (
            <Select value={selectedApartmentId} onValueChange={setSelectedApartmentId}>
              <SelectTrigger className="w-48 bg-card">
                <SelectValue placeholder="All Apartments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Apartments</SelectItem>
                {apartments.map((apt) => (
                  <SelectItem key={apt.id} value={apt.id}>{apt.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <AddApartmentDialog />
          <AddTenantDialog />
          <Button size="sm" variant="outline" className="gap-2">
            <Receipt className="h-4 w-4" />
            Add Bill
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 px-4 mb-6">
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">€{totalRentDue.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Rent Due</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-xl font-bold text-green-500">€{totalReceived.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Received</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Receipt className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-xl font-bold text-orange-500">€{totalBillsDue.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Bills Due</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-xl font-bold text-red-500">{overdueCount}</p>
              <p className="text-sm text-muted-foreground">Overdue</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2 px-4">
        {/* Tenant Rent Status */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-foreground">Tenant Rent Status</CardTitle>
              <p className="text-sm text-muted-foreground">{currentMonthName}</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {apartmentTenants.map((tenant) => {
              const tenantPayment = currentMonthPayments.find(p => p.tenant_id === tenant.id)
              const isPaid = tenantPayment?.is_paid || false
              const amount = tenant.rooms.monthly_rent
              const leaseEnd = tenant.lease_end ? new Date(tenant.lease_end) : null
              const isExpiringSoon = leaseEnd && leaseEnd <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
              
              return (
                <div key={tenant.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/40 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-primary font-bold text-sm">
                        {tenant.first_name[0]}{tenant.last_name[0]}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground">{tenant.first_name} {tenant.last_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Room {tenant.rooms.room_number} • €{amount}/month
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(tenant.lease_start), "MMM dd, yyyy")} - {tenant.lease_end ? format(new Date(tenant.lease_end), "MMM dd, yyyy") : "Ongoing"}
                        {isExpiringSoon && <span className="text-orange-500 ml-2">• Expiring Soon</span>}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold text-foreground">€{amount}</p>
                      <Badge variant={isPaid ? "secondary" : "destructive"} className="text-xs">
                        {isPaid ? "Paid" : "Pending"}
                      </Badge>
                    </div>
                  </div>
                </div>
              )
            })}
            
            {apartmentTenants.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No tenants in this property</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bills Status */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-foreground">Bills Status</CardTitle>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Bill
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockBills.map((bill) => {
              const isPaid = bill.status === 'paid'
              const isOverdue = new Date(bill.dueDate) < new Date() && !isPaid
              
              return (
                <div key={bill.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/40 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-secondary/20 flex items-center justify-center">
                      <span className="text-secondary-foreground font-bold text-sm">
                        {bill.name.charAt(0)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground">{bill.name}</p>
                      <p className="text-sm text-muted-foreground">{bill.type} • Due {format(new Date(bill.dueDate), "MMM dd, yyyy")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold text-foreground">€{bill.amount}</p>
                      <Badge 
                        variant={isPaid ? "secondary" : isOverdue ? "destructive" : "outline"} 
                        className="text-xs"
                      >
                        {isPaid ? "Paid" : isOverdue ? "Overdue" : "Pending"}
                      </Badge>
                    </div>
                  </div>
                </div>
              )
            })}
            
            {mockBills.length === 0 && (
              <div className="text-center py-8">
                <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No bills for this property</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
