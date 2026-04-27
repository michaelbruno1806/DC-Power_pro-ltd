export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      companies: {
        Row: {
          address: string | null
          brn: string | null
          city: string | null
          country: string | null
          created_at: string
          director_name: string | null
          director_nic: string | null
          email: string | null
          ern: string | null
          id: string
          mra_due_day: number | null
          name: string
          pay_period_end_day: number | null
          pay_period_start_day: number | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          brn?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          director_name?: string | null
          director_nic?: string | null
          email?: string | null
          ern?: string | null
          id?: string
          mra_due_day?: number | null
          name: string
          pay_period_end_day?: number | null
          pay_period_start_day?: number | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          brn?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          director_name?: string | null
          director_nic?: string | null
          email?: string | null
          ern?: string | null
          id?: string
          mra_due_day?: number | null
          name?: string
          pay_period_end_day?: number | null
          pay_period_start_day?: number | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      employees: {
        Row: {
          address: string | null
          bank_account: string | null
          bank_name: string | null
          basic_salary: number | null
          company_id: string
          created_at: string
          date_of_birth: string | null
          email: string | null
          employment_date: string | null
          first_name: string
          gender: string | null
          id: string
          last_name: string
          nic: string | null
          phone: string | null
          status: string | null
          termination_date: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          bank_account?: string | null
          bank_name?: string | null
          basic_salary?: number | null
          company_id: string
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          employment_date?: string | null
          first_name: string
          gender?: string | null
          id?: string
          last_name: string
          nic?: string | null
          phone?: string | null
          status?: string | null
          termination_date?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          bank_account?: string | null
          bank_name?: string | null
          basic_salary?: number | null
          company_id?: string
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          employment_date?: string | null
          first_name?: string
          gender?: string | null
          id?: string
          last_name?: string
          nic?: string | null
          phone?: string | null
          status?: string | null
          termination_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employees_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_requests: {
        Row: {
          approved_by: string | null
          company_id: string
          created_at: string
          days: number
          decided_at: string | null
          employee_id: string
          end_date: string
          id: string
          leave_type_id: string | null
          reason: string | null
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          approved_by?: string | null
          company_id: string
          created_at?: string
          days?: number
          decided_at?: string | null
          employee_id: string
          end_date: string
          id?: string
          leave_type_id?: string | null
          reason?: string | null
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          approved_by?: string | null
          company_id?: string
          created_at?: string
          days?: number
          decided_at?: string | null
          employee_id?: string
          end_date?: string
          id?: string
          leave_type_id?: string | null
          reason?: string | null
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      leave_types: {
        Row: {
          annual_entitlement_days: number | null
          code: string | null
          company_id: string
          created_at: string
          id: string
          is_active: boolean
          is_paid: boolean
          name: string
          updated_at: string
        }
        Insert: {
          annual_entitlement_days?: number | null
          code?: string | null
          company_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_paid?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          annual_entitlement_days?: number | null
          code?: string | null
          company_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_paid?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      payroll_components: {
        Row: {
          amount: number | null
          company_id: string
          created_at: string
          id: string
          in_wage_bill: boolean | null
          is_active: boolean | null
          is_percentage: boolean | null
          name: string
          taxable: boolean | null
          type: string
          updated_at: string
        }
        Insert: {
          amount?: number | null
          company_id: string
          created_at?: string
          id?: string
          in_wage_bill?: boolean | null
          is_active?: boolean | null
          is_percentage?: boolean | null
          name: string
          taxable?: boolean | null
          type: string
          updated_at?: string
        }
        Update: {
          amount?: number | null
          company_id?: string
          created_at?: string
          id?: string
          in_wage_bill?: boolean | null
          is_active?: boolean | null
          is_percentage?: boolean | null
          name?: string
          taxable?: boolean | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payroll_components_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_entries: {
        Row: {
          additions: Json | null
          basic_salary: number | null
          created_at: string
          deductions: Json | null
          employee_id: string
          gross_pay: number | null
          id: string
          net_pay: number | null
          payroll_file_id: string
          total_deductions: number | null
          updated_at: string
        }
        Insert: {
          additions?: Json | null
          basic_salary?: number | null
          created_at?: string
          deductions?: Json | null
          employee_id: string
          gross_pay?: number | null
          id?: string
          net_pay?: number | null
          payroll_file_id: string
          total_deductions?: number | null
          updated_at?: string
        }
        Update: {
          additions?: Json | null
          basic_salary?: number | null
          created_at?: string
          deductions?: Json | null
          employee_id?: string
          gross_pay?: number | null
          id?: string
          net_pay?: number | null
          payroll_file_id?: string
          total_deductions?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payroll_entries_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_entries_payroll_file_id_fkey"
            columns: ["payroll_file_id"]
            isOneToOne: false
            referencedRelation: "payroll_files"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_files: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          id: string
          month: number
          status: string | null
          total_deductions: number | null
          total_gross: number | null
          total_net: number | null
          updated_at: string
          year: number
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          month: number
          status?: string | null
          total_deductions?: number | null
          total_gross?: number | null
          total_net?: number | null
          updated_at?: string
          year: number
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          month?: number
          status?: string | null
          total_deductions?: number | null
          total_gross?: number | null
          total_net?: number | null
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "payroll_files_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_id: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      public_holidays: {
        Row: {
          company_id: string
          created_at: string
          holiday_date: string
          id: string
          is_recurring: boolean
          name: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          holiday_date: string
          id?: string
          is_recurring?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          holiday_date?: string
          id?: string
          is_recurring?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      working_day_configs: {
        Row: {
          company_id: string
          created_at: string
          hours_per_week: number
          id: string
          month: number | null
          updated_at: string
          working_days: number
          year: number
        }
        Insert: {
          company_id: string
          created_at?: string
          hours_per_week?: number
          id?: string
          month?: number | null
          updated_at?: string
          working_days?: number
          year: number
        }
        Update: {
          company_id?: string
          created_at?: string
          hours_per_week?: number
          id?: string
          month?: number | null
          updated_at?: string
          working_days?: number
          year?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_company_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "super_admin" | "client_admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["super_admin", "client_admin"],
    },
  },
} as const
