export type RecordStatus = "ACTIVE" | "INACTIVE";
export type PaymentMethod = "CASH" | "UPI" | "BANK_TRANSFER" | "OTHER";
export type UserRole = "ADMIN" | "STAFF";

// NOTE: every table's Row/Insert/Update below is an INLINE object literal
// directly inside `Database.public.Tables`, not a reference to a separately
// declared named interface — even a perfectly flat one. Referencing a named
// type from here breaks postgrest-js's insert()/update() overload resolution
// (its generic `keyof`/`Exclude` machinery over `Relation['Insert']` silently
// collapses to `never` the moment the field is a reference instead of a
// fresh object literal). This matches exactly what `supabase gen types
// typescript` emits, which is why the generated files never factor field
// lists out into shared interfaces either. Cost a long debugging session to
// track down — do not "clean this up" by extracting shared interfaces.
export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          organization_id: string;
          name: string;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          name?: string;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      farmers: {
        Row: {
          id: string;
          organization_id: string;
          farmer_code: string;
          name: string;
          phone: string | null;
          address: string | null;
          status: RecordStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id?: string;
          farmer_code: string;
          name: string;
          phone?: string | null;
          address?: string | null;
          status?: RecordStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          farmer_code?: string;
          name?: string;
          phone?: string | null;
          address?: string | null;
          status?: RecordStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      milk_types: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          status: RecordStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id?: string;
          name: string;
          status?: RecordStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          name?: string;
          status?: RecordStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      shift_configs: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          start_time: string;
          end_time: string;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id?: string;
          name: string;
          start_time: string;
          end_time: string;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          name?: string;
          start_time?: string;
          end_time?: string;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      expense_categories: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          status: RecordStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id?: string;
          name: string;
          status?: RecordStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          name?: string;
          status?: RecordStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      milk_purchases: {
        Row: {
          id: string;
          organization_id: string;
          farmer_id: string;
          purchase_date: string;
          shift_id: string;
          milk_type_id: string;
          quantity: number;
          fat_percentage: number | null;
          snf_percentage: number | null;
          rate: number;
          calculated_amount: number;
          total_amount: number;
          is_amount_overridden: boolean;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id?: string;
          farmer_id: string;
          purchase_date: string;
          shift_id: string;
          milk_type_id: string;
          quantity: number;
          fat_percentage?: number | null;
          snf_percentage?: number | null;
          rate: number;
          calculated_amount: number;
          total_amount: number;
          is_amount_overridden?: boolean;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          farmer_id?: string;
          purchase_date?: string;
          shift_id?: string;
          milk_type_id?: string;
          quantity?: number;
          fat_percentage?: number | null;
          snf_percentage?: number | null;
          rate?: number;
          calculated_amount?: number;
          total_amount?: number;
          is_amount_overridden?: boolean;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      farmer_payments: {
        Row: {
          id: string;
          organization_id: string;
          farmer_id: string;
          payment_date: string;
          amount: number;
          payment_method: PaymentMethod;
          reference_number: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id?: string;
          farmer_id: string;
          payment_date: string;
          amount: number;
          payment_method?: PaymentMethod;
          reference_number?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          farmer_id?: string;
          payment_date?: string;
          amount?: number;
          payment_method?: PaymentMethod;
          reference_number?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      milk_supplies: {
        Row: {
          id: string;
          organization_id: string;
          supply_date: string;
          shift_id: string;
          milk_type_id: string;
          customer_name: string | null;
          quantity: number;
          fat_percentage: number | null;
          snf_percentage: number | null;
          rate: number;
          calculated_amount: number;
          total_amount: number;
          is_amount_overridden: boolean;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id?: string;
          supply_date: string;
          shift_id: string;
          milk_type_id: string;
          customer_name?: string | null;
          quantity: number;
          fat_percentage?: number | null;
          snf_percentage?: number | null;
          rate: number;
          calculated_amount: number;
          total_amount: number;
          is_amount_overridden?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          supply_date?: string;
          shift_id?: string;
          milk_type_id?: string;
          customer_name?: string | null;
          quantity?: number;
          fat_percentage?: number | null;
          snf_percentage?: number | null;
          rate?: number;
          calculated_amount?: number;
          total_amount?: number;
          is_amount_overridden?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      expenses: {
        Row: {
          id: string;
          organization_id: string;
          expense_date: string;
          category_id: string;
          amount: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id?: string;
          expense_date: string;
          category_id: string;
          amount: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          expense_date?: string;
          category_id?: string;
          amount?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
    Functions: {
      get_farmer_account_totals: {
        Args: { p_farmer_id: string; p_from: string | null; p_to: string | null };
        Returns: { total_milk_value: number; total_paid: number }[];
      };
      get_farmer_status_counts: {
        Args: Record<string, never>;
        Returns: { status: "PAID" | "PARTIALLY_PAID" | "UNPAID"; count: number }[];
      };
      current_organization_id: {
        Args: Record<string, never>;
        Returns: string;
      };
    };
  };
}

// Convenience aliases for app code that wants a table's Row shape (e.g. for
// component props). These are NOT used inside the Database interface above —
// see the note there for why.
export type OrganizationRow = Database["public"]["Tables"]["organizations"]["Row"];
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type FarmerRow = Database["public"]["Tables"]["farmers"]["Row"];
export type MilkTypeRow = Database["public"]["Tables"]["milk_types"]["Row"];
export type ShiftConfigRow = Database["public"]["Tables"]["shift_configs"]["Row"];
export type ExpenseCategoryRow = Database["public"]["Tables"]["expense_categories"]["Row"];
export type MilkPurchaseRow = Database["public"]["Tables"]["milk_purchases"]["Row"];
export type FarmerPaymentRow = Database["public"]["Tables"]["farmer_payments"]["Row"];
export type MilkSupplyRow = Database["public"]["Tables"]["milk_supplies"]["Row"];
export type ExpenseRow = Database["public"]["Tables"]["expenses"]["Row"];
