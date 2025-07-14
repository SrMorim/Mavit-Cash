import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingDown, DollarSign, Percent, Calendar, AlertCircle, Calculator } from 'lucide-react'
import { Debt } from '../types'
import { formatCurrency } from '../utils/dateUtils'

interface DebtFormProps {
  debt?: Debt
  onSubmit: (debt: Omit<Debt, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
}

export default function DebtForm({ debt, onSubmit, onCancel }: DebtFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    totalAmount: '',
    remainingAmount: '',
    interestRate: '',
    minimumPayment: '',
    priority: 'avalanche' as 'snowball' | 'avalanche'
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (debt) {
      setFormData({
        name: debt.name,
        totalAmount: debt.totalAmount.toString(),
        remainingAmount: debt.remainingAmount.toString(),
        interestRate: debt.interestRate.toString(),
        minimumPayment: debt.minimumPayment.toString(),
        priority: debt.priority
      })
    }
  }, [debt])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nome da dívida é obrigatório'
    }

    if (!formData.totalAmount || parseFloat(formData.totalAmount) <= 0) {
      newErrors.totalAmount = 'Valor total deve ser maior que zero'
    }

    if (!formData.remainingAmount || parseFloat(formData.remainingAmount) <= 0) {
      newErrors.remainingAmount = 'Valor restante deve ser maior que zero'
    }

    if (formData.totalAmount && formData.remainingAmount && 
        parseFloat(formData.remainingAmount) > parseFloat(formData.totalAmount)) {
      newErrors.remainingAmount = 'Valor restante não pode ser maior que o total'
    }

    if (!formData.interestRate || parseFloat(formData.interestRate) < 0) {
      newErrors.interestRate = 'Taxa de juros deve ser maior ou igual a zero'
    }

    if (!formData.minimumPayment || parseFloat(formData.minimumPayment) <= 0) {
      newErrors.minimumPayment = 'Pagamento mínimo deve ser maior que zero'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const debtData = {
        name: formData.name.trim(),
        totalAmount: parseFloat(formData.totalAmount),
        remainingAmount: parseFloat(formData.remainingAmount),
        interestRate: parseFloat(formData.interestRate),
        minimumPayment: parseFloat(formData.minimumPayment),
        priority: formData.priority
      }

      await new Promise(resolve => setTimeout(resolve, 500))
      onSubmit(debtData)
    } catch (error) {
      console.error('Error submitting debt:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalAmount = parseFloat(formData.totalAmount) || 0
  const remainingAmount = parseFloat(formData.remainingAmount) || 0
  const minimumPayment = parseFloat(formData.minimumPayment) || 0
  const interestRate = parseFloat(formData.interestRate) || 0
  
  const progress = totalAmount > 0 ? ((totalAmount - remainingAmount) / totalAmount) * 100 : 0
  const monthsToPayoff = minimumPayment > 0 ? Math.ceil(remainingAmount / minimumPayment) : 0
  const totalInterest = remainingAmount * (interestRate / 100) * (monthsToPayoff / 12)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Nome da Dívida
        </label>
        <div className="relative">
          <TrendingDown className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Ex: Cartão de Crédito XYZ"
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

      {/* Total Amount */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Valor Total da Dívida
        </label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="number"
            step="0.01"
            placeholder="0,00"
            className={`input-field w-full pl-10 ${errors.totalAmount ? 'border-red-500' : ''}`}
            value={formData.totalAmount}
            onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
          />
        </div>
        {errors.totalAmount && (
          <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.totalAmount}
          </p>
        )}
        {formData.totalAmount && !errors.totalAmount && (
          <p className="text-text-secondary text-sm mt-1">
            Total: {formatCurrency(totalAmount)}
          </p>
        )}
      </div>

      {/* Remaining Amount */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Valor Restante
        </label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="number"
            step="0.01"
            placeholder="0,00"
            className={`input-field w-full pl-10 ${errors.remainingAmount ? 'border-red-500' : ''}`}
            value={formData.remainingAmount}
            onChange={(e) => setFormData({ ...formData, remainingAmount: e.target.value })}
          />
        </div>
        {errors.remainingAmount && (
          <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.remainingAmount}
          </p>
        )}
        {formData.remainingAmount && !errors.remainingAmount && (
          <p className="text-text-secondary text-sm mt-1">
            Restante: {formatCurrency(remainingAmount)}
          </p>
        )}
      </div>

      {/* Interest Rate */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Taxa de Juros (% ao ano)
        </label>
        <div className="relative">
          <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="number"
            step="0.01"
            placeholder="0,00"
            className={`input-field w-full pl-10 ${errors.interestRate ? 'border-red-500' : ''}`}
            value={formData.interestRate}
            onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
          />
        </div>
        {errors.interestRate && (
          <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.interestRate}
          </p>
        )}
        {formData.interestRate && !errors.interestRate && (
          <p className="text-text-secondary text-sm mt-1">
            Taxa: {interestRate}% ao ano
          </p>
        )}
      </div>

      {/* Minimum Payment */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Pagamento Mínimo Mensal
        </label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="number"
            step="0.01"
            placeholder="0,00"
            className={`input-field w-full pl-10 ${errors.minimumPayment ? 'border-red-500' : ''}`}
            value={formData.minimumPayment}
            onChange={(e) => setFormData({ ...formData, minimumPayment: e.target.value })}
          />
        </div>
        {errors.minimumPayment && (
          <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.minimumPayment}
          </p>
        )}
        {formData.minimumPayment && !errors.minimumPayment && (
          <p className="text-text-secondary text-sm mt-1">
            Mínimo: {formatCurrency(minimumPayment)}/mês
          </p>
        )}
      </div>

      {/* Priority Strategy */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Estratégia de Quitação
        </label>
        <div className="space-y-3">
          <label className="flex items-start gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-border/10 transition-colors">
            <input
              type="radio"
              value="avalanche"
              checked={formData.priority === 'avalanche'}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'snowball' | 'avalanche' })}
              className="w-4 h-4 mt-1"
            />
            <div>
              <span className="text-text-primary font-medium">Método Avalanche</span>
              <p className="text-text-secondary text-sm">
                Prioriza dívidas com maiores taxas de juros. Economiza mais dinheiro a longo prazo.
              </p>
            </div>
          </label>
          
          <label className="flex items-start gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-border/10 transition-colors">
            <input
              type="radio"
              value="snowball"
              checked={formData.priority === 'snowball'}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'snowball' | 'avalanche' })}
              className="w-4 h-4 mt-1"
            />
            <div>
              <span className="text-text-primary font-medium">Método Bola de Neve</span>
              <p className="text-text-secondary text-sm">
                Prioriza dívidas com menores valores. Gera motivação através de vitórias rápidas.
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Debt Calculation Preview */}
      {remainingAmount > 0 && minimumPayment > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
          className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4"
        >
          <h3 className="text-sm font-medium text-yellow-400 mb-3 flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Simulação de Quitação
          </h3>
          
          <div className="space-y-3">
            {totalAmount > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Progresso</span>
                  <span className="text-text-primary">{progress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-border rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">
                    {formatCurrency(totalAmount - remainingAmount)} pago
                  </span>
                  <span className="text-text-primary">
                    {formatCurrency(totalAmount)} total
                  </span>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-text-secondary block">Tempo para quitar</span>
                <span className="text-text-primary font-medium">
                  {monthsToPayoff} meses
                </span>
              </div>
              <div>
                <span className="text-text-secondary block">Juros estimados</span>
                <span className="text-text-primary font-medium">
                  {formatCurrency(totalInterest)}
                </span>
              </div>
            </div>
            
            <div className="text-sm p-2 bg-yellow-500/20 rounded">
              <p className="text-yellow-300">
                💡 Estes cálculos são estimados e não consideram juros compostos complexos.
              </p>
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
          {isSubmitting ? 'Salvando...' : debt ? 'Atualizar' : 'Adicionar Dívida'}
        </button>
      </div>
    </form>
  )
}