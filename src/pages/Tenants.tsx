import { Users, Mail, Phone, Calendar, MapPin, Plus, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useTenants, useDeleteTenant } from "@/hooks/use-apartments"
import { AddTenantDialog } from "@/components/forms/AddTenantDialog"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

const Tenants = () => {
  const { data: tenants = [], isLoading } = useTenants()
  const deleteTenant = useDeleteTenant()
  const { toast } = useToast()

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await deleteTenant.mutateAsync(id)
        toast({
          title: "Success",
          description: "Tenant deleted successfully",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete tenant",
          variant: "destructive",
        })
      }
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Tenants</h1>
          <AddTenantDialog />
        </div>
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse border rounded-lg p-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-muted"></div>
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
          <h1 className="text-3xl font-bold">Tenants</h1>
          <p className="text-muted-foreground">
            Manage your current tenants and their rental information
          </p>
        </div>
        <AddTenantDialog />
      </div>

      {tenants.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-lg">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No tenants yet</h3>
          <p className="text-muted-foreground mb-4">
            Tenants will appear here once they're added to your apartments
          </p>
          <AddTenantDialog />
        </div>
      ) : (
        <div className="space-y-2">
          {tenants.map((tenant) => {
            const leaseEnd = tenant.lease_end ? new Date(tenant.lease_end) : null
            const isExpiringSoon = leaseEnd && leaseEnd <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            
            return (
              <div key={tenant.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-semibold text-sm">
                        {tenant.first_name[0]}{tenant.last_name[0]}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{tenant.first_name} {tenant.last_name}</h3>
                        <Badge variant="outline" className="text-xs">Active</Badge>
                        {isExpiringSoon && <Badge variant="destructive" className="text-xs">Expiring Soon</Badge>}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {tenant.rooms.apartments.name} - Room {tenant.rooms.room_number}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(tenant.lease_start), "MMM dd, yyyy")} - {tenant.lease_end ? format(new Date(tenant.lease_end), "MMM dd, yyyy") : "Ongoing"}
                        </span>
                        <span className="font-semibold">€{tenant.rooms.monthly_rent}/month</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        {tenant.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {tenant.email}
                          </span>
                        )}
                        {tenant.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {tenant.phone}
                          </span>
                        )}
                        {tenant.deposit_amount && (
                          <span>
                            Deposit: €{tenant.deposit_amount} ({tenant.deposit_paid ? "Paid" : "Pending"})
                          </span>
                        )}
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
                      onClick={() => handleDelete(tenant.id, `${tenant.first_name} ${tenant.last_name}`)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Tenants