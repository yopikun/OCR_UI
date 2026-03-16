"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { usePathname } from "next/navigation"

import { AppSidebar } from "@/components/app-sidebar"

type OrderCategory = "sheet" | "case"

interface FactoryUiConfig {
  id: string
  name: string
  userLabel: string
  showUserSwitcher: boolean
  showCategorySwitcher: boolean
}

const DEFAULT_FACTORIES: FactoryUiConfig[] = [
  {
    id: "factory-kanto",
    name: "関東工場",
    userLabel: "関東オペレーター",
    showUserSwitcher: true,
    showCategorySwitcher: true,
  },
  {
    id: "factory-kansai",
    name: "関西工場",
    userLabel: "関西オペレーター",
    showUserSwitcher: false,
    showCategorySwitcher: true,
  },
  {
    id: "factory-chubu",
    name: "中部工場",
    userLabel: "中部オペレーター",
    showUserSwitcher: true,
    showCategorySwitcher: false,
  },
]

const FACTORY_STORAGE_KEY = "propack_ocr_factory_ui"
const FACTORY_ID_STORAGE_KEY = "propack_ocr_active_factory"

const CompanyFilterContext = createContext<{
  selectedCompanyId: string | null
  category: OrderCategory
}>({
  selectedCompanyId: null,
  category: "sheet",
})

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname()
  const [category, setCategory] = useState<OrderCategory>("sheet")
  const [collapsed, setCollapsed] = useState(false)
  const [factories, setFactories] = useState<FactoryUiConfig[]>(DEFAULT_FACTORIES)
  const [activeFactoryId, setActiveFactoryId] = useState(DEFAULT_FACTORIES[0].id)

  useEffect(() => {
    setCollapsed(pathname === "/compare")
  }, [pathname])

  useEffect(() => {
    if (typeof window === "undefined") return

    const savedFactories = window.localStorage.getItem(FACTORY_STORAGE_KEY)
    const savedFactoryId = window.localStorage.getItem(FACTORY_ID_STORAGE_KEY)

    if (savedFactories) {
      try {
        const parsed = JSON.parse(savedFactories) as FactoryUiConfig[]
        if (Array.isArray(parsed) && parsed.length > 0) {
          setFactories(parsed)
        }
      } catch {
        window.localStorage.removeItem(FACTORY_STORAGE_KEY)
      }
    }

    if (savedFactoryId) {
      setActiveFactoryId(savedFactoryId)
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem(FACTORY_STORAGE_KEY, JSON.stringify(factories))
  }, [factories])

  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem(FACTORY_ID_STORAGE_KEY, activeFactoryId)
  }, [activeFactoryId])

  const activeFactory = factories.find((factory) => factory.id === activeFactoryId) ?? factories[0] ?? DEFAULT_FACTORIES[0]

  const updateFactoryVisibility = (
    factoryId: string,
    key: "showUserSwitcher" | "showCategorySwitcher",
    value: boolean,
  ) => {
    setFactories((current) =>
      current.map((factory) => (factory.id === factoryId ? { ...factory, [key]: value } : factory)),
    )
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar
        category={category}
        onCategoryChange={setCategory}
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        factories={factories}
        activeFactoryId={activeFactory.id}
        onActiveFactoryChange={setActiveFactoryId}
        onFactoryVisibilityChange={updateFactoryVisibility}
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

