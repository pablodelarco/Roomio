import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

export type Apartment = {
  id: string
  name: string
  address: string
  total_rooms: number
  monthly_bills: number
  bills_paid_until: string | null
  created_at: string
  updated_at: string
}

export type Room = {
  id: string
  apartment_id: string
  room_number: string
  monthly_rent: number
  is_occupied: boolean
  created_at: string
  updated_at: string
}

export type Tenant = {
  id: string
  room_id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  lease_start: string
  lease_end: string | null
  deposit_amount: number | null
  deposit_paid: boolean
  deposit_returned: boolean
  created_at: string
  updated_at: string
}

export type RentPayment = {
  id: string
  tenant_id: string
  amount: number
  due_date: string
  paid_date: string | null
  is_paid: boolean
  utilities_paid: boolean
  payment_method: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type Bill = {
  id: string
  apartment_id: string
  provider: string
  bill_type: string
  amount: number
  due_date: string
  period_start: string | null
  period_end: string | null
  ready_to_pay: boolean
  is_paid: boolean
  utilities_paid: boolean
  paid_date: string | null
  created_at: string
  updated_at: string
}

export function useApartments() {
  return useQuery({
    queryKey: ["apartments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("apartments")
        .select("*")
        .order("name")
      
      if (error) throw error
      return data as Apartment[]
    },
  })
}

export function useRooms() {
  return useQuery({
    queryKey: ["rooms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rooms")
        .select(`
          *,
          apartments:apartment_id (name, address)
        `)
        .order("room_number")
      
      if (error) throw error
      return data as (Room & { apartments: Pick<Apartment, 'name' | 'address'> })[]
    },
  })
}

export function useTenants() {
  return useQuery({
    queryKey: ["tenants"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenants")
        .select(`
          *,
          rooms:room_id (
            room_number,
            monthly_rent,
            apartment_id,
            apartments:apartment_id (name, address)
          )
        `)
        .order("first_name")
      
      if (error) throw error
      return data as (Tenant & { 
        rooms: Room & { apartment_id: string; apartments: Pick<Apartment, 'name' | 'address'> } 
      })[]
    },
  })
}

export function useRentPayments() {
  return useQuery({
    queryKey: ["rent_payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rent_payments")
        .select(`
          *,
          tenants:tenant_id (
            first_name,
            last_name,
            rooms:room_id (
              room_number,
              apartments:apartment_id (name)
            )
          )
        `)
        .order("due_date", { ascending: false })
      
      if (error) throw error
      return data as (RentPayment & {
        tenants: Tenant & {
          rooms: Room & { apartments: Pick<Apartment, 'name'> }
        }
      })[]
    },
  })
}

export function useCreateApartment() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: { name: string; address: string; total_rooms: number; monthly_bills: number; rooms: { room_number: string; monthly_rent: number }[] }) => {
      // First create the apartment
      const { data: apartment, error: apartmentError } = await supabase
        .from('apartments')
        .insert({
          name: data.name,
          address: data.address,
          total_rooms: data.total_rooms,
          monthly_bills: data.monthly_bills
        })
        .select()
        .single()
      
      if (apartmentError) throw apartmentError

      // Then create the rooms
      const roomsToInsert = data.rooms.map(room => ({
        apartment_id: apartment.id,
        room_number: room.room_number,
        monthly_rent: room.monthly_rent
      }))

      const { error: roomsError } = await supabase
        .from('rooms')
        .insert(roomsToInsert)

      if (roomsError) throw roomsError

      return apartment
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apartments"] })
      queryClient.invalidateQueries({ queryKey: ["rooms"] })
    }
  })
}

export function useCreateTenant() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (tenant: Omit<Tenant, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('tenants')
        .insert(tenant)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] })
      queryClient.invalidateQueries({ queryKey: ["rooms"] })
    }
  })
}

export function useDeleteApartment() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('apartments')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apartments"] })
      queryClient.invalidateQueries({ queryKey: ["rooms"] })
    }
  })
}

export function useDeleteTenant() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tenants')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] })
      queryClient.invalidateQueries({ queryKey: ["rooms"] })
    }
  })
}

export function useUpdateRentPayment() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, is_paid, utilities_paid, paid_date }: { id: string; is_paid?: boolean; utilities_paid?: boolean; paid_date?: string }) => {
      const updateData: any = {}
      if (is_paid !== undefined) updateData.is_paid = is_paid
      if (utilities_paid !== undefined) updateData.utilities_paid = utilities_paid
      if (paid_date !== undefined) updateData.paid_date = paid_date
      
      const { error } = await supabase
        .from('rent_payments')
        .update(updateData)
        .eq('id', id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rent_payments"] })
    }
  })
}

export function useUpdateApartment() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: { 
      apartment: {
        id: string
        name: string
        address: string
        total_rooms: number
        monthly_bills: number
        bills_paid_until?: string
      }
      rooms: {
        id?: string
        room_number: string
        monthly_rent: number
      }[]
    }) => {
      // Update apartment
      const { data: apartmentData, error: apartmentError } = await supabase
        .from('apartments')
        .update({
          name: data.apartment.name,
          address: data.apartment.address,
          total_rooms: data.apartment.total_rooms,
          monthly_bills: data.apartment.monthly_bills,
          bills_paid_until: data.apartment.bills_paid_until,
          updated_at: new Date().toISOString()
        })
        .eq('id', data.apartment.id)
        .select()
        .single()
      
      if (apartmentError) throw apartmentError

      // Get existing rooms for this apartment
      const { data: existingRooms, error: roomsError } = await supabase
        .from('rooms')
        .select('id')
        .eq('apartment_id', data.apartment.id)

      if (roomsError) throw roomsError

      const existingRoomIds = existingRooms.map(room => room.id)
      const updatedRoomIds = data.rooms.filter(room => room.id).map(room => room.id)
      
      // Delete rooms that are no longer in the list
      const roomsToDelete = existingRoomIds.filter(id => !updatedRoomIds.includes(id))
      if (roomsToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('rooms')
          .delete()
          .in('id', roomsToDelete)
        
        if (deleteError) throw deleteError
      }

      // Update existing rooms and insert new ones
      for (const room of data.rooms) {
        if (room.id) {
          // Update existing room
          const { error: updateError } = await supabase
            .from('rooms')
            .update({
              room_number: room.room_number,
              monthly_rent: room.monthly_rent,
              updated_at: new Date().toISOString()
            })
            .eq('id', room.id)
          
          if (updateError) throw updateError
        } else {
          // Insert new room
          const { error: insertError } = await supabase
            .from('rooms')
            .insert({
              apartment_id: data.apartment.id,
              room_number: room.room_number,
              monthly_rent: room.monthly_rent
            })
          
          if (insertError) throw insertError
        }
      }

      return apartmentData
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apartments'] })
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
    },
  })
}

export function useUpdateTenant() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (tenant: { 
      id: string
      first_name: string
      last_name: string
      email: string | null
      phone: string | null
      room_id: string
      lease_start: string
      lease_end: string | null
      deposit_amount: number | null
      deposit_paid: boolean
      deposit_returned: boolean
    }) => {
      const { data, error } = await supabase
        .from('tenants')
        .update({
          first_name: tenant.first_name,
          last_name: tenant.last_name,
          email: tenant.email,
          phone: tenant.phone,
          room_id: tenant.room_id,
          lease_start: tenant.lease_start,
          lease_end: tenant.lease_end,
          deposit_amount: tenant.deposit_amount,
          deposit_paid: tenant.deposit_paid,
          deposit_returned: tenant.deposit_returned,
          updated_at: new Date().toISOString()
        })
        .eq('id', tenant.id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
    },
  })
}

// Bills hooks
export const useBills = () => {
  return useQuery({
    queryKey: ['bills'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bills')
        .select(`
          *,
          apartments:apartment_id(name, address)
        `)
        .order('due_date', { ascending: false })
      
      if (error) throw error
      return data as any
    },
  })
}

export function useUpdateBill() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (billData: Partial<Bill> & { id: string }) => {
      const { data, error } = await supabase
        .from('bills')
        .update({
          apartment_id: billData.apartment_id,
          provider: billData.provider,
          bill_type: billData.bill_type,
          amount: billData.amount,
          due_date: billData.due_date,
          period_start: billData.period_start,
          period_end: billData.period_end,
          ready_to_pay: billData.ready_to_pay,
          is_paid: billData.is_paid,
          utilities_paid: billData.utilities_paid,
          paid_date: billData.paid_date,
          updated_at: new Date().toISOString()
        })
        .eq('id', billData.id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] })
    },
  })
}

export const useCreateBill = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (billData: {
      provider: string
      bill_type: string
      amount: number
      due_date: string
      apartment_id: string
      is_paid: boolean
      utilities_paid: boolean
      ready_to_pay: boolean
    }) => {
      console.log('Inserting bill into Supabase:', billData)
      const { data, error } = await supabase
        .from('bills')
        .insert({
          provider: billData.provider,
          bill_type: billData.bill_type,
          amount: billData.amount,
          due_date: billData.due_date,
          apartment_id: billData.apartment_id,
          is_paid: billData.is_paid,
          utilities_paid: billData.utilities_paid,
          ready_to_pay: billData.ready_to_pay,
        })
        .select()
        .single()
      
      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      console.log('Bill inserted successfully:', data)
      return data
    },
    onSuccess: () => {
      console.log('Invalidating bills query after successful creation')
      queryClient.invalidateQueries({ queryKey: ['bills'] })
    },
  })
}