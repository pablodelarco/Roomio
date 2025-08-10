import { CreditCard, Calendar, CheckCircle, Clock, AlertCircle, Edit, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useRentPayments, useUpdateRentPayment } from "@/hooks/use-apartments"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

const Payments = () => {
  const { data: allPayments = [], isLoading } = useRentPayments()
  const updatePayment = useUpdateRentPayment()
  const { toast } = useToast()

  // Deduplicate payments - keep only the most recent payment for each tenant per month
  const payments = allPayments.reduce((acc, payment) => {
    const key = `${payment.tenant_id}-${payment.due_date.slice(0, 7)}` // tenant_id + YYYY-MM
    const existing = acc.find(p => `${p.tenant_id}-${p.due_date.slice(0, 7)}` === key)
    
    if (!existing) {
      acc.push(payment)
    } else {
      // Keep the one with the latest updated_at timestamp
      if (new Date(payment.updated_at) > new Date(existing.updated_at)) {
        const index = acc.findIndex(p => `${p.tenant_id}-${p.due_date.slice(0, 7)}` === key)
        acc[index] = payment
      }
    }
    
    return acc
  }, [] as typeof allPayments)

  const handleMarkAsPaid = async (id: string) => {
    try {
      await updatePayment.mutateAsync({
        id,
        is_paid: true,
        paid_date: new Date().toISOString().split('T')[0]
      })
      toast({
        description: "Payment marked as paid",
        duration: 2000,
      })
    } catch (error) {
      toast({
        description: "Failed to update payment",
        variant: "destructive",
        duration: 3000,
      })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Payments</h1>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse border rounded-lg p-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded bg-muted"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-48"></div>
                  <div className="h-3 bg-muted rounded w-32"></div>
                </div>
                <div className="h-8 w-16 bg-muted rounded"></div>
              </div>
            </div>
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
        <div className="text-center py-12 border border-dashed border-border rounded-lg">
          <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No payment records</h3>
          <p className="text-muted-foreground">
            Payment history will appear here once tenants start paying rent
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {payments.map((payment) => {
            const PaymentIcon = getPaymentIcon(payment)
            const status = getPaymentStatus(payment)
            
            return (
              <div key={payment.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded flex items-center justify-center ${
                      payment.is_paid 
                        ? 'bg-green-100 text-green-600' 
                        : new Date(payment.due_date) < new Date()
                        ? 'bg-red-100 text-red-600'
                        : 'bg-yellow-100 text-yellow-600'
                    }`}>
                      <PaymentIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">
                          {payment.tenants.first_name} {payment.tenants.last_name}
                        </h3>
                        <Badge variant={status.variant} className="text-xs">
                          {status.label}
                        </Badge>
                        <span className="font-bold">€{payment.amount}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Due: {format(new Date(payment.due_date), "MMM dd, yyyy")}
                        </span>
                        <span>
                          {payment.tenants.rooms.apartments.name} - Room {payment.tenants.rooms.room_number}
                        </span>
                        {payment.paid_date && (
                          <span className="text-green-600">
                            Paid: {format(new Date(payment.paid_date), "MMM dd, yyyy")}
                            {payment.payment_method && ` via ${payment.payment_method}`}
                          </span>
                        )}
                      </div>
                      {payment.notes && (
                        <p className="text-sm text-muted-foreground italic mt-1">
                          Note: {payment.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!payment.is_paid && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleMarkAsPaid(payment.id)}
                      >
                        Mark Paid
                      </Button>
                    )}
                    <Button size="sm" variant="ghost">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Payments