"use client"

import React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Inbox,
  Search,

  ArrowRight,
  CheckSquare,
  Zap,

  FileSpreadsheet,
  FileImage,
  FileType,
  File,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { MOCK_ORDERS, MOCK_COMPANIES, STATUS_CONFIG, type OrderDocument, type OrderStatus } from "@/lib/store"
import { StatusBadge } from "@/components/status-badge"
import { loadStoredOrders, resetStoredOrders, saveStoredOrders } from "@/lib/order-storage"
import { useCompanyFilter } from "@/components/app-shell"
import { inferOrderCategory } from "@/lib/order-classification"

const FORMAT_ICONS: Record<string, React.ElementType> = {
  excel: FileSpreadsheet,
  csv: FileType,
  text: File,
  pdf: FileImage,
  image: FileImage,
}

export function OrdersContent() {
  const { selectedCompanyId, category } = useCompanyFilter()
  const [orders, setOrders] = useState<OrderDocument[]>(MOCK_ORDERS)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [unifiedDialogOpen, setUnifiedDialogOpen] = useState(false)
  const [unifiedStep, setUnifiedStep] = useState<"converting" | "convert-done" | "sorting" | "sort-confirm">("converting")
  const [convertedCount, setConvertedCount] = useState(0)
  const [sortResults, setSortResults] = useState<{id: string; company: string; method: string}[]>([])
  const [editingRowId, setEditingRowId] = useState<string | null>(null)

  useEffect(() => {
    setOrders(loadStoredOrders())
  }, [])

  // Only show received (not yet converted) orders
  const unconvertedOrders = orders.filter((o) => o.status === "received")

  const filteredOrders = unconvertedOrders.filter((o) => {
    if (o.category !== category) return false
    if (selectedCompanyId && o.companyId !== selectedCompanyId) return false
    if (searchQuery && !o.fileName.toLowerCase().includes(searchQuery.toLowerCase()) && !o.companyName.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selectedIds.size === filteredOrders.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredOrders.map((o) => o.id)))
    }
  }

  const handleUnifiedProcess = () => {
    const total = selectedIds.size
    setConvertedCount(0)
    setUnifiedStep("converting")
    setUnifiedDialogOpen(true)

    // Step 1: EDI conversion for ALL selected orders (simulated one-by-one progress)
    const selectedArr = orders.filter((o) => selectedIds.has(o.id))
    let done = 0
    const perItemDelay = Math.max(400, Math.min(1200, 3000 / total))

    const convertNext = () => {
      done++
      setConvertedCount(done)
      if (done < total) {
        setTimeout(convertNext, perItemDelay)
      } else {
        // All conversions done - show completion briefly
        setUnifiedStep("convert-done")
        setTimeout(() => {
          // Step 2: Start auto-sort
          setUnifiedStep("sorting")
          setTimeout(() => {
            const results = selectedArr.map((o) => {
              const company = MOCK_COMPANIES.find((c) => c.id === o.companyId) || MOCK_COMPANIES[0]
              return {
                id: o.id,
                company: company.name,
                method: company.rules[0] || "メールドメイン",
              }
            })
            setSortResults(results)
            setUnifiedStep("sort-confirm")
          }, 1000)
        }, 800)
      }
    }
    setTimeout(convertNext, perItemDelay)
  }

  const confirmSortAndFinish = () => {
    const nextOrders = orders.map((o) =>
      selectedIds.has(o.id)
        ? {
            ...o,
            category: inferOrderCategory(o),
            status: "pending" as OrderStatus,
          }
        : o
    )
    setOrders(nextOrders)
    saveStoredOrders(nextOrders)
    setUnifiedDialogOpen(false)
    setSelectedIds(new Set())
  }

  return (
    <div className="flex flex-col gap-6 overflow-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground text-balance">受注書処理</h1>
          <p className="mt-1 text-sm text-muted-foreground">未変換の受信データ一覧 - EDI変換＋会社振分を実行します</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="bg-transparent text-foreground" onClick={() => {
            resetStoredOrders()
            setOrders(loadStoredOrders())
          }}>
            <Inbox className="mr-2 h-4 w-4" />
            受信データ参照
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="ファイル名・会社名で検索..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Separator orientation="vertical" className="h-8" />
          <Button
            size="sm"
            disabled={selectedIds.size === 0}
            onClick={handleUnifiedProcess}
          >
            <Zap className="mr-2 h-4 w-4" />
            一括処理（EDI変換＋振分）
          </Button>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="flex items-center justify-between text-sm font-semibold text-foreground">
            <span>未変換データ一覧</span>
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
                  <th className="sticky top-0 bg-muted/30 px-4 py-3 text-left w-10">
                    <Checkbox
                      checked={selectedIds.size === filteredOrders.length && filteredOrders.length > 0}
                      onCheckedChange={toggleAll}
                      aria-label="すべて選択"
                    />
                  </th>
                  <th className="sticky top-0 bg-muted/30 px-4 py-3 text-left font-semibold text-muted-foreground">形式</th>
                  <th className="sticky top-0 bg-muted/30 px-4 py-3 text-left font-semibold text-muted-foreground">ファイル名</th>
                  <th className="sticky top-0 bg-muted/30 px-4 py-3 text-left font-semibold text-muted-foreground">会社名</th>
                  <th className="sticky top-0 bg-muted/30 px-4 py-3 text-left font-semibold text-muted-foreground">受信日時</th>
                  <th className="sticky top-0 bg-muted/30 px-4 py-3 text-left font-semibold text-muted-foreground">入力元</th>
                  <th className="sticky top-0 bg-muted/30 px-4 py-3 text-left font-semibold text-muted-foreground">ステータス</th>
                  <th className="sticky top-0 bg-muted/30 px-4 py-3 text-right font-semibold text-muted-foreground">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const FormatIcon = FORMAT_ICONS[order.sourceFormat] || File
                  return (
                    <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
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
                      <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{order.receivedAt}</td>
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
                            詳細 <ArrowRight className="ml-1 h-3 w-3" />
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

      {/* Unified Process Dialog */}
      <Dialog open={unifiedDialogOpen} onOpenChange={(open) => {
        if (!open && unifiedStep === "converting") return
        setUnifiedDialogOpen(open)
      }}>
        <DialogContent className="sm:max-w-lg">
          {(unifiedStep === "converting" || unifiedStep === "convert-done") ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-foreground">
                  {unifiedStep === "converting" ? "EDIフォーマットへ変換中..." : "EDI変換 完了"}
                </DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-6 py-6">
                {/* Step 1: EDI conversion progress */}
                <div className="flex items-center gap-3 px-4">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${unifiedStep === "convert-done" ? "bg-success text-success-foreground" : "bg-primary text-primary-foreground"}`}>
                    {unifiedStep === "convert-done" ? <CheckSquare className="h-4 w-4" /> : "1"}
                  </div>
                  <div className="flex flex-col gap-0.5 flex-1">
                    <span className="text-sm font-medium text-foreground">EDIフォーマットへ変換</span>
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

                {/* Progress bar */}
                <div className="mx-4">
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${unifiedStep === "convert-done" ? "bg-success" : "bg-primary"}`}
                      style={{ width: `${selectedIds.size > 0 ? (convertedCount / selectedIds.size) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {/* Step 2: waiting */}
                <div className="flex items-center gap-3 px-4 opacity-40">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-bold">2</div>
                  <div className="flex flex-col gap-0.5 flex-1">
                    <span className="text-sm font-medium text-muted-foreground">会社自動振分</span>
                    <span className="text-xs text-muted-foreground">すべてのEDI変換完了後���振分を行います</span>
                  </div>
                </div>
              </div>
            </>
          ) : unifiedStep === "sorting" ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-foreground">会社自動振分中...</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-6 py-6">
                {/* Step 1: done */}
                <div className="flex items-center gap-3 px-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success text-success-foreground text-sm font-bold">
                    <CheckSquare className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col gap-0.5 flex-1">
                    <span className="text-sm text-muted-foreground line-through">EDIフォーマットへ変換</span>
                    <span className="text-xs text-success">{selectedIds.size} 件完了</span>
                  </div>
                </div>

                {/* Step 2: sorting in progress */}
                <div className="flex items-center gap-3 px-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">2</div>
                  <div className="flex flex-col gap-0.5 flex-1">
                    <span className="text-sm font-medium text-foreground">会社自動振分</span>
                    <span className="text-xs text-muted-foreground">変換済みデータを会社ごとに振り分けています...</span>
                  </div>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted border-t-primary" />
                </div>
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-foreground">振分結果確認</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                {/* Both steps done */}
                <div className="flex items-center gap-3 px-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-success text-success-foreground text-xs font-bold">
                    <CheckSquare className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-sm text-muted-foreground line-through">EDIフォーマットへ変換</span>
                  <span className="ml-auto text-xs text-success font-medium">{selectedIds.size} 件完了</span>
                </div>
                <div className="flex items-center gap-3 px-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-success text-success-foreground text-xs font-bold">
                    <CheckSquare className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-sm text-muted-foreground line-through">会社自動振分</span>
                  <span className="ml-auto text-xs text-success font-medium">完了</span>
                </div>

                <Separator />

                <p className="text-sm text-muted-foreground">振分結果をご確認ください。修正が必要な場合は編集ボタンを押してください。</p>

                {/* Confirmation table */}
                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/40">
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">ファイル名</th>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">判定方法</th>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">振分先</th>
                        <th className="px-3 py-2 text-right font-medium text-muted-foreground w-16" />
                      </tr>
                    </thead>
                    <tbody>
                      {sortResults.map((r) => (
                        <tr key={r.id} className="border-t border-border">
                          <td className="px-3 py-2.5 font-medium text-foreground">{orders.find(o => o.id === r.id)?.fileName}</td>
                          <td className="px-3 py-2.5 text-muted-foreground text-xs">{r.method}</td>
                          <td className="px-3 py-2.5">
                            {editingRowId === r.id ? (
                              <Select
                                defaultValue={r.company}
                                onValueChange={(val) => {
                                  setSortResults((prev) => prev.map((sr) => sr.id === r.id ? { ...sr, company: val } : sr))
                                  setEditingRowId(null)
                                }}
                              >
                                <SelectTrigger className="w-[180px] h-8 text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {MOCK_COMPANIES.map((c) => (
                                    <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <span className="text-foreground font-medium">{r.company}</span>
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-right">
                            {editingRowId !== r.id && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                                onClick={() => setEditingRowId(r.id)}
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
                <Button variant="outline" className="bg-transparent text-foreground" onClick={() => setUnifiedDialogOpen(false)}>キャンセル</Button>
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
