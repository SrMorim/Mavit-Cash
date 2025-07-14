import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { 
  User, 
  Expense, 
  Budget, 
  Goal, 
  Debt, 
  Category, 
  AppSettings,
  BudgetTemplate 
} from '../types'

interface AppState {
  // User data
  user: User | null
  
  // Financial data
  expenses: Expense[]
  budgets: Budget[]
  goals: Goal[]
  debts: Debt[]
  categories: Category[]
  
  // App settings
  settings: AppSettings
  
  // UI state
  sidebarCollapsed: boolean
  
  // Actions
  setUser: (user: User) => void
  updateUser: (updates: Partial<User>) => void
  
  // Expense actions
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateExpense: (id: string, updates: Partial<Expense>) => void
  deleteExpense: (id: string) => void
  
  // Budget actions
  addBudget: (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateBudget: (id: string, updates: Partial<Budget>) => void
  deleteBudget: (id: string) => void
  
  // Goal actions
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateGoal: (id: string, updates: Partial<Goal>) => void
  deleteGoal: (id: string) => void
  markGoalCompleted: (id: string) => void
  
  // Debt actions
  addDebt: (debt: Omit<Debt, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateDebt: (id: string, updates: Partial<Debt>) => void
  deleteDebt: (id: string) => void
  
  // Category actions
  addCategory: (category: Omit<Category, 'id' | 'createdAt'>) => void
  updateCategory: (id: string, updates: Partial<Category>) => void
  deleteCategory: (id: string) => void
  
  // Settings actions
  updateSettings: (updates: Partial<AppSettings>) => void
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  
  // Utility actions
  resetData: () => void
  importData: (data: Partial<AppState>) => void
  exportData: () => Partial<AppState>
}

// Default categories
const defaultCategories: Category[] = [
  { id: '1', name: 'Alimentação', color: '#ff6b6b', icon: 'Utensils', createdAt: new Date() },
  { id: '2', name: 'Transporte', color: '#4ecdc4', icon: 'Car', createdAt: new Date() },
  { id: '3', name: 'Moradia', color: '#45b7d1', icon: 'Home', createdAt: new Date() },
  { id: '4', name: 'Saúde', color: '#96ceb4', icon: 'Heart', createdAt: new Date() },
  { id: '5', name: 'Educação', color: '#feca57', icon: 'BookOpen', createdAt: new Date() },
  { id: '6', name: 'Entretenimento', color: '#ff9ff3', icon: 'Music', createdAt: new Date() },
  { id: '7', name: 'Roupas', color: '#54a0ff', icon: 'Shirt', createdAt: new Date() },
  { id: '8', name: 'Outros', color: '#a0a0a0', icon: 'Package', createdAt: new Date() },
]

// Default settings
const defaultSettings: AppSettings = {
  theme: 'dark',
  currency: 'BRL',
  language: 'pt-BR',
  autoBackup: true,
  notifications: true,
  sidebarCollapsed: false,
}

// Custom serialization functions to handle Date objects
const customStorage = {
  getItem: (name: string) => {
    const str = localStorage.getItem(name)
    if (!str) return null
    
    try {
      const data = JSON.parse(str)
      return {
        ...data,
        state: deserializeDates(data.state)
      }
    } catch (error) {
      console.error('Error parsing stored data:', error)
      return null
    }
  },
  setItem: (name: string, value: any) => {
    try {
      const serializedValue = JSON.stringify(value)
      localStorage.setItem(name, serializedValue)
    } catch (error) {
      console.error('Error serializing data:', error)
    }
  },
  removeItem: (name: string) => {
    localStorage.removeItem(name)
  }
}

// Function to convert date strings back to Date objects
const deserializeDates = (state: any): any => {
  if (!state) return state
  
  const dateFields = ['createdAt', 'updatedAt', 'date', 'deadline', 'completedAt']
  
  const convertDateFields = (obj: any): any => {
    if (!obj || typeof obj !== 'object') return obj
    
    const converted = Array.isArray(obj) ? [...obj] : { ...obj }
    
    for (const key in converted) {
      if (dateFields.includes(key) && typeof converted[key] === 'string') {
        converted[key] = new Date(converted[key])
      } else if (typeof converted[key] === 'object' && converted[key] !== null) {
        converted[key] = convertDateFields(converted[key])
      }
    }
    
    return converted
  }
  
  return {
    ...state,
    expenses: state.expenses ? state.expenses.map(convertDateFields) : [],
    budgets: state.budgets ? state.budgets.map(convertDateFields) : [],
    goals: state.goals ? state.goals.map(convertDateFields) : [],
    debts: state.debts ? state.debts.map(convertDateFields) : [],
    categories: state.categories ? state.categories.map(convertDateFields) : [],
    user: state.user ? convertDateFields(state.user) : null
  }
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      expenses: [],
      budgets: [],
      goals: [],
      debts: [],
      categories: defaultCategories,
      settings: defaultSettings,
      sidebarCollapsed: false,
      
      // User actions
      setUser: (user) => set({ user }),
      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates, updatedAt: new Date() } : null
      })),
      
      // Expense actions
      addExpense: (expense) => set((state) => ({
        expenses: [...state.expenses, {
          ...expense,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }]
      })),
      
      updateExpense: (id, updates) => set((state) => ({
        expenses: state.expenses.map(expense => 
          expense.id === id 
            ? { ...expense, ...updates, updatedAt: new Date() }
            : expense
        )
      })),
      
      deleteExpense: (id) => set((state) => ({
        expenses: state.expenses.filter(expense => expense.id !== id)
      })),
      
      // Budget actions
      addBudget: (budget) => set((state) => ({
        budgets: [...state.budgets, {
          ...budget,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }]
      })),
      
      updateBudget: (id, updates) => set((state) => ({
        budgets: state.budgets.map(budget => 
          budget.id === id 
            ? { ...budget, ...updates, updatedAt: new Date() }
            : budget
        )
      })),
      
      deleteBudget: (id) => set((state) => ({
        budgets: state.budgets.filter(budget => budget.id !== id)
      })),
      
      // Goal actions
      addGoal: (goal) => set((state) => ({
        goals: [...state.goals, {
          ...goal,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }]
      })),
      
      updateGoal: (id, updates) => set((state) => ({
        goals: state.goals.map(goal => 
          goal.id === id 
            ? { ...goal, ...updates, updatedAt: new Date() }
            : goal
        )
      })),
      
      deleteGoal: (id) => set((state) => ({
        goals: state.goals.filter(goal => goal.id !== id)
      })),
      
      markGoalCompleted: (id) => set((state) => ({
        goals: state.goals.map(goal => 
          goal.id === id 
            ? { ...goal, completed: true, completedAt: new Date(), updatedAt: new Date() }
            : goal
        )
      })),
      
      // Debt actions
      addDebt: (debt) => set((state) => ({
        debts: [...state.debts, {
          ...debt,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }]
      })),
      
      updateDebt: (id, updates) => set((state) => ({
        debts: state.debts.map(debt => 
          debt.id === id 
            ? { ...debt, ...updates, updatedAt: new Date() }
            : debt
        )
      })),
      
      deleteDebt: (id) => set((state) => ({
        debts: state.debts.filter(debt => debt.id !== id)
      })),
      
      // Category actions
      addCategory: (category) => set((state) => ({
        categories: [...state.categories, {
          ...category,
          id: crypto.randomUUID(),
          createdAt: new Date(),
        }]
      })),
      
      updateCategory: (id, updates) => set((state) => ({
        categories: state.categories.map(category => 
          category.id === id 
            ? { ...category, ...updates }
            : category
        )
      })),
      
      deleteCategory: (id) => set((state) => ({
        categories: state.categories.filter(category => category.id !== id)
      })),
      
      // Settings actions
      updateSettings: (updates) => set((state) => ({
        settings: { ...state.settings, ...updates }
      })),
      
      toggleSidebar: () => set((state) => ({
        sidebarCollapsed: !state.sidebarCollapsed
      })),
      
      setSidebarCollapsed: (collapsed) => set({
        sidebarCollapsed: collapsed
      }),
      
      // Utility actions
      resetData: () => set({
        user: null,
        expenses: [],
        budgets: [],
        goals: [],
        debts: [],
        categories: defaultCategories,
        settings: defaultSettings,
        sidebarCollapsed: false,
      }),
      
      importData: (data) => set((state) => ({
        ...state,
        ...data
      })),
      
      exportData: () => {
        const state = get()
        return {
          user: state.user,
          expenses: state.expenses,
          budgets: state.budgets,
          goals: state.goals,
          debts: state.debts,
          categories: state.categories,
          settings: state.settings,
        }
      },
    }),
    {
      name: 'mavit-cash-storage',
      version: 1,
      storage: customStorage,
    }
  )
)