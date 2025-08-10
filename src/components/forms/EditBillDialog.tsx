import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Edit } from "lucide-react"
import { format } from "date-fns"
import { useApartments, useBills, useUpdateBill, type Bill } from "@/hooks/use-apartments"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"

interface EditBillDialogProps {
  bill: Bill & {
    apartments?: { name: string; address: string }
  }
  children?: React.ReactNode
}

export function EditBillDialog({ bill, children }: EditBillDialogProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    apartment_id: "",
    provider: "",
    bill_type: "",
    amount: "",
    due_date: null as Date | null,
    period_start: null as Date | null,
    period_end: null as Date | null,
    ready_to_pay: false,
    is_paid: false
  })

  const { data: apartments = [] } = useApartments()
  const updateBill = useUpdateBill()
  const { toast } = useToast()

  const billTypes = ["Water", "Electricity", "Gas", "Internet", "Heating", "Maintenance", "Insurance", "Other"]

  // Populate form data when bill prop changes
  useEffect(() => {
    if (bill) {
      setFormData({
        apartment_id: bill.apartment_id,
        provider: bill.provider,
        bill_type: bill.bill_type,
        amount: bill.amount?.toString() || "",
        due_date: bill.due_date ? new Date(bill.due_date) : null,
        period_start: bill.period_start ? new Date(bill.period_start) : null,
        period_end: bill.period_end ? new Date(bill.period_end) : null,
        ready_to_pay: bill.ready_to_pay || false,
        is_paid: bill.is_paid || false
      })
    }
  }, [bill])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.apartment_id || !formData.provider || !formData.bill_type || !formData.amount || !formData.due_date) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    try {
      await updateBill.mutateAsync({
        id: bill.id,
        apartment_id: formData.apartment_id,
        provider: formData.provider,
        bill_type: formData.bill_type,
        amount: parseFloat(formData.amount),
        due_date: formData.due_date.toISOString().split('T')[0],
        period_start: formData.period_start?.toISOString().split('T')[0] || null,
        period_end: formData.period_end?.toISOString().split('T')[0] || null,
        ready_to_pay: formData.ready_to_pay,
        is_paid: formData.is_paid,
        paid_date: formData.is_paid ? new Date().toISOString().split('T')[0] : null
      })

      toast({
        title: "Success",
        description: "Bill updated successfully"
      })

      setOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update bill",
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
          <DialogTitle>Edit Bill</DialogTitle>
          <DialogDescription>
            Update bill information and payment status.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="apartment" className="text-sm">Apartment *</Label>
            <Select value={formData.apartment_id} onValueChange={(value) => setFormData({ ...formData, apartment_id: value })}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select apartment" />
              </SelectTrigger>
              <SelectContent>
                {apartments.map((apartment) => (
                  <SelectItem key={apartment.id} value={apartment.id}>
                    {apartment.name} - {apartment.address}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="provider" className="text-sm">Provider *</Label>
              <Input
                id="provider"
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                placeholder="Company name"
                required
                className="h-10"
              />
            </div>
            <div>
              <Label htmlFor="bill_type" className="text-sm">Bill Type *</Label>
              <Select value={formData.bill_type} onValueChange={(value) => setFormData({ ...formData, bill_type: value })}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {billTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount" className="text-sm">Amount (€) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                required
                className="h-10"
              />
            </div>
            <div>
              <Label className="text-sm">Due Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-10",
                      !formData.due_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.due_date ? format(formData.due_date, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.due_date || undefined}
                    onSelect={(date) => setFormData({ ...formData, due_date: date || null })}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm">Period Start</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-10",
                      !formData.period_start && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.period_start ? format(formData.period_start, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.period_start || undefined}
                    onSelect={(date) => setFormData({ ...formData, period_start: date || null })}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label className="text-sm">Period End</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-10",
                      !formData.period_end && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.period_end ? format(formData.period_end, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.period_end || undefined}
                    onSelect={(date) => setFormData({ ...formData, period_end: date || null })}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="ready_to_pay"
                checked={formData.ready_to_pay}
                onCheckedChange={(checked) => setFormData({ ...formData, ready_to_pay: !!checked })}
              />
              <Label htmlFor="ready_to_pay" className="text-sm">Ready to pay</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_paid"
                checked={formData.is_paid}
                onCheckedChange={(checked) => setFormData({ ...formData, is_paid: !!checked })}
              />
              <Label htmlFor="is_paid" className="text-sm">Paid</Label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateBill.isPending}>
              {updateBill.isPending ? "Updating..." : "Update Bill"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}