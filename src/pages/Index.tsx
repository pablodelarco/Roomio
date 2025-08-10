import React, { useState, useEffect, useCallback } from "react"
import { Building2, Users, DollarSign, TrendingUp, AlertTriangle, Calendar, Plus, Home, UserPlus, Receipt, ChevronDown, Check, X, Edit } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useApartments, useTenants, useRentPayments, useUpdateRentPayment, useBills } from "@/hooks/use-apartments"
import { EditTenantDialog } from "@/components/forms/EditTenantDialog"
import { PaymentStatusPopover } from "@/components/PaymentStatusPopover"
import { BillStatusPopover } from "@/components/BillStatusPopover"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { supabase } from "@/integrations/supabase/client"

const Index = () => {
  const [selectedApartmentId, setSelectedApartmentId] = useState<string>("all")
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7)) // YYYY-MM format
  const [optimisticPayments, setOptimisticPayments] = useState<Map<string, { isRentPaid: boolean; isUtilitiesPaid: boolean }>>(new Map())
  
  const { data: apartments = [] } = useApartments()
  const { data: tenants = [] } = useTenants()
  const { data: payments = [], refetch: refetchPayments } = useRentPayments()
  const updatePayment = useUpdateRentPayment()
  const { toast } = useToast()

  // Generate month options (6 months back, current month, 6 months forward)
  const generateMonthOptions = () => {
    const options = []
    const currentDate = new Date()
    
    for (let i = -6; i <= 6; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1)
      const monthKey = date.toISOString().slice(0, 7)
      const monthLabel = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      options.push({ value: monthKey, label: monthLabel })
    }
    
    return options
  }

  const monthOptions = generateMonthOptions()
  const selectedMonthLabel = monthOptions.find(option => option.value === selectedMonth)?.label || "Select Month"

  // Set up real-time subscription for instant updates
  useEffect(() => {
    const channel = supabase
      .channel('rent_payments_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rent_payments'
        },
        (payload) => {
          console.log('Real-time update received:', payload)
          // Force refresh data when changes occur
          refetchPayments()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [refetchPayments])

  // Optimistic update handler
  const handleOptimisticUpdate = useCallback((tenantId: string, updates: { isRentPaid?: boolean; isUtilitiesPaid?: boolean }) => {
    setOptimisticPayments(prev => {
      const key = `${tenantId}-${selectedMonth}`
      const existing = prev.get(key) || { isRentPaid: false, isUtilitiesPaid: false }
      const newMap = new Map(prev)
      newMap.set(key, { ...existing, ...updates })
      return newMap
    })
  }, [selectedMonth])

  // Clear optimistic updates when month changes
  useEffect(() => {
    setOptimisticPayments(new Map())
  }, [selectedMonth])

  const handlePaymentToggle = async (tenantId: string, currentStatus: boolean) => {
    const payment = currentMonthPayments.find(p => p.tenant_id === tenantId)
    if (payment) {
      try {
        await updatePayment.mutateAsync({
          id: payment.id,
          is_paid: !currentStatus,
          paid_date: !currentStatus ? new Date().toISOString().split('T')[0] : undefined
        })
        toast({
          title: "Success",
          description: `Payment marked as ${!currentStatus ? 'paid' : 'pending'}`,
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update payment status",
          variant: "destructive",
        })
      }
    }
  }

  // Filter data by selected apartment
  const selectedApartment = apartments.find(apt => apt.id === selectedApartmentId)
  const apartmentTenants = tenants.filter(tenant => 
    selectedApartmentId === "all" ? true : tenant.rooms.apartment_id === selectedApartmentId
  )

  // Filter bills for selected apartment and month
  const { data: bills = [] } = useBills()
  const filteredBills = bills.filter(bill => {
    const billMonth = bill.due_date.slice(0, 7) // Extract YYYY-MM from due_date
    const matchesMonth = billMonth === selectedMonth
    const matchesApartment = selectedApartmentId === "all" ? true : bill.apartment_id === selectedApartmentId
    return matchesMonth && matchesApartment
  })

  // Calculate dashboard statistics for selected month
  const currentMonthPayments = payments.filter(p => {
    const paymentTenant = tenants.find(t => t.id === p.tenant_id)
    return p.due_date.startsWith(selectedMonth) && 
           (selectedApartmentId === "all" ? true : paymentTenant?.rooms.apartment_id === selectedApartmentId)
  })
  const paidPayments = currentMonthPayments.filter(p => p.is_paid)
  const pendingPayments = currentMonthPayments.filter(p => !p.is_paid)
  
  // Calculate rent properly based on actual tenants and their latest payment status (with optimistic updates)
  let totalRentDue = 0
  let totalReceived = 0
  
  apartmentTenants.forEach(tenant => {
    const monthlyRent = tenant.rooms.monthly_rent
    const tenantPayment = currentMonthPayments.find(p => p.tenant_id === tenant.id)
    const optimisticKey = `${tenant.id}-${selectedMonth}`
    const optimisticData = optimisticPayments.get(optimisticKey)
    
    // Use optimistic data if available, otherwise use actual data
    const isRentPaid = optimisticData?.isRentPaid ?? (tenantPayment?.is_paid || false)
    
    if (isRentPaid) {
      totalReceived += monthlyRent
    } else {
      totalRentDue += monthlyRent
    }
  })
  
  // Calculate bills due and paid from filtered bills (by month and apartment)
  const totalBillsDue = filteredBills.filter(bill => !bill.is_paid).reduce((sum, bill) => sum + Number(bill.amount), 0)
  const totalBillsPaid = filteredBills.filter(bill => bill.is_paid).reduce((sum, bill) => sum + Number(bill.amount), 0)

  const currentMonthName = selectedMonthLabel

  return (
      <div className="min-h-screen bg-background text-foreground">
      {/* Header with month selector */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                className="text-3xl font-bold text-white p-0 h-auto hover:bg-transparent hover:text-primary transition-colors"
              >
                <Calendar className="h-8 w-8 mr-3" />
                {currentMonthName}
                <ChevronDown className="h-6 w-6 ml-2" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0" align="start">
              <div className="p-2">
                <div className="text-sm font-medium text-muted-foreground mb-2 px-2">Select Month</div>
                <div className="space-y-1">
                  {monthOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={selectedMonth === option.value ? "default" : "ghost"}
                      className="w-full justify-start text-sm"
                      onClick={() => setSelectedMonth(option.value)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Apartment Selector */}
        {apartments.length > 0 && (
          <div className="mb-4">
            <Select value={selectedApartmentId} onValueChange={setSelectedApartmentId}>
              <SelectTrigger className="w-48 bg-card border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">All Apartments</SelectItem>
                {apartments.map((apt) => (
                  <SelectItem key={apt.id} value={apt.id}>{apt.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Rent Section */}
          <div className="bg-card rounded-xl p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Rent</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-xl font-bold text-white">€{totalRentDue.toLocaleString()}</div>
                <div className="text-muted-foreground text-xs">Due</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-500">€{totalReceived.toLocaleString()}</div>
                <div className="text-muted-foreground text-xs">Received</div>
              </div>
            </div>
          </div>

          {/* Utilities Section */}
          <div className="bg-card rounded-xl p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Utilities</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-xl font-bold text-orange-500">€{totalBillsDue.toLocaleString()}</div>
                <div className="text-muted-foreground text-xs">Due</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-500">€{totalBillsPaid.toLocaleString()}</div>
                <div className="text-muted-foreground text-xs">Paid</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-2 gap-6">
          {/* Tenant Rent Status */}
          <div className="bg-card rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Tenant Rent Status</h2>
            </div>
            
            <div className="space-y-2">
              {apartmentTenants.map((tenant) => {
                const tenantPayment = currentMonthPayments.find(p => p.tenant_id === tenant.id)
                const optimisticKey = `${tenant.id}-${selectedMonth}`
                const optimisticData = optimisticPayments.get(optimisticKey)
                
                // Use optimistic data for instant UI updates
                const isRentPaid = optimisticData?.isRentPaid ?? (tenantPayment?.is_paid || false)
                const isUtilitiesPaid = optimisticData?.isUtilitiesPaid ?? (tenantPayment?.utilities_paid || false)
                const amount = tenant.rooms.monthly_rent
                
                return (
                  <div key={tenant.id} className="bg-muted rounded-lg p-3 flex items-center justify-between">
                    <EditTenantDialog tenant={tenant}>
                      <div className="flex items-center gap-3 cursor-pointer flex-1 hover:bg-muted/70 transition-colors p-2 rounded">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                          {tenant.first_name[0]}{tenant.last_name[0]}
                        </div>
                        <div>
                          <div className="font-medium text-foreground text-sm">{tenant.first_name} {tenant.last_name}</div>
                          <div className="text-muted-foreground text-xs">Room {tenant.rooms.room_number} • €{amount}.00/month</div>
                        </div>
                      </div>
                    </EditTenantDialog>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-bold text-foreground text-sm">€{amount}.00</div>
                        <div className="text-xs text-muted-foreground">
                          Rent: <span className={isRentPaid ? 'text-green-500' : 'text-red-500'}>
                            {isRentPaid ? 'Paid' : 'Pending'}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Utils: <span className={isUtilitiesPaid ? 'text-blue-500' : 'text-orange-500'}>
                            {isUtilitiesPaid ? 'Paid' : 'Pending'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Always show the payment menu for every month */}
                      <PaymentStatusPopover
                        paymentId={tenantPayment?.id || `${tenant.id}-${selectedMonth}`}
                        isRentPaid={isRentPaid}
                        isUtilitiesPaid={isUtilitiesPaid}
                        tenantName={`${tenant.first_name} ${tenant.last_name}`}
                        tenantId={tenant.id}
                        selectedMonth={selectedMonth}
                        monthlyRent={amount}
                        onUpdate={() => {
                          // Clear optimistic state after successful update
                          setOptimisticPayments(prev => {
                            const newMap = new Map(prev)
                            newMap.delete(`${tenant.id}-${selectedMonth}`)
                            return newMap
                          })
                          refetchPayments()
                        }}
                        onOptimisticUpdate={handleOptimisticUpdate}
                      />
                    </div>
                  </div>
                )
              })}
              
              {apartmentTenants.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">No tenants in this property</p>
                </div>
              )}
            </div>
          </div>

          {/* Bills Status */}
          <div className="bg-card rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Bills Status</h2>
            </div>
            
            <div className="space-y-2">
              {filteredBills.map((bill) => {
                const isPaid = bill.is_paid
                const isOverdue = new Date(bill.due_date) < new Date() && !isPaid
                
                return (
                  <div key={bill.id} className="bg-muted rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-muted/80 transition-colors">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-8 h-8 rounded-full bg-muted-foreground/20 flex items-center justify-center text-foreground font-bold text-xs">
                        {bill.provider.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-foreground text-sm">{bill.provider}</div>
                        <div className="text-muted-foreground text-xs">{bill.bill_type} • Due {format(new Date(bill.due_date), "M/d/yyyy")}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-bold text-foreground text-sm">€{Number(bill.amount).toLocaleString()}</div>
                        <div className={`text-xs px-2 py-1 rounded ${
                          isPaid ? 'text-green-500' : isOverdue ? 'text-red-500' : 'text-orange-500'
                        }`}>
                          {isPaid ? 'Paid' : isOverdue ? 'Overdue' : 'Pending'}
                        </div>
                      </div>
                      <BillStatusPopover
                        billId={bill.id}
                        isPaid={isPaid}
                        providerName={bill.provider}
                      />
                    </div>
                  </div>
                )
              })}
              
              {filteredBills.length === 0 && (
                <div className="text-center py-8">
                  <Receipt className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground text-sm">No bills for this property</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
};

export default Index;