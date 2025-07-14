import React from 'react'
import { motion } from 'framer-motion'
import Sidebar from './Sidebar'
import { useAppStore } from '../store'
import { useResponsive, getSidebarWidth, isSafeToUseBreakpoint } from '../hooks/useResponsive'
import ErrorBoundary from './ErrorBoundary'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { sidebarCollapsed } = useAppStore()
  const breakpoint = useResponsive()
  const sidebarWidth = getSidebarWidth(sidebarCollapsed, breakpoint)
  const isSafeBreakpoint = isSafeToUseBreakpoint(breakpoint)

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-background overflow-hidden">
        <ErrorBoundary>
          <Sidebar />
        </ErrorBoundary>
        
        <motion.main 
          className={`flex-1 overflow-hidden ${
            isSafeBreakpoint && breakpoint.isMobile ? 'w-full' : ''
          }`}
          initial={false}
          animate={{ 
            marginLeft: isSafeBreakpoint && breakpoint.isMobile && !sidebarCollapsed ? sidebarWidth : 0,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          style={{
            width: isSafeBreakpoint && breakpoint.isMobile 
              ? '100%' 
              : `calc(100% - ${sidebarWidth || 256}px)`
          }}
        >
          <div className="h-full overflow-y-auto scrollbar-custom">
            <div className={`transition-all duration-300 ${
              !isSafeBreakpoint
                ? 'p-4' // Loading state fallback
                : breakpoint.isMobile 
                  ? 'p-4'
                  : sidebarCollapsed 
                    ? 'p-4 lg:p-8 xl:p-12'
                    : 'p-4 lg:p-6 xl:p-8'
            }`}>
              <div className="max-w-full">
                <ErrorBoundary>
                  {children}
                </ErrorBoundary>
              </div>
            </div>
          </div>
        </motion.main>
      </div>
    </ErrorBoundary>
  )
}