import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Edit } from "lucide-react"
import { format } from "date-fns"
import { useUpdateTenant, useApartments, useRooms, useRentPayments, useUpdateRentPayment, type Tenant } from "@/hooks/use-apartments"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"

interface EditTenantDialogProps {
  tenant: Tenant & { 
    rooms: { 
      room_number: string
      monthly_rent: number
      apartment_id: string
      apartments: { name: string; address: string }
    }
  }
  children?: React.ReactNode
  showPaymentStatus?: boolean
}

export function EditTenantDialog({ tenant, children, showPaymentStatus = false }: EditTenantDialogProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    room_id: "",
    lease_start: null as Date | null,
    lease_end: null as Date | null,
    deposit_amount: "",
    deposit_paid: false,
    deposit_returned: false
  })

  const { data: apartments = [] } = useApartments()
  const { data: rooms = [] } = useRooms()
  const { data: payments = [] } = useRentPayments()
  const updateTenant = useUpdateTenant()
  const updatePayment = useUpdateRentPayment()
  const { toast } = useToast()

  // Populate form data when tenant prop changes
  useEffect(() => {
    if (tenant) {
      setFormData({
        first_name: tenant.first_name,
        last_name: tenant.last_name,
        email: tenant.email || "",
        phone: tenant.phone || "",
        room_id: tenant.room_id,
        lease_start: tenant.lease_start ? new Date(tenant.lease_start) : null,
        lease_end: tenant.lease_end ? new Date(tenant.lease_end) : null,
        deposit_amount: tenant.deposit_amount?.toString() || "",
        deposit_paid: tenant.deposit_paid,
        deposit_returned: (tenant as any).deposit_returned || false
      })
    }
  }, [tenant])

  const availableRooms = rooms.filter(room => !room.is_occupied || room.id === tenant.room_id)
  
  // Get current month payment for this tenant
  const currentMonth = new Date().toISOString().slice(0, 7)
  const currentPayment = payments.find(p => p.tenant_id === tenant.id && p.due_date.startsWith(currentMonth))
  const isRentPaid = currentPayment?.is_paid || false

  const handleRentPaymentToggle = async (isPaid: boolean) => {
    if (currentPayment) {
      try {
        await updatePayment.mutateAsync({
          id: currentPayment.id,
          is_paid: isPaid,
          paid_date: isPaid ? new Date().toISOString().split('T')[0] : undefined
        })
        toast({
          title: "Success",
          description: `Rent marked as ${isPaid ? 'paid' : 'pending'}`,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.first_name || !formData.last_name || !formData.room_id || !formData.lease_start) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    try {
      await updateTenant.mutateAsync({
        id: tenant.id,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email || null,
        phone: formData.phone || null,
        room_id: formData.room_id,
        lease_start: formData.lease_start.toISOString().split('T')[0],
        lease_end: formData.lease_end?.toISOString().split('T')[0] || null,
        deposit_amount: formData.deposit_amount ? parseFloat(formData.deposit_amount) : null,
        deposit_paid: formData.deposit_paid,
        deposit_returned: formData.deposit_returned
      } as any)

      toast({
        title: "Success",
        description: "Tenant updated successfully"
      })

      setOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update tenant",
        variant: "destructive"
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Rent Payment Status</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <div className="font-medium">{tenant.first_name} {tenant.last_name}</div>
            <div>Room {tenant.rooms.room_number} • €{tenant.rooms.monthly_rent}/month</div>
          </div>
          
          <div className="flex items-center justify-between py-4">
            <Label htmlFor="rent_paid" className="text-sm font-medium">Current Month Rent Status</Label>
            <div className="flex items-center gap-3">
              <span className={`text-sm px-3 py-1 rounded-full ${isRentPaid ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                {isRentPaid ? 'Paid' : 'Pending'}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRentPaymentToggle(!isRentPaid)}
                disabled={updatePayment.isPending}
              >
                {updatePayment.isPending ? "Updating..." : `Mark as ${isRentPaid ? 'Pending' : 'Paid'}`}
              </Button>
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}