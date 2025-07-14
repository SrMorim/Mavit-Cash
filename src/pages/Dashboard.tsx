import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, Target, CreditCard } from 'lucide-react'
import { useAppStore } from '../store'
import { formatCurrency, getGreeting, getCurrentMonth, isCurrentMonth } from '../utils/dateUtils'
import { useResponsive, getGridCols } from '../hooks/useResponsive'

interface StatsCard {
  title: string
  value: string
  change?: string
  trend?: 'up' | 'down'
  icon: React.ComponentType<{ className?: string }>
  color: string
}

export default function Dashboard() {
  const { user, expenses, budgets, goals, categories, sidebarCollapsed } = useAppStore()
  const currentMonth = getCurrentMonth()
  const breakpoint = useResponsive()
  const gridCols = getGridCols(sidebarCollapsed, breakpoint)
  
  const monthlyData = useMemo(() => {
    const currentExpenses = expenses.filter(expense => isCurrentMonth(expense.date))
    const totalExpenses = currentExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    const salary = user?.salary || 0
    const balance = salary - totalExpenses
    
    return {
      salary,
      totalExpenses,
      balance,
      currentExpenses
    }
  }, [expenses, user])

  const categoryData = useMemo(() => {
    const expensesByCategory = categories.map(category => {
      const categoryExpenses = monthlyData.currentExpenses.filter(
        expense => expense.categoryId === category.id
      )
      const total = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0)
      
      return {
        name: category.name,
        value: total,
        color: category.color,
        percentage: monthlyData.totalExpenses > 0 ? (total / monthlyData.totalExpenses) * 100 : 0
      }
    }).filter(item => item.value > 0)
    
    return expensesByCategory
  }, [categories, monthlyData])

  const budgetAlerts = useMemo(() => {
    const currentBudgets = budgets.filter(
      budget => budget.month === currentMonth.month && budget.year === currentMonth.year
    )
    
    return currentBudgets.filter(budget => {
      const spent = monthlyData.currentExpenses
        .filter(expense => expense.categoryId === budget.categoryId)
        .reduce((sum, expense) => sum + expense.amount, 0)
      
      return spent >= budget.amount * 0.8
    })
  }, [budgets, monthlyData, currentMonth])

  const activeGoals = useMemo(() => {
    return goals.filter(goal => !goal.completed).length
  }, [goals])

  const statsCards: StatsCard[] = [
    {
      title: 'Salário Líquido',
      value: formatCurrency(monthlyData.salary),
      icon: DollarSign,
      color: 'text-green-400',
    },
    {
      title: 'Total de Despesas',
      value: formatCurrency(monthlyData.totalExpenses),
      icon: CreditCard,
      color: 'text-red-400',
    },
    {
      title: 'Saldo Restante',
      value: formatCurrency(monthlyData.balance),
      trend: monthlyData.balance > 0 ? 'up' : 'down',
      icon: monthlyData.balance > 0 ? TrendingUp : TrendingDown,
      color: monthlyData.balance > 0 ? 'text-green-400' : 'text-red-400',
    },
    {
      title: 'Metas Ativas',
      value: activeGoals.toString(),
      icon: Target,
      color: 'text-blue-400',
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold text-text-primary">
          {getGreeting()}, {user?.name || 'Usuário'}! 👋
        </h1>
        <p className="text-text-secondary mt-1">
          Aqui está um resumo das suas finanças de {new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        className={`grid gap-3 lg:gap-4 xl:gap-6 transition-all duration-300 ${gridCols}`}
        variants={itemVariants}
      >
        {statsCards.map((card, index) => (
          <motion.div
            key={card.title}
            className="card p-4 lg:p-6 hover:shadow-lg transition-all duration-300"
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-text-secondary text-xs lg:text-sm font-medium truncate">{card.title}</p>
                <p className="text-lg lg:text-2xl font-bold text-text-primary mt-1 truncate">{card.value}</p>
                {card.change && (
                  <p className={`text-xs lg:text-sm mt-1 ${card.color} truncate`}>
                    {card.change}
                  </p>
                )}
              </div>
              <div className={`p-2 lg:p-3 rounded-lg bg-opacity-10 flex-shrink-0 ml-3 ${card.color}`}>
                <card.icon className={`w-5 h-5 lg:w-6 lg:h-6 ${card.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts and Insights */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
        {/* Expense Distribution Chart */}
        <motion.div className="card p-4 lg:p-6" variants={itemVariants}>
          <h3 className="text-lg lg:text-xl font-semibold text-text-primary mb-4">
            Distribuição de Gastos
          </h3>
          {categoryData.length > 0 ? (
            <div className="h-48 lg:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    labelStyle={{ color: '#ffffff' }}
                    itemStyle={{ color: '#ffffff' }}
                    contentStyle={{ 
                      backgroundColor: '#1a1a1a', 
                      border: '1px solid #2a2a2a',
                      borderRadius: '8px',
                      color: '#ffffff'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-text-secondary">
              <div className="text-center">
                <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma despesa registrada este mês</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Budget Alerts */}
        <motion.div className="card p-4 lg:p-6" variants={itemVariants}>
          <h3 className="text-lg lg:text-xl font-semibold text-text-primary mb-4">
            Assistente de Economia
          </h3>
          <div className="space-y-4">
            {budgetAlerts.length > 0 ? (
              budgetAlerts.map((budget) => {
                const category = categories.find(cat => cat.id === budget.categoryId)
                const spent = monthlyData.currentExpenses
                  .filter(expense => expense.categoryId === budget.categoryId)
                  .reduce((sum, expense) => sum + expense.amount, 0)
                
                return (
                  <div key={budget.id} className="flex items-center gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                    <div>
                      <p className="text-text-primary font-medium">
                        Atenção: {category?.name}
                      </p>
                      <p className="text-sm text-text-secondary">
                        Gastou {formatCurrency(spent)} de {formatCurrency(budget.amount)} ({((spent / budget.amount) * 100).toFixed(1)}%)
                      </p>
                    </div>
                  </div>
                )
              })
            ) : (
              <>
                {categoryData.length > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-text-primary font-medium">
                        Parabéns! Seus gastos estão controlados
                      </p>
                      <p className="text-sm text-text-secondary">
                        Maior categoria: {categoryData[0]?.name} ({categoryData[0]?.percentage.toFixed(1)}%)
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <Target className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-text-primary font-medium">
                      Dica do mês
                    </p>
                    <p className="text-sm text-text-secondary">
                      Que tal definir algumas metas financeiras para o próximo mês?
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}