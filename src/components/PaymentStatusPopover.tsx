import { useState } from "react"
import { Check, X, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useUpdateRentPayment } from "@/hooks/use-apartments"
import { useToast } from "@/hooks/use-toast"

interface PaymentStatusPopoverProps {
  paymentId: string
  isRentPaid: boolean
  isUtilitiesPaid: boolean
  tenantName: string
}

export function PaymentStatusPopover({ 
  paymentId, 
  isRentPaid, 
  isUtilitiesPaid, 
  tenantName 
}: PaymentStatusPopoverProps) {
  const [open, setOpen] = useState(false)
  const updatePayment = useUpdateRentPayment()
  const { toast } = useToast()

  const handleRentToggle = async (checked: boolean) => {
    try {
      await updatePayment.mutateAsync({
        id: paymentId,
        is_paid: checked,
        paid_date: checked ? new Date().toISOString().split('T')[0] : undefined
      })
      toast({
        title: "Success",
        description: `Rent marked as ${checked ? 'paid' : 'pending'} for ${tenantName}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update rent status",
        variant: "destructive",
      })
    }
  }

  const handleUtilitiesToggle = async (checked: boolean) => {
    try {
      await updatePayment.mutateAsync({
        id: paymentId,
        utilities_paid: checked
      })
      toast({
        title: "Success",
        description: `Utilities marked as ${checked ? 'paid' : 'pending'} for ${tenantName}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update utilities status",
        variant: "destructive",
      })
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
          <MoreHorizontal className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-4" side="right" align="start">
        <div className="space-y-4">
          <h4 className="font-medium text-sm">{tenantName} - Payment Status</h4>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="rent-status" className="text-sm">Rent</Label>
            <Switch
              id="rent-status"
              checked={isRentPaid}
              onCheckedChange={handleRentToggle}
              disabled={updatePayment.isPending}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="utilities-status" className="text-sm">Utilities</Label>
            <Switch
              id="utilities-status"
              checked={isUtilitiesPaid}
              onCheckedChange={handleUtilitiesToggle}
              disabled={updatePayment.isPending}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}