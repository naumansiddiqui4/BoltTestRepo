import React, { createContext, useContext, useState, useEffect } from 'react'

export interface Transaction {
  id: string
  amount: number
  description: string
  category: string
  date: string
  type: 'income' | 'expense'
}

export interface BudgetItem {
  id: string
  category: string
  budgeted: number
  spent: number
}

interface FinanceContextType {
  transactions: Transaction[]
  budgets: BudgetItem[]
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void
  deleteTransaction: (id: string) => void
  updateBudget: (category: string, amount: number) => void
  categories: string[]
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
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [budgets, setBudgets] = useState<BudgetItem[]>([])

  useEffect(() => {
    // Load data from localStorage
    const storedTransactions = localStorage.getItem('transactions')
    const storedBudgets = localStorage.getItem('budgets')
    
    if (storedTransactions) {
      setTransactions(JSON.parse(storedTransactions))
    } else {
      // Add some sample data
      const sampleTransactions: Transaction[] = [
        {
          id: '1',
          amount: 3500,
          description: 'Monthly Salary',
          category: 'Salary',
          date: new Date().toISOString().split('T')[0],
          type: 'income'
        },
        {
          id: '2',
          amount: 45.50,
          description: 'Grocery Shopping',
          category: 'Food & Dining',
          date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
          type: 'expense'
        },
        {
          id: '3',
          amount: 12.99,
          description: 'Netflix Subscription',
          category: 'Entertainment',
          date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
          type: 'expense'
        }
      ]
      setTransactions(sampleTransactions)
    }

    if (storedBudgets) {
      setBudgets(JSON.parse(storedBudgets))
    } else {
      // Initialize default budgets
      const defaultBudgets: BudgetItem[] = defaultCategories
        .filter(cat => cat !== 'Salary' && cat !== 'Freelance' && cat !== 'Investment')
        .map(category => ({
          id: category,
          category,
          budgeted: 0,
          spent: 0
        }))
      setBudgets(defaultBudgets)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions))
  }, [transactions])

  useEffect(() => {
    localStorage.setItem('budgets', JSON.stringify(budgets))
  }, [budgets])

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString()
    }
    setTransactions(prev => [newTransaction, ...prev])

    // Update budget spent amount if it's an expense
    if (transaction.type === 'expense') {
      setBudgets(prev => prev.map(budget => 
        budget.category === transaction.category
          ? { ...budget, spent: budget.spent + transaction.amount }
          : budget
      ))
    }
  }

  const deleteTransaction = (id: string) => {
    const transaction = transactions.find(t => t.id === id)
    if (transaction && transaction.type === 'expense') {
      setBudgets(prev => prev.map(budget => 
        budget.category === transaction.category
          ? { ...budget, spent: Math.max(0, budget.spent - transaction.amount) }
          : budget
      ))
    }
    setTransactions(prev => prev.filter(t => t.id !== id))
  }

  const updateBudget = (category: string, amount: number) => {
    setBudgets(prev => prev.map(budget => 
      budget.category === category
        ? { ...budget, budgeted: amount }
        : budget
    ))
  }

  const value = {
    transactions,
    budgets,
    addTransaction,
    deleteTransaction,
    updateBudget,
    categories: defaultCategories
  }

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  )
}