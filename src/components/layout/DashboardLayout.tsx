// src/components/layout/DashboardLayout.tsx
import React, { useState } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { cn } from '@/lib/utils/helpers'

interface DashboardLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  className?: string
  showSidebar?: boolean
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title,
  subtitle,
  className,
  showSidebar = true
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Sidebar */}
      {showSidebar && (
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={closeSidebar}
        />
      )}

      {/* Main Content Area */}
      <div className={cn(
        "flex flex-col",
        showSidebar ? "lg:pl-64" : ""
      )}>
        
        {/* Header */}
        <Header
          title={title}
          subtitle={subtitle}
          onMenuToggle={showSidebar ? toggleSidebar : undefined}
        />

        {/* Page Content */}
        <main className={cn(
          "flex-1",
          className
        )}>
          {children}
        </main>
      </div>
    </div>
  )
}

export { DashboardLayout }