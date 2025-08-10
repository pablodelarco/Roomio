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
  payment_method: string | null
  notes: string | null
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
    mutationFn: async ({ id, is_paid, paid_date }: { id: string; is_paid: boolean; paid_date?: string }) => {
      const { error } = await supabase
        .from('rent_payments')
        .update({ is_paid, paid_date })
        .eq('id', id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rent_payments"] })
    }
  })
}