import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit3, Trash2, Search, Filter, Calendar, Receipt, Settings } from 'lucide-react'
import { useAppStore } from '../store'
import { formatCurrency, formatDate } from '../utils/dateUtils'
import { Expense, Category } from '../types'
import Modal from '../components/Modal'
import ExpenseForm from '../components/ExpenseForm'
import CategoryForm from '../components/CategoryForm'

export default function Expenses() {
  const { expenses, categories, addExpense, updateExpense, deleteExpense, addCategory, updateCategory, deleteCategory } = useAppStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedType, setSelectedType] = useState<'all' | 'recurring' | 'one-time' | 'annual'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'category'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const filteredAndSortedExpenses = useMemo(() => {
    let filtered = expenses.filter(expense => {
      const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = !selectedCategory || expense.categoryId === selectedCategory
      const matchesType = selectedType === 'all' || 
        (selectedType === 'recurring' && expense.type === 'recurring') ||
        (selectedType === 'one-time' && expense.type === 'one-time') ||
        (selectedType === 'annual' && expense.type === 'annual')
      return matchesSearch && matchesCategory && matchesType
    })

    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'date':
          const dateA = a.date instanceof Date ? a.date : new Date(a.date)
          const dateB = b.date instanceof Date ? b.date : new Date(b.date)
          comparison = dateA.getTime() - dateB.getTime()
          break
        case 'amount':
          comparison = a.amount - b.amount
          break
        case 'category':
          const categoryA = categories.find(cat => cat.id === a.categoryId)?.name || ''
          const categoryB = categories.find(cat => cat.id === b.categoryId)?.name || ''
          comparison = categoryA.localeCompare(categoryB)
          break
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [expenses, searchTerm, selectedCategory, selectedType, sortBy, sortOrder, categories])

  const totalExpenses = useMemo(() => {
    return filteredAndSortedExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  }, [filteredAndSortedExpenses])

  const handleAddExpense = () => {
    setEditingExpense(null)
    setIsModalOpen(true)
  }

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense)
    setIsModalOpen(true)
  }

  const handleDeleteExpense = (expenseId: string) => {
    if (confirm('Tem certeza que deseja excluir esta despesa?')) {
      deleteExpense(expenseId)
    }
  }

  const handleFormSubmit = (expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingExpense) {
      updateExpense(editingExpense.id, expenseData)
    } else {
      addExpense(expenseData)
    }
    setIsModalOpen(false)
    setEditingExpense(null)
  }

  const handleFormCancel = () => {
    setIsModalOpen(false)
    setEditingExpense(null)
  }

  const handleAddCategory = () => {
    setEditingCategory(null)
    setIsCategoryModalOpen(true)
  }

  const handleCategorySubmit = (categoryData: Omit<Category, 'id' | 'createdAt'>) => {
    if (editingCategory) {
      updateCategory(editingCategory.id, categoryData)
    } else {
      addCategory(categoryData)
    }
    setIsCategoryModalOpen(false)
    setEditingCategory(null)
  }

  const handleCategoryCancel = () => {
    setIsCategoryModalOpen(false)
    setEditingCategory(null)
  }

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Despesas</h1>
          <p className="text-text-secondary mt-1">
            Gerencie suas despesas mensais e recorrentes
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleAddCategory}
            className="btn-secondary flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Gerenciar Categorias
          </button>
          <button 
            onClick={handleAddExpense}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nova Despesa
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input
                type="text"
                placeholder="Buscar despesas..."
                className="input-field w-full pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <select
              className="input-field"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">Todas as categorias</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            
            <select
              className="input-field"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as 'all' | 'recurring' | 'one-time' | 'annual')}
            >
              <option value="all">Todas</option>
              <option value="recurring">Recorrentes</option>
              <option value="one-time">Únicas</option>
              <option value="annual">Anuais</option>
            </select>
            
            <select
              className="input-field"
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-')
                setSortBy(field as 'date' | 'amount' | 'category')
                setSortOrder(order as 'asc' | 'desc')
              }}
            >
              <option value="date-desc">Data (mais recente)</option>
              <option value="date-asc">Data (mais antiga)</option>
              <option value="amount-desc">Valor (maior)</option>
              <option value="amount-asc">Valor (menor)</option>
              <option value="category-asc">Categoria (A-Z)</option>
              <option value="category-desc">Categoria (Z-A)</option>
            </select>
          </div>
        </div>
        
        {filteredAndSortedExpenses.length > 0 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <p className="text-text-secondary text-sm">
              {filteredAndSortedExpenses.length} despesa(s) encontrada(s)
              {(searchTerm || selectedCategory || selectedType !== 'all') && (
                <span className="ml-2 text-text-muted">
                  {selectedType === 'recurring' && '(recorrentes)'}
                  {selectedType === 'one-time' && '(únicas)'}
                  {selectedType === 'annual' && '(anuais)'}
                </span>
              )}
            </p>
            <p className="text-text-primary font-semibold">
              Total: {formatCurrency(totalExpenses)}
            </p>
          </div>
        )}
      </div>

      {/* Expenses List */}
      <div className="card p-6">
        <div className="space-y-4">
          {filteredAndSortedExpenses.length > 0 ? (
            filteredAndSortedExpenses.map((expense) => {
              const category = categories.find(cat => cat.id === expense.categoryId)
              return (
                <motion.div 
                  key={expense.id}
                  className="flex items-center justify-between p-4 bg-background rounded-lg border border-border hover:bg-border/10 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category?.color }}
                    />
                    <div>
                      <p className="font-medium text-text-primary">{expense.description}</p>
                      <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <span>{category?.name}</span>
                        <span>•</span>
                        <span>{formatDate(expense.date instanceof Date ? expense.date : new Date(expense.date))}</span>
                        {expense.type === 'recurring' && (
                          <>
                            <span>•</span>
                            <span className="text-blue-400">Recorrente</span>
                          </>
                        )}
                        {expense.type === 'annual' && (
                          <>
                            <span>•</span>
                            <span className="text-green-400">Anual</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-text-primary">
                      {formatCurrency(expense.amount)}
                    </span>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handleEditExpense(expense)}
                        className="p-1 hover:bg-border/20 rounded transition-colors"
                        title="Editar despesa"
                      >
                        <Edit3 className="w-4 h-4 text-text-secondary" />
                      </button>
                      <button 
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="p-1 hover:bg-border/20 rounded transition-colors"
                        title="Excluir despesa"
                      >
                        <Trash2 className="w-4 h-4 text-text-secondary" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })
          ) : (
            <div className="text-center py-12">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-border/20 rounded-full flex items-center justify-center mb-4">
                  <Receipt className="w-8 h-8 text-text-secondary" />
                </div>
                <p className="text-text-secondary mb-4">
                  {searchTerm || selectedCategory || selectedType !== 'all' ? 'Nenhuma despesa encontrada' : 'Nenhuma despesa registrada ainda'}
                </p>
                <button 
                  onClick={handleAddExpense}
                  className="btn-primary"
                >
                  Adicionar primeira despesa
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Expense Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleFormCancel}
        title={editingExpense ? 'Editar Despesa' : 'Nova Despesa'}
      >
        <ExpenseForm
          expense={editingExpense}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      </Modal>

      {/* Category Modal */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={handleCategoryCancel}
        title=""
      >
        <CategoryForm
          editingCategory={editingCategory}
          onSubmit={handleCategorySubmit}
          onCancel={handleCategoryCancel}
        />
      </Modal>
    </motion.div>
  )
}