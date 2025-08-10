import { Building2, Users, DollarSign, TrendingUp, AlertTriangle, Calendar, Plus, Home, UserPlus, Receipt } from "lucide-react"
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
    <div className="space-y-4">
      {/* Header with Quick Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Property Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {currentMonthName} • {tenants.length}/{totalRooms} rooms occupied
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="gap-2">
            <Home className="h-4 w-4" />
            Add Apartment
          </Button>
          <Button size="sm" variant="outline" className="gap-2">
            <UserPlus className="h-4 w-4" />
            Add Tenant
          </Button>
          <Button size="sm" variant="outline" className="gap-2">
            <Receipt className="h-4 w-4" />
            Add Bill
          </Button>
        </div>
      </div>

      {/* Compact Stats */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-5">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-lg font-bold">€{totalRentDue.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Rent Due</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-success/5 border-success/20">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded bg-success/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-success" />
            </div>
            <div>
              <p className="text-lg font-bold text-success">€{totalReceived.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Received</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-warning/5 border-warning/20">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded bg-warning/10 flex items-center justify-center">
              <Receipt className="h-4 w-4 text-warning" />
            </div>
            <div>
              <p className="text-lg font-bold text-warning">€{totalBillsDue.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Bills Due</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-destructive/5 border-destructive/20">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </div>
            <div>
              <p className="text-lg font-bold text-destructive">{overdueCount}</p>
              <p className="text-xs text-muted-foreground">Overdue</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-lg font-bold text-primary">{occupancyRate}%</p>
              <p className="text-xs text-muted-foreground">Occupied</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Compact Content Grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Tenant Status - More Compact */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Tenant Status</CardTitle>
              <Select defaultValue="all">
                <SelectTrigger className="w-40 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Properties</SelectItem>
                  {apartments.map((apt) => (
                    <SelectItem key={apt.id} value={apt.id}>{apt.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {tenants.slice(0, 8).map((tenant) => {
              const tenantPayment = currentMonthPayments.find(p => p.tenant_id === tenant.id)
              const isPaid = tenantPayment?.is_paid || false
              const amount = tenant.rooms.monthly_rent
              
              return (
                <div key={tenant.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                        {tenant.first_name[0]}{tenant.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{tenant.first_name} {tenant.last_name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{tenant.rooms.apartments.name}</span>
                        <span>•</span>
                        <span>Room {tenant.rooms.room_number}</span>
                        <span>•</span>
                        <span>€{amount}/month</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">€{amount}</p>
                    <Badge variant={isPaid ? "default" : "destructive"} className="text-xs px-2 py-0">
                      {isPaid ? "✓" : "!"}
                    </Badge>
                  </div>
                </div>
              )
            })}
            
            {tenants.length === 0 && (
              <div className="text-center py-6">
                <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No tenants yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bills Status - Compact */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Bills Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {apartments.slice(0, 6).map((apartment, index) => {
              const bills = [
                { type: 'Water', amount: 85.50, status: 'pending', color: 'bg-blue-500' },
                { type: 'Electricity', amount: 156.80, status: 'paid', color: 'bg-yellow-500' },
                { type: 'Gas', amount: 89.50, status: 'pending', color: 'bg-orange-500' },
                { type: 'Internet', amount: 45.00, status: 'paid', color: 'bg-green-500' },
                { type: 'Maintenance', amount: 120.00, status: 'pending', color: 'bg-purple-500' },
                { type: 'Insurance', amount: 65.30, status: 'paid', color: 'bg-gray-500' }
              ]
              
              const bill = bills[index % bills.length]
              const isPaid = bill.status === 'paid'
              
              return (
                <div key={apartment.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`h-6 w-6 rounded ${bill.color} flex items-center justify-center`}>
                      <span className="text-white text-xs font-bold">{bill.type[0]}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{apartment.name}</p>
                      <p className="text-xs text-muted-foreground">{bill.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">€{bill.amount}</p>
                    <Badge variant={isPaid ? "default" : "destructive"} className="text-xs px-2 py-0">
                      {isPaid ? "✓" : "!"}
                    </Badge>
                  </div>
                </div>
              )
            })}
            
            {apartments.length === 0 && (
              <div className="text-center py-6">
                <Receipt className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No apartments yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
