import React, { useState } from 'react'
import { useFinance } from '../../contexts/FinanceContext'
import { Edit2, Save, X } from 'lucide-react'

export function Budget() {
  const { budgets, updateBudget, categories } = useFinance()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const handleEdit = (budget: any) => {
    setEditingId(budget.id)
    setEditValue(budget.budgeted.toString())
  }

  const handleSave = (categoryId: string) => {
    const amount = parseFloat(editValue)
    if (!isNaN(amount) && amount >= 0) {
      updateBudget(categoryId, amount)
    }
    setEditingId(null)
    setEditValue('')
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditValue('')
  }

  const totalBudgeted = budgets.reduce((sum, b) => sum + b.budgeted, 0)
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0)
  const remainingBudget = totalBudgeted - totalSpent

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Budget Management</h1>
        <p className="mt-1 text-sm text-gray-600">
          Set and track your spending limits by category
        </p>
      </div>

      {/* Budget Summary */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-blue-100 p-3 rounded-md">
                  <span className="text-blue-600 font-semibold">$</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Budgeted
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    ${totalBudgeted.toFixed(2)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-red-100 p-3 rounded-md">
                  <span className="text-red-600 font-semibold">$</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Spent
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    ${totalSpent.toFixed(2)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`p-3 rounded-md ${
                  remainingBudget >= 0 ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <span className={`font-semibold ${
                    remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>$</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Remaining
                  </dt>
                  <dd className={`text-lg font-medium ${
                    remainingBudget >= 0 ? 'text-gray-900' : 'text-red-600'
                  }`}>
                    ${remainingBudget.toFixed(2)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Categories */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
            Budget by Category
          </h3>
          
          <div className="space-y-6">
            {budgets.map((budget) => {
              const percentage = budget.budgeted > 0 ? (budget.spent / budget.budgeted) * 100 : 0
              const isOverBudget = percentage > 100
              const isEditing = editingId === budget.id

              return (
                <div key={budget.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        {budget.category}
                      </h4>
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                        <span>Spent: ${budget.spent.toFixed(2)}</span>
                        <span>•</span>
                        <span>
                          Budgeted: 
                          {isEditing ? (
                            <div className="inline-flex items-center ml-1">
                              <input
                                type="number"
                                step="0.01"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                autoFocus
                              />
                              <button
                                onClick={() => handleSave(budget.category)}
                                className="ml-1 p-1 text-green-600 hover:text-green-800"
                              >
                                <Save className="h-3 w-3" />
                              </button>
                              <button
                                onClick={handleCancel}
                                className="ml-1 p-1 text-red-600 hover:text-red-800"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <span className="ml-1">
                              ${budget.budgeted.toFixed(2)}
                              <button
                                onClick={() => handleEdit(budget)}
                                className="ml-2 p-1 text-gray-400 hover:text-gray-600"
                              >
                                <Edit2 className="h-3 w-3" />
                              </button>
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                    
                    {budget.budgeted > 0 && (
                      <div className="text-right">
                        <span className={`text-sm font-medium ${
                          isOverBudget ? 'text-red-600' : 'text-gray-900'
                        }`}>
                          {percentage.toFixed(1)}%
                        </span>
                        {isOverBudget && (
                          <p className="text-xs text-red-600 mt-1">
                            Over by ${(budget.spent - budget.budgeted).toFixed(2)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {budget.budgeted > 0 && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          isOverBudget ? 'bg-red-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  )}

                  {budget.budgeted === 0 && (
                    <div className="text-center py-2">
                      <button
                        onClick={() => handleEdit(budget)}
                        className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                      >
                        Set budget for this category
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}