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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      assignment_documents: {
        Row: {
          assignment_id: string
          created_at: string
          document_html: string
          id: string
        }
        Insert: {
          assignment_id: string
          created_at?: string
          document_html: string
          id?: string
        }
        Update: {
          assignment_id?: string
          created_at?: string
          document_html?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignment_documents_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          assigned_to: string
          created_at: string
          department: string | null
          end_date: string | null
          id: string
          notes: string | null
          renewal_date: string | null
          serial_id: string
          serial_number: string
          start_date: string
          updated_at: string
        }
        Insert: {
          assigned_to: string
          created_at?: string
          department?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          renewal_date?: string | null
          serial_id: string
          serial_number: string
          start_date: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string
          created_at?: string
          department?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          renewal_date?: string | null
          serial_id?: string
          serial_number?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_serial_id_fkey"
            columns: ["serial_id"]
            isOneToOne: false
            referencedRelation: "serials"
            referencedColumns: ["id"]
          },
        ]
      }
      materials: {
        Row: {
          category: Database["public"]["Enums"]["material_category"]
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          manufacturer: string | null
          min_stock: number | null
          model: string | null
          name: string
          stock: number
          unit_price: number | null
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["material_category"]
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          manufacturer?: string | null
          min_stock?: number | null
          model?: string | null
          name: string
          stock?: number
          unit_price?: number | null
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["material_category"]
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          manufacturer?: string | null
          min_stock?: number | null
          model?: string | null
          name?: string
          stock?: number
          unit_price?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      order_files: {
        Row: {
          file_name: string
          file_path: string
          file_type: string
          id: string
          order_id: string
          uploaded_at: string
        }
        Insert: {
          file_name: string
          file_path: string
          file_type: string
          id?: string
          order_id: string
          uploaded_at?: string
        }
        Update: {
          file_name?: string
          file_path?: string
          file_type?: string
          id?: string
          order_id?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_files_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_lines: {
        Row: {
          created_at: string
          delivered_quantity: number | null
          id: string
          material_id: string | null
          material_name: string
          order_id: string
          quantity: number
          tax_rate: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          delivered_quantity?: number | null
          id?: string
          material_id?: string | null
          material_name: string
          order_id: string
          quantity: number
          tax_rate?: number
          unit_price: number
        }
        Update: {
          created_at?: string
          delivered_quantity?: number | null
          id?: string
          material_id?: string | null
          material_name?: string
          order_id?: string
          quantity?: number
          tax_rate?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_lines_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_lines_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount: number
          created_at: string
          currency: string
          description: string | null
          id: string
          reference: string
          requested_by: string | null
          site: string | null
          status: Database["public"]["Enums"]["order_status"]
          supplier: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          reference: string
          requested_by?: string | null
          site?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          supplier: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          reference?: string
          requested_by?: string | null
          site?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          supplier?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          department: string | null
          display_name: string
          email: string
          id: string
          site: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          display_name: string
          email: string
          id: string
          site?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string | null
          display_name?: string
          email?: string
          id?: string
          site?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      serials: {
        Row: {
          created_at: string
          id: string
          location: string | null
          material_id: string
          notes: string | null
          order_line_id: string | null
          purchase_date: string | null
          renewal_date: string | null
          serial_number: string
          status: Database["public"]["Enums"]["serial_status"]
          updated_at: string
          warranty_end: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          location?: string | null
          material_id: string
          notes?: string | null
          order_line_id?: string | null
          purchase_date?: string | null
          renewal_date?: string | null
          serial_number: string
          status?: Database["public"]["Enums"]["serial_status"]
          updated_at?: string
          warranty_end?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          location?: string | null
          material_id?: string
          notes?: string | null
          order_line_id?: string | null
          purchase_date?: string | null
          renewal_date?: string | null
          serial_number?: string
          status?: Database["public"]["Enums"]["serial_status"]
          updated_at?: string
          warranty_end?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "serials_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "serials_order_line_id_fkey"
            columns: ["order_line_id"]
            isOneToOne: false
            referencedRelation: "order_lines"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          contact: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
        }
        Insert: {
          address?: string | null
          contact?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
        }
        Update: {
          address?: string | null
          contact?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          department: string | null
          display_name: string
          email: string
          id: string
          password: string
          role: Database["public"]["Enums"]["user_role"]
          site: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          display_name: string
          email: string
          id?: string
          password: string
          role?: Database["public"]["Enums"]["user_role"]
          site?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string | null
          display_name?: string
          email?: string
          id?: string
          password?: string
          role?: Database["public"]["Enums"]["user_role"]
          site?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "magasinier" | "acheteur" | "lecteur"
      material_category:
        | "PC Portable"
        | "Fixe"
        | "Écran"
        | "Clavier"
        | "Souris"
        | "Casque"
        | "Webcam"
        | "Autre"
      order_status:
        | "Demandé"
        | "Circuit interne"
        | "Commande fournisseur faite"
        | "Livré"
      serial_status:
        | "En stock"
        | "Attribué"
        | "En réparation"
        | "Retiré"
        | "Télétravail"
      user_role: "admin" | "magasinier" | "acheteur" | "lecteur"
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
      app_role: ["admin", "magasinier", "acheteur", "lecteur"],
      material_category: [
        "PC Portable",
        "Fixe",
        "Écran",
        "Clavier",
        "Souris",
        "Casque",
        "Webcam",
        "Autre",
      ],
      order_status: [
        "Demandé",
        "Circuit interne",
        "Commande fournisseur faite",
        "Livré",
      ],
      serial_status: [
        "En stock",
        "Attribué",
        "En réparation",
        "Retiré",
        "Télétravail",
      ],
      user_role: ["admin", "magasinier", "acheteur", "lecteur"],
    },
  },
} as const
