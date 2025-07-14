import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Target, Plus, Check, Edit3, Trash2, Trophy, DollarSign, Calendar } from 'lucide-react'
import { useAppStore } from '../store'
import { formatCurrency, formatDate } from '../utils/dateUtils'
import { Goal } from '../types'
import Modal from '../components/Modal'
import GoalForm from '../components/GoalForm'

export default function Goals() {
  const { goals, addGoal, updateGoal, deleteGoal, markGoalCompleted } = useAppStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)

  const handleAddGoal = () => {
    setEditingGoal(null)
    setIsModalOpen(true)
  }

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal)
    setIsModalOpen(true)
  }

  const handleDeleteGoal = (goalId: string) => {
    if (confirm('Tem certeza que deseja excluir esta meta?')) {
      deleteGoal(goalId)
    }
  }

  const handleCompleteGoal = (goalId: string) => {
    if (confirm('Parabéns! Deseja marcar esta meta como concluída?')) {
      markGoalCompleted(goalId)
    }
  }

  const handleFormSubmit = (goalData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingGoal) {
      updateGoal(editingGoal.id, goalData)
    } else {
      addGoal(goalData)
    }
    setIsModalOpen(false)
    setEditingGoal(null)
  }

  const handleFormCancel = () => {
    setIsModalOpen(false)
    setEditingGoal(null)
  }

  const activeGoals = goals.filter(goal => !goal.completed)
  const completedGoals = goals.filter(goal => goal.completed)

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Metas Financeiras</h1>
          <p className="text-text-secondary mt-1">
            Defina e acompanhe seus objetivos de economia
          </p>
        </div>
        <button 
          onClick={handleAddGoal}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nova Meta
        </button>
      </div>

      {/* Stats */}
      {goals.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-5 h-5 text-blue-400" />
              <h3 className="font-semibold text-text-primary">Metas Ativas</h3>
            </div>
            <p className="text-2xl font-bold text-blue-400">{activeGoals.length}</p>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-5 h-5 text-green-400" />
              <h3 className="font-semibold text-text-primary">Concluídas</h3>
            </div>
            <p className="text-2xl font-bold text-green-400">{completedGoals.length}</p>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-text-primary">Valor Total</h3>
            </div>
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(activeGoals.reduce((sum, goal) => sum + goal.targetAmount, 0))}
            </p>
          </div>
        </div>
      )}

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-text-primary mb-4">Metas Ativas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeGoals.map((goal) => {
              const progress = (goal.currentAmount / goal.targetAmount) * 100
              const remaining = goal.targetAmount - goal.currentAmount
              const isNearComplete = progress >= 90
              
              return (
                <motion.div 
                  key={goal.id} 
                  className="card p-6 relative group"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <Target className="w-6 h-6 text-primary" />
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEditGoal(goal)}
                        className="p-1 hover:bg-border/20 rounded"
                        title="Editar meta"
                      >
                        <Edit3 className="w-4 h-4 text-text-secondary" />
                      </button>
                      <button 
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="p-1 hover:bg-border/20 rounded"
                        title="Excluir meta"
                      >
                        <Trash2 className="w-4 h-4 text-text-secondary" />
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    {goal.name}
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">Progresso</span>
                      <span className={`font-medium ${isNearComplete ? 'text-green-400' : 'text-text-primary'}`}>
                        {Math.min(progress, 100).toFixed(1)}%
                      </span>
                    </div>
                    
                    <div className="w-full bg-border rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          isNearComplete ? 'bg-green-500' : 'bg-primary'
                        }`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">
                        {formatCurrency(goal.currentAmount)}
                      </span>
                      <span className="text-text-primary">
                        {formatCurrency(goal.targetAmount)}
                      </span>
                    </div>
                    
                    {goal.deadline && (
                      <div className="flex items-center gap-1 text-sm text-text-secondary">
                        <Calendar className="w-4 h-4" />
                        <span>até {formatDate(goal.deadline)}</span>
                      </div>
                    )}
                    
                    {remaining > 0 && (
                      <p className="text-sm text-text-secondary">
                        Faltam {formatCurrency(remaining)} para atingir a meta
                      </p>
                    )}
                  </div>
                  
                  {isNearComplete && (
                    <motion.button
                      onClick={() => handleCompleteGoal(goal.id)}
                      className="btn-primary w-full mt-4 text-sm"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Marcar como Concluída
                    </motion.button>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-text-primary mb-4">Metas Concluídas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedGoals.map((goal) => (
              <motion.div 
                key={goal.id} 
                className="card p-6 opacity-75"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 0.75, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <Trophy className="w-6 h-6 text-green-500" />
                  <div className="p-1 bg-green-500/20 rounded-full">
                    <Check className="w-4 h-4 text-green-500" />
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  {goal.name}
                </h3>
                
                <div className="space-y-3">
                  <div className="w-full bg-green-500/20 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full w-full" />
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Concluída</span>
                    <span className="text-green-400 font-medium">100%</span>
                  </div>
                  
                  <p className="text-text-primary font-semibold">
                    {formatCurrency(goal.targetAmount)}
                  </p>
                  
                  {goal.completedAt && (
                    <p className="text-sm text-text-secondary">
                      Concluída em {formatDate(goal.completedAt)}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {goals.length === 0 && (
        <div className="text-center py-12">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-border/20 rounded-full flex items-center justify-center mb-4">
              <Target className="w-8 h-8 text-text-secondary" />
            </div>
            <p className="text-text-secondary mb-4">Nenhuma meta definida ainda</p>
            <p className="text-sm text-text-secondary mb-6">
              Crie metas financeiras para manter seu foco e motivação
            </p>
            <button 
              onClick={handleAddGoal}
              className="btn-primary"
            >
              Criar primeira meta
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleFormCancel}
        title={editingGoal ? 'Editar Meta' : 'Nova Meta'}
      >
        <GoalForm
          goal={editingGoal}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      </Modal>
    </motion.div>
  )
}