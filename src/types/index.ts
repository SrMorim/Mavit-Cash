export interface User {
  id: string
  name: string
  salary: number
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: string
  name: string
  color: string
  icon: string
  createdAt: Date
}

export interface Expense {
  id: string
  description: string
  amount: number
  categoryId: string
  category: Category
  date: Date
  type: 'one-time' | 'recurring' | 'annual'
  isRecurring: boolean
  recurringDay?: number
  recurringMonth?: number
  recurringYear?: number
  createdAt: Date
  updatedAt: Date
}

export interface Budget {
  id: string
  categoryId: string
  category: Category
  amount: number
  month: number
  year: number
  spent: number
  createdAt: Date
  updatedAt: Date
}

export interface Goal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline?: Date
  completed: boolean
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Debt {
  id: string
  name: string
  totalAmount: number
  remainingAmount: number
  interestRate: number
  minimumPayment: number
  priority: 'snowball' | 'avalanche'
  createdAt: Date
  updatedAt: Date
}

export interface BudgetTemplate {
  id: string
  name: string
  description: string
  categories: {
    categoryId: string
    percentage: number
  }[]
}

export interface MonthlyReport {
  month: number
  year: number
  totalIncome: number
  totalExpenses: number
  balance: number
  expensesByCategory: {
    categoryId: string
    categoryName: string
    amount: number
    percentage: number
  }[]
  budgetComparison: {
    categoryId: string
    categoryName: string
    budgeted: number
    spent: number
    variance: number
  }[]
  generatedAt: Date
}

export interface AppSettings {
  theme: 'dark' | 'light'
  currency: string
  language: string
  autoBackup: boolean
  backupPath?: string
  notifications: boolean
  sidebarCollapsed: boolean
}