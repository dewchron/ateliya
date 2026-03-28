// Types matching Supabase schema
// Regenerate with: npx supabase gen types typescript --project-id <id> > src/types/database.types.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          phone: string | null;
          full_name: string | null;
          birth_date: string | null;
          gender: 'male' | 'female' | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          phone?: string | null;
          full_name?: string | null;
          birth_date?: string | null;
          gender?: 'male' | 'female' | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          phone?: string | null;
          full_name?: string | null;
          birth_date?: string | null;
          gender?: 'male' | 'female' | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      addresses: {
        Row: {
          id: string;
          profile_id: string;
          address_line: string | null;
          city: string | null;
          pin_code: string | null;
          landmark: string | null;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          address_line?: string | null;
          city?: string | null;
          pin_code?: string | null;
          landmark?: string | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          address_line?: string | null;
          city?: string | null;
          pin_code?: string | null;
          landmark?: string | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      measurements: {
        Row: {
          id: string;
          profile_id: string;
          bust_cm: number | null;
          waist_cm: number | null;
          hips_cm: number | null;
          shoulder_cm: number | null;
          measured_by: 'self' | 'professional';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          bust_cm?: number | null;
          waist_cm?: number | null;
          hips_cm?: number | null;
          shoulder_cm?: number | null;
          measured_by?: 'self' | 'professional';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          bust_cm?: number | null;
          waist_cm?: number | null;
          hips_cm?: number | null;
          shoulder_cm?: number | null;
          measured_by?: 'self' | 'professional';
          created_at?: string;
          updated_at?: string;
        };
      };
      service_prices: {
        Row: {
          id: string;
          service: string;
          price: number;
          items_per_hr: number | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          service: string;
          price: number;
          items_per_hr?: number | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          service?: string;
          price?: number;
          items_per_hr?: number | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          order_number: string | null;
          customer_id: string;
          pickup_date: string | null;
          pickup_time: string | null;
          custom_community: string | null;
          payment_id: string | null;
          total_amount: number;
          status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
          admin_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number?: string | null;
          customer_id: string;
          pickup_date?: string | null;
          pickup_time?: string | null;
          custom_community?: string | null;
          payment_id?: string | null;
          total_amount?: number;
          status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_number?: string | null;
          customer_id?: string;
          pickup_date?: string | null;
          pickup_time?: string | null;
          custom_community?: string | null;
          payment_id?: string | null;
          total_amount?: number;
          status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_services: {
        Row: {
          id: string;
          order_id: string;
          service_type: string;
          status: 'pending' | 'in_progress' | 'completed';
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          service_type: string;
          status?: 'pending' | 'in_progress' | 'completed';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          service_type?: string;
          status?: 'pending' | 'in_progress' | 'completed';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
  };
}

// Convenience aliases
export type Profile = Database['public']['Tables']['user_profiles']['Row'];
export type Address = Database['public']['Tables']['addresses']['Row'];
export type Measurement = Database['public']['Tables']['measurements']['Row'];
export type ServicePriceRow = Database['public']['Tables']['service_prices']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderService = Database['public']['Tables']['order_services']['Row'];

export interface CommunityRow {
  id: string;
  name: string;
  zone: string | null;
  planned_date: string | null;
  time_range: string | null;
  unit_count: number | null;
  city: string | null;
  pincode: string | null;
  sort_order: number;
}
