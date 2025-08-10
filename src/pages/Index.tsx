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
      {/* Header with prominent month display */}
      <div className="text-center py-8 border-b border-border bg-gradient-to-r from-primary/5 to-secondary/5">
        <h1 className="text-6xl font-bold text-foreground mb-2">
          {currentMonthName.split(' ')[0]}
        </h1>
        <p className="text-xl text-muted-foreground">
          {currentMonthName.split(' ')[1]}
        </p>
      </div>

      {/* Apartment Selector */}
      <div className="flex items-center justify-between p-4 bg-card/50">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">
            {selectedApartment ? selectedApartment.name : "All Properties"}
          </h2>
          <span className="text-sm text-muted-foreground">
            {apartmentTenants.length}/{totalRooms} rooms occupied
          </span>
          
          {apartments.length > 0 && (
            <Select value={selectedApartmentId} onValueChange={setSelectedApartmentId}>
              <SelectTrigger className="w-48">
                <SelectValue />
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
      </div>

      {/* Compact Stats Grid */}
      <div className="grid gap-3 grid-cols-4 px-4 py-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">€{totalRentDue.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">Rent Due</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">€{totalReceived.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">Received</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">€{totalBillsDue.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">Bills Due</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{overdueCount}</div>
          <div className="text-xs text-muted-foreground">Overdue</div>
        </div>
      </div>
    </div>
  );
};

export default Index;
