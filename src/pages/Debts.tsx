import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { TrendingDown, Plus, CreditCard, Zap, Mountain, Edit3, Trash2, Target, AlertCircle, TrendingUp } from 'lucide-react'
import { useAppStore } from '../store'
import { formatCurrency } from '../utils/dateUtils'
import { Debt } from '../types'
import Modal from '../components/Modal'
import DebtForm from '../components/DebtForm'

export default function Debts() {
  const { debts, addDebt, updateDebt, deleteDebt } = useAppStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null)

  const debtStats = useMemo(() => {
    const totalDebt = debts.reduce((sum, debt) => sum + debt.remainingAmount, 0)
    const totalOriginalDebt = debts.reduce((sum, debt) => sum + debt.totalAmount, 0)
    const totalMinPayment = debts.reduce((sum, debt) => sum + debt.minimumPayment, 0)
    const totalPaid = totalOriginalDebt - totalDebt
    const averageProgress = debts.length > 0 
      ? debts.reduce((sum, debt) => sum + ((debt.totalAmount - debt.remainingAmount) / debt.totalAmount * 100), 0) / debts.length 
      : 0

    return { totalDebt, totalMinPayment, totalPaid, averageProgress, totalOriginalDebt }
  }, [debts])

  const prioritizedDebts = useMemo(() => {
    if (debts.length === 0) return []
    
    const sorted = [...debts].sort((a, b) => {
      // Assumindo que a maioria das dívidas usa a mesma estratégia
      const strategy = debts[0].priority
      
      if (strategy === 'snowball') {
        // Menor valor primeiro
        return a.remainingAmount - b.remainingAmount
      } else {
        // Maior taxa de juros primeiro
        return b.interestRate - a.interestRate
      }
    })
    
    return sorted
  }, [debts])

  const handleAddDebt = () => {
    setEditingDebt(null)
    setIsModalOpen(true)
  }

  const handleEditDebt = (debt: Debt) => {
    setEditingDebt(debt)
    setIsModalOpen(true)
  }

  const handleDeleteDebt = (debtId: string) => {
    if (confirm('Tem certeza que deseja excluir esta dívida?')) {
      deleteDebt(debtId)
    }
  }

  const handleFormSubmit = (debtData: Omit<Debt, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingDebt) {
      updateDebt(editingDebt.id, debtData)
    } else {
      addDebt(debtData)
    }
    setIsModalOpen(false)
    setEditingDebt(null)
  }

  const handleFormCancel = () => {
    setIsModalOpen(false)
    setEditingDebt(null)
  }

  const getStrategyInfo = () => {
    if (debts.length === 0) return null
    
    const strategy = debts[0].priority
    
    if (strategy === 'snowball') {
      return {
        name: 'Bola de Neve',
        description: 'Quitando da menor para a maior dívida',
        icon: Zap,
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/20'
      }
    } else {
      return {
        name: 'Avalanche',
        description: 'Quitando das maiores para as menores taxas',
        icon: Mountain,
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/20'
      }
    }
  }

  const strategyInfo = getStrategyInfo()

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Gerenciamento de Dívidas</h1>
          <p className="text-text-secondary mt-1">
            Estratégias para quitar suas dívidas de forma eficiente
          </p>
        </div>
        <button 
          onClick={handleAddDebt}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nova Dívida
        </button>
      </div>

      {/* Stats */}
      {debts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingDown className="w-5 h-5 text-red-400" />
              <h3 className="font-semibold text-text-primary">Total Restante</h3>
            </div>
            <p className="text-2xl font-bold text-red-400">{formatCurrency(debtStats.totalDebt)}</p>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-2">
              <CreditCard className="w-5 h-5 text-yellow-400" />
              <h3 className="font-semibold text-text-primary">Pagamento Mínimo</h3>
            </div>
            <p className="text-2xl font-bold text-yellow-400">{formatCurrency(debtStats.totalMinPayment)}</p>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <h3 className="font-semibold text-text-primary">Total Pago</h3>
            </div>
            <p className="text-2xl font-bold text-green-400">{formatCurrency(debtStats.totalPaid)}</p>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-text-primary">Progresso Médio</h3>
            </div>
            <p className="text-2xl font-bold text-primary">{debtStats.averageProgress.toFixed(1)}%</p>
          </div>
        </div>
      )}

      {/* Strategy Info */}
      {strategyInfo && (
        <div className={`card p-6 ${strategyInfo.bgColor} border-0`}>
          <div className="flex items-center gap-3 mb-3">
            <strategyInfo.icon className={`w-6 h-6 ${strategyInfo.color}`} />
            <div>
              <h3 className={`text-lg font-semibold ${strategyInfo.color}`}>
                Estratégia: {strategyInfo.name}
              </h3>
              <p className="text-text-secondary text-sm">
                {strategyInfo.description}
              </p>
            </div>
          </div>
          
          {prioritizedDebts.length > 0 && (
            <div className="bg-background/50 rounded-lg p-4">
              <p className="text-sm text-text-secondary mb-2">Próxima dívida prioritária:</p>
              <div className="flex items-center justify-between">
                <span className="font-medium text-text-primary">{prioritizedDebts[0].name}</span>
                <span className={strategyInfo.color}>
                  {strategyInfo.name === 'Bola de Neve' 
                    ? formatCurrency(prioritizedDebts[0].remainingAmount)
                    : `${prioritizedDebts[0].interestRate}% a.a.`
                  }
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Debts List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-text-primary">Suas Dívidas</h2>
          {debts.length > 1 && (
            <div className="text-sm text-text-secondary">
              Ordenadas por {strategyInfo?.name === 'Bola de Neve' ? 'menor valor' : 'maior taxa de juros'}
            </div>
          )}
        </div>

        {debts.length > 0 ? (
          prioritizedDebts.map((debt, index) => {
            const progress = ((debt.totalAmount - debt.remainingAmount) / debt.totalAmount) * 100
            const monthsToPayoff = Math.ceil(debt.remainingAmount / debt.minimumPayment)
            const isPriority = index === 0
            
            return (
              <motion.div 
                key={debt.id} 
                className={`card p-6 group relative ${
                  isPriority ? 'ring-2 ring-primary/30 bg-primary/5' : ''
                }`}
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {isPriority && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
                      Prioridade
                    </span>
                  </div>
                )}
                
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary">{debt.name}</h3>
                    <p className="text-sm text-text-secondary">
                      Taxa: {debt.interestRate}% a.a. • Min: {formatCurrency(debt.minimumPayment)}/mês
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xl font-bold text-text-primary">
                        {formatCurrency(debt.remainingAmount)}
                      </p>
                      <p className="text-sm text-text-secondary">
                        ~{monthsToPayoff} meses
                      </p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEditDebt(debt)}
                        className="p-1 hover:bg-border/20 rounded"
                        title="Editar dívida"
                      >
                        <Edit3 className="w-4 h-4 text-text-secondary" />
                      </button>
                      <button 
                        onClick={() => handleDeleteDebt(debt.id)}
                        className="p-1 hover:bg-border/20 rounded"
                        title="Excluir dívida"
                      >
                        <Trash2 className="w-4 h-4 text-text-secondary" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Progresso</span>
                    <span className="text-text-primary">{progress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-border rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isPriority ? 'bg-primary' : 'bg-gray-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">
                      {formatCurrency(debt.totalAmount - debt.remainingAmount)} pago
                    </span>
                    <span className="text-text-primary">
                      {formatCurrency(debt.totalAmount)} total
                    </span>
                  </div>
                </div>
                
                {progress >= 90 && (
                  <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-green-400 text-sm font-medium">
                      🎉 Quase lá! Faltam apenas {formatCurrency(debt.remainingAmount)} para quitar esta dívida!
                    </p>
                  </div>
                )}
              </motion.div>
            )
          })
        ) : (
          <div className="card p-12 text-center">
            <TrendingDown className="w-12 h-12 mx-auto mb-4 text-text-secondary opacity-50" />
            <p className="text-text-secondary mb-4">Nenhuma dívida registrada</p>
            <p className="text-sm text-text-secondary mb-6">
              Mantenha suas dívidas organizadas e quite mais rápido com estratégias eficazes
            </p>
            <button 
              onClick={handleAddDebt}
              className="btn-primary"
            >
              Adicionar Dívida
            </button>
          </div>
        )}
      </div>

      {/* Strategy Explanation */}
      {debts.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-6 border-blue-500/20 bg-blue-500/5">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-semibold text-blue-400">Método Bola de Neve</h3>
            </div>
            <p className="text-text-secondary text-sm mb-4">
              Foque em quitar primeiro as dívidas com menores valores, independente da taxa de juros.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-text-secondary">Gera motivação rápida</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-text-secondary">Reduz o número de dívidas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-text-secondary">Pode custar mais a longo prazo</span>
              </div>
            </div>
          </div>
          
          <div className="card p-6 border-purple-500/20 bg-purple-500/5">
            <div className="flex items-center gap-3 mb-4">
              <Mountain className="w-6 h-6 text-purple-400" />
              <h3 className="text-lg font-semibold text-purple-400">Método Avalanche</h3>
            </div>
            <p className="text-text-secondary text-sm mb-4">
              Foque em quitar primeiro as dívidas com maiores taxas de juros, independente do valor.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-text-secondary">Economiza mais dinheiro</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-text-secondary">Matematicamente otimizado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-text-secondary">Pode levar mais tempo para ver resultados</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleFormCancel}
        title={editingDebt ? 'Editar Dívida' : 'Nova Dívida'}
      >
        <DebtForm
          debt={editingDebt}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      </Modal>
    </motion.div>
  )
}