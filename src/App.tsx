import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { FinanceProvider } from './contexts/FinanceContext'
import { Login } from './components/auth/Login'
import { Register } from './components/auth/Register'
import { Dashboard } from './components/dashboard/Dashboard'
import { Expenses } from './components/expenses/Expenses'
import { Budget } from './components/budget/Budget'
import { Analytics } from './components/analytics/Analytics'
import { Layout } from './components/layout/Layout'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  return user ? <>{children}</> : <Navigate to="/login" />
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  return !user ? <>{children}</> : <Navigate to="/dashboard" />
}

function App() {
  return (
    <AuthProvider>
      <FinanceProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/login" element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } />
              <Route path="/register" element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } />
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/expenses" element={
                <ProtectedRoute>
                  <Layout>
                    <Expenses />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/budget" element={
                <ProtectedRoute>
                  <Layout>
                    <Budget />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/analytics" element={
                <ProtectedRoute>
                  <Layout>
                    <Analytics />
                  </Layout>
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </Router>
      </FinanceProvider>
    </AuthProvider>
  )
}

export default App