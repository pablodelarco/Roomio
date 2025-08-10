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
            apartments:apartment_id (name, address)
          )
        `)
        .order("first_name")
      
      if (error) throw error
      return data as (Tenant & { 
        rooms: Room & { apartments: Pick<Apartment, 'name' | 'address'> } 
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
    mutationFn: async (apartment: Omit<Apartment, 'id' | 'created_at' | 'updated_at' | 'bills_paid_until'> & { bills_paid_until?: string | null }) => {
      const { data, error } = await supabase
        .from("apartments")
        .insert(apartment)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apartments"] })
    },
  })
}