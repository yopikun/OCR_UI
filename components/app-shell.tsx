"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { usePathname } from "next/navigation"
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
  const pathname = usePathname()
  const [category, setCategory] = useState<"sheet" | "case">("sheet")
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    setCollapsed(pathname === "/compare")
  }, [pathname])

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar
        category={category}
        onCategoryChange={setCategory}
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
      />
      <main className="flex flex-1 flex-col overflow-hidden">
        <CompanyFilterContext.Provider value={{ selectedCompanyId: null, category }}>
          {children}
        </CompanyFilterContext.Provider>
      </main>
    </div>
  )
}

export function useCompanyFilter() {
  return useContext(CompanyFilterContext)
}
