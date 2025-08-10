import { CreditCard, Calendar, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useRentPayments } from "@/hooks/use-apartments"

const Payments = () => {
  const { data: payments = [], isLoading } = useRentPayments()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Payments</h1>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-32"></div>
                    <div className="h-3 bg-muted rounded w-48"></div>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="h-4 bg-muted rounded w-16"></div>
                    <div className="h-3 bg-muted rounded w-12"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const getPaymentIcon = (payment: any) => {
    if (payment.is_paid) return CheckCircle
    if (new Date(payment.due_date) < new Date()) return AlertCircle
    return Clock
  }

  const getPaymentStatus = (payment: any) => {
    if (payment.is_paid) return { label: "Paid", variant: "default" as const }
    if (new Date(payment.due_date) < new Date()) return { label: "Overdue", variant: "destructive" as const }
    return { label: "Pending", variant: "secondary" as const }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payments</h1>
        <p className="text-muted-foreground">
          Track rent payments and manage tenant billing
        </p>
      </div>

      {payments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No payment records</h3>
            <p className="text-muted-foreground">
              Payment history will appear here once tenants start paying rent
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => {
            const PaymentIcon = getPaymentIcon(payment)
            const status = getPaymentStatus(payment)
            
            return (
              <Card key={payment.id} className="bg-gradient-card hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        payment.is_paid 
                          ? 'bg-success/10 text-success' 
                          : new Date(payment.due_date) < new Date()
                          ? 'bg-destructive/10 text-destructive'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        <PaymentIcon className="h-5 w-5" />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">
                            {payment.tenants.first_name} {payment.tenants.last_name}
                          </h3>
                          <Badge variant={status.variant} className="text-xs">
                            {status.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Due: {new Date(payment.due_date).toLocaleDateString()}</span>
                          </div>
                          <span>
                            {payment.tenants.rooms.apartments.name} - Room {payment.tenants.rooms.room_number}
                          </span>
                        </div>
                        {payment.paid_date && (
                          <p className="text-sm text-success">
                            Paid on {new Date(payment.paid_date).toLocaleDateString()}
                            {payment.payment_method && ` via ${payment.payment_method}`}
                          </p>
                        )}
                        {payment.notes && (
                          <p className="text-sm text-muted-foreground italic">
                            Note: {payment.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right space-y-2">
                      <p className="text-xl font-bold">${payment.amount}</p>
                      {!payment.is_paid && (
                        <Button size="sm" variant="outline">
                          Mark as Paid
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Payments