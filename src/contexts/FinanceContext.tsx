import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

export interface Transaction {
  id: string
  amount: number
  description: string
  category: string
  date: string
  type: 'income' | 'expense'
  created_at?: string
  updated_at?: string
}

export interface BudgetItem {
  id: string
  category: string
  budgeted: number
  spent: number
  created_at?: string
  updated_at?: string
}

export interface Statement {
  id: string
  filename: string
  file_path: string
  file_type: 'bank' | 'credit_card'
  upload_date: string
  processed: boolean
  transactions_extracted: number
  created_at: string
}

interface FinanceContextType {
  transactions: Transaction[]
  budgets: BudgetItem[]
  statements: Statement[]
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
  updateBudget: (category: string, amount: number) => Promise<void>
  uploadStatement: (file: File, type: 'bank' | 'credit_card') => Promise<void>
  deleteStatement: (id: string) => Promise<void>
  categories: string[]
  loading: boolean
  refreshData: () => Promise<void>
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined)

export function useFinance() {
  const context = useContext(FinanceContext)
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider')
  }
  return context
}

const defaultCategories = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Travel',
  'Education',
  'Salary',
  'Freelance',
  'Investment',
  'Other'
]

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [budgets, setBudgets] = useState<BudgetItem[]>([])
  const [statements, setStatements] = useState<Statement[]>([])
  const [loading, setLoading] = useState(false)

  const refreshData = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Fetch transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (transactionsError) throw transactionsError
      setTransactions(transactionsData || [])

      // Fetch budgets
      const { data: budgetsData, error: budgetsError } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)

      if (budgetsError) throw budgetsError
      
      // Initialize budgets for all categories if they don't exist
      const existingBudgets = budgetsData || []
      const missingCategories = defaultCategories.filter(
        cat => !existingBudgets.some(budget => budget.category === cat)
      )

      if (missingCategories.length > 0) {
        const newBudgets = missingCategories.map(category => ({
          user_id: user.id,
          category,
          budgeted: 0,
          spent: 0
        }))

        const { data: insertedBudgets, error: insertError } = await supabase
          .from('budgets')
          .insert(newBudgets)
          .select()

        if (!insertError && insertedBudgets) {
          setBudgets([...existingBudgets, ...insertedBudgets])
        } else {
          setBudgets(existingBudgets)
        }
      } else {
        setBudgets(existingBudgets)
      }

      // Fetch statements
      const { data: statementsData, error: statementsError } = await supabase
        .from('statements')
        .select('*')
        .eq('user_id', user.id)
        .order('upload_date', { ascending: false })

      if (statementsError) throw statementsError
      setStatements(statementsData || [])

    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      refreshData()
    } else {
      setTransactions([])
      setBudgets([])
      setStatements([])
    }
  }, [user])

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          ...transaction,
          user_id: user.id
        })
        .select()
        .single()

      if (error) throw error

      setTransactions(prev => [data, ...prev])

      // Update budget spent amount if it's an expense
      if (transaction.type === 'expense') {
        await updateBudgetSpent(transaction.category, transaction.amount, 'add')
      }
    } catch (error) {
      console.error('Error adding transaction:', error)
      throw error
    }
  }

  const deleteTransaction = async (id: string) => {
    if (!user) return

    try {
      const transaction = transactions.find(t => t.id === id)
      
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      setTransactions(prev => prev.filter(t => t.id !== id))

      // Update budget spent amount if it was an expense
      if (transaction && transaction.type === 'expense') {
        await updateBudgetSpent(transaction.category, transaction.amount, 'subtract')
      }
    } catch (error) {
      console.error('Error deleting transaction:', error)
      throw error
    }
  }

  const updateBudgetSpent = async (category: string, amount: number, operation: 'add' | 'subtract') => {
    if (!user) return

    try {
      const currentBudget = budgets.find(b => b.category === category)
      if (!currentBudget) return

      const newSpent = operation === 'add' 
        ? currentBudget.spent + amount 
        : Math.max(0, currentBudget.spent - amount)

      const { data, error } = await supabase
        .from('budgets')
        .update({ spent: newSpent })
        .eq('id', currentBudget.id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      setBudgets(prev => prev.map(budget => 
        budget.id === currentBudget.id ? data : budget
      ))
    } catch (error) {
      console.error('Error updating budget spent:', error)
    }
  }

  const updateBudget = async (category: string, amount: number) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('budgets')
        .upsert({
          user_id: user.id,
          category,
          budgeted: amount
        })
        .select()
        .single()

      if (error) throw error

      setBudgets(prev => {
        const existingIndex = prev.findIndex(b => b.category === category)
        if (existingIndex >= 0) {
          const updated = [...prev]
          updated[existingIndex] = data
          return updated
        } else {
          return [...prev, data]
        }
      })
    } catch (error) {
      console.error('Error updating budget:', error)
      throw error
    }
  }

  const uploadStatement = async (file: File, type: 'bank' | 'credit_card') => {
    if (!user) return

    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('statements')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Save statement record to database
      const { data, error } = await supabase
        .from('statements')
        .insert({
          user_id: user.id,
          filename: file.name,
          file_path: uploadData.path,
          file_type: type
        })
        .select()
        .single()

      if (error) throw error

      setStatements(prev => [data, ...prev])

      // TODO: Process PDF and extract transactions
      // This would typically be done by a background job or edge function
      
    } catch (error) {
      console.error('Error uploading statement:', error)
      throw error
    }
  }

  const deleteStatement = async (id: string) => {
    if (!user) return

    try {
      const statement = statements.find(s => s.id === id)
      if (!statement) return

      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from('statements')
        .remove([statement.file_path])

      if (storageError) console.error('Error deleting file:', storageError)

      // Delete record from database
      const { error } = await supabase
        .from('statements')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      setStatements(prev => prev.filter(s => s.id !== id))
    } catch (error) {
      console.error('Error deleting statement:', error)
      throw error
    }
  }

  const value = {
    transactions,
    budgets,
    statements,
    addTransaction,
    deleteTransaction,
    updateBudget,
    uploadStatement,
    deleteStatement,
    categories: defaultCategories,
    loading,
    refreshData
  }

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  )
}