import { useState } from "react"
import { Plus, Edit, Trash2, Receipt } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useApartments } from "@/hooks/use-apartments"
import { format } from "date-fns"

const Bills = () => {
  const { data: apartments = [] } = useApartments()
  const [selectedApartmentId, setSelectedApartmentId] = useState<string>("all")

  // Mock bills data for demonstration
  const mockBills = [
    { id: 1, apartmentId: apartments[0]?.id, name: "Water Company", type: "Water", amount: 85.50, dueDate: "2025-08-15", status: "pending" },
    { id: 2, apartmentId: apartments[0]?.id, name: "Electricity Provider", type: "Electricity", amount: 156.80, dueDate: "2025-08-20", status: "paid" },
    { id: 3, apartmentId: apartments[1]?.id, name: "Gas Natural", type: "Gas", amount: 89.50, dueDate: "2025-08-25", status: "pending" },
    { id: 4, apartmentId: apartments[1]?.id, name: "Internet ISP", type: "Internet", amount: 45.00, dueDate: "2025-08-10", status: "paid" }
  ]

  const filteredBills = mockBills.filter(bill => 
    selectedApartmentId === "all" ? true : bill.apartmentId === selectedApartmentId
  )

  const getStatusColor = (status: string, dueDate: string) => {
    if (status === "paid") return "bg-green-500/10 text-green-500 border-green-500/20"
    if (new Date(dueDate) < new Date()) return "bg-red-500/10 text-red-500 border-red-500/20"
    return "bg-orange-500/10 text-orange-500 border-orange-500/20"
  }

  const getStatusText = (status: string, dueDate: string) => {
    if (status === "paid") return "Paid"
    if (new Date(dueDate) < new Date()) return "Overdue"
    return "Pending"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bills Management</h1>
          <p className="text-muted-foreground">Manage utility bills and payments for your properties</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Bill
        </Button>
      </div>

      {/* Apartment Selector */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-foreground">Filter by apartment:</label>
        <Select value={selectedApartmentId} onValueChange={setSelectedApartmentId}>
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Apartments</SelectItem>
            {apartments.map((apt) => (
              <SelectItem key={apt.id} value={apt.id}>{apt.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Bills Grid */}
      {filteredBills.length > 0 ? (
        <div className="grid gap-4">
          {filteredBills.map((bill) => {
            const apartment = apartments.find(apt => apt.id === bill.apartmentId)
            return (
              <Card key={bill.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Receipt className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{bill.name}</h3>
                        <p className="text-sm text-muted-foreground">{bill.type}</p>
                        {apartment && (
                          <p className="text-xs text-muted-foreground mt-1">{apartment.name}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-bold text-lg text-foreground">€{bill.amount}</div>
                        <div className="text-sm text-muted-foreground">
                          Due {format(new Date(bill.dueDate), "MMM d, yyyy")}
                        </div>
                      </div>
                      
                      <Badge 
                        variant="outline" 
                        className={getStatusColor(bill.status, bill.dueDate)}
                      >
                        {getStatusText(bill.status, bill.dueDate)}
                      </Badge>
                      
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No bills found</h3>
            <p className="text-muted-foreground mb-4">
              {selectedApartmentId === "all" 
                ? "No bills have been added yet." 
                : "No bills found for the selected apartment."}
            </p>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add First Bill
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Bills