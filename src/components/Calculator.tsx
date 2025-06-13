import React, { useState } from 'react'

export function Calculator() {
  const [display, setDisplay] = useState('0')
  const [previousValue, setPreviousValue] = useState<number | null>(null)
  const [operation, setOperation] = useState<string | null>(null)
  const [waitingForOperand, setWaitingForOperand] = useState(false)

  const inputNumber = (num: string) => {
    if (waitingForOperand) {
      setDisplay(num)
      setWaitingForOperand(false)
    } else {
      setDisplay(display === '0' ? num : display + num)
    }
  }

  const inputOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display)

    if (previousValue === null) {
      setPreviousValue(inputValue)
    } else if (operation) {
      const currentValue = previousValue || 0
      const newValue = calculate(currentValue, inputValue, operation)

      setDisplay(String(newValue))
      setPreviousValue(newValue)
    }

    setWaitingForOperand(true)
    setOperation(nextOperation)
  }

  const calculate = (firstValue: number, secondValue: number, operation: string) => {
    switch (operation) {
      case '+':
        return firstValue + secondValue
      case '-':
        return firstValue - secondValue
      case '×':
        return firstValue * secondValue
      case '÷':
        return firstValue / secondValue
      case '=':
        return secondValue
      default:
        return secondValue
    }
  }

  const performCalculation = () => {
    const inputValue = parseFloat(display)

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation)
      setDisplay(String(newValue))
      setPreviousValue(null)
      setOperation(null)
      setWaitingForOperand(true)
    }
  }

  const clear = () => {
    setDisplay('0')
    setPreviousValue(null)
    setOperation(null)
    setWaitingForOperand(false)
  }

  const buttons = [
    ['C', '±', '%', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', '=']
  ]

  return (
    <div className="max-w-sm mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Calculator</h2>
      
      <div className="bg-gray-900 rounded-lg p-4 mb-4">
        <div className="text-right text-white text-3xl font-mono overflow-hidden">
          {display}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {buttons.flat().map((btn, index) => (
          <button
            key={index}
            onClick={() => {
              if (btn === 'C') clear()
              else if (btn === '=') performCalculation()
              else if (['+', '-', '×', '÷'].includes(btn)) inputOperation(btn)
              else if (btn === '±') setDisplay(String(-parseFloat(display)))
              else if (btn === '%') setDisplay(String(parseFloat(display) / 100))
              else inputNumber(btn)
            }}
            className={`h-16 rounded-lg font-semibold text-lg transition-all duration-150 ${
              btn === '0' ? 'col-span-2' : ''
            } ${
              ['+', '-', '×', '÷', '='].includes(btn)
                ? 'bg-orange-500 hover:bg-orange-600 text-white'
                : ['C', '±', '%'].includes(btn)
                ? 'bg-gray-300 hover:bg-gray-400 text-gray-800'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
            } active:scale-95 shadow-md hover:shadow-lg`}
          >
            {btn}
          </button>
        ))}
      </div>
    </div>
  )
}