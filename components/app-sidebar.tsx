"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  GitCompareArrows,
  Settings,
  SlidersHorizontal,
  UserCircle2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
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

interface FactoryUiConfig {
  id: string
  name: string
  userLabel: string
  showUserSwitcher: boolean
  showCategorySwitcher: boolean
}

interface AppSidebarProps {
  category: "sheet" | "case"
  onCategoryChange: (c: "sheet" | "case") => void
  collapsed: boolean
  onCollapsedChange: (collapsed: boolean) => void
  factories: FactoryUiConfig[]
  activeFactoryId: string
  onActiveFactoryChange: (factoryId: string) => void
  onFactoryVisibilityChange: (
    factoryId: string,
    key: "showUserSwitcher" | "showCategorySwitcher",
    value: boolean,
  ) => void
}

export function AppSidebar({
  category,
  onCategoryChange,
  collapsed,
  onCollapsedChange,
  factories,
  activeFactoryId,
  onActiveFactoryChange,
  onFactoryVisibilityChange,
}: AppSidebarProps) {
  const pathname = usePathname()
  const activeFactory = factories.find((factory) => factory.id === activeFactoryId) ?? factories[0]

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

        {activeFactory?.showCategorySwitcher &&
          (!collapsed ? (
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
          ))}

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

        <div className={cn("border-t border-border", collapsed ? "p-2" : "p-3")}>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 text-left hover:bg-accent",
                  collapsed ? "h-10 justify-center px-0" : "h-auto px-2 py-2",
                )}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  OP
                </div>
                {!collapsed && (
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-foreground">{activeFactory?.name}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {activeFactory?.showUserSwitcher ? activeFactory.userLabel : "工場設定"}
                    </div>
                  </div>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align={collapsed ? "start" : "end"} side="top" className="w-80 p-0">
              <div className="border-b border-border px-4 py-3">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">工場別表示設定</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  工場ごとにユーザー切り替え表示とシート/ケース切り替え表示を変更できます。
                </p>
              </div>

              <div className="max-h-[360px] overflow-y-auto p-2">
                <div className="space-y-2">
                  {factories.map((factory) => {
                    const selected = factory.id === activeFactoryId

                    return (
                      <div key={factory.id} className="rounded-lg border border-border bg-card p-3">
                        <button
                          type="button"
                          className={cn(
                            "flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors",
                            selected ? "bg-primary/10" : "hover:bg-accent",
                          )}
                          onClick={() => onActiveFactoryChange(factory.id)}
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium text-foreground">{factory.name}</div>
                            <div className="truncate text-xs text-muted-foreground">{factory.userLabel}</div>
                          </div>
                        </button>

                        <div className="mt-3 space-y-3 px-2">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-2">
                              <UserCircle2 className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="text-sm font-medium text-foreground">ユーザー切り替え表示</div>
                                <div className="text-xs text-muted-foreground">左下のユーザー表示を使う工場向け</div>
                              </div>
                            </div>
                            <Switch
                              checked={factory.showUserSwitcher}
                              onCheckedChange={(checked) =>
                                onFactoryVisibilityChange(factory.id, "showUserSwitcher", checked)
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="text-sm font-medium text-foreground">シート/ケース切り替え表示</div>
                              <div className="text-xs text-muted-foreground">受注種別を分ける工場だけ有効化</div>
                            </div>
                            <Switch
                              checked={factory.showCategorySwitcher}
                              onCheckedChange={(checked) =>
                                onFactoryVisibilityChange(factory.id, "showCategorySwitcher", checked)
                              }
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </aside>
    </TooltipProvider>
  )
}
