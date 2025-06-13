import React from 'react'
import { useFinance } from '../../contexts/FinanceContext'
import { DollarSign, TrendingUp, TrendingDown, CreditCard } from 'lucide-react'
import { format } from 'date-fns'

export function Dashboard() {
  const { transactions, budgets } = useFinance()

  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const monthlyTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date)
    return transactionDate.getMonth() === currentMonth && 
           transactionDate.getFullYear() === currentYear
  })

  const totalIncome = monthlyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpenses

  const totalBudget = budgets.reduce((sum, b) => sum + b.budgeted, 0)
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0)

  const recentTransactions = transactions.slice(0, 5)

  const stats = [
    {
      name: 'Total Balance',
      value: `$${balance.toFixed(2)}`,
      icon: DollarSign,
      color: balance >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: balance >= 0 ? 'bg-green-100' : 'bg-red-100'
    },
    {
      name: 'Monthly Income',
      value: `$${totalIncome.toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      name: 'Monthly Expenses',
      value: `$${totalExpenses.toFixed(2)}`,
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      name: 'Budget Used',
      value: `${totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0}%`,
      icon: CreditCard,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome back! Here's your financial overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.name} className="bg-white overflow-hidden shadow-sm rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`p-3 rounded-md ${stat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.name}
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stat.value}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Transactions */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Recent Transactions
          </h3>
          {recentTransactions.length > 0 ? (
            <div className="flow-root">
              <ul className="-my-5 divide-y divide-gray-200">
                {recentTransactions.map((transaction) => (
                  <li key={transaction.id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className={`p-2 rounded-full ${
                          transaction.type === 'income' 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-red-100 text-red-600'
                        }`}>
                          {transaction.type === 'income' ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {transaction.description}
                        </p>
                        <p className="text-sm text-gray-500">
                          {transaction.category} • {format(new Date(transaction.date), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <span className={`text-sm font-medium ${
                          transaction.type === 'income' 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No transactions yet</p>
          )}
        </div>
      </div>

      {/* Budget Overview */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Budget Overview
          </h3>
          {budgets.filter(b => b.budgeted > 0).length > 0 ? (
            <div className="space-y-4">
              {budgets
                .filter(budget => budget.budgeted > 0)
                .slice(0, 5)
                .map((budget) => {
                  const percentage = budget.budgeted > 0 ? (budget.spent / budget.budgeted) * 100 : 0
                  const isOverBudget = percentage > 100
                  
                  return (
                    <div key={budget.id}>
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-900">{budget.category}</span>
                        <span className="text-gray-500">
                          ${budget.spent.toFixed(2)} / ${budget.budgeted.toFixed(2)}
                        </span>
                      </div>
                      <div className="mt-1">
                        <div className="bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              isOverBudget ? 'bg-red-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                      {isOverBudget && (
                        <p className="text-xs text-red-600 mt-1">
                          Over budget by ${(budget.spent - budget.budgeted).toFixed(2)}
                        </p>
                      )}
                    </div>
                  )
                })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No budgets set yet</p>
          )}
        </div>
      </div>
    </div>
  )
}