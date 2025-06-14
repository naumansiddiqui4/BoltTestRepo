import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          description: string
          category: string
          date: string
          type: 'income' | 'expense'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          description: string
          category: string
          date: string
          type: 'income' | 'expense'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          description?: string
          category?: string
          date?: string
          type?: 'income' | 'expense'
          created_at?: string
          updated_at?: string
        }
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          category: string
          budgeted: number
          spent: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category: string
          budgeted: number
          spent?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category?: string
          budgeted?: number
          spent?: number
          created_at?: string
          updated_at?: string
        }
      }
      statements: {
        Row: {
          id: string
          user_id: string
          filename: string
          file_path: string
          file_type: 'bank' | 'credit_card'
          upload_date: string
          processed: boolean
          transactions_extracted: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          filename: string
          file_path: string
          file_type: 'bank' | 'credit_card'
          upload_date?: string
          processed?: boolean
          transactions_extracted?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          filename?: string
          file_path?: string
          file_type?: 'bank' | 'credit_card'
          upload_date?: string
          processed?: boolean
          transactions_extracted?: number
          created_at?: string
        }
      }
    }
  }
}