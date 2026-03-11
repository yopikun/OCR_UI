"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { AppSidebar } from "@/components/app-sidebar"

const CompanyFilterContext = createContext<{
  selectedCompanyId: string | null
  category: "sheet" | "case"
}>({
  selectedCompanyId: null,
  category: "sheet",
})

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [category, setCategory] = useState<"sheet" | "case">("sheet")
  const [collapsed, setCollapsed] = useState(false)
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null)

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar
        category={category}
        onCategoryChange={setCategory}
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        selectedCompanyId={selectedCompanyId}
        onCompanySelect={setSelectedCompanyId}
      />
      <main className="flex flex-1 flex-col overflow-hidden">
        <CompanyFilterContext.Provider value={{ selectedCompanyId, category }}>
          {children}
        </CompanyFilterContext.Provider>
      </main>
    </div>
  )
}

export function useCompanyFilter() {
  return useContext(CompanyFilterContext)
}
