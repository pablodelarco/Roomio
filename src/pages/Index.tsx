import { Building2, Users, CreditCard, DollarSign, TrendingUp, AlertTriangle } from "lucide-react"
import { StatCard } from "@/components/ui/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useApartments, useTenants, useRentPayments } from "@/hooks/use-apartments"

const Index = () => {
  const { data: apartments = [] } = useApartments()
  const { data: tenants = [] } = useTenants()
  const { data: payments = [] } = useRentPayments()

  // Calculate dashboard statistics
  const totalApartments = apartments.length
  const totalTenants = tenants.length
  const occupancyRate = totalTenants > 0 ? Math.round((totalTenants / apartments.reduce((sum, apt) => sum + apt.total_rooms, 0)) * 100) : 0
  
  const currentMonth = new Date().toISOString().slice(0, 7)
  const currentMonthPayments = payments.filter(p => p.due_date.startsWith(currentMonth))
  const paidPayments = currentMonthPayments.filter(p => p.is_paid)
  const totalRevenue = paidPayments.reduce((sum, p) => sum + p.amount, 0)
  const pendingPayments = currentMonthPayments.filter(p => !p.is_paid)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your rental properties.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Apartments"
          value={totalApartments}
          icon={Building2}
        />
        <StatCard
          title="Active Tenants"
          value={totalTenants}
          icon={Users}
        />
        <StatCard
          title="Occupancy Rate"
          value={`${occupancyRate}%`}
          icon={TrendingUp}
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          icon={DollarSign}
        />
      </div>

      {/* Recent Activity Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Payments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Recent Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {payments.slice(0, 5).map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">
                      {payment.tenants.first_name} {payment.tenants.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {payment.tenants.rooms.apartments.name} - Room {payment.tenants.rooms.room_number}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Due: {new Date(payment.due_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${payment.amount}</p>
                    <Badge variant={payment.is_paid ? "default" : "destructive"}>
                      {payment.is_paid ? "Paid" : "Pending"}
                    </Badge>
                  </div>
                </div>
              ))}
              {payments.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No payment records yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pending Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Pending Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingPayments.slice(0, 5).map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg bg-warning/10 border border-warning/20">
                  <div>
                    <p className="font-medium">
                      Rent Due: {payment.tenants.first_name} {payment.tenants.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {payment.tenants.rooms.apartments.name} - Room {payment.tenants.rooms.room_number}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Due: {new Date(payment.due_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-warning">${payment.amount}</p>
                    <Badge variant="outline" className="border-warning text-warning">
                      Overdue
                    </Badge>
                  </div>
                </div>
              ))}
              {pendingPayments.length === 0 && (
                <div className="text-center py-8">
                  <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="h-6 w-6 text-success" />
                  </div>
                  <p className="font-medium text-success">All caught up!</p>
                  <p className="text-sm text-muted-foreground">No pending payments this month</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
