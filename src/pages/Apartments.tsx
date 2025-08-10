import { useState } from "react"
import { Plus, Building2, MapPin, Bed, DollarSign, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useApartments, useDeleteApartment } from "@/hooks/use-apartments"
import { AddApartmentDialog } from "@/components/forms/AddApartmentDialog"
import { useToast } from "@/hooks/use-toast"

const Apartments = () => {
  const { data: apartments = [], isLoading } = useApartments()
  const deleteApartment = useDeleteApartment()
  const { toast } = useToast()

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await deleteApartment.mutateAsync(id)
        toast({
          title: "Success",
          description: "Apartment deleted successfully",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete apartment",
          variant: "destructive",
        })
      }
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Apartments</h1>
          <AddApartmentDialog />
        </div>
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Apartments</h1>
          <p className="text-muted-foreground">
            Manage your rental properties and room configurations
          </p>
        </div>
        <AddApartmentDialog />
      </div>

      {apartments.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-lg">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No apartments yet</h3>
          <p className="text-muted-foreground mb-4">
            Get started by adding your first rental property
          </p>
          <AddApartmentDialog />
        </div>
      ) : (
        <div className="space-y-2">
          {apartments.map((apartment) => (
            <div key={apartment.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{apartment.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {apartment.address}
                      </span>
                      <span className="flex items-center gap-1">
                        <Bed className="h-3 w-3" />
                        {apartment.total_rooms} rooms
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        €{apartment.monthly_bills}/month bills
                      </span>
                    </div>
                    <div className="mt-1">
                      <Badge variant="outline" className="text-xs">
                        {apartment.bills_paid_until 
                          ? `Bills paid until ${new Date(apartment.bills_paid_until).toLocaleDateString()}`
                          : "Bills status unknown"
                        }
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => handleDelete(apartment.id, apartment.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Apartments