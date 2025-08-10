import React, { useState } from "react"
import { Check, X, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useUpdateRentPayment, useRentPayments } from "@/hooks/use-apartments"
import { useToast } from "@/hooks/use-toast"

interface PaymentStatusPopoverProps {
  paymentId: string
  isRentPaid: boolean
  isUtilitiesPaid: boolean
  tenantName: string
  tenantId?: string
  selectedMonth?: string
  monthlyRent?: number
  onUpdate?: () => void // Add callback to trigger parent refresh
  onOptimisticUpdate?: (tenantId: string, updates: { isRentPaid?: boolean; isUtilitiesPaid?: boolean }) => void
}

export function PaymentStatusPopover({ 
  paymentId, 
  isRentPaid,
  isUtilitiesPaid, 
  tenantName,
  tenantId,
  selectedMonth,
  monthlyRent,
  onUpdate,
  onOptimisticUpdate
}: PaymentStatusPopoverProps) {
  const [open, setOpen] = useState(false)
  const [localRentPaid, setLocalRentPaid] = useState(isRentPaid)
  const [localUtilitiesPaid, setLocalUtilitiesPaid] = useState(isUtilitiesPaid)
  const [isUpdating, setIsUpdating] = useState(false)
  const updatePayment = useUpdateRentPayment()
  const { refetch: refetchPayments } = useRentPayments()
  const { toast } = useToast()

  // Sync local state with props when they change
  React.useEffect(() => {
    setLocalRentPaid(isRentPaid)
    setLocalUtilitiesPaid(isUtilitiesPaid)
  }, [isRentPaid, isUtilitiesPaid])

  const handleRentToggle = async (checked: boolean) => {
    if (isUpdating) return // Prevent multiple simultaneous updates
    
    // Update local state immediately but don't trigger parent optimistic updates yet
    setLocalRentPaid(checked)
    setIsUpdating(true)
    
    try {
      if (paymentId.includes('-')) {
        // Check if record exists, then update only the specific field
        const { supabase } = await import("@/integrations/supabase/client")
        const dueDate = `${selectedMonth}-01`
        
        // First check if a payment record exists
        const { data: existingPayment } = await supabase
          .from('rent_payments')
          .select('id')
          .eq('tenant_id', tenantId)
          .eq('due_date', dueDate)
          .limit(1)
          .single()
        
        if (existingPayment) {
          // Update only the rent fields
          console.log('Updating rent status only:', {
            id: existingPayment.id,
            is_paid: checked,
            paid_date: checked ? new Date().toISOString().split('T')[0] : null
          })
          
          const { error } = await supabase
            .from('rent_payments')
            .update({
              is_paid: checked,
              paid_date: checked ? new Date().toISOString().split('T')[0] : null
            })
            .eq('id', existingPayment.id)
            
          if (error) throw error
        } else {
          // Create new record with all current values
          console.log('Creating new payment record (rent):', {
            tenant_id: tenantId,
            amount: monthlyRent,
            due_date: dueDate,
            is_paid: checked,
            utilities_paid: localUtilitiesPaid,
            paid_date: checked ? new Date().toISOString().split('T')[0] : null
          })
          
          const { error } = await supabase
            .from('rent_payments')
            .insert({
              tenant_id: tenantId,
              amount: monthlyRent,
              due_date: dueDate,
              is_paid: checked,
              paid_date: checked ? new Date().toISOString().split('T')[0] : null,
              utilities_paid: localUtilitiesPaid
            })
            
          if (error) throw error
        }
      } else {
        // Update existing payment record
        console.log('Updating existing payment record:', {
          id: paymentId,
          is_paid: checked,
          paid_date: checked ? new Date().toISOString().split('T')[0] : null
        })
        
        await updatePayment.mutateAsync({
          id: paymentId,
          is_paid: checked,
          paid_date: checked ? new Date().toISOString().split('T')[0] : null
        })
      }
      
      // Only trigger parent optimistic update AFTER successful database operation
      if (tenantId && onOptimisticUpdate) {
        onOptimisticUpdate(tenantId, { isRentPaid: checked })
      }
      
      // Trigger data refresh but don't await it to avoid interfering with UI
      refetchPayments()
      onUpdate?.() // Notify parent component
      
      toast({
        description: `${tenantName} rent ${checked ? 'paid' : 'pending'}`,
        duration: 2000,
      })
    } catch (error) {
      // Revert local state on error
      setLocalRentPaid(!checked)
      console.error('Error updating rent payment:', error)
      toast({
        description: "Failed to update rent status",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleUtilitiesToggle = async (checked: boolean) => {
    if (isUpdating) return // Prevent multiple simultaneous updates
    
    // Update local state immediately but don't trigger parent optimistic updates yet
    setLocalUtilitiesPaid(checked)
    setIsUpdating(true)
    
    try {
      if (paymentId.includes('-')) {
        // Check if record exists, then update only the specific field
        const { supabase } = await import("@/integrations/supabase/client")
        const dueDate = `${selectedMonth}-01`
        
        // First check if a payment record exists
        const { data: existingPayment } = await supabase
          .from('rent_payments')
          .select('id')
          .eq('tenant_id', tenantId)
          .eq('due_date', dueDate)
          .limit(1)
          .single()
        
        if (existingPayment) {
          // Update only the utilities field
          console.log('Updating utilities status only:', {
            id: existingPayment.id,
            utilities_paid: checked
          })
          
          const { error } = await supabase
            .from('rent_payments')
            .update({
              utilities_paid: checked
            })
            .eq('id', existingPayment.id)
            
          if (error) throw error
        } else {
          // Create new record with all current values
          console.log('Creating new payment record (utilities):', {
            tenant_id: tenantId,
            amount: monthlyRent,
            due_date: dueDate,
            is_paid: localRentPaid,
            utilities_paid: checked,
            paid_date: localRentPaid ? new Date().toISOString().split('T')[0] : null
          })
          
          const { error } = await supabase
            .from('rent_payments')
            .insert({
              tenant_id: tenantId,
              amount: monthlyRent,
              due_date: dueDate,
              is_paid: localRentPaid,
              utilities_paid: checked,
              paid_date: localRentPaid ? new Date().toISOString().split('T')[0] : null
            })
            
          if (error) throw error
        }
      } else {
        // Update existing payment record
        console.log('Updating existing payment record (utilities):', {
          id: paymentId,
          utilities_paid: checked
        })
        
        await updatePayment.mutateAsync({
          id: paymentId,
          utilities_paid: checked
        })
      }
      
      // Only trigger parent optimistic update AFTER successful database operation
      if (tenantId && onOptimisticUpdate) {
        onOptimisticUpdate(tenantId, { isUtilitiesPaid: checked })
      }
      
      // Trigger data refresh but don't await it to avoid interfering with UI
      refetchPayments()
      onUpdate?.() // Notify parent component
      
      toast({
        description: `${tenantName} utilities ${checked ? 'paid' : 'pending'}`,
        duration: 2000,
      })
    } catch (error) {
      // Revert local state on error
      setLocalUtilitiesPaid(!checked)
      console.error('Error updating utilities payment:', error)
      toast({
        description: "Failed to update utilities status",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsUpdating(false)
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
        <div className="space-y-4">
          <h4 className="font-medium text-sm">{tenantName}</h4>

          <div className="flex items-center justify-between">
            <Label htmlFor="rent-status" className="text-sm">Rent paid</Label>
            <Switch
              id="rent-status"
              checked={localRentPaid}
              onCheckedChange={handleRentToggle}
              disabled={isUpdating}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="utilities-status" className="text-sm">Utilities paid</Label>
            <Switch
              id="utilities-status"
              checked={localUtilitiesPaid}
              onCheckedChange={handleUtilitiesToggle}
              disabled={isUpdating}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}