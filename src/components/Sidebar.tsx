import React, { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Home, 
  CreditCard, 
  Target, 
  DollarSign, 
  TrendingDown, 
  BarChart3, 
  Settings, 
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useAppStore } from '../store'
import { useResponsive, getSidebarWidth } from '../hooks/useResponsive'

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/' },
  { id: 'expenses', label: 'Despesas', icon: CreditCard, path: '/expenses' },
  { id: 'goals', label: 'Metas', icon: Target, path: '/goals' },
  { id: 'budgets', label: 'Orçamentos', icon: DollarSign, path: '/budgets' },
  { id: 'debts', label: 'Dívidas', icon: TrendingDown, path: '/debts' },
  { id: 'reports', label: 'Relatórios', icon: BarChart3, path: '/reports' },
  { id: 'settings', label: 'Configurações', icon: Settings, path: '/settings' },
]

export default function Sidebar() {
  const location = useLocation()
  const { sidebarCollapsed, toggleSidebar, setSidebarCollapsed } = useAppStore()
  const breakpoint = useResponsive()
  const sidebarWidth = getSidebarWidth(sidebarCollapsed, breakpoint)

  // Auto-collapse on mobile
  useEffect(() => {
    if (breakpoint.isMobile && !sidebarCollapsed) {
      setSidebarCollapsed(true)
    }
  }, [breakpoint.isMobile, sidebarCollapsed, setSidebarCollapsed])

  return (
    <>
      {/* Mobile Overlay */}
      {!sidebarCollapsed && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={toggleSidebar}
        />
      )}

      <motion.div 
        className={`relative bg-card border-r border-border h-screen flex flex-col transition-all duration-300 z-50 ${
          breakpoint.isMobile 
            ? 'fixed' 
            : 'relative'
        }`}
        initial={false}
        animate={{ 
          width: sidebarWidth,
          x: sidebarCollapsed && breakpoint.isMobile ? -sidebarWidth : 0
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
      {/* Header */}
      <div className={`border-b border-border transition-all duration-300 ${
        sidebarCollapsed ? 'p-3' : 'p-4 lg:p-5'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`bg-primary rounded-lg flex items-center justify-center transition-all duration-300 ${
            sidebarCollapsed ? 'w-8 h-8' : 'w-10 h-10 lg:w-12 lg:h-12'
          }`}>
            <DollarSign className={`text-white transition-all duration-300 ${
              sidebarCollapsed ? 'w-5 h-5' : 'w-6 h-6 lg:w-7 lg:h-7'
            }`} />
          </div>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              <h1 className="text-xl lg:text-2xl xl:text-3xl font-bold gradient-text">Mavit</h1>
              <p className="text-sm lg:text-base text-text-secondary">Cash Manager</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 space-y-1 transition-all duration-300 ${
        sidebarCollapsed ? 'p-2' : 'p-3 lg:p-4'
      }`}>
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path
          const Icon = item.icon

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Link
                to={item.path}
                className={`sidebar-item ${isActive ? 'active' : ''} ${
                  sidebarCollapsed ? 'collapsed' : ''
                } ${
                  sidebarCollapsed 
                    ? 'p-3 justify-center' 
                    : 'px-4 py-3 lg:px-5 lg:py-4'
                }`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon className={`transition-all duration-300 ${
                  sidebarCollapsed ? 'w-6 h-6' : 'w-5 h-5 lg:w-6 lg:h-6'
                } ${isActive ? 'text-primary' : ''}`} />
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2, delay: 0.1 }}
                    className="font-medium text-sm lg:text-base truncate"
                  >
                    {item.label}
                  </motion.span>
                )}
              </Link>
            </motion.div>
          )
        })}
      </nav>

      {/* Toggle Button - Desktop */}
      <button
        onClick={toggleSidebar}
        className={`absolute bg-card border border-border rounded-full hover:bg-border/20 transition-all duration-300 hidden lg:flex items-center justify-center ${
          sidebarCollapsed 
            ? '-right-4 top-20 p-2' 
            : '-right-5 top-24 p-2.5'
        }`}
        aria-label={sidebarCollapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
      >
        {sidebarCollapsed ? (
          <ChevronRight className="w-4 h-4 lg:w-5 lg:h-5" />
        ) : (
          <ChevronLeft className="w-4 h-4 lg:w-5 lg:h-5" />
        )}
      </button>

      {/* Mobile Toggle Button */}
      {sidebarCollapsed && (
        <button
          onClick={toggleSidebar}
          className="fixed top-6 left-6 z-60 lg:hidden bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary/90 transition-all duration-300"
          aria-label="Abrir menu"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </motion.div>
    </>
  )
}