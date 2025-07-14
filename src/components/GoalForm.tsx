import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Target, DollarSign, Calendar, AlertCircle } from 'lucide-react'
import { Goal } from '../types'
import { formatCurrency } from '../utils/dateUtils'

interface GoalFormProps {
  goal?: Goal
  onSubmit: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
}

export default function GoalForm({ goal, onSubmit, onCancel }: GoalFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    deadline: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (goal) {
      setFormData({
        name: goal.name,
        targetAmount: goal.targetAmount.toString(),
        currentAmount: goal.currentAmount.toString(),
        deadline: goal.deadline ? goal.deadline.toISOString().split('T')[0] : ''
      })
    }
  }, [goal])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nome da meta é obrigatório'
    }

    if (!formData.targetAmount || parseFloat(formData.targetAmount) <= 0) {
      newErrors.targetAmount = 'Valor da meta deve ser maior que zero'
    }

    if (formData.currentAmount && parseFloat(formData.currentAmount) < 0) {
      newErrors.currentAmount = 'Valor atual não pode ser negativo'
    }

    if (formData.deadline && new Date(formData.deadline) <= new Date()) {
      newErrors.deadline = 'Data deve ser futura'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const goalData = {
        name: formData.name.trim(),
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: parseFloat(formData.currentAmount) || 0,
        deadline: formData.deadline ? new Date(formData.deadline) : undefined,
        completed: false
      }

      await new Promise(resolve => setTimeout(resolve, 500))
      onSubmit(goalData)
    } catch (error) {
      console.error('Error submitting goal:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const progress = formData.targetAmount && formData.currentAmount 
    ? (parseFloat(formData.currentAmount) / parseFloat(formData.targetAmount)) * 100
    : 0

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Nome da Meta
        </label>
        <div className="relative">
          <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Ex: Viagem para Paris"
            className={`input-field w-full pl-10 ${errors.name ? 'border-red-500' : ''}`}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        {errors.name && (
          <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.name}
          </p>
        )}
      </div>

      {/* Target Amount */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Valor da Meta
        </label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="number"
            step="0.01"
            placeholder="0,00"
            className={`input-field w-full pl-10 ${errors.targetAmount ? 'border-red-500' : ''}`}
            value={formData.targetAmount}
            onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
          />
        </div>
        {errors.targetAmount && (
          <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.targetAmount}
          </p>
        )}
        {formData.targetAmount && !errors.targetAmount && (
          <p className="text-text-secondary text-sm mt-1">
            Meta: {formatCurrency(parseFloat(formData.targetAmount) || 0)}
          </p>
        )}
      </div>

      {/* Current Amount */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Valor Atual (Opcional)
        </label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="number"
            step="0.01"
            placeholder="0,00"
            className={`input-field w-full pl-10 ${errors.currentAmount ? 'border-red-500' : ''}`}
            value={formData.currentAmount}
            onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
          />
        </div>
        {errors.currentAmount && (
          <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.currentAmount}
          </p>
        )}
        {formData.currentAmount && !errors.currentAmount && (
          <p className="text-text-secondary text-sm mt-1">
            Atual: {formatCurrency(parseFloat(formData.currentAmount) || 0)}
          </p>
        )}
      </div>

      {/* Deadline */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Data Limite (Opcional)
        </label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="date"
            className={`input-field w-full pl-10 ${errors.deadline ? 'border-red-500' : ''}`}
            value={formData.deadline}
            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
          />
        </div>
        {errors.deadline && (
          <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.deadline}
          </p>
        )}
      </div>

      {/* Progress Preview */}
      {formData.targetAmount && formData.currentAmount && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
          className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4"
        >
          <h3 className="text-sm font-medium text-blue-400 mb-2">
            Progresso da Meta
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Progresso</span>
              <span className="text-text-primary">{Math.min(progress, 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-border rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">
                {formatCurrency(parseFloat(formData.currentAmount) || 0)}
              </span>
              <span className="text-text-primary">
                {formatCurrency(parseFloat(formData.targetAmount) || 0)}
              </span>
            </div>
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
          {isSubmitting ? 'Salvando...' : goal ? 'Atualizar' : 'Criar Meta'}
        </button>
      </div>
    </form>
  )
}