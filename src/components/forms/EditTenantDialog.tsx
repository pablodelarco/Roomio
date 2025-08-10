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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Tenant</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="first_name" className="text-xs">First Name *</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                required
                className="h-8"
              />
            </div>
            <div>
              <Label htmlFor="last_name" className="text-xs">Last Name *</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                required
                className="h-8"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="email" className="text-xs">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="h-8"
              />
            </div>
            <div>
              <Label htmlFor="phone" className="text-xs">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="h-8"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="room" className="text-xs">Room *</Label>
            <Select 
              value={formData.room_id} 
              onValueChange={(value) => setFormData({ ...formData, room_id: value })}
            >
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Select a room" />
              </SelectTrigger>
              <SelectContent>
                {availableRooms.map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    {room.apartments.name} - Room {room.room_number} (€{room.monthly_rent}/month)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Lease Start *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-8 text-xs",
                      !formData.lease_start && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-1 h-3 w-3" />
                    {formData.lease_start ? format(formData.lease_start, "PP") : "Pick date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.lease_start || undefined}
                    onSelect={(date) => setFormData({ ...formData, lease_start: date || null })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label className="text-xs">Lease End</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-8 text-xs",
                      !formData.lease_end && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-1 h-3 w-3" />
                    {formData.lease_end ? format(formData.lease_end, "PP") : "Pick date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.lease_end || undefined}
                    onSelect={(date) => setFormData({ ...formData, lease_end: date || null })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="deposit" className="text-xs">Deposit Amount</Label>
              <Input
                id="deposit"
                type="number"
                step="0.01"
                value={formData.deposit_amount}
                onChange={(e) => setFormData({ ...formData, deposit_amount: e.target.value })}
                className="h-8"
              />
            </div>
            <div className="flex items-center justify-between pt-4">
              <Label htmlFor="deposit_paid" className="text-xs">Deposit Paid</Label>
              <Switch
                id="deposit_paid"
                checked={formData.deposit_paid}
                onCheckedChange={(checked) => setFormData({ ...formData, deposit_paid: checked })}
              />
            </div>
            <div className="flex items-center justify-between pt-4">
              <Label htmlFor="deposit_returned" className="text-xs">Deposit Returned</Label>
              <Switch
                id="deposit_returned"
                checked={formData.deposit_returned}
                onCheckedChange={(checked) => setFormData({ ...formData, deposit_returned: checked })}
              />
            </div>
          </div>

          <div className="p-3 border rounded-lg bg-muted/20">
            <h4 className="font-medium mb-2 text-sm">Current Month Payment Status</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs">Rent Amount:</span>
                <span className="font-medium text-sm">€{tenant.rooms.monthly_rent}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs">Payment Status:</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded ${isRentPaid ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                    {isRentPaid ? 'Paid' : 'Pending'}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => handleRentPaymentToggle(!isRentPaid)}
                    disabled={updatePayment.isPending}
                  >
                    Mark as {isRentPaid ? 'Pending' : 'Paid'}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="h-8 px-3 text-xs">
              Cancel
            </Button>
            <Button type="submit" disabled={updateTenant.isPending} className="h-8 px-3 text-xs">
              {updateTenant.isPending ? "Updating..." : "Update Tenant"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}