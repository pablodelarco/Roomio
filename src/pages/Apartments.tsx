import { useState } from "react"
import { Plus, Building2, MapPin, Bed, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useApartments, useCreateApartment } from "@/hooks/use-apartments"
import { useToast } from "@/hooks/use-toast"

const Apartments = () => {
  const { data: apartments = [], isLoading } = useApartments()
  const createApartment = useCreateApartment()
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    total_rooms: 0,
    monthly_bills: 0
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createApartment.mutateAsync(formData)
      setIsDialogOpen(false)
      setFormData({ name: "", address: "", total_rooms: 0, monthly_bills: 0 })
      toast({
        title: "Success",
        description: "Apartment created successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create apartment",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Apartments</h1>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                  <div className="h-3 bg-muted rounded w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Apartments</h1>
          <p className="text-muted-foreground">
            Manage your rental properties and room configurations
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Apartment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Apartment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Apartment Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Sunset Apartments"
                  required
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Main St, City, State"
                  required
                />
              </div>
              <div>
                <Label htmlFor="total_rooms">Total Rooms</Label>
                <Input
                  id="total_rooms"
                  type="number"
                  min="1"
                  value={formData.total_rooms || ""}
                  onChange={(e) => setFormData({ ...formData, total_rooms: parseInt(e.target.value) || 0 })}
                  placeholder="4"
                  required
                />
              </div>
              <div>
                <Label htmlFor="monthly_bills">Monthly Bills ($)</Label>
                <Input
                  id="monthly_bills"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.monthly_bills || ""}
                  onChange={(e) => setFormData({ ...formData, monthly_bills: parseFloat(e.target.value) || 0 })}
                  placeholder="500.00"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={createApartment.isPending} className="flex-1">
                  {createApartment.isPending ? "Creating..." : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {apartments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No apartments yet</h3>
            <p className="text-muted-foreground mb-4">
              Get started by adding your first rental property
            </p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>Add Your First Apartment</Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {apartments.map((apartment) => (
            <Card key={apartment.id} className="bg-gradient-card hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  {apartment.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{apartment.address}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="flex items-center gap-2">
                    <Bed className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{apartment.total_rooms}</p>
                      <p className="text-xs text-muted-foreground">Rooms</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">${apartment.monthly_bills}</p>
                      <p className="text-xs text-muted-foreground">Monthly Bills</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Badge variant="outline" className="text-xs">
                    {apartment.bills_paid_until 
                      ? `Bills paid until ${new Date(apartment.bills_paid_until).toLocaleDateString()}`
                      : "Bills status unknown"
                    }
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default Apartments