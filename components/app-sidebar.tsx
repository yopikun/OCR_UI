"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  GitCompareArrows,
  Settings,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/orders", label: "受注処理", icon: FileText },
  { href: "/compare", label: "結果編集", icon: GitCompareArrows },
  { href: "/export", label: "出力履歴", icon: Download },
  { href: "/master", label: "マスタ管理", icon: Settings },
]

interface AppSidebarProps {
  category: "sheet" | "case"
  onCategoryChange: (c: "sheet" | "case") => void
  collapsed: boolean
  onCollapsedChange: (collapsed: boolean) => void
}

export function AppSidebar({
  category,
  onCategoryChange,
  collapsed,
  onCollapsedChange,
}: AppSidebarProps) {
  const pathname = usePathname()

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "flex shrink-0 flex-col border-r border-border bg-card transition-all duration-200",
          collapsed ? "w-[68px]" : "w-[260px]",
        )}
      >
        <div className="flex h-16 items-center border-b border-border px-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
            <FileText className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && <span className="ml-2 truncate text-base font-bold text-foreground">EDI Transform</span>}
          <button
            type="button"
            onClick={() => onCollapsedChange(!collapsed)}
            className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {!collapsed ? (
          <div className="flex gap-1 p-4">
            <Button
              variant={category === "sheet" ? "default" : "outline"}
              size="sm"
              className={cn("flex-1 text-xs", category === "sheet" ? "" : "bg-transparent text-foreground hover:bg-accent")}
              onClick={() => onCategoryChange("sheet")}
            >
              シート受注
            </Button>
            <Button
              variant={category === "case" ? "default" : "outline"}
              size="sm"
              className={cn("flex-1 text-xs", category === "case" ? "" : "bg-transparent text-foreground hover:bg-accent")}
              onClick={() => onCategoryChange("case")}
            >
              ケース受注
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-1 p-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={category === "sheet" ? "default" : "outline"}
                  size="sm"
                  className={cn("px-1 text-[10px]", category === "sheet" ? "" : "bg-transparent text-foreground hover:bg-accent")}
                  onClick={() => onCategoryChange("sheet")}
                >
                  Sheet
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">シート受注</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={category === "case" ? "default" : "outline"}
                  size="sm"
                  className={cn("px-1 text-[10px]", category === "case" ? "" : "bg-transparent text-foreground hover:bg-accent")}
                  onClick={() => onCategoryChange("case")}
                >
                  Case
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">ケース受注</TooltipContent>
            </Tooltip>
          </div>
        )}

        <Separator />

        <ScrollArea className="flex-1">
          <nav className="flex flex-col gap-1 p-3">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href
              return collapsed ? (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center justify-center rounded-md p-2.5 transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </ScrollArea>

        <div className={cn("flex items-center border-t border-border", collapsed ? "justify-center p-3" : "gap-3 p-4")}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                OP
              </div>
            </TooltipTrigger>
            {collapsed && <TooltipContent side="right">オペレーター</TooltipContent>}
          </Tooltip>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">オペレーター</span>
              <span className="text-xs text-muted-foreground">管理者</span>
            </div>
          )}
        </div>
      </aside>
    </TooltipProvider>
  )
}
