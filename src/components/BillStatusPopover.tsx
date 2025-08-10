import { useState } from "react"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useUpdateBill } from "@/hooks/use-apartments"
import { useToast } from "@/hooks/use-toast"

interface BillStatusPopoverProps {
  billId: string
  isPaid: boolean
  providerName: string
}

export function BillStatusPopover({ 
  billId, 
  isPaid, 
  providerName 
}: BillStatusPopoverProps) {
  const [open, setOpen] = useState(false)
  const updateBill = useUpdateBill()
  const { toast } = useToast()

  const handleBillToggle = async (checked: boolean) => {
    try {
      await updateBill.mutateAsync({
        id: billId,
        is_paid: checked,
        paid_date: checked ? new Date().toISOString().split('T')[0] : undefined
      })
      
      // Less intrusive toast - shorter duration and simpler message
      toast({
        description: `${providerName} ${checked ? 'paid' : 'pending'}`,
        duration: 2000, // Shorter duration
      })
      setOpen(false) // Close popup after action
    } catch (error) {
      toast({
        description: "Failed to update bill status",
        variant: "destructive",
        duration: 3000,
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
      <PopoverContent className="w-48 p-3 z-50 bg-background border shadow-lg" side="right" align="start">
        <div className="space-y-3">
          <h4 className="font-medium text-sm">{providerName}</h4>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="bill-status" className="text-sm">Mark as paid</Label>
            <Switch
              id="bill-status"
              checked={isPaid}
              onCheckedChange={handleBillToggle}
              disabled={updateBill.isPending}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}