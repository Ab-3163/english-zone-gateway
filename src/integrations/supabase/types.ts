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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          metadata: Json | null
          read: boolean | null
          title: string
          type: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          read?: boolean | null
          title: string
          type: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          read?: boolean | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      admin_otp_codes: {
        Row: {
          attempts: number | null
          code: string
          created_at: string
          email: string
          expires_at: string
          id: string
          used: boolean | null
        }
        Insert: {
          attempts?: number | null
          code: string
          created_at?: string
          email: string
          expires_at: string
          id?: string
          used?: boolean | null
        }
        Update: {
          attempts?: number | null
          code?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          used?: boolean | null
        }
        Relationships: []
      }
      admin_sessions: {
        Row: {
          created_at: string
          device_id: string
          expires_at: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_id: string
          expires_at: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_id?: string
          expires_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          content: string
          created_at: string
          id: string
          image_url: string | null
          published: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          published?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          published?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      certificates: {
        Row: {
          certificate_number: string
          course: string
          created_at: string
          full_name: string
          grade: string | null
          id: string
          level: string | null
          pass_date: string
          result_id: string | null
          score: number | null
          student_id: string
          updated_at: string
        }
        Insert: {
          certificate_number?: string
          course: string
          created_at?: string
          full_name: string
          grade?: string | null
          id?: string
          level?: string | null
          pass_date?: string
          result_id?: string | null
          score?: number | null
          student_id: string
          updated_at?: string
        }
        Update: {
          certificate_number?: string
          course?: string
          created_at?: string
          full_name?: string
          grade?: string | null
          id?: string
          level?: string | null
          pass_date?: string
          result_id?: string | null
          score?: number | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_result_id_fkey"
            columns: ["result_id"]
            isOneToOne: false
            referencedRelation: "student_results"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string
          description: string
          features: string[] | null
          id: string
          image_url: string | null
          language: string | null
          price: number
          published: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          features?: string[] | null
          id?: string
          image_url?: string | null
          language?: string | null
          price: number
          published?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          features?: string[] | null
          id?: string
          image_url?: string | null
          language?: string | null
          price?: number
          published?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      invoice_logs: {
        Row: {
          channel: string
          created_at: string
          error_message: string | null
          id: string
          invoice_number: string | null
          phone: string | null
          provider_response: Json | null
          status: string
          student_id: string | null
        }
        Insert: {
          channel?: string
          created_at?: string
          error_message?: string | null
          id?: string
          invoice_number?: string | null
          phone?: string | null
          provider_response?: Json | null
          status: string
          student_id?: string | null
        }
        Update: {
          channel?: string
          created_at?: string
          error_message?: string | null
          id?: string
          invoice_number?: string | null
          phone?: string | null
          provider_response?: Json | null
          status?: string
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_logs_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      media: {
        Row: {
          created_at: string
          file_name: string
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          published: boolean | null
          title: string | null
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          published?: boolean | null
          title?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          published?: boolean | null
          title?: string | null
        }
        Relationships: []
      }
      registrations: {
        Row: {
          age: number | null
          course_type: string | null
          created_at: string
          full_name: string
          id: string
          language: string
          level: string | null
          notes: string | null
          payment_method: string | null
          phone: string
          preferred_time: string | null
          receipt_url: string | null
          status: string
          updated_at: string
        }
        Insert: {
          age?: number | null
          course_type?: string | null
          created_at?: string
          full_name: string
          id?: string
          language: string
          level?: string | null
          notes?: string | null
          payment_method?: string | null
          phone: string
          preferred_time?: string | null
          receipt_url?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          age?: number | null
          course_type?: string | null
          created_at?: string
          full_name?: string
          id?: string
          language?: string
          level?: string | null
          notes?: string | null
          payment_method?: string | null
          phone?: string
          preferred_time?: string | null
          receipt_url?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      student_results: {
        Row: {
          admin_note: string | null
          course: string
          created_at: string
          full_name: string
          grade: string | null
          id: string
          level: string | null
          phone: string | null
          published: boolean
          score: number | null
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          admin_note?: string | null
          course: string
          created_at?: string
          full_name: string
          grade?: string | null
          id?: string
          level?: string | null
          phone?: string | null
          published?: boolean
          score?: number | null
          status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          admin_note?: string | null
          course?: string
          created_at?: string
          full_name?: string
          grade?: string | null
          id?: string
          level?: string | null
          phone?: string | null
          published?: boolean
          score?: number | null
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          absences: number | null
          admin_note: string | null
          age: number | null
          attendance_rate: number | null
          average: number | null
          birth_date: string | null
          course_fee: number | null
          course_type: string | null
          created_at: string
          eligible_promotion: boolean | null
          email: string | null
          final_exam_score: number | null
          first_exam_score: number | null
          full_name: string
          grade: string | null
          group_name: string | null
          id: string
          invoice_generated_at: string | null
          invoice_number: string | null
          invoice_pdf_url: string | null
          invoice_sent_at: string | null
          invoice_status: string | null
          language: string | null
          level: string | null
          next_level: string | null
          notes: string | null
          paid_amount: number | null
          pass_status: string | null
          payment_confirmed_at: string | null
          payment_method: string | null
          payment_receipt_url: string | null
          payment_status: string
          phone: string
          preferred_time: string | null
          rejection_reason: string | null
          remaining_amount: number | null
          room: string | null
          status: string
          student_id: string
          study_days: string | null
          study_time: string | null
          teacher: string | null
          total_sessions: number | null
          updated_at: string
        }
        Insert: {
          absences?: number | null
          admin_note?: string | null
          age?: number | null
          attendance_rate?: number | null
          average?: number | null
          birth_date?: string | null
          course_fee?: number | null
          course_type?: string | null
          created_at?: string
          eligible_promotion?: boolean | null
          email?: string | null
          final_exam_score?: number | null
          first_exam_score?: number | null
          full_name: string
          grade?: string | null
          group_name?: string | null
          id?: string
          invoice_generated_at?: string | null
          invoice_number?: string | null
          invoice_pdf_url?: string | null
          invoice_sent_at?: string | null
          invoice_status?: string | null
          language?: string | null
          level?: string | null
          next_level?: string | null
          notes?: string | null
          paid_amount?: number | null
          pass_status?: string | null
          payment_confirmed_at?: string | null
          payment_method?: string | null
          payment_receipt_url?: string | null
          payment_status?: string
          phone: string
          preferred_time?: string | null
          rejection_reason?: string | null
          remaining_amount?: number | null
          room?: string | null
          status?: string
          student_id?: string
          study_days?: string | null
          study_time?: string | null
          teacher?: string | null
          total_sessions?: number | null
          updated_at?: string
        }
        Update: {
          absences?: number | null
          admin_note?: string | null
          age?: number | null
          attendance_rate?: number | null
          average?: number | null
          birth_date?: string | null
          course_fee?: number | null
          course_type?: string | null
          created_at?: string
          eligible_promotion?: boolean | null
          email?: string | null
          final_exam_score?: number | null
          first_exam_score?: number | null
          full_name?: string
          grade?: string | null
          group_name?: string | null
          id?: string
          invoice_generated_at?: string | null
          invoice_number?: string | null
          invoice_pdf_url?: string | null
          invoice_sent_at?: string | null
          invoice_status?: string | null
          language?: string | null
          level?: string | null
          next_level?: string | null
          notes?: string | null
          paid_amount?: number | null
          pass_status?: string | null
          payment_confirmed_at?: string | null
          payment_method?: string | null
          payment_receipt_url?: string | null
          payment_status?: string
          phone?: string
          preferred_time?: string | null
          rejection_reason?: string | null
          remaining_amount?: number | null
          room?: string | null
          status?: string
          student_id?: string
          study_days?: string | null
          study_time?: string | null
          teacher?: string | null
          total_sessions?: number | null
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
          role?: Database["public"]["Enums"]["app_role"]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      confirm_payment_and_prepare_invoice: {
        Args: {
          _paid_amount?: number
          _payment_method?: string
          _student_uuid: string
        }
        Returns: {
          absences: number | null
          admin_note: string | null
          age: number | null
          attendance_rate: number | null
          average: number | null
          birth_date: string | null
          course_fee: number | null
          course_type: string | null
          created_at: string
          eligible_promotion: boolean | null
          email: string | null
          final_exam_score: number | null
          first_exam_score: number | null
          full_name: string
          grade: string | null
          group_name: string | null
          id: string
          invoice_generated_at: string | null
          invoice_number: string | null
          invoice_pdf_url: string | null
          invoice_sent_at: string | null
          invoice_status: string | null
          language: string | null
          level: string | null
          next_level: string | null
          notes: string | null
          paid_amount: number | null
          pass_status: string | null
          payment_confirmed_at: string | null
          payment_method: string | null
          payment_receipt_url: string | null
          payment_status: string
          phone: string
          preferred_time: string | null
          rejection_reason: string | null
          remaining_amount: number | null
          room: string | null
          status: string
          student_id: string
          study_days: string | null
          study_time: string | null
          teacher: string | null
          total_sessions: number | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "students"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      generate_certificate_number: { Args: never; Returns: string }
      generate_invoice_number: { Args: never; Returns: string }
      generate_short_student_id: { Args: never; Returns: string }
      generate_student_id: { Args: never; Returns: string }
      get_student_by_credentials: {
        Args: { _phone: string; _student_id: string }
        Returns: {
          absences: number | null
          admin_note: string | null
          age: number | null
          attendance_rate: number | null
          average: number | null
          birth_date: string | null
          course_fee: number | null
          course_type: string | null
          created_at: string
          eligible_promotion: boolean | null
          email: string | null
          final_exam_score: number | null
          first_exam_score: number | null
          full_name: string
          grade: string | null
          group_name: string | null
          id: string
          invoice_generated_at: string | null
          invoice_number: string | null
          invoice_pdf_url: string | null
          invoice_sent_at: string | null
          invoice_status: string | null
          language: string | null
          level: string | null
          next_level: string | null
          notes: string | null
          paid_amount: number | null
          pass_status: string | null
          payment_confirmed_at: string | null
          payment_method: string | null
          payment_receipt_url: string | null
          payment_status: string
          phone: string
          preferred_time: string | null
          rejection_reason: string | null
          remaining_amount: number | null
          room: string | null
          status: string
          student_id: string
          study_days: string | null
          study_time: string | null
          teacher: string | null
          total_sessions: number | null
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "students"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      list_published_results: {
        Args: { _query?: string }
        Returns: {
          admin_note: string
          course: string
          full_name: string
          grade: string
          level: string
          score: number
          status: string
          student_id: string
        }[]
      }
      search_student_result: {
        Args: { _query: string }
        Returns: {
          admin_note: string
          course: string
          full_name: string
          grade: string
          level: string
          score: number
          status: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
