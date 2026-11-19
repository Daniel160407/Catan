// Hand-written to match supabase/migrations. Regenerate after linking with: pnpm db:types
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      games: {
        Row: { id: string, phase: string, state: Json, created_at: string, updated_at: string }
        Insert: { id: string, phase?: string, state: Json, created_at?: string, updated_at?: string }
        Update: { id?: string, phase?: string, state?: Json, created_at?: string, updated_at?: string }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}
