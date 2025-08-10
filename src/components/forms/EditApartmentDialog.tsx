import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Edit } from "lucide-react"
import { useUpdateApartment } from "@/hooks/use-apartments"
import { useToast } from "@/hooks/use-toast"

interface EditApartmentDialogProps {
  apartment: {
    id: string
    name: string
    address: string
    total_rooms: number
    monthly_bills: number
    bills_paid_until?: string
  }
}

export function EditApartmentDialog({ apartment }: EditApartmentDialogProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: apartment.name,
    address: apartment.address,
    total_rooms: apartment.total_rooms,
    monthly_bills: apartment.monthly_bills,
    bills_paid_until: apartment.bills_paid_until ? apartment.bills_paid_until.split('T')[0] : ''
  })
  
  const updateApartment = useUpdateApartment()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await updateApartment.mutateAsync({
        id: apartment.id,
        ...formData,
        bills_paid_until: formData.bills_paid_until || undefined
      })
      
      toast({
        title: "Success",
        description: "Apartment updated successfully",
      })
      setOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update apartment",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Apartment</DialogTitle>
          <DialogDescription>
            Make changes to your apartment details here.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Address
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="total_rooms" className="text-right">
                Total Rooms
              </Label>
              <Input
                id="total_rooms"
                type="number"
                value={formData.total_rooms}
                onChange={(e) => setFormData(prev => ({ ...prev, total_rooms: parseInt(e.target.value) }))}
                className="col-span-3"
                min="1"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="monthly_bills" className="text-right">
                Monthly Bills (€)
              </Label>
              <Input
                id="monthly_bills"
                type="number"
                step="0.01"
                value={formData.monthly_bills}
                onChange={(e) => setFormData(prev => ({ ...prev, monthly_bills: parseFloat(e.target.value) }))}
                className="col-span-3"
                min="0"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bills_paid_until" className="text-right">
                Bills Paid Until
              </Label>
              <Input
                id="bills_paid_until"
                type="date"
                value={formData.bills_paid_until}
                onChange={(e) => setFormData(prev => ({ ...prev, bills_paid_until: e.target.value }))}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={updateApartment.isPending}>
              {updateApartment.isPending ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}