import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, Tag, Calendar, AlertCircle, TrendingUp } from 'lucide-react'
import { useAppStore } from '../store'
import { Budget } from '../types'
import { formatCurrency, getCurrentMonth } from '../utils/dateUtils'

interface BudgetFormProps {
  budget?: Budget
  onSubmit: (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
}

export default function BudgetForm({ budget, onSubmit, onCancel }: BudgetFormProps) {
  const { categories, expenses } = useAppStore()
  const currentMonth = getCurrentMonth()
  
  const [formData, setFormData] = useState({
    categoryId: '',
    amount: '',
    month: currentMonth.month,
    year: currentMonth.year
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (budget) {
      setFormData({
        categoryId: budget.categoryId,
        amount: budget.amount.toString(),
        month: budget.month,
        year: budget.year
      })
    }
  }, [budget])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.categoryId) {
      newErrors.categoryId = 'Categoria é obrigatória'
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valor deve ser maior que zero'
    }

    if (!formData.month || formData.month < 1 || formData.month > 12) {
      newErrors.month = 'Mês inválido'
    }

    if (!formData.year || formData.year < 2020) {
      newErrors.year = 'Ano inválido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const category = categories.find(cat => cat.id === formData.categoryId)!
      
      // Calculate spent amount for the selected month/year
      const spent = expenses
        .filter(expense => 
          expense.categoryId === formData.categoryId &&
          expense.date.getMonth() === formData.month - 1 &&
          expense.date.getFullYear() === formData.year
        )
        .reduce((sum, expense) => sum + expense.amount, 0)

      const budgetData = {
        categoryId: formData.categoryId,
        category,
        amount: parseFloat(formData.amount),
        month: formData.month,
        year: formData.year,
        spent
      }

      await new Promise(resolve => setTimeout(resolve, 500))
      onSubmit(budgetData)
    } catch (error) {
      console.error('Error submitting budget:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedCategory = categories.find(cat => cat.id === formData.categoryId)
  const spentAmount = expenses
    .filter(expense => 
      expense.categoryId === formData.categoryId &&
      expense.date.getMonth() === formData.month - 1 &&
      expense.date.getFullYear() === formData.year
    )
    .reduce((sum, expense) => sum + expense.amount, 0)

  const budgetAmount = parseFloat(formData.amount) || 0
  const percentage = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Categoria
        </label>
        <div className="relative">
          <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <select
            className={`input-field w-full pl-10 ${errors.categoryId ? 'border-red-500' : ''}`}
            value={formData.categoryId}
            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
          >
            <option value="">Selecione uma categoria</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        {errors.categoryId && (
          <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.categoryId}
          </p>
        )}
      </div>

      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Orçamento Mensal
        </label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="number"
            step="0.01"
            placeholder="0,00"
            className={`input-field w-full pl-10 ${errors.amount ? 'border-red-500' : ''}`}
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          />
        </div>
        {errors.amount && (
          <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.amount}
          </p>
        )}
        {formData.amount && !errors.amount && (
          <p className="text-text-secondary text-sm mt-1">
            Orçamento: {formatCurrency(budgetAmount)}
          </p>
        )}
      </div>

      {/* Month and Year */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Mês
          </label>
          <select
            className={`input-field w-full ${errors.month ? 'border-red-500' : ''}`}
            value={formData.month}
            onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(2023, i).toLocaleString('pt-BR', { month: 'long' })}
              </option>
            ))}
          </select>
          {errors.month && (
            <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.month}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Ano
          </label>
          <input
            type="number"
            min="2020"
            max="2030"
            className={`input-field w-full ${errors.year ? 'border-red-500' : ''}`}
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
          />
          {errors.year && (
            <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.year}
            </p>
          )}
        </div>
      </div>

      {/* Budget Preview */}
      {selectedCategory && formData.amount && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
          className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4"
        >
          <h3 className="text-sm font-medium text-blue-400 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Previsão do Orçamento
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: selectedCategory.color }}
              />
              <span className="text-text-primary font-medium">{selectedCategory.name}</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Gasto atual</span>
                <span className={`font-medium ${percentage > 100 ? 'text-red-400' : 'text-text-primary'}`}>
                  {percentage.toFixed(1)}%
                </span>
              </div>
              
              <div className="w-full bg-border rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    percentage > 100 ? 'bg-red-500' : percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">
                  {formatCurrency(spentAmount)}
                </span>
                <span className="text-text-primary">
                  {formatCurrency(budgetAmount)}
                </span>
              </div>
            </div>
            
            {percentage > 80 && (
              <div className={`text-sm p-2 rounded ${
                percentage > 100 
                  ? 'bg-red-500/20 text-red-400' 
                  : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                {percentage > 100 
                  ? `Orçamento excedido em ${formatCurrency(spentAmount - budgetAmount)}`
                  : 'Atenção: Próximo do limite do orçamento'
                }
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary flex-1"
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="btn-primary flex-1"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Salvando...' : budget ? 'Atualizar' : 'Criar Orçamento'}
        </button>
      </div>
    </form>
  )
}