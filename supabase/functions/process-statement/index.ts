import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Transaction {
  date: string
  description: string
  amount: number
  type: 'income' | 'expense'
  category: string
}

// Simple transaction categorization rules
const categorizeTransaction = (description: string, amount: number): string => {
  const desc = description.toLowerCase()
  
  if (desc.includes('salary') || desc.includes('payroll') || desc.includes('wage')) {
    return 'Salary'
  }
  if (desc.includes('grocery') || desc.includes('supermarket') || desc.includes('food')) {
    return 'Food & Dining'
  }
  if (desc.includes('gas') || desc.includes('fuel') || desc.includes('uber') || desc.includes('taxi')) {
    return 'Transportation'
  }
  if (desc.includes('netflix') || desc.includes('spotify') || desc.includes('movie') || desc.includes('entertainment')) {
    return 'Entertainment'
  }
  if (desc.includes('electric') || desc.includes('water') || desc.includes('internet') || desc.includes('phone')) {
    return 'Bills & Utilities'
  }
  if (desc.includes('amazon') || desc.includes('shopping') || desc.includes('store')) {
    return 'Shopping'
  }
  if (desc.includes('hospital') || desc.includes('doctor') || desc.includes('pharmacy')) {
    return 'Healthcare'
  }
  if (desc.includes('hotel') || desc.includes('flight') || desc.includes('travel')) {
    return 'Travel'
  }
  if (desc.includes('school') || desc.includes('university') || desc.includes('education')) {
    return 'Education'
  }
  if (desc.includes('dividend') || desc.includes('interest') || desc.includes('investment')) {
    return 'Investment'
  }
  
  return 'Other'
}

// Simple PDF text extraction (in a real implementation, you'd use a proper PDF parser)
const extractTextFromPDF = async (pdfBuffer: ArrayBuffer): Promise<string> => {
  // This is a simplified mock implementation
  // In a real scenario, you'd use a library like pdf-parse or similar
  const decoder = new TextDecoder()
  const text = decoder.decode(pdfBuffer)
  
  // Mock extracted text that looks like a bank statement
  return `
    Date        Description                     Amount
    2024-01-15  SALARY DEPOSIT                  +3500.00
    2024-01-16  GROCERY STORE                   -45.67
    2024-01-17  GAS STATION                     -32.50
    2024-01-18  NETFLIX SUBSCRIPTION            -15.99
    2024-01-19  AMAZON PURCHASE                 -89.99
    2024-01-20  ELECTRIC BILL                   -125.00
  `
}

// Parse transactions from extracted text
const parseTransactions = (text: string): Transaction[] => {
  const lines = text.split('\n').filter(line => line.trim())
  const transactions: Transaction[] = []
  
  for (const line of lines) {
    // Simple regex to match date, description, and amount
    const match = line.match(/(\d{4}-\d{2}-\d{2})\s+(.+?)\s+([-+]?\d+\.\d{2})/)
    if (match) {
      const [, date, description, amountStr] = match
      const amount = Math.abs(parseFloat(amountStr))
      const type: 'income' | 'expense' = amountStr.startsWith('+') ? 'income' : 'expense'
      const category = categorizeTransaction(description, amount)
      
      transactions.push({
        date,
        description: description.trim(),
        amount,
        type,
        category
      })
    }
  }
  
  return transactions
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { statementId } = await req.json()

    // Get the statement record
    const { data: statement, error: statementError } = await supabaseClient
      .from('statements')
      .select('*')
      .eq('id', statementId)
      .single()

    if (statementError || !statement) {
      throw new Error('Statement not found')
    }

    // Download the PDF file from storage
    const { data: fileData, error: downloadError } = await supabaseClient.storage
      .from('statements')
      .download(statement.file_path)

    if (downloadError || !fileData) {
      throw new Error('Failed to download statement file')
    }

    // Extract text from PDF
    const pdfBuffer = await fileData.arrayBuffer()
    const extractedText = await extractTextFromPDF(pdfBuffer)

    // Parse transactions from extracted text
    const transactions = parseTransactions(extractedText)

    // Insert transactions into database
    const transactionsToInsert = transactions.map(transaction => ({
      ...transaction,
      user_id: statement.user_id
    }))

    const { error: insertError } = await supabaseClient
      .from('transactions')
      .insert(transactionsToInsert)

    if (insertError) {
      throw insertError
    }

    // Update statement as processed
    const { error: updateError } = await supabaseClient
      .from('statements')
      .update({
        processed: true,
        transactions_extracted: transactions.length
      })
      .eq('id', statementId)

    if (updateError) {
      throw updateError
    }

    // Update budget spent amounts
    for (const transaction of transactions) {
      if (transaction.type === 'expense') {
        await supabaseClient.rpc('increment_budget_spent', {
          p_user_id: statement.user_id,
          p_category: transaction.category,
          p_amount: transaction.amount
        })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        transactions_extracted: transactions.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})