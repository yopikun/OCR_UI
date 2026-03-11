"use client"

import { useEffect, useState } from "react"
import {
  CheckCircle2,
  RotateCcw,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  History,
  FileText,
  ZoomIn,
  ZoomOut,
  RotateCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { MOCK_ORDERS, type OrderDocument } from "@/lib/store"
import { StatusBadge } from "@/components/status-badge"
import { loadStoredOrders } from "@/lib/order-storage"
import { useCompanyFilter } from "@/components/app-shell"

const COLOR_MAP: Record<string, string> = {
  red: "bg-[hsl(0,72%,51%)]",
  orange: "bg-[hsl(38,92%,50%)]",
  green: "bg-[hsl(152,60%,42%)]",
  blue: "bg-[hsl(217,91%,50%)]",
}

interface ChangeLog {
  field: string
  oldValue: string
  newValue: string
  editedBy: string
  editedAt: string
}

export function CompareContent() {
  const { selectedCompanyId, category } = useCompanyFilter()
  const [orders, setOrders] = useState<OrderDocument[]>(MOCK_ORDERS)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: string } | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(270)
  const [changeLogs] = useState<ChangeLog[]>([
    { field: "幅", oldValue: "1000", newValue: "1100", editedBy: "オペレーターA", editedAt: "2026-01-06 14:30" },
    { field: "長さ", oldValue: "1050", newValue: "1057", editedBy: "オペレーターA", editedAt: "2026-01-06 14:32" },
  ])

  const docList = orders.filter((order) => {
    if (order.status !== "pending") return false
    if (order.category !== category) return false
    if (selectedCompanyId && order.companyId !== selectedCompanyId) return false
    return true
  })

  const safeCurrentIdx = currentIdx < docList.length ? currentIdx : 0
  const order = docList[safeCurrentIdx] ?? null
  const editedItems = order?.items ?? []

  useEffect(() => {
    const syncOrders = () => {
      setOrders(loadStoredOrders())
      setCurrentIdx(0)
      setSelectedCell(null)
    }

    syncOrders()
    window.addEventListener("orders-updated", syncOrders)
    window.addEventListener("storage", syncOrders)

    return () => {
      window.removeEventListener("orders-updated", syncOrders)
      window.removeEventListener("storage", syncOrders)
    }
  }, [])

  const handleCellEdit = (rowIdx: number, field: string, value: string) => {
    if (!order) return

    const nextOrders = orders.map((targetOrder) => {
      if (targetOrder.id !== order.id) return targetOrder

      return {
        ...targetOrder,
        items: targetOrder.items.map((item, idx) => {
          if (idx !== rowIdx) return item
          const numVal = Number(value)
          if (field === "width") return { ...item, width: Number.isNaN(numVal) ? item.width : numVal }
          if (field === "length") return { ...item, length: Number.isNaN(numVal) ? item.length : numVal }
          if (field === "quantity") return { ...item, quantity: Number.isNaN(numVal) ? item.quantity : numVal }
          if (field === "material") return { ...item, material: value }
          if (field === "flute") return { ...item, flute: value }
          return item
        }),
      }
    })

    setOrders(nextOrders)
  }

  const goToOrder = (idx: number) => {
    setCurrentIdx(idx)
    setSelectedCell(null)
  }

  const emptyMessage =
    category === "case"
      ? "ケース受注の対象受注はありません"
      : "シート受注の対象受注はありません"

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-foreground">結果編集</h1>
          <Separator orientation="vertical" className="h-6" />
          {order ? (
            <>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{order.companyName}</span>
                <span>-</span>
                <span>{order.fileName}</span>
              </div>
              <StatusBadge status={order.status} />
            </>
          ) : (
            <span className="text-sm text-muted-foreground">{emptyMessage}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="bg-transparent text-foreground" onClick={() => setHistoryOpen(true)}>
            <History className="mr-2 h-4 w-4" />
            変更履歴
          </Button>
          <Button variant="outline" size="sm" className="bg-transparent text-foreground">
            <RotateCcw className="mr-2 h-4 w-4" />
            元に戻す
          </Button>
          <Button size="sm" disabled={!order}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            確認完了
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex w-[220px] shrink-0 flex-col border-r border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">対象受注</span>
          </div>
          <ScrollArea className="flex-1">
            <div className="flex flex-col gap-1 p-2">
              {docList.map((doc, idx) => (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => goToOrder(idx)}
                  className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors ${
                    idx === safeCurrentIdx
                      ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  }`}
                >
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded text-xs font-medium ${
                      idx === safeCurrentIdx ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div className="flex flex-col gap-0.5 truncate">
                    <span className="truncate text-xs font-medium">{doc.companyName}</span>
                    <span className="truncate text-[10px] text-muted-foreground">{doc.orderNumber || doc.fileName}</span>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
          <div className="flex items-center justify-between border-t border-border px-4 py-2 text-xs text-muted-foreground">
            <span>{`PAGE ${docList.length === 0 ? 0 : safeCurrentIdx + 1} OF ${docList.length}`}</span>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" disabled={safeCurrentIdx === 0 || docList.length === 0} onClick={() => goToOrder(safeCurrentIdx - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                disabled={docList.length === 0 || safeCurrentIdx === docList.length - 1}
                onClick={() => goToOrder(safeCurrentIdx + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex min-w-0 flex-1 flex-col border-r border-border">
            <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-2 text-xs font-semibold text-muted-foreground">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-[10px]">
                  原本
                </Badge>
                <span>{order ? order.orderNumber || order.fileName : "対象なし"}</span>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setZoom((z) => Math.max(25, z - 25))} disabled={zoom <= 25 || !order}>
                  <ZoomOut className="h-3.5 w-3.5" />
                </Button>
                <button
                  type="button"
                  onClick={() => setZoom(100)}
                  className="min-w-[48px] text-center text-xs font-medium text-foreground hover:underline"
                >
                  {zoom}%
                </button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setZoom((z) => Math.min(300, z + 25))} disabled={zoom >= 300 || !order}>
                  <ZoomIn className="h-3.5 w-3.5" />
                </Button>
                <Separator orientation="vertical" className="mx-1 h-4" />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => setRotation((prev) => (prev + 90) % 360)}
                  disabled={!order}
                >
                  <RotateCw className="h-3.5 w-3.5" />
                </Button>
                <span className="ml-1 min-w-[42px] text-center text-[10px] text-foreground">{rotation}°</span>
              </div>
            </div>
            <div className="flex-1 overflow-auto bg-muted/10 p-4">
              {order?.pages && order.pages.length > 0 ? (
                <div className="flex min-h-full flex-col items-center gap-6 py-4">
                  {order.pages.map((page) => (
                    <div key={page.pageNumber} className="flex items-center justify-center rounded-lg border border-border bg-white p-4 shadow-sm">
                      <div className="flex h-[960px] w-[720px] items-center justify-center overflow-hidden">
                        <img
                          src={page.imageUrl}
                          alt={`${order.fileName} - page ${page.pageNumber}`}
                          className="max-w-none"
                          crossOrigin="anonymous"
                          draggable={false}
                          style={{
                            transform: `rotate(${rotation}deg) scale(${zoom / 100})`,
                            transformOrigin: "center center",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-full items-center justify-center p-4">
                  <p className="text-sm text-muted-foreground">{emptyMessage}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex w-[560px] shrink-0 flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-2 text-xs font-semibold text-muted-foreground">
              <span>抽出結果テーブル</span>
              {editedItems.some((item) => item.width === 0 || item.length === 0) && (
                <span className="flex items-center gap-1 text-destructive">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  入力エラーあり
                </span>
              )}
            </div>
            <ScrollArea className="flex-1">
              <div className="p-3">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 z-10 bg-card">
                    <tr className="border-b border-border">
                      <th className="w-10 px-3 py-2 text-left font-semibold text-muted-foreground">確認</th>
                      <th className="w-10 px-3 py-2 text-left font-semibold text-muted-foreground" />
                      <th className="px-3 py-2 text-left font-semibold text-muted-foreground">材質</th>
                      <th className="px-3 py-2 text-right font-semibold text-muted-foreground">幅</th>
                      <th className="px-3 py-2 text-right font-semibold text-muted-foreground">長さ</th>
                      <th className="px-3 py-2 text-right font-semibold text-muted-foreground">数量</th>
                      <th className="px-3 py-2 text-left font-semibold text-muted-foreground">フルート</th>
                    </tr>
                  </thead>
                  <tbody>
                    {editedItems.map((item, idx) => (
                      <tr
                        key={item.id}
                        className={`border-b border-border transition-colors last:border-0 ${
                          selectedCell?.row === idx ? "bg-primary/5" : "hover:bg-muted/30"
                        }`}
                      >
                        <td className="px-3 py-2">
                          <input type="checkbox" className="h-4 w-4 rounded border-border" />
                        </td>
                        <td className="px-3 py-2">
                          <div className={`h-3.5 w-3.5 rounded-full ${COLOR_MAP[item.colorIndicator]}`} />
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            className="h-7 w-24 text-center text-sm font-medium"
                            value={item.material}
                            onChange={(e) => handleCellEdit(idx, "material", e.target.value)}
                            onClick={() => setSelectedCell({ row: idx, col: "material" })}
                          />
                        </td>
                        <td className="px-3 py-2 text-right">
                          <Input
                            className="ml-auto h-7 w-24 text-right text-sm font-bold"
                            value={item.width}
                            onChange={(e) => handleCellEdit(idx, "width", e.target.value)}
                            onClick={() => setSelectedCell({ row: idx, col: "width" })}
                          />
                        </td>
                        <td className="px-3 py-2 text-right">
                          <Input
                            className="ml-auto h-7 w-24 text-right text-sm font-bold"
                            value={item.length}
                            onChange={(e) => handleCellEdit(idx, "length", e.target.value)}
                            onClick={() => setSelectedCell({ row: idx, col: "length" })}
                          />
                        </td>
                        <td className="px-3 py-2 text-right">
                          <Input
                            className="ml-auto h-7 w-20 text-right text-sm"
                            value={item.quantity}
                            onChange={(e) => handleCellEdit(idx, "quantity", e.target.value)}
                            onClick={() => setSelectedCell({ row: idx, col: "quantity" })}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            className="h-7 w-16 text-center text-sm"
                            value={item.flute}
                            onChange={(e) => handleCellEdit(idx, "flute", e.target.value)}
                            onClick={() => setSelectedCell({ row: idx, col: "flute" })}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">変更履歴</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            {changeLogs.map((log, idx) => (
              <div key={idx} className="flex flex-col gap-1 rounded-lg border border-border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{log.field}</span>
                  <span className="text-xs text-muted-foreground">{log.editedAt}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="line-through text-muted-foreground">{log.oldValue}</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <span className="font-medium text-foreground">{log.newValue}</span>
                </div>
                <span className="text-xs text-muted-foreground">編集者: {log.editedBy}</span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
