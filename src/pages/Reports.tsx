import React from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Download, Calendar, TrendingUp, PieChart } from 'lucide-react'
import { useAppStore } from '../store'

export default function Reports() {
  const { expenses, budgets, goals } = useAppStore()

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Relatórios e Gráficos</h1>
          <p className="text-text-secondary mt-1">
            Analise suas finanças com relatórios detalhados
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Filtrar Período
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div 
          className="card p-6"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <BarChart3 className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="font-semibold text-text-primary">Gastos Mensais</h3>
          </div>
          <p className="text-text-secondary text-sm">
            Evolução dos seus gastos ao longo do tempo
          </p>
        </motion.div>

        <motion.div 
          className="card p-6"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <PieChart className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="font-semibold text-text-primary">Por Categoria</h3>
          </div>
          <p className="text-text-secondary text-sm">
            Distribuição de gastos por categoria
          </p>
        </motion.div>

        <motion.div 
          className="card p-6"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="font-semibold text-text-primary">Orçamento vs Real</h3>
          </div>
          <p className="text-text-secondary text-sm">
            Compare orçamento planejado com gastos reais
          </p>
        </motion.div>
      </div>

      <div className="card p-12 text-center">
        <BarChart3 className="w-12 h-12 mx-auto mb-4 text-text-secondary opacity-50" />
        <p className="text-text-secondary mb-4">Relatórios em desenvolvimento</p>
        <p className="text-sm text-text-secondary">
          Em breve você terá acesso a relatórios detalhados com gráficos interativos
        </p>
      </div>
    </motion.div>
  )
}