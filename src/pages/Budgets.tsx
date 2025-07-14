import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, Plus, TrendingUp, TrendingDown, Edit3, Trash2, Calendar, BarChart3, AlertTriangle } from 'lucide-react'
import { useAppStore } from '../store'
import { formatCurrency, getCurrentMonth } from '../utils/dateUtils'
import { Budget } from '../types'
import Modal from '../components/Modal'
import BudgetForm from '../components/BudgetForm'

const BUDGET_TEMPLATES = [
  {
    id: '50-30-20',
    name: 'Método 50/30/20',
    description: 'Distribuição clássica: 50% necessidades, 30% desejos, 20% poupança',
    distribution: [
      { categoryName: 'Moradia', percentage: 25 },
      { categoryName: 'Alimentação', percentage: 15 },
      { categoryName: 'Transporte', percentage: 10 },
      { categoryName: 'Entretenimento', percentage: 20 },
      { categoryName: 'Roupas', percentage: 10 },
      { categoryName: 'Outros', percentage: 20 }
    ]
  }
]

export default function Budgets() {
  const { budgets, categories, expenses, user, addBudget, updateBudget, deleteBudget } = useAppStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth().month)
  const [selectedYear, setSelectedYear] = useState(getCurrentMonth().year)
  const [showTemplates, setShowTemplates] = useState(false)

  const currentBudgets = useMemo(() => {
    return budgets.filter(
      budget => budget.month === selectedMonth && budget.year === selectedYear
    )
  }, [budgets, selectedMonth, selectedYear])

  const budgetStats = useMemo(() => {
    const totalBudget = currentBudgets.reduce((sum, budget) => sum + budget.amount, 0)
    const totalSpent = currentBudgets.reduce((sum, budget) => {
      const spent = expenses
        .filter(expense => 
          expense.categoryId === budget.categoryId && 
          expense.date.getMonth() === selectedMonth - 1 &&
          expense.date.getFullYear() === selectedYear
        )
        .reduce((expenseSum, expense) => expenseSum + expense.amount, 0)
      return sum + spent
    }, 0)
    
    const remaining = totalBudget - totalSpent
    const overBudgetCount = currentBudgets.filter(budget => {
      const spent = expenses
        .filter(expense => 
          expense.categoryId === budget.categoryId && 
          expense.date.getMonth() === selectedMonth - 1 &&
          expense.date.getFullYear() === selectedYear
        )
        .reduce((expenseSum, expense) => expenseSum + expense.amount, 0)
      return spent > budget.amount
    }).length

    return { totalBudget, totalSpent, remaining, overBudgetCount }
  }, [currentBudgets, expenses, selectedMonth, selectedYear])

  const handleAddBudget = () => {
    setEditingBudget(null)
    setIsModalOpen(true)
  }

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget)
    setIsModalOpen(true)
  }

  const handleDeleteBudget = (budgetId: string) => {
    if (confirm('Tem certeza que deseja excluir este orçamento?')) {
      deleteBudget(budgetId)
    }
  }

  const handleFormSubmit = (budgetData: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingBudget) {
      updateBudget(editingBudget.id, budgetData)
    } else {
      addBudget(budgetData)
    }
    setIsModalOpen(false)
    setEditingBudget(null)
  }

  const handleFormCancel = () => {
    setIsModalOpen(false)
    setEditingBudget(null)
  }

  const applyTemplate = (template: typeof BUDGET_TEMPLATES[0]) => {
    if (!user?.salary) return
    
    const salary = user.salary
    template.distribution.forEach(item => {
      const category = categories.find(cat => cat.name === item.categoryName)
      if (category) {
        const amount = (salary * item.percentage) / 100
        const spent = expenses
          .filter(expense => 
            expense.categoryId === category.id && 
            expense.date.getMonth() === selectedMonth - 1 &&
            expense.date.getFullYear() === selectedYear
          )
          .reduce((sum, expense) => sum + expense.amount, 0)

        addBudget({
          categoryId: category.id,
          category,
          amount,
          month: selectedMonth,
          year: selectedYear,
          spent
        })
      }
    })
    setShowTemplates(false)
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
          <h1 className="text-3xl font-bold text-text-primary">Orçamentos</h1>
          <p className="text-text-secondary mt-1">
            Controle seus gastos por categoria
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowTemplates(true)}
            className="btn-secondary"
          >
            Templates
          </button>
          <button 
            onClick={handleAddBudget}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Orçamento
          </button>
        </div>
      </div>

      {/* Month/Year Selector */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-text-secondary" />
          <select
            className="input-field"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(2023, i).toLocaleString('pt-BR', { month: 'long' })}
              </option>
            ))}
          </select>
          <select
            className="input-field"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          >
            {[2023, 2024, 2025].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      {currentBudgets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-blue-400" />
              <h3 className="font-semibold text-text-primary">Orçamento Total</h3>
            </div>
            <p className="text-2xl font-bold text-blue-400">{formatCurrency(budgetStats.totalBudget)}</p>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-5 h-5 text-green-400" />
              <h3 className="font-semibold text-text-primary">Total Gasto</h3>
            </div>
            <p className="text-2xl font-bold text-green-400">{formatCurrency(budgetStats.totalSpent)}</p>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-text-primary">Restante</h3>
            </div>
            <p className={`text-2xl font-bold ${budgetStats.remaining >= 0 ? 'text-primary' : 'text-red-400'}`}>
              {formatCurrency(budgetStats.remaining)}
            </p>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <h3 className="font-semibold text-text-primary">Acima do Limite</h3>
            </div>
            <p className="text-2xl font-bold text-yellow-400">{budgetStats.overBudgetCount}</p>
          </div>
        </div>
      )}

      {/* Budgets List */}
      <div className="space-y-4">
        {currentBudgets.length > 0 ? (
          currentBudgets.map((budget) => {
            const category = categories.find(cat => cat.id === budget.categoryId)
            const spent = expenses
              .filter(expense => 
                expense.categoryId === budget.categoryId && 
                expense.date.getMonth() === selectedMonth - 1 &&
                expense.date.getFullYear() === selectedYear
              )
              .reduce((sum, expense) => sum + expense.amount, 0)
            
            const percentage = (spent / budget.amount) * 100
            const isOverBudget = spent > budget.amount
            const isNearLimit = percentage > 80 && !isOverBudget
            
            return (
              <motion.div 
                key={budget.id} 
                className="card p-6 group"
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category?.color }}
                    />
                    <h3 className="text-lg font-semibold text-text-primary">
                      {category?.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-text-primary font-semibold">
                        {formatCurrency(spent)} / {formatCurrency(budget.amount)}
                      </p>
                      <p className={`text-sm ${
                        isOverBudget ? 'text-red-400' : 
                        isNearLimit ? 'text-yellow-400' : 'text-green-400'
                      }`}>
                        {isOverBudget ? 'Acima do orçamento' : 
                         isNearLimit ? 'Próximo do limite' : 'Dentro do orçamento'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEditBudget(budget)}
                        className="p-1 hover:bg-border/20 rounded"
                        title="Editar orçamento"
                      >
                        <Edit3 className="w-4 h-4 text-text-secondary" />
                      </button>
                      <button 
                        onClick={() => handleDeleteBudget(budget.id)}
                        className="p-1 hover:bg-border/20 rounded"
                        title="Excluir orçamento"
                      >
                        <Trash2 className="w-4 h-4 text-text-secondary" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Progresso</span>
                    <span className={`${
                      isOverBudget ? 'text-red-400' : 
                      isNearLimit ? 'text-yellow-400' : 'text-text-primary'
                    }`}>
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-border rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isOverBudget ? 'bg-red-500' : 
                        isNearLimit ? 'bg-yellow-500' : 'bg-primary'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {isOverBudget ? (
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    ) : (
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    )}
                    <span className="text-text-secondary">
                      {isOverBudget 
                        ? `${formatCurrency(spent - budget.amount)} acima do limite`
                        : `${formatCurrency(budget.amount - spent)} restante`
                      }
                    </span>
                  </div>
                </div>
              </motion.div>
            )
          })
        ) : (
          <div className="card p-12 text-center">
            <DollarSign className="w-12 h-12 mx-auto mb-4 text-text-secondary opacity-50" />
            <p className="text-text-secondary mb-4">Nenhum orçamento definido para este período</p>
            <p className="text-sm text-text-secondary mb-6">
              Use um template ou crie orçamentos personalizados para suas categorias
            </p>
            <div className="flex items-center justify-center gap-3">
              <button 
                onClick={() => setShowTemplates(true)}
                className="btn-secondary"
              >
                Usar Template
              </button>
              <button 
                onClick={handleAddBudget}
                className="btn-primary"
              >
                Criar Orçamento
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Budget Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleFormCancel}
        title={editingBudget ? 'Editar Orçamento' : 'Novo Orçamento'}
      >
        <BudgetForm
          budget={editingBudget}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      </Modal>

      {/* Templates Modal */}
      <Modal
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        title="Templates de Orçamento"
      >
        <div className="space-y-6">
          {BUDGET_TEMPLATES.map(template => (
            <div key={template.id} className="border border-border rounded-lg p-4">
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                {template.name}
              </h3>
              <p className="text-text-secondary text-sm mb-4">
                {template.description}
              </p>
              <div className="space-y-2 mb-4">
                {template.distribution.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-text-secondary">{item.categoryName}</span>
                    <span className="text-text-primary">{item.percentage}%</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => applyTemplate(template)}
                className="btn-primary w-full"
                disabled={!user?.salary}
              >
                {!user?.salary ? 'Configure seu salário primeiro' : 'Aplicar Template'}
              </button>
            </div>
          ))}
        </div>
      </Modal>
    </motion.div>
  )
}