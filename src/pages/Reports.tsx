import { BarChart3, DollarSign, TrendingUp, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const Reports = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground">
          Financial reports and property analytics
        </p>
      </div>

      <Card>
        <CardContent className="py-12 text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Reports Coming Soon</h3>
          <p className="text-muted-foreground">
            Detailed financial reports and analytics will be available here
          </p>
        </CardContent>
      </Card>

      {/* Placeholder for future report cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="opacity-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Monthly Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Revenue trends and projections</p>
          </CardContent>
        </Card>

        <Card className="opacity-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Occupancy Rates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Property occupancy analytics</p>
          </CardContent>
        </Card>

        <Card className="opacity-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Payment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Detailed payment reports</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Reports