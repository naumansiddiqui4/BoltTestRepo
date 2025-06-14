import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useFinance } from '../../contexts/FinanceContext'
import { Upload, FileText, Trash2, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'

export function StatementUpload() {
  const { statements, uploadStatement, deleteStatement, loading } = useFinance()
  const [uploadType, setUploadType] = useState<'bank' | 'credit_card'>('bank')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file')
      return
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File size must be less than 10MB')
      return
    }

    setUploading(true)
    setError('')

    try {
      await uploadStatement(file, uploadType)
    } catch (err) {
      setError('Failed to upload statement. Please try again.')
    } finally {
      setUploading(false)
    }
  }, [uploadStatement, uploadType])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false,
    disabled: uploading
  })

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this statement?')) {
      try {
        await deleteStatement(id)
      } catch (err) {
        setError('Failed to delete statement')
      }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Upload Statements</h2>
        <p className="text-sm text-gray-600">
          Upload your bank and credit card statements to automatically extract transactions
        </p>
      </div>

      {/* Upload Type Selection */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Statement Type
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="bank"
              checked={uploadType === 'bank'}
              onChange={(e) => setUploadType(e.target.value as 'bank' | 'credit_card')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">Bank Statement</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="credit_card"
              checked={uploadType === 'credit_card'}
              onChange={(e) => setUploadType(e.target.value as 'bank' | 'credit_card')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">Credit Card Statement</span>
          </label>
        </div>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          {uploading ? (
            <p className="text-sm text-gray-600">Uploading...</p>
          ) : isDragActive ? (
            <p className="text-sm text-gray-600">Drop the PDF file here...</p>
          ) : (
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Drag and drop a PDF file here, or click to select
              </p>
              <p className="text-xs text-gray-500">
                PDF files only, max 10MB
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 flex items-center text-red-600 text-sm">
            <AlertCircle className="h-4 w-4 mr-2" />
            {error}
          </div>
        )}
      </div>

      {/* Uploaded Statements */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Uploaded Statements ({statements.length})
          </h3>
        </div>
        
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading statements...</p>
          </div>
        ) : statements.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {statements.map((statement) => (
              <div key={statement.id} className="p-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      {statement.filename}
                    </h4>
                    <div className="text-sm text-gray-500 space-x-2">
                      <span className="capitalize">
                        {statement.file_type.replace('_', ' ')}
                      </span>
                      <span>•</span>
                      <span>
                        Uploaded {format(new Date(statement.upload_date), 'MMM d, yyyy')}
                      </span>
                      {statement.processed && (
                        <>
                          <span>•</span>
                          <span className="text-green-600">
                            {statement.transactions_extracted} transactions extracted
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {!statement.processed && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Processing
                    </span>
                  )}
                  <button
                    onClick={() => handleDelete(statement.id)}
                    className="text-red-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p>No statements uploaded yet</p>
            <p className="text-sm mt-1">Upload your first statement to get started</p>
          </div>
        )}
      </div>

      {/* Processing Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Statement Processing
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                After uploading, statements are automatically processed to extract transactions.
                This may take a few minutes depending on the file size and complexity.
              </p>
              <ul className="mt-2 list-disc list-inside space-y-1">
                <li>Transactions are automatically categorized</li>
                <li>Duplicate transactions are detected and merged</li>
                <li>Your budgets are updated with new spending data</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}