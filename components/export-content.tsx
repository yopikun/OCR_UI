"use client"

import { useMemo, useState } from "react"
import {
  Download,
  Eye,
  CheckCircle2,
  FolderOpen,
  FileOutput,
  ChevronRight,
  ArrowLeft,
  FileText,
  Calendar,
  User,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MOCK_COMPANIES, MOCK_ORDERS } from "@/lib/store"

interface EdiFile {
  id: string
  fileName: string
  orderId: string
  originalFileName: string
  exportedAt: string
  operator: string
  itemCount: number
  order: (typeof MOCK_ORDERS)[0]
}

interface CompanyFolder {
  companyId: string
  companyName: string
  files: EdiFile[]
}

function buildFolders(): CompanyFolder[] {
  const exportable = MOCK_ORDERS.filter((o) => o.status === "confirmed" || o.status === "exported")
  const grouped: Record<string, typeof exportable> = {}

  for (const order of exportable) {
    if (!grouped[order.companyId]) grouped[order.companyId] = []
    grouped[order.companyId].push(order)
  }

  return Object.entries(grouped).map(([companyId, orders]) => {
    const company = MOCK_COMPANIES.find((c) => c.id === companyId)

    return {
      companyId,
      companyName: company?.name || "未設定会社",
      files: orders.map((order) => {
        const dateStr = order.receivedAt.split(" ")[0].replaceAll("-", "")
        return {
          id: order.id,
          fileName: `EDI_${companyId}_${dateStr}.edi`,
          orderId: order.id,
          originalFileName: order.fileName,
          exportedAt: order.receivedAt,
          operator: order.assignedTo || "自動割当",
          itemCount: order.items.length,
          order,
        }
      }),
    }
  })
}

const colorMap: Record<string, string> = {
  red: "bg-[hsl(0,72%,51%)]",
  orange: "bg-[hsl(38,92%,50%)]",
  green: "bg-[hsl(152,60%,42%)]",
  blue: "bg-[hsl(217,91%,50%)]",
}

export function ExportContent() {
  const folders = useMemo(() => buildFolders(), [])
  const [selectedFolder, setSelectedFolder] = useState<CompanyFolder | null>(null)
  const [previewFile, setPreviewFile] = useState<EdiFile | null>(null)
  const [exportDone, setExportDone] = useState(false)

  const totalFiles = folders.reduce((sum, folder) => sum + folder.files.length, 0)

  const showDoneBanner = () => {
    setExportDone(true)
    window.setTimeout(() => setExportDone(false), 3000)
  }

  const handleExportAll = () => {
    showDoneBanner()
  }

  const handleDownloadFile = () => {
    showDoneBanner()
  }

  return (
    <div className="flex flex-col gap-6 overflow-auto p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {selectedFolder && (
            <Button variant="ghost" size="sm" className="mr-1" onClick={() => setSelectedFolder(null)}>
              <ArrowLeft className="mr-1 h-4 w-4" />
              戻る
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-foreground text-balance">
              {selectedFolder ? selectedFolder.companyName : "EDI出力"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {selectedFolder
                ? `${selectedFolder.files.length} 件のEDI出力対象`
                : `会社別の出力フォルダ一覧です。 ${folders.length} 社 / ${totalFiles} ファイル`}
            </p>
          </div>
        </div>
        {!selectedFolder && (
          <Button onClick={handleExportAll}>
            <Download className="mr-2 h-4 w-4" />
            一括EDI出力
          </Button>
        )}
      </div>

      {exportDone && (
        <div className="flex items-center gap-3 rounded-lg border border-success/20 bg-success/10 px-4 py-3">
          <CheckCircle2 className="h-5 w-5 text-success" />
          <span className="text-sm font-medium text-foreground">EDI出力処理が完了しました。</span>
        </div>
      )}

      {!selectedFolder ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {folders.map((folder) => (
            <Card
              key={folder.companyId}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => setSelectedFolder(folder)}
            >
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <FolderOpen className="h-6 w-6 text-primary" />
                </div>
                <div className="flex flex-1 flex-col gap-1 overflow-hidden">
                  <span className="truncate text-sm font-semibold text-foreground">{folder.companyName}</span>
                  <span className="text-xs text-muted-foreground">{folder.files.length} 件のEDIファイル</span>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}

          {folders.length === 0 && (
            <div className="col-span-full flex flex-col items-center gap-3 py-16 text-muted-foreground">
              <FolderOpen className="h-12 w-12" />
              <p className="text-sm">出力対象データがありません</p>
            </div>
          )}
        </div>
      ) : (
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="flex items-center justify-between text-sm font-semibold text-foreground">
              <span className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-primary" />
                {selectedFolder.companyName}
              </span>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {selectedFolder.files.length} 件
                </Badge>
                <Button size="sm" onClick={handleExportAll}>
                  <Download className="mr-2 h-3.5 w-3.5" />
                  フォルダ一括DL
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-3">
            <div className="flex flex-col divide-y divide-border">
              {selectedFolder.files.map((file) => (
                <div key={file.id} className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-muted/30">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <FileOutput className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex flex-1 flex-col gap-1 overflow-hidden">
                    <span className="truncate font-mono text-sm font-medium text-foreground">{file.fileName}</span>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        元ファイル: {file.originalFileName}
                      </span>
                      <Separator orientation="vertical" className="h-3" />
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {file.exportedAt}
                      </span>
                      <Separator orientation="vertical" className="h-3" />
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {file.operator}
                      </span>
                      <Separator orientation="vertical" className="h-3" />
                      <span>{file.itemCount} 行</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button variant="outline" size="sm" className="bg-transparent text-foreground" onClick={() => setPreviewFile(file)}>
                      <Eye className="mr-1.5 h-3.5 w-3.5" />
                      プレビュー
                    </Button>
                    <Button size="sm" onClick={handleDownloadFile}>
                      <Download className="mr-1.5 h-3.5 w-3.5" />
                      DL
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!previewFile} onOpenChange={(open) => !open && setPreviewFile(null)}>
        <DialogContent className="max-h-[85vh] sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <FileOutput className="h-4 w-4 text-primary" />
              <span className="font-mono text-sm">{previewFile?.fileName}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="rounded-lg border border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
              結果編集画面の抽出結果テーブルを基準に、EDI出力対象データを確認できます。
            </div>

            <ScrollArea className="max-h-[56vh] rounded-lg border border-border">
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
                    {previewFile?.order.items.map((item) => (
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
            <Button variant="outline" className="bg-transparent text-foreground" onClick={() => setPreviewFile(null)}>
              閉じる
            </Button>
            <Button
              onClick={() => {
                handleDownloadFile()
                setPreviewFile(null)
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
