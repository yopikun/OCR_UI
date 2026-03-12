"use client"

import React, { useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  CheckSquare,
  File,
  FileImage,
  FileSpreadsheet,
  FileType,
  Search,
  SlidersHorizontal,
  X,
  Zap,
} from "lucide-react"

import { useCompanyFilter } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { StatusBadge } from "@/components/status-badge"
import { inferOrderCategory } from "@/lib/order-classification"
import { loadStoredOrders, saveStoredOrders } from "@/lib/order-storage"
import { MOCK_COMPANIES, MOCK_ORDERS, type OrderDocument, type OrderStatus } from "@/lib/store"

const FORMAT_ICONS: Record<string, React.ElementType> = {
  excel: FileSpreadsheet,
  csv: FileType,
  text: File,
  pdf: FileImage,
  image: FileImage,
}

export function OrdersContent() {
  const { selectedCompanyId, category } = useCompanyFilter()
  const [orders, setOrders] = useState<OrderDocument[]>(() => loadStoredOrders() || MOCK_ORDERS)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearchOptions, setShowSearchOptions] = useState(false)
  const [companyFilterQuery, setCompanyFilterQuery] = useState("")
  const [sourceTypeFilter, setSourceTypeFilter] = useState<"all" | OrderDocument["type"]>("all")
  const [sourceFormatFilter, setSourceFormatFilter] = useState<"all" | OrderDocument["sourceFormat"]>("all")
  const [receivedDateQuery, setReceivedDateQuery] = useState("")
  const [unifiedDialogOpen, setUnifiedDialogOpen] = useState(false)
  const [unifiedStep, setUnifiedStep] = useState<"converting" | "convert-done" | "sorting" | "sort-confirm">(
    "converting",
  )
  const [convertedCount, setConvertedCount] = useState(0)
  const [sortResults, setSortResults] = useState<{ id: string; company: string; method: string }[]>([])
  const [editingRowId, setEditingRowId] = useState<string | null>(null)

  const unconvertedOrders = useMemo(() => orders.filter((order) => order.status === "received"), [orders])

  const companyNameOptions = useMemo(
    () => Array.from(new Set(unconvertedOrders.map((order) => order.companyName))).sort(),
    [unconvertedOrders],
  )

  const receivedDateOptions = useMemo(
    () =>
      Array.from(
        new Set(unconvertedOrders.map((order) => order.receivedAt.split(" ")[0]).filter((value) => Boolean(value))),
      ).sort(),
    [unconvertedOrders],
  )

  const filteredOrders = useMemo(() => {
    const normalizedSearch = searchQuery.toLowerCase()
    const normalizedCompany = companyFilterQuery.toLowerCase()
    const normalizedDate = receivedDateQuery.toLowerCase()

    return unconvertedOrders.filter((order) => {
      if (order.category !== category) return false
      if (selectedCompanyId && order.companyId !== selectedCompanyId) return false
      if (normalizedCompany && !order.companyName.toLowerCase().includes(normalizedCompany)) return false
      if (sourceTypeFilter !== "all" && order.type !== sourceTypeFilter) return false
      if (sourceFormatFilter !== "all" && order.sourceFormat !== sourceFormatFilter) return false
      if (normalizedDate && !order.receivedAt.toLowerCase().includes(normalizedDate)) return false

      if (
        normalizedSearch &&
        !order.fileName.toLowerCase().includes(normalizedSearch) &&
        !order.companyName.toLowerCase().includes(normalizedSearch)
      ) {
        return false
      }

      return true
    })
  }, [
    category,
    companyFilterQuery,
    receivedDateQuery,
    searchQuery,
    selectedCompanyId,
    sourceFormatFilter,
    sourceTypeFilter,
    unconvertedOrders,
  ])

  const activeOptionCount = [
    companyFilterQuery.length > 0,
    sourceTypeFilter !== "all",
    sourceFormatFilter !== "all",
    receivedDateQuery.length > 0,
  ].filter(Boolean).length

  const clearAdvancedFilters = () => {
    setCompanyFilterQuery("")
    setSourceTypeFilter("all")
    setSourceFormatFilter("all")
    setReceivedDateQuery("")
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const toggleAll = () => {
    if (selectedIds.size === filteredOrders.length) {
      setSelectedIds(new Set())
      return
    }

    setSelectedIds(new Set(filteredOrders.map((order) => order.id)))
  }

  const handleUnifiedProcess = () => {
    const total = selectedIds.size
    if (total === 0) return

    setConvertedCount(0)
    setUnifiedStep("converting")
    setUnifiedDialogOpen(true)

    const selectedOrders = orders.filter((order) => selectedIds.has(order.id))
    let done = 0
    const perItemDelay = Math.max(400, Math.min(1200, 3000 / total))

    const convertNext = () => {
      done += 1
      setConvertedCount(done)

      if (done < total) {
        setTimeout(convertNext, perItemDelay)
        return
      }

      setUnifiedStep("convert-done")

      setTimeout(() => {
        setUnifiedStep("sorting")

        setTimeout(() => {
          const results = selectedOrders.map((order) => {
            const company = MOCK_COMPANIES.find((entry) => entry.id === order.companyId) || MOCK_COMPANIES[0]
            return {
              id: order.id,
              company: company.name,
              method: company.rules[0] || "自動仕分け",
            }
          })

          setSortResults(results)
          setUnifiedStep("sort-confirm")
        }, 1000)
      }, 800)
    }

    setTimeout(convertNext, perItemDelay)
  }

  const confirmSortAndFinish = () => {
    const nextOrders = orders.map((order) =>
      selectedIds.has(order.id)
        ? {
            ...order,
            category: inferOrderCategory(order),
            status: "pending" as OrderStatus,
          }
        : order,
    )

    setOrders(nextOrders)
    saveStoredOrders(nextOrders)
    setUnifiedDialogOpen(false)
    setSelectedIds(new Set())
  }

  return (
    <div className="flex flex-col gap-6 overflow-auto p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground text-balance">受注処理</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            未処理の受注データを一覧表示し、EDI変換と会社仕分けまでまとめて進めます。
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[240px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="ファイル名・会社名で検索"
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Button
              variant={showSearchOptions ? "secondary" : "outline"}
              className="bg-transparent text-foreground"
              onClick={() => setShowSearchOptions((current) => !current)}
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              検索オプション
              {activeOptionCount > 0 && (
                <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                  {activeOptionCount}
                </span>
              )}
            </Button>

            <Separator orientation="vertical" className="h-8" />

            <Button size="sm" disabled={selectedIds.size === 0} onClick={handleUnifiedProcess}>
              <Zap className="mr-2 h-4 w-4" />
              一括処理
            </Button>
          </div>

          {showSearchOptions && (
            <div className="mt-4 rounded-2xl border border-border bg-muted/20 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">検索オプション</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    会社名、受信種別、ファイル形式、受信日で対象受注を絞り込みます。
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={clearAdvancedFilters}>
                  <X className="mr-2 h-4 w-4" />
                  条件をクリア
                </Button>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <label className="grid gap-2 text-sm">
                  <span className="font-medium text-foreground">会社フィルター</span>
                  <Input
                    list="order-company-filter-options"
                    value={companyFilterQuery}
                    onChange={(e) => setCompanyFilterQuery(e.target.value)}
                    placeholder="会社名を入力して絞り込み"
                    className="h-10 rounded-xl"
                  />
                  <datalist id="order-company-filter-options">
                    {companyNameOptions.map((companyName) => (
                      <option key={companyName} value={companyName} />
                    ))}
                  </datalist>
                </label>

                <label className="grid gap-2 text-sm">
                  <span className="font-medium text-foreground">受信種別</span>
                  <select
                    value={sourceTypeFilter}
                    onChange={(e) => setSourceTypeFilter(e.target.value as "all" | OrderDocument["type"])}
                    className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground"
                  >
                    <option value="all">すべて</option>
                    <option value="email">メール</option>
                    <option value="scan">スキャン</option>
                  </select>
                </label>

                <label className="grid gap-2 text-sm">
                  <span className="font-medium text-foreground">ファイル形式</span>
                  <select
                    value={sourceFormatFilter}
                    onChange={(e) => setSourceFormatFilter(e.target.value as "all" | OrderDocument["sourceFormat"])}
                    className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground"
                  >
                    <option value="all">すべて</option>
                    <option value="pdf">PDF</option>
                    <option value="image">画像</option>
                    <option value="excel">Excel</option>
                    <option value="csv">CSV</option>
                    <option value="text">テキスト</option>
                  </select>
                </label>

                <label className="grid gap-2 text-sm">
                  <span className="font-medium text-foreground">受信日</span>
                  <Input
                    list="order-date-filter-options"
                    value={receivedDateQuery}
                    onChange={(e) => setReceivedDateQuery(e.target.value)}
                    placeholder={receivedDateOptions[0] || "2026-03-12"}
                    className="h-10 rounded-xl"
                  />
                  <datalist id="order-date-filter-options">
                    {receivedDateOptions.map((receivedDate) => (
                      <option key={receivedDate} value={receivedDate} />
                    ))}
                  </datalist>
                </label>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="flex items-center justify-between text-sm font-semibold text-foreground">
            <span>未処理受注一覧</span>
            <span className="text-xs font-normal text-muted-foreground">
              {selectedIds.size > 0 ? `${selectedIds.size}件選択中` : `${filteredOrders.length}件`}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="sticky top-0 w-10 bg-muted/30 px-4 py-3 text-left">
                    <Checkbox
                      checked={selectedIds.size === filteredOrders.length && filteredOrders.length > 0}
                      onCheckedChange={toggleAll}
                      aria-label="すべて選択"
                    />
                  </th>
                  <th className="sticky top-0 bg-muted/30 px-4 py-3 text-left font-semibold text-muted-foreground">
                    形式
                  </th>
                  <th className="sticky top-0 bg-muted/30 px-4 py-3 text-left font-semibold text-muted-foreground">
                    ファイル名
                  </th>
                  <th className="sticky top-0 bg-muted/30 px-4 py-3 text-left font-semibold text-muted-foreground">
                    会社名
                  </th>
                  <th className="sticky top-0 bg-muted/30 px-4 py-3 text-left font-semibold text-muted-foreground">
                    受信日時
                  </th>
                  <th className="sticky top-0 bg-muted/30 px-4 py-3 text-left font-semibold text-muted-foreground">
                    受信種別
                  </th>
                  <th className="sticky top-0 bg-muted/30 px-4 py-3 text-left font-semibold text-muted-foreground">
                    ステータス
                  </th>
                  <th className="sticky top-0 bg-muted/30 px-4 py-3 text-right font-semibold text-muted-foreground">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const FormatIcon = FORMAT_ICONS[order.sourceFormat] || File

                  return (
                    <tr
                      key={order.id}
                      className="border-b border-border transition-colors last:border-0 hover:bg-muted/30"
                    >
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={selectedIds.has(order.id)}
                          onCheckedChange={() => toggleSelect(order.id)}
                          aria-label={`${order.fileName}を選択`}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <FormatIcon className="h-4 w-4 text-muted-foreground" />
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">{order.fileName}</td>
                      <td className="px-4 py-3 text-foreground">{order.companyName}</td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{order.receivedAt}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                          {order.type === "email" ? "メール" : "スキャン"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href="/compare">
                          <Button variant="ghost" size="sm" className="text-xs">
                            詳細
                            <ArrowRight className="ml-1 h-3 w-3" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={unifiedDialogOpen}
        onOpenChange={(open) => {
          if (!open && unifiedStep === "converting") return
          setUnifiedDialogOpen(open)
        }}
      >
        <DialogContent className="sm:max-w-lg">
          {unifiedStep === "converting" || unifiedStep === "convert-done" ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-foreground">
                  {unifiedStep === "converting" ? "EDI変換を実行中..." : "EDI変換が完了しました"}
                </DialogTitle>
              </DialogHeader>

              <div className="flex flex-col gap-6 py-6">
                <div className="flex flex-1 items-center gap-3 px-4">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      unifiedStep === "convert-done"
                        ? "bg-success text-success-foreground"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    {unifiedStep === "convert-done" ? <CheckSquare className="h-4 w-4" /> : "1"}
                  </div>
                  <div className="flex flex-1 flex-col gap-0.5">
                    <span className="text-sm font-medium text-foreground">EDI変換</span>
                    <span className="text-xs text-muted-foreground">
                      {unifiedStep === "converting"
                        ? `${convertedCount} / ${selectedIds.size} 件を変換中...`
                        : `${selectedIds.size} 件すべての変換が完了しました`}
                    </span>
                  </div>
                  {unifiedStep === "converting" && (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted border-t-primary" />
                  )}
                </div>

                <div className="mx-4">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        unifiedStep === "convert-done" ? "bg-success" : "bg-primary"
                      }`}
                      style={{ width: `${selectedIds.size > 0 ? (convertedCount / selectedIds.size) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 px-4 opacity-40">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground">
                    2
                  </div>
                  <div className="flex flex-1 flex-col gap-0.5">
                    <span className="text-sm font-medium text-muted-foreground">会社自動仕分け</span>
                    <span className="text-xs text-muted-foreground">EDI変換完了後に会社ルールで仕分けします</span>
                  </div>
                </div>
              </div>
            </>
          ) : unifiedStep === "sorting" ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-foreground">会社自動仕分けを実行中...</DialogTitle>
              </DialogHeader>

              <div className="flex flex-col gap-6 py-6">
                <div className="flex items-center gap-3 px-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success text-sm font-bold text-success-foreground">
                    <CheckSquare className="h-4 w-4" />
                  </div>
                  <div className="flex flex-1 flex-col gap-0.5">
                    <span className="text-sm text-muted-foreground line-through">EDI変換</span>
                    <span className="text-xs text-success">{selectedIds.size} 件完了</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 px-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    2
                  </div>
                  <div className="flex flex-1 flex-col gap-0.5">
                    <span className="text-sm font-medium text-foreground">会社自動仕分け</span>
                    <span className="text-xs text-muted-foreground">会社データをもとにルールへ自動で振り分けています...</span>
                  </div>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted border-t-primary" />
                </div>
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-foreground">処理結果の確認</DialogTitle>
              </DialogHeader>

              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 px-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-success text-xs font-bold text-success-foreground">
                    <CheckSquare className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-sm text-muted-foreground line-through">EDI変換</span>
                  <span className="ml-auto text-xs font-medium text-success">{selectedIds.size} 件完了</span>
                </div>

                <div className="flex items-center gap-3 px-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-success text-xs font-bold text-success-foreground">
                    <CheckSquare className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-sm text-muted-foreground line-through">会社自動仕分け</span>
                  <span className="ml-auto text-xs font-medium text-success">完了</span>
                </div>

                <Separator />

                <p className="text-sm text-muted-foreground">
                  処理結果を確認してください。必要があれば会社を変更してから確定できます。
                </p>

                <div className="overflow-hidden rounded-lg border border-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/40">
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">ファイル名</th>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">分類方法</th>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">推定会社</th>
                        <th className="w-16 px-3 py-2 text-right font-medium text-muted-foreground" />
                      </tr>
                    </thead>
                    <tbody>
                      {sortResults.map((result) => (
                        <tr key={result.id} className="border-t border-border">
                          <td className="px-3 py-2.5 font-medium text-foreground">
                            {orders.find((order) => order.id === result.id)?.fileName}
                          </td>
                          <td className="px-3 py-2.5 text-xs text-muted-foreground">{result.method}</td>
                          <td className="px-3 py-2.5">
                            {editingRowId === result.id ? (
                              <Select
                                defaultValue={result.company}
                                onValueChange={(value) => {
                                  setSortResults((prev) =>
                                    prev.map((entry) => (entry.id === result.id ? { ...entry, company: value } : entry)),
                                  )
                                  setEditingRowId(null)
                                }}
                              >
                                <SelectTrigger className="h-8 w-[180px] text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {MOCK_COMPANIES.map((company) => (
                                    <SelectItem key={company.id} value={company.name}>
                                      {company.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <span className="font-medium text-foreground">{result.company}</span>
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-right">
                            {editingRowId !== result.id && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                                onClick={() => setEditingRowId(result.id)}
                              >
                                編集
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" className="bg-transparent text-foreground" onClick={() => setUnifiedDialogOpen(false)}>
                  キャンセル
                </Button>
                <Button onClick={confirmSortAndFinish}>
                  <CheckSquare className="mr-2 h-4 w-4" />
                  確定
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
