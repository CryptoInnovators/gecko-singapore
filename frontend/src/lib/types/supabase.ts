export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string
          id: string
          image_url: string | null
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email: string
          id?: string
          image_url?: string | null
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          image_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      project_tasks: {
        Row: {
          absolute_file_path: string | null
          business_type: string | null
          category: string | null
          content: string | null
          contract_code: string | null
          description: string | null
          end_line: string | null
          function_type: string | null
          id: number
          key: string | null
          keyword: string | null
          name: string | null
          project_id: string | null
          recommendation: string | null
          relative_file_path: string | null
          result: string | null
          result_gpt4: string | null
          risklevel: string | null
          rule: string | null
          score: string | null
          similarity_with_rule: string | null
          start_line: string | null
          sub_business_type: string | null
          title: string | null
        }
        Insert: {
          absolute_file_path?: string | null
          business_type?: string | null
          category?: string | null
          content?: string | null
          contract_code?: string | null
          description?: string | null
          end_line?: string | null
          function_type?: string | null
          id?: number
          key?: string | null
          keyword?: string | null
          name?: string | null
          project_id?: string | null
          recommendation?: string | null
          relative_file_path?: string | null
          result?: string | null
          result_gpt4?: string | null
          risklevel?: string | null
          rule?: string | null
          score?: string | null
          similarity_with_rule?: string | null
          start_line?: string | null
          sub_business_type?: string | null
          title?: string | null
        }
        Update: {
          absolute_file_path?: string | null
          business_type?: string | null
          category?: string | null
          content?: string | null
          contract_code?: string | null
          description?: string | null
          end_line?: string | null
          function_type?: string | null
          id?: number
          key?: string | null
          keyword?: string | null
          name?: string | null
          project_id?: string | null
          recommendation?: string | null
          relative_file_path?: string | null
          result?: string | null
          result_gpt4?: string | null
          risklevel?: string | null
          rule?: string | null
          score?: string | null
          similarity_with_rule?: string | null
          start_line?: string | null
          sub_business_type?: string | null
          title?: string | null
        }
        Relationships: []
      }
      project_tasks_amazing_prompt: {
        Row: {
          absolute_file_path: string | null
          business_flow_code: string | null
          business_flow_context: string | null
          business_flow_lines: string | null
          business_type: string | null
          category: string | null
          content: string | null
          contract_code: string | null
          description: string | null
          end_line: string | null
          function_type: string | null
          id: number
          if_business_flow_scan: string | null
          key: string | null
          keyword: string | null
          name: string | null
          project_id: string | null
          recommendation: string | null
          relative_file_path: string | null
          result: string | null
          result_gpt4: string | null
          risklevel: string | null
          rule: string | null
          score: string | null
          similarity_with_rule: string | null
          start_line: string | null
          sub_business_type: string | null
          title: string | null
        }
        Insert: {
          absolute_file_path?: string | null
          business_flow_code?: string | null
          business_flow_context?: string | null
          business_flow_lines?: string | null
          business_type?: string | null
          category?: string | null
          content?: string | null
          contract_code?: string | null
          description?: string | null
          end_line?: string | null
          function_type?: string | null
          id?: number
          if_business_flow_scan?: string | null
          key?: string | null
          keyword?: string | null
          name?: string | null
          project_id?: string | null
          recommendation?: string | null
          relative_file_path?: string | null
          result?: string | null
          result_gpt4?: string | null
          risklevel?: string | null
          rule?: string | null
          score?: string | null
          similarity_with_rule?: string | null
          start_line?: string | null
          sub_business_type?: string | null
          title?: string | null
        }
        Update: {
          absolute_file_path?: string | null
          business_flow_code?: string | null
          business_flow_context?: string | null
          business_flow_lines?: string | null
          business_type?: string | null
          category?: string | null
          content?: string | null
          contract_code?: string | null
          description?: string | null
          end_line?: string | null
          function_type?: string | null
          id?: number
          if_business_flow_scan?: string | null
          key?: string | null
          keyword?: string | null
          name?: string | null
          project_id?: string | null
          recommendation?: string | null
          relative_file_path?: string | null
          result?: string | null
          result_gpt4?: string | null
          risklevel?: string | null
          rule?: string | null
          score?: string | null
          similarity_with_rule?: string | null
          start_line?: string | null
          sub_business_type?: string | null
          title?: string | null
        }
        Relationships: []
      }
      prompt_cache2: {
        Row: {
          index: string
          key: string | null
          value: string | null
        }
        Insert: {
          index: string
          key?: string | null
          value?: string | null
        }
        Update: {
          index?: string
          key?: string | null
          value?: string | null
        }
        Relationships: []
      }
      scans: {
        Row: {
          id: string
          name: string
          result: Json | null
          uploaded_at: string
          user_id: string
        }
        Insert: {
          id?: string
          name: string
          result?: Json | null
          uploaded_at: string
          user_id?: string
        }
        Update: {
          id?: string
          name?: string
          result?: Json | null
          uploaded_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscription: {
        Row: {
          created_at: string
          customer_id: string | null
          email: string
          end_at: string | null
          subscription_id: string | null
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          email: string
          end_at?: string | null
          subscription_id?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          email?: string
          end_at?: string | null
          subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_email_fkey"
            columns: ["email"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["email"]
          },
        ]
      }
      test: {
        Row: {
          id: string
          name: string
          result: Json | null
          uploaded_at: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          name: string
          result?: Json | null
          uploaded_at?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          result?: Json | null
          uploaded_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
