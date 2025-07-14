import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, DollarSign, Tag, Repeat, AlertCircle } from 'lucide-react'
import { useAppStore } from '../store'
import { Expense } from '../types'
import { formatCurrency } from '../utils/dateUtils'
import ErrorBoundary from './ErrorBoundary'

interface ExpenseFormProps {
  expense?: Expense
  onSubmit: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
}

export default function ExpenseForm({ expense, onSubmit, onCancel }: ExpenseFormProps) {
  const { categories } = useAppStore()
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    categoryId: '',
    date: new Date().toISOString().split('T')[0],
    type: 'one-time' as 'one-time' | 'recurring',
    isRecurring: false,
    recurringDay: undefined as number | undefined
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (expense) {
      try {
        const dateValue = expense.date instanceof Date 
          ? expense.date.toISOString().split('T')[0]
          : typeof expense.date === 'string'
          ? new Date(expense.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]
        
        setFormData({
          description: expense.description || '',
          amount: expense.amount?.toString() || '',
          categoryId: expense.categoryId || '',
          date: dateValue,
          type: expense.type || 'one-time',
          isRecurring: expense.isRecurring || false,
          recurringDay: expense.recurringDay
        })
      } catch (error) {
        console.error('Error loading expense data:', error)
        setErrors({ general: 'Erro ao carregar dados da despesa' })
      }
    }
  }, [expense])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória'
    }

    const amount = parseFloat(formData.amount)
    if (!formData.amount || isNaN(amount) || amount <= 0) {
      newErrors.amount = 'Valor deve ser maior que zero'
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Categoria é obrigatória'
    }

    if (!formData.date) {
      newErrors.date = 'Data é obrigatória'
    }

    if (formData.type === 'recurring') {
      const recurringDay = formData.recurringDay
      if (!recurringDay || isNaN(recurringDay) || recurringDay < 1 || recurringDay > 28) {
        newErrors.recurringDay = 'Dia deve ser entre 1 e 28'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const category = categories.find(cat => cat.id === formData.categoryId)
      
      if (!category) {
        setErrors({ categoryId: 'Categoria não encontrada' })
        return
      }
      
      const expenseData = {
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),
        categoryId: formData.categoryId,
        category,
        date: new Date(formData.date),
        type: formData.type,
        isRecurring: formData.type === 'recurring',
        recurringDay: formData.type === 'recurring' ? formData.recurringDay : undefined
      }

      await new Promise(resolve => setTimeout(resolve, 500))
      onSubmit(expenseData)
    } catch (error) {
      console.error('Error submitting expense:', error)
      setErrors({ general: 'Erro ao salvar despesa. Tente novamente.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ErrorBoundary>
      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.general && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {errors.general}
            </p>
          </div>
        )}
      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Descrição
        </label>
        <input
          type="text"
          placeholder="Ex: Almoço no restaurante"
          className={`input-field w-full ${errors.description ? 'border-red-500' : ''}`}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
        {errors.description && (
          <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.description}
          </p>
        )}
      </div>

      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Valor
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
            Valor: {formatCurrency(parseFloat(formData.amount) || 0)}
          </p>
        )}
      </div>

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

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Data
        </label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="date"
            className={`input-field w-full pl-10 ${errors.date ? 'border-red-500' : ''}`}
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>
        {errors.date && (
          <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.date}
          </p>
        )}
      </div>

      {/* Type */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Tipo de despesa
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="one-time"
              checked={formData.type === 'one-time'}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'one-time' | 'recurring' })}
              className="w-4 h-4"
            />
            <span className="text-text-primary">Única</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="recurring"
              checked={formData.type === 'recurring'}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'one-time' | 'recurring' })}
              className="w-4 h-4"
            />
            <span className="text-text-primary">Recorrente</span>
          </label>
        </div>
      </div>

      {/* Recurring Day */}
      {formData.type === 'recurring' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
        >
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Dia do mês para repetir
          </label>
          <div className="relative">
            <Repeat className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input
              type="number"
              min="1"
              max="28"
              placeholder="Ex: 15"
              className={`input-field w-full pl-10 ${errors.recurringDay ? 'border-red-500' : ''}`}
              value={formData.recurringDay || ''}
              onChange={(e) => setFormData({ ...formData, recurringDay: parseInt(e.target.value) })}
            />
          </div>
          {errors.recurringDay && (
            <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.recurringDay}
            </p>
          )}
          <p className="text-text-secondary text-sm mt-1">
            A despesa será lançada automaticamente todo mês neste dia
          </p>
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
          {isSubmitting ? 'Salvando...' : expense ? 'Atualizar' : 'Adicionar'}
        </button>
      </div>
      </form>
    </ErrorBoundary>
  )
}