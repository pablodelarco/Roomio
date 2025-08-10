import { Users, Mail, Phone, Calendar, MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useTenants } from "@/hooks/use-apartments"

const Tenants = () => {
  const { data: tenants = [], isLoading } = useTenants()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Tenants</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full bg-muted"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-24"></div>
                    <div className="h-3 bg-muted rounded w-16"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
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
      <div>
        <h1 className="text-3xl font-bold">Tenants</h1>
        <p className="text-muted-foreground">
          Manage your current tenants and their rental information
        </p>
      </div>

      {tenants.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tenants yet</h3>
            <p className="text-muted-foreground">
              Tenants will appear here once they're added to your apartments
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tenants.map((tenant) => (
            <Card key={tenant.id} className="bg-gradient-card hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {tenant.first_name[0]}{tenant.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">
                      {tenant.first_name} {tenant.last_name}
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">
                      Active Lease
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <div>
                      <p className="font-medium text-foreground">
                        {tenant.rooms.apartments.name}
                      </p>
                      <p>Room {tenant.rooms.room_number}</p>
                    </div>
                  </div>
                  
                  {tenant.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{tenant.email}</span>
                    </div>
                  )}
                  
                  {tenant.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{tenant.phone}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <div>
                      <p className="font-medium text-foreground">
                        ${tenant.rooms.monthly_rent}/month
                      </p>
                      <p>Lease: {new Date(tenant.lease_start).toLocaleDateString()} 
                        {tenant.lease_end && ` - ${new Date(tenant.lease_end).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Deposit</span>
                    <div className="text-right">
                      {tenant.deposit_amount && (
                        <p className="text-sm font-medium">${tenant.deposit_amount}</p>
                      )}
                      <Badge 
                        variant={tenant.deposit_paid ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {tenant.deposit_paid ? "Paid" : "Pending"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default Tenants