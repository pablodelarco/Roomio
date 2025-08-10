import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Edit, Plus, Trash } from "lucide-react"
import { useUpdateApartment, useRooms, type Apartment } from "@/hooks/use-apartments"
import { useToast } from "@/hooks/use-toast"

interface RoomData {
  id?: string
  room_number: string
  monthly_rent: string
}

interface EditApartmentDialogProps {
  apartment: Apartment
  children?: React.ReactNode
}

export function EditApartmentDialog({ apartment, children }: EditApartmentDialogProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    monthly_bills: ""
  })
  const [rooms, setRooms] = useState<RoomData[]>([{ room_number: "", monthly_rent: "" }])

  const { data: allRooms = [] } = useRooms()
  const updateApartment = useUpdateApartment()
  const { toast } = useToast()

  // Populate form data when apartment prop changes
  useEffect(() => {
    if (apartment) {
      setFormData({
        name: apartment.name,
        address: apartment.address,
        monthly_bills: apartment.monthly_bills.toString()
      })

      // Get rooms for this apartment
      const apartmentRooms = allRooms.filter(room => room.apartment_id === apartment.id)
      if (apartmentRooms.length > 0) {
        setRooms(apartmentRooms.map(room => ({
          id: room.id,
          room_number: room.room_number,
          monthly_rent: room.monthly_rent.toString()
        })))
      } else {
        setRooms([{ room_number: "", monthly_rent: "" }])
      }
    }
  }, [apartment, allRooms])

  const addRoom = () => {
    setRooms([...rooms, { room_number: "", monthly_rent: "" }])
  }

  const removeRoom = (index: number) => {
    if (rooms.length > 1) {
      setRooms(rooms.filter((_, i) => i !== index))
    }
  }

  const updateRoom = (index: number, field: keyof RoomData, value: string) => {
    const newRooms = [...rooms]
    newRooms[index][field] = value
    setRooms(newRooms)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.address) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    const validRooms = rooms.filter(room => room.room_number && room.monthly_rent)
    if (validRooms.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one room",
        variant: "destructive"
      })
      return
    }

    try {
      
      await updateApartment.mutateAsync({
        apartment: {
          id: apartment.id,
          name: formData.name,
          address: formData.address,
          total_rooms: validRooms.length,
          monthly_bills: formData.monthly_bills ? parseFloat(formData.monthly_bills) : 0
        },
        rooms: validRooms.map(room => ({
          id: room.id,
          room_number: room.room_number,
          monthly_rent: parseFloat(room.monthly_rent)
        }))
      })

      toast({
        title: "Success",
        description: "Apartment updated successfully"
      })

      setOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update apartment",
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
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Apartment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Apartment Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Building A"
              required
            />
          </div>

          <div>
            <Label htmlFor="address">Address *</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Full address"
              required
            />
          </div>

          <div>
            <Label htmlFor="bills">Monthly Bills (Total)</Label>
            <Input
              id="bills"
              type="number"
              step="0.01"
              value={formData.monthly_bills}
              onChange={(e) => setFormData({ ...formData, monthly_bills: e.target.value })}
              placeholder="0.00"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Rooms *</Label>
              <Button type="button" size="sm" variant="outline" onClick={addRoom}>
                <Plus className="h-4 w-4 mr-1" />
                Add Room
              </Button>
            </div>
            
            <div className="space-y-3">
              {rooms.map((room, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Label htmlFor={`room-${index}`}>Room Number</Label>
                    <Input
                      id={`room-${index}`}
                      value={room.room_number}
                      onChange={(e) => updateRoom(index, "room_number", e.target.value)}
                      placeholder="e.g., A1"
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor={`rent-${index}`}>Monthly Rent (€)</Label>
                    <Input
                      id={`rent-${index}`}
                      type="number"
                      step="0.01"
                      value={room.monthly_rent}
                      onChange={(e) => updateRoom(index, "monthly_rent", e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  {rooms.length > 1 && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => removeRoom(index)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateApartment.isPending}>
              {updateApartment.isPending ? "Updating..." : "Update Apartment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}