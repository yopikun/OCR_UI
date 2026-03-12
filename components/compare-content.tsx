"use client"

import { useEffect, useState } from "react"
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  History,
  Upload,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
} from "lucide-react"

import { useCompanyFilter } from "@/components/app-shell"
import { StatusBadge } from "@/components/status-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { loadStoredOrders } from "@/lib/order-storage"
import { MOCK_ORDERS, type OrderDocument } from "@/lib/store"

interface ChangeLog {
  field: string
  oldValue: string
  newValue: string
  editedBy: string
  editedAt: string
}

interface CellHighlightRect {
  left: number
  top: number
  width: number
  height: number
}

type EditableCellKey = "material" | "width" | "length" | "quantity" | "flute"

function isLowConfidenceCell(orderId: string | undefined, row: number, col: string) {
  if (orderId === "ord-001") {
    return (
      (row === 1 && col === "width") ||
      (row === 1 && col === "length") ||
      (row === 2 && col === "material") ||
      (row === 3 && col === "quantity")
    )
  }

  return row === 0 && (col === "material" || col === "width")
}

function getCellHighlightRect(orderId: string | undefined, row: number, col: string): CellHighlightRect | null {
  if (orderId === "ord-001") {
    const top = 27 + row * 4
    const columnRects: Record<EditableCellKey, CellHighlightRect> = {
      material: { left: 39, top, width: 13, height: 4 },
      width: { left: 58, top, width: 8, height: 4 },
      length: { left: 66.5, top, width: 8, height: 4 },
      quantity: { left: 76, top, width: 6, height: 4 },
      flute: { left: 52.5, top, width: 4.5, height: 4 },
    }

    return columnRects[col as EditableCellKey] ?? null
  }

  const fallbackTop = 33 + row * 6
  const fallbackRects: Record<EditableCellKey, CellHighlightRect> = {
    material: { left: 24, top: fallbackTop, width: 20, height: 5 },
    width: { left: 50, top: fallbackTop, width: 10, height: 5 },
    length: { left: 61, top: fallbackTop, width: 10, height: 5 },
    quantity: { left: 73, top: fallbackTop, width: 8, height: 5 },
    flute: { left: 44, top: fallbackTop, width: 5, height: 5 },
  }

  return fallbackRects[col as EditableCellKey] ?? null
}

function getRowHighlightRect(orderId: string | undefined, row: number): CellHighlightRect | null {
  if (orderId === "ord-001") {
    const top = 27 + row * 4
    return { left: 20, top, width: 62, height: 4 }
  }

  const fallbackTop = 33 + row * 6
  return { left: 24, top: fallbackTop, width: 57, height: 5 }
}

function getSelectedCellClass(isSelected: boolean, isLowConfidence: boolean, baseClassName: string) {
  if (isSelected && isLowConfidence) {
    return `${baseClassName} border-red-600 bg-red-100 ring-2 ring-red-300 focus-visible:ring-red-500`
  }

  if (isSelected) {
    return `${baseClassName} border-primary bg-primary/5 ring-2 ring-primary/20 focus-visible:ring-primary`
  }

  if (isLowConfidence) {
    return `${baseClassName} border-red-500 bg-red-50/50 focus-visible:ring-red-500`
  }

  return baseClassName
}

function getConfidenceInputClass(colorIndicator: string, baseClassName: string) {
  const isLowConfidence = colorIndicator === "red" || colorIndicator === "orange"
  if (!isLowConfidence) return baseClassName
  return `${baseClassName} border-red-500 bg-red-50/50 focus-visible:ring-red-500`
}

export function CompareContent() {
  const defaultZoom = 125
  const { selectedCompanyId, category } = useCompanyFilter()
  const [orders, setOrders] = useState<OrderDocument[]>(MOCK_ORDERS)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: string } | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [zoom, setZoom] = useState(defaultZoom)
  const [rotation, setRotation] = useState(270)
  const [changeLogs] = useState<ChangeLog[]>([
    { field: "幅", oldValue: "1000", newValue: "1100", editedBy: "オペレーターA", editedAt: "2026-01-06 14:30" },
    { field: "長さ", oldValue: "1050", newValue: "1057", editedBy: "オペレーターA", editedAt: "2026-01-06 14:32" },
  ])

  const filteredStoredOrders = orders.filter((order) => {
    if (order.status !== "pending") return false
    if (order.category !== category) return false
    if (selectedCompanyId && order.companyId !== selectedCompanyId) return false
    return true
  })

  const fallbackOrders = MOCK_ORDERS.filter((order) => {
    if (order.status !== "pending") return false
    if (order.category !== category) return false
    if (selectedCompanyId && order.companyId !== selectedCompanyId) return false
    return true
  })

  const docList = filteredStoredOrders.length > 0 ? filteredStoredOrders : fallbackOrders
  const safeCurrentIdx = currentIdx < docList.length ? currentIdx : 0
  const order = docList[safeCurrentIdx] ?? null
  const editedItems = order?.items ?? []
  const selectedHighlightRect =
    selectedCell && isLowConfidenceCell(order?.id, selectedCell.row, selectedCell.col)
      ? getCellHighlightRect(order?.id, selectedCell.row, selectedCell.col)
      : null
  const selectedRowHighlightRect =
    selectedCell && isLowConfidenceCell(order?.id, selectedCell.row, selectedCell.col)
      ? getRowHighlightRect(order?.id, selectedCell.row)
      : null

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

          const numericValue = Number(value)
          if (field === "width") return { ...item, width: Number.isNaN(numericValue) ? item.width : numericValue }
          if (field === "length") return { ...item, length: Number.isNaN(numericValue) ? item.length : numericValue }
          if (field === "quantity") return { ...item, quantity: Number.isNaN(numericValue) ? item.quantity : numericValue }
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
    category === "case" ? "ケース受注の対象受注はまだありません" : "シート受注の対象受注はまだありません"

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
          <Button
            size="sm"
            disabled={!order}
            className="bg-emerald-600 text-white hover:bg-emerald-700"
          >
            <Upload className="mr-2 h-4 w-4" />
            EDI出力
          </Button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
        <div className="border-b border-border bg-card">
          <div className="flex items-center gap-2 px-4 py-3">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">対象受注</span>
            <span className="ml-auto text-xs text-muted-foreground">
              {`PAGE ${docList.length === 0 ? 0 : safeCurrentIdx + 1} OF ${docList.length}`}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                disabled={safeCurrentIdx === 0 || docList.length === 0}
                onClick={() => goToOrder(safeCurrentIdx - 1)}
              >
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

          <ScrollArea className="w-full border-t border-border">
            <div className="flex min-w-max gap-2 p-3">
              {docList.map((doc, idx) => (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => goToOrder(idx)}
                  className={`flex min-w-[220px] items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
                    idx === safeCurrentIdx
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border bg-background text-foreground hover:bg-muted/50"
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded text-xs font-medium ${
                      idx === safeCurrentIdx ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-xs font-medium">{doc.companyName}</div>
                    <div className="truncate text-[10px] text-muted-foreground">{doc.orderNumber || doc.fileName}</div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <ResizablePanelGroup direction="horizontal" className="flex-1">
            <ResizablePanel defaultSize={62} minSize={30}>
              <div className="flex h-full min-w-0 flex-col border-r border-border">
                <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-2 text-xs font-semibold text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px]">
                    原本
                  </Badge>
                  <span>{order ? order.orderNumber || order.fileName : "対象受注なし"}</span>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => setZoom((value) => Math.max(25, value - 25))}
                    disabled={zoom <= 25 || !order}
                  >
                    <ZoomOut className="h-3.5 w-3.5" />
                  </Button>
                  <button type="button" onClick={() => setZoom(defaultZoom)} className="min-w-[48px] text-center text-xs font-medium text-foreground hover:underline">
                    {zoom}%
                  </button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => setZoom((value) => Math.min(300, value + 25))}
                    disabled={zoom >= 300 || !order}
                  >
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
                        <div className="relative flex h-[960px] w-[720px] items-center justify-center overflow-hidden">
                          <div
                            className="relative h-[960px] w-[720px] shrink-0"
                            style={{
                              transform: `rotate(${rotation}deg) scale(${zoom / 100})`,
                              transformOrigin: "center center",
                            }}
                          >
                            <img
                              src={page.imageUrl}
                              alt={`${order.fileName} - page ${page.pageNumber}`}
                              className="h-full w-full object-contain"
                              crossOrigin="anonymous"
                              draggable={false}
                            />
                          </div>

                          {page.pageNumber === 1 && selectedCell && selectedHighlightRect && (
                            <div
                              className="pointer-events-none absolute inset-0"
                              style={{
                                transform: `scale(${zoom / 100})`,
                                transformOrigin: "center center",
                              }}
                            >
                              {selectedRowHighlightRect && (
                                <div
                                  className="absolute rounded-md border border-red-400 bg-red-500/10"
                                  style={{
                                    left: `${selectedRowHighlightRect.left}%`,
                                    top: `${selectedRowHighlightRect.top}%`,
                                    width: `${selectedRowHighlightRect.width}%`,
                                    height: `${selectedRowHighlightRect.height}%`,
                                  }}
                                />
                              )}
                              <div
                                className="absolute rounded-md border-[3px] border-red-500 bg-red-500/15 shadow-[0_0_0_3px_rgba(239,68,68,0.15)]"
                                style={{
                                  left: `${selectedHighlightRect.left}%`,
                                  top: `${selectedHighlightRect.top}%`,
                                  width: `${selectedHighlightRect.width}%`,
                                  height: `${selectedHighlightRect.height}%`,
                                }}
                              />
                            </div>
                          )}
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
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel defaultSize={38} minSize={24}>
              <div className="flex h-full min-w-0 flex-col overflow-hidden">
                <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-2 text-xs font-semibold text-muted-foreground">
                  <span>EDIテーブル</span>
                  {editedItems.some((item) => item.width === 0 || item.length === 0) && (
                    <span className="flex items-center gap-1 text-destructive">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      入力エラーあり
                    </span>
                  )}
                </div>

                <div className="min-h-0 flex-1 overflow-auto">
                  <div className="min-h-full min-w-max p-3">
                    <table className="w-max min-w-[720px] text-sm">
                    <thead className="sticky top-0 z-10 bg-card">
                      <tr className="border-b border-border">
                        <th className="px-3 py-2 text-left font-semibold text-muted-foreground">材質</th>
                        <th className="px-3 py-2 text-right font-semibold text-muted-foreground">幅</th>
                        <th className="px-3 py-2 text-right font-semibold text-muted-foreground">長さ</th>
                        <th className="px-3 py-2 text-right font-semibold text-muted-foreground">数量</th>
                        <th className="px-3 py-2 text-left font-semibold text-muted-foreground">フルート</th>
                      </tr>
                    </thead>
                    <tbody>
                      {editedItems.map((item, idx) => {
                        const isSelectedRow = selectedCell?.row === idx
                        const isLowConfidenceRowSelected =
                          isSelectedRow && selectedCell ? isLowConfidenceCell(order?.id, idx, selectedCell.col) : false

                        return (
                          <tr
                            key={item.id}
                            className={`border-b border-border transition-colors last:border-0 ${
                              isLowConfidenceRowSelected
                                ? "bg-red-50/80"
                                : isSelectedRow
                                  ? "bg-primary/5"
                                  : "hover:bg-muted/30"
                            }`}
                          >
                            <td className="px-3 py-2">
                              <Input
                                className={getSelectedCellClass(
                                  selectedCell?.row === idx && selectedCell?.col === "material",
                                  isLowConfidenceCell(order?.id, idx, "material"),
                                  getConfidenceInputClass(item.colorIndicator, "h-7 w-24 text-center text-sm font-medium"),
                                )}
                                value={item.material}
                                onChange={(e) => handleCellEdit(idx, "material", e.target.value)}
                                onClick={() => setSelectedCell({ row: idx, col: "material" })}
                              />
                            </td>
                            <td className="px-3 py-2 text-right">
                              <Input
                                className={getSelectedCellClass(
                                  selectedCell?.row === idx && selectedCell?.col === "width",
                                  isLowConfidenceCell(order?.id, idx, "width"),
                                  getConfidenceInputClass(item.colorIndicator, "ml-auto h-7 w-24 text-right text-sm font-bold"),
                                )}
                                value={item.width}
                                onChange={(e) => handleCellEdit(idx, "width", e.target.value)}
                                onClick={() => setSelectedCell({ row: idx, col: "width" })}
                              />
                            </td>
                            <td className="px-3 py-2 text-right">
                              <Input
                                className={getSelectedCellClass(
                                  selectedCell?.row === idx && selectedCell?.col === "length",
                                  isLowConfidenceCell(order?.id, idx, "length"),
                                  getConfidenceInputClass(item.colorIndicator, "ml-auto h-7 w-24 text-right text-sm font-bold"),
                                )}
                                value={item.length}
                                onChange={(e) => handleCellEdit(idx, "length", e.target.value)}
                                onClick={() => setSelectedCell({ row: idx, col: "length" })}
                              />
                            </td>
                            <td className="px-3 py-2 text-right">
                              <Input
                                className={getSelectedCellClass(
                                  selectedCell?.row === idx && selectedCell?.col === "quantity",
                                  isLowConfidenceCell(order?.id, idx, "quantity"),
                                  getConfidenceInputClass(item.colorIndicator, "ml-auto h-7 w-20 text-right text-sm"),
                                )}
                                value={item.quantity}
                                onChange={(e) => handleCellEdit(idx, "quantity", e.target.value)}
                                onClick={() => setSelectedCell({ row: idx, col: "quantity" })}
                              />
                            </td>
                            <td className="px-3 py-2">
                              <Input
                                className={getSelectedCellClass(
                                  selectedCell?.row === idx && selectedCell?.col === "flute",
                                  isLowConfidenceCell(order?.id, idx, "flute"),
                                  getConfidenceInputClass(item.colorIndicator, "h-7 w-16 text-center text-sm"),
                                )}
                                value={item.flute}
                                onChange={(e) => handleCellEdit(idx, "flute", e.target.value)}
                                onClick={() => setSelectedCell({ row: idx, col: "flute" })}
                              />
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
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
                  <span className="text-muted-foreground line-through">{log.oldValue}</span>
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
