"use client"

import { useMemo, useState } from "react"
import {
  Calendar,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  FileOutput,
  Grid2x2,
  List,
  Search,
  SlidersHorizontal,
  User,
  X,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MOCK_COMPANIES, MOCK_HISTORY, MOCK_ORDERS } from "@/lib/store"

interface EdiFile {
  id: string
  fileName: string
  orderId: string
  originalFileName: string
  exportedAt: string
  operator: string
  itemCount: number
  companyId: string
  companyName: string
  order: (typeof MOCK_ORDERS)[0]
}

type DisplayMode = "grid" | "list"
type ExportTab = "folders" | "history"
type FilterType = "all" | "company" | "file" | "item" | "operator"
type ExportStatusFilter = "all" | "success" | "error"

function buildEdiFiles(): EdiFile[] {
  const exportable = MOCK_ORDERS.filter((order) => order.status === "confirmed" || order.status === "exported")
  const sampleOrder = exportable[0] ?? MOCK_ORDERS[0]

  return MOCK_COMPANIES.flatMap((company, index) => {
    const matched = exportable.filter((order) => order.companyId === company.id)

    if (matched.length > 0) {
      return matched.map((order) => {
        const dateStr = order.receivedAt.split(" ")[0].replaceAll("-", "")

        return {
          id: order.id,
          fileName: `EDI_${company.id}_${dateStr}.edi`,
          orderId: order.id,
          originalFileName: order.fileName,
          exportedAt: order.receivedAt,
          operator: order.assignedTo || "自動処理",
          itemCount: order.items.length,
          companyId: company.id,
          companyName: company.name,
          order,
        }
      })
    }

    return [
      {
        id: `dummy-file-${company.id}`,
        fileName: `EDI_${company.id}_20260312.edi`,
        orderId: `dummy-order-${company.id}`,
        originalFileName: `sample_${String(index + 1).padStart(3, "0")}.pdf`,
        exportedAt: "2026-03-12 10:00",
        operator: "自動処理",
        itemCount: sampleOrder.items.length,
        companyId: company.id,
        companyName: company.name,
        order: {
          ...sampleOrder,
          id: `dummy-order-${company.id}`,
          companyId: company.id,
          companyName: company.name,
          fileName: `sample_${String(index + 1).padStart(3, "0")}.pdf`,
        },
      },
    ]
  })
}

const colorMap: Record<string, string> = {
  red: "bg-[hsl(0,72%,51%)]",
  orange: "bg-[hsl(38,92%,50%)]",
  green: "bg-[hsl(152,60%,42%)]",
  blue: "bg-[hsl(217,91%,50%)]",
}

function normalize(text: string) {
  return text.toLowerCase()
}

export function ExportContent() {
  const files = useMemo(() => buildEdiFiles(), [])
  const [searchQuery, setSearchQuery] = useState("")
  const [tab, setTab] = useState<ExportTab>("folders")
  const [displayMode, setDisplayMode] = useState<DisplayMode>("grid")
  const [companyFilterQuery, setCompanyFilterQuery] = useState("")
  const [selectedFile, setSelectedFile] = useState<EdiFile | null>(null)
  const [exportDone, setExportDone] = useState(false)
  const [showSearchOptions, setShowSearchOptions] = useState(false)
  const [filterType, setFilterType] = useState<FilterType>("all")
  const [itemNameQuery, setItemNameQuery] = useState("")
  const [operatorQuery, setOperatorQuery] = useState("")
  const [sourceFileQuery, setSourceFileQuery] = useState("")
  const [historyStatus, setHistoryStatus] = useState<ExportStatusFilter>("all")

  const operatorOptions = useMemo(
    () => Array.from(new Set([...files.map((file) => file.operator), ...MOCK_HISTORY.map((entry) => entry.operator)])).filter(Boolean),
    [files],
  )

  const itemNameOptions = useMemo(
    () =>
      Array.from(
        new Set(
          files.flatMap((file) =>
            file.order.items.map((item) => item.productName).filter((value): value is string => Boolean(value)),
          ),
        ),
      )
        .filter(Boolean)
        .slice(0, 20),
    [files],
  )

  const sourceFileOptions = useMemo(
    () => Array.from(new Set(files.map((file) => file.originalFileName))).slice(0, 20),
    [files],
  )

  const companyNameOptions = useMemo(() => MOCK_COMPANIES.map((company) => company.name), [])

  const filteredFiles = useMemo(() => {
    const normalizedQuery = normalize(searchQuery)
    const normalizedItem = normalize(itemNameQuery)
    const normalizedOperator = normalize(operatorQuery)
    const normalizedSource = normalize(sourceFileQuery)
    const normalizedCompanyFilter = normalize(companyFilterQuery)

    return files.filter((file) => {
      if (normalizedCompanyFilter && !normalize(file.companyName).includes(normalizedCompanyFilter)) return false

      if (normalizedQuery) {
        const matchByType =
          filterType === "all"
            ? [
                file.fileName,
                file.companyName,
                file.originalFileName,
                ...file.order.items.map((item) => item.productName || ""),
                file.operator,
              ]
            : filterType === "company"
              ? [file.companyName]
              : filterType === "file"
                ? [file.fileName, file.originalFileName]
                : filterType === "item"
                  ? file.order.items.map((item) => item.productName || "")
                  : [file.operator]

        if (!matchByType.some((value) => normalize(value).includes(normalizedQuery))) return false
      }

      if (normalizedItem && !file.order.items.some((item) => normalize(item.productName || "").includes(normalizedItem))) {
        return false
      }

      if (normalizedOperator && !normalize(file.operator).includes(normalizedOperator)) return false
      if (normalizedSource && !normalize(file.originalFileName).includes(normalizedSource)) return false

      return true
    })
  }, [companyFilterQuery, files, filterType, itemNameQuery, operatorQuery, searchQuery, sourceFileQuery])

  const groupedFolders = useMemo(
    () =>
      MOCK_COMPANIES.map((company) => ({
        companyId: company.id,
        companyName: company.name,
        files: filteredFiles.filter((file) => file.companyId === company.id),
      })),
    [filteredFiles],
  )

  const visibleFolders = groupedFolders.filter((folder) => folder.files.length > 0)

  const filteredHistory = useMemo(() => {
    const normalizedQuery = normalize(searchQuery)
    const normalizedOperator = normalize(operatorQuery)
    const normalizedCompanyFilter = normalize(companyFilterQuery)

    return MOCK_HISTORY.filter((entry) => {
      if (normalizedCompanyFilter && !normalize(entry.companyName).includes(normalizedCompanyFilter)) return false
      if (historyStatus !== "all" && entry.status !== historyStatus) return false
      if (normalizedOperator && !normalize(entry.operator).includes(normalizedOperator)) return false

      if (normalizedQuery) {
        const matchByType =
          filterType === "all"
            ? [entry.companyName, entry.fileName, entry.operator, entry.exportFormat]
            : filterType === "company"
              ? [entry.companyName]
              : filterType === "file"
                ? [entry.fileName]
                : filterType === "operator"
                  ? [entry.operator]
                  : [entry.fileName]

        if (!matchByType.some((value) => normalize(value).includes(normalizedQuery))) return false
      }

      return true
    })
  }, [companyFilterQuery, filterType, historyStatus, operatorQuery, searchQuery])

  const activeOptionCount = [
    filterType !== "all",
    itemNameQuery.length > 0,
    operatorQuery.length > 0,
    sourceFileQuery.length > 0,
    historyStatus !== "all",
    companyFilterQuery.length > 0,
  ].filter(Boolean).length

  const clearAdvancedFilters = () => {
    setFilterType("all")
    setItemNameQuery("")
    setOperatorQuery("")
    setSourceFileQuery("")
    setHistoryStatus("all")
    setCompanyFilterQuery("")
  }

  const showDoneBanner = () => {
    setExportDone(true)
    window.setTimeout(() => setExportDone(false), 3000)
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#f8fafc]">
      <div className="border-b border-border bg-card/95 px-6 pb-4 pt-5 backdrop-blur">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">出力履歴</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              会社別ファイルと時間順履歴を同じ画面で検索、確認、出力できます。
            </p>
          </div>
          <Button onClick={showDoneBanner}>
            <Download className="mr-2 h-4 w-4" />
            一括EDI出力
          </Button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[320px] flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="会社名、EDIファイル名、元データ名、アイテム名、作業者で検索"
              className="h-11 rounded-full border-border bg-background pl-11 pr-4"
            />
          </div>

          <Button
            variant={showSearchOptions ? "secondary" : "outline"}
            className="rounded-full bg-transparent text-foreground"
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

          <div className="flex items-center gap-2">
            <Button
              variant={displayMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="rounded-full"
              onClick={() => setDisplayMode("grid")}
            >
              <Grid2x2 className="h-4 w-4" />
            </Button>
            <Button
              variant={displayMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="rounded-full"
              onClick={() => setDisplayMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {showSearchOptions && (
          <div className="mt-4 rounded-3xl border border-border bg-muted/20 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-foreground">検索オプション</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  会社、アイテム名、作業者、元データ名、履歴ステータスで絞り込みます。
                </p>
              </div>
              <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={clearAdvancedFilters}>
                <X className="mr-2 h-4 w-4" />
                条件をクリア
              </Button>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <label className="grid gap-2 text-sm">
                <span className="font-medium text-foreground">会社フィルター</span>
                <Input
                  list="company-filter-options"
                  value={companyFilterQuery}
                  onChange={(e) => setCompanyFilterQuery(e.target.value)}
                  placeholder="会社名を入力して絞り込み"
                  className="h-10 rounded-xl"
                />
                <datalist id="company-filter-options">
                  {companyNameOptions.map((companyName) => (
                    <option key={companyName} value={companyName} />
                  ))}
                </datalist>
              </label>

              <label className="grid gap-2 text-sm">
                <span className="font-medium text-foreground">アイテム名</span>
                <Input
                  list="edi-item-options"
                  value={itemNameQuery}
                  onChange={(e) => setItemNameQuery(e.target.value)}
                  placeholder={itemNameOptions[0] || "品名で絞り込み"}
                  className="h-10 rounded-xl"
                />
                <datalist id="edi-item-options">
                  {itemNameOptions.map((itemName) => (
                    <option key={itemName} value={itemName} />
                  ))}
                </datalist>
              </label>

              <label className="grid gap-2 text-sm">
                <span className="font-medium text-foreground">作業者</span>
                <Input
                  list="edi-operator-options"
                  value={operatorQuery}
                  onChange={(e) => setOperatorQuery(e.target.value)}
                  placeholder={operatorOptions[0] || "作業者で絞り込み"}
                  className="h-10 rounded-xl"
                />
                <datalist id="edi-operator-options">
                  {operatorOptions.map((operator) => (
                    <option key={operator} value={operator} />
                  ))}
                </datalist>
              </label>

              <label className="grid gap-2 text-sm">
                <span className="font-medium text-foreground">元データ名</span>
                <Input
                  list="edi-source-options"
                  value={sourceFileQuery}
                  onChange={(e) => setSourceFileQuery(e.target.value)}
                  placeholder={sourceFileOptions[0] || "元ファイル名で絞り込み"}
                  className="h-10 rounded-xl"
                />
                <datalist id="edi-source-options">
                  {sourceFileOptions.map((sourceFile) => (
                    <option key={sourceFile} value={sourceFile} />
                  ))}
                </datalist>
              </label>

              <label className="grid gap-2 text-sm">
                <span className="font-medium text-foreground">履歴ステータス</span>
                <select
                  value={historyStatus}
                  onChange={(e) => setHistoryStatus(e.target.value as ExportStatusFilter)}
                  className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground"
                >
                  <option value="all">すべて</option>
                  <option value="success">成功のみ</option>
                  <option value="error">エラーのみ</option>
                </select>
              </label>
            </div>
          </div>
        )}
      </div>

      {exportDone && (
        <div className="mx-6 mt-4 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <span className="text-sm font-medium text-foreground">EDI出力を実行しました。</span>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden px-6 pb-6 pt-4">
        <div className="flex w-full min-w-0 flex-col overflow-hidden rounded-[28px] border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <Tabs value={tab} onValueChange={(value) => setTab(value as ExportTab)}>
              <TabsList className="grid h-10 w-[320px] grid-cols-2 rounded-full bg-muted/60">
                <TabsTrigger value="folders" className="rounded-full">
                  会社別ファイル
                </TabsTrigger>
                <TabsTrigger value="history" className="rounded-full">
                  時間順履歴
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{visibleFolders.length}社</span>
              <Separator orientation="vertical" className="h-4" />
              <span>{tab === "folders" ? filteredFiles.length : filteredHistory.length}件</span>
            </div>
          </div>

          <ScrollArea className="flex-1">
            {tab === "folders" ? (
              displayMode === "grid" ? (
                <div className="grid grid-cols-2 gap-3 p-4 md:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6">
                  {visibleFolders.map((folder) => {
                    const latestFile = folder.files[0]

                    return (
                      <Card
                        key={folder.companyId}
                        className="overflow-hidden rounded-2xl border-border/80 bg-[#f8fafc] shadow-none transition-all hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <CardContent className="p-0">
                          <button
                            type="button"
                            className="flex w-full items-center justify-between gap-3 p-4 text-left"
                            onClick={() => setSelectedFile(latestFile)}
                          >
                            <div className="min-w-0">
                              <p className="line-clamp-2 text-[13px] font-semibold leading-5 text-foreground">
                                {folder.companyName}
                              </p>
                            </div>
                            <Badge variant="secondary" className="rounded-full px-2 py-0 text-[10px]">
                              {folder.files.length}
                            </Badge>
                          </button>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredFiles.map((file) => (
                    <button
                      key={file.id}
                      type="button"
                      className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/30"
                      onClick={() => setSelectedFile(file)}
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                        <FileOutput className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-medium text-foreground">{file.fileName}</span>
                          <Badge variant="outline" className="rounded-full">
                            {file.companyName}
                          </Badge>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span>{file.originalFileName}</span>
                          <span>{file.exportedAt}</span>
                          <span>{file.operator}</span>
                          <span>{file.itemCount}行</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        詳細
                      </Button>
                    </button>
                  ))}
                </div>
              )
            ) : (
              <div className="divide-y divide-border">
                {filteredHistory.map((entry) => (
                  <div key={entry.id} className="flex items-center gap-4 px-5 py-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-muted">
                      <Clock3 className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium text-foreground">{entry.fileName}</span>
                        <Badge variant={entry.status === "success" ? "secondary" : "destructive"} className="rounded-full">
                          {entry.status === "success" ? "成功" : "エラー"}
                        </Badge>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {entry.exportedAt}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          {entry.operator}
                        </span>
                        <span>{entry.companyName}</span>
                        <span>{entry.exportFormat}</span>
                      </div>
                    </div>
                    <Button variant="outline" className="bg-transparent text-foreground">
                      <Download className="mr-2 h-4 w-4" />
                      再出力
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>

      <Dialog open={!!selectedFile} onOpenChange={(open) => !open && setSelectedFile(null)}>
        <DialogContent className="max-h-[88vh] sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <FileOutput className="h-4 w-4 text-primary" />
              <span className="font-mono text-sm">{selectedFile?.fileName}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-3 rounded-2xl bg-muted/30 p-4 md:grid-cols-4">
              <div>
                <p className="text-xs text-muted-foreground">会社名</p>
                <p className="mt-1 text-sm font-medium text-foreground">{selectedFile?.companyName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">元ファイル</p>
                <p className="mt-1 truncate text-sm font-medium text-foreground">{selectedFile?.originalFileName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">出力日時</p>
                <p className="mt-1 text-sm font-medium text-foreground">{selectedFile?.exportedAt}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">作業者</p>
                <p className="mt-1 text-sm font-medium text-foreground">{selectedFile?.operator}</p>
              </div>
            </div>

            <ScrollArea className="max-h-[56vh] rounded-2xl border border-border">
              <div className="p-4">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 z-10 bg-card">
                    <tr className="border-b border-border">
                      <th className="w-10 px-3 py-2 text-left font-semibold text-muted-foreground">色</th>
                      <th className="px-3 py-2 text-left font-semibold text-muted-foreground">材質</th>
                      <th className="px-3 py-2 text-right font-semibold text-muted-foreground">幅</th>
                      <th className="px-3 py-2 text-right font-semibold text-muted-foreground">長さ</th>
                      <th className="px-3 py-2 text-right font-semibold text-muted-foreground">数量</th>
                      <th className="px-3 py-2 text-left font-semibold text-muted-foreground">フルート</th>
                      <th className="px-3 py-2 text-left font-semibold text-muted-foreground">ライナー</th>
                      <th className="px-3 py-2 text-left font-semibold text-muted-foreground">品名</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedFile?.order.items.map((item) => (
                      <tr key={item.id} className="border-b border-border last:border-0">
                        <td className="px-3 py-3">
                          <div className={`h-3.5 w-3.5 rounded-full ${colorMap[item.colorIndicator]}`} />
                        </td>
                        <td className="px-3 py-3 font-medium text-foreground">{item.material}</td>
                        <td className="px-3 py-3 text-right text-foreground">{item.width}</td>
                        <td className="px-3 py-3 text-right text-foreground">{item.length}</td>
                        <td className="px-3 py-3 text-right text-foreground">{item.quantity}</td>
                        <td className="px-3 py-3 text-foreground">{item.flute}</td>
                        <td className="px-3 py-3 text-foreground">{item.liner}</td>
                        <td className="px-3 py-3 text-muted-foreground">{item.productName || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ScrollArea>
          </div>

          <DialogFooter>
            <Button variant="outline" className="bg-transparent text-foreground" onClick={() => setSelectedFile(null)}>
              閉じる
            </Button>
            <Button
              onClick={() => {
                showDoneBanner()
                setSelectedFile(null)
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              EDI出力
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
