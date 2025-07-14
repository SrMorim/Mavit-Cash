import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useAppStore } from './store'
import Layout from './components/Layout'
import Welcome from './components/Welcome'
import ErrorBoundary from './components/ErrorBoundary'
import Dashboard from './pages/Dashboard'
import Expenses from './pages/Expenses'
import Goals from './pages/Goals'
import Budgets from './pages/Budgets'
import Debts from './pages/Debts'
import Reports from './pages/Reports'
import Settings from './pages/Settings'

function AppContent() {
  const { user } = useAppStore()

  // Show welcome screen if user is not set up
  if (!user) {
    return (
      <ErrorBoundary>
        <Welcome />
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <Router>
        <Layout>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={
                <ErrorBoundary>
                  <Dashboard />
                </ErrorBoundary>
              } />
              <Route path="/expenses" element={
                <ErrorBoundary>
                  <Expenses />
                </ErrorBoundary>
              } />
              <Route path="/goals" element={
                <ErrorBoundary>
                  <Goals />
                </ErrorBoundary>
              } />
              <Route path="/budgets" element={
                <ErrorBoundary>
                  <Budgets />
                </ErrorBoundary>
              } />
              <Route path="/debts" element={
                <ErrorBoundary>
                  <Debts />
                </ErrorBoundary>
              } />
              <Route path="/reports" element={
                <ErrorBoundary>
                  <Reports />
                </ErrorBoundary>
              } />
              <Route path="/settings" element={
                <ErrorBoundary>
                  <Settings />
                </ErrorBoundary>
              } />
            </Routes>
          </ErrorBoundary>
        </Layout>
      </Router>
    </ErrorBoundary>
  )
}

function App() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Root Error Boundary caught error:', error, errorInfo)
        // Here you could send to error reporting service
      }}
    >
      <AppContent />
    </ErrorBoundary>
  )
}

export default App