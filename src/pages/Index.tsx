import { Building2, Users, DollarSign, TrendingUp, AlertTriangle, Calendar, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useApartments, useTenants, useRentPayments } from "@/hooks/use-apartments"

const Index = () => {
  const { data: apartments = [] } = useApartments()
  const { data: tenants = [] } = useTenants()
  const { data: payments = [] } = useRentPayments()

  // Calculate dashboard statistics
  const totalRooms = apartments.reduce((sum, apt) => sum + apt.total_rooms, 0)
  const occupancyRate = totalRooms > 0 ? Math.round((tenants.length / totalRooms) * 100) : 0
  
  const currentMonth = new Date().toISOString().slice(0, 7)
  const currentMonthPayments = payments.filter(p => p.due_date.startsWith(currentMonth))
  const paidPayments = currentMonthPayments.filter(p => p.is_paid)
  const pendingPayments = currentMonthPayments.filter(p => !p.is_paid)
  
  const totalRentDue = currentMonthPayments.reduce((sum, p) => sum + p.amount, 0)
  const totalReceived = paidPayments.reduce((sum, p) => sum + p.amount, 0)
  const totalBillsDue = apartments.reduce((sum, apt) => sum + apt.monthly_bills, 0)
  const overdueCount = pendingPayments.filter(p => new Date(p.due_date) < new Date()).length

  const currentMonthName = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="space-y-6">
      {/* Header with Property Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Property Dashboard</h1>
          <p className="text-muted-foreground">
            Track rent collection, bills, and tenant status
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select defaultValue="all">
            <SelectTrigger className="w-64">
              <Building2 className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Select property" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties • {totalRooms} rooms</SelectItem>
              {apartments.map((apt) => (
                <SelectItem key={apt.id} value={apt.id}>
                  {apt.name} • {apt.total_rooms} rooms
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Current Month Stats */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {currentMonthName}
        </h2>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          <Card className="bg-gradient-card">
            <CardContent className="p-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Rent Due</p>
                <p className="text-2xl font-bold">€{totalRentDue.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-success">
            <CardContent className="p-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-success-foreground">Received</p>
                <p className="text-2xl font-bold text-success-foreground">€{totalReceived.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card">
            <CardContent className="p-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Bills Due</p>
                <p className="text-2xl font-bold text-warning">€{totalBillsDue.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card">
            <CardContent className="p-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-destructive">{overdueCount}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card">
            <CardContent className="p-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Occupancy</p>
                <p className="text-2xl font-bold text-primary">{occupancyRate}%</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Tenant Rent Status */}
        <Card>
          <CardHeader>
            <CardTitle>Tenant Rent Status</CardTitle>
            <p className="text-sm text-muted-foreground">{currentMonthName}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {tenants.slice(0, 6).map((tenant) => {
              const tenantPayment = currentMonthPayments.find(p => p.tenant_id === tenant.id)
              const isPaid = tenantPayment?.is_paid || false
              const amount = tenant.rooms.monthly_rent
              
              return (
                <div key={tenant.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                        {tenant.first_name[0]}{tenant.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{tenant.first_name} {tenant.last_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Room {tenant.rooms.room_number} • €{amount}/month
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">€{amount}</p>
                    <Badge variant={isPaid ? "default" : "destructive"} className="text-xs">
                      {isPaid ? "Paid" : "Pending"}
                    </Badge>
                  </div>
                </div>
              )
            })}
            
            {tenants.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No tenants yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bills Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Bills Status</CardTitle>
            </div>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Bill
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {apartments.slice(0, 4).map((apartment, index) => {
              // Sample bills for demo
              const bills = [
                { type: 'Water', amount: 85.50, status: 'pending', initial: 'W' },
                { type: 'Electricity', amount: 156.80, status: 'paid', initial: 'E' },
                { type: 'Gas', amount: 89.50, status: 'pending', initial: 'G' },
                { type: 'Internet', amount: 45.00, status: 'paid', initial: 'I' }
              ]
              
              const bill = bills[index % bills.length]
              const isPaid = bill.status === 'paid'
              
              return (
                <div key={apartment.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                      <span className="font-semibold text-sm">{bill.initial}</span>
                    </div>
                    <div>
                      <p className="font-medium">{apartment.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {bill.type} • Due {new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">€{bill.amount}</p>
                    <Badge variant={isPaid ? "default" : "destructive"} className="text-xs">
                      {isPaid ? "Paid" : "Pending"}
                    </Badge>
                  </div>
                </div>
              )
            })}
            
            {apartments.length === 0 && (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No apartments yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
