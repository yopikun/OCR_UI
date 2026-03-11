"use client"

import { useState } from "react"
import {
  Search,
  SlidersHorizontal,
  Download,
  Eye,
  FileText,
  CheckCircle2,
  XCircle,
  Calendar,
  User,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
} from "@/components/ui/dialog"
import { MOCK_HISTORY, MOCK_COMPANIES } from "@/lib/store"

export function HistoryContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCompany, setFilterCompany] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [auditLogOpen, setAuditLogOpen] = useState(false)

  const filteredHistory = MOCK_HISTORY.filter((h) => {
    if (filterCompany !== "all" && !h.companyName.includes(filterCompany)) return false
    if (filterStatus !== "all" && h.status !== filterStatus) return false
    if (searchQuery && !h.fileName.toLowerCase().includes(searchQuery.toLowerCase()) && !h.companyName.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  return (
    <div className="flex flex-col gap-6 overflow-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground text-balance">出力履歴</h1>
          <p className="mt-1 text-sm text-muted-foreground">会社別出力履歴の確認・再出力</p>
        </div>
        <Button variant="outline" className="bg-transparent text-foreground" onClick={() => setAuditLogOpen(true)}>
          <FileText className="mr-2 h-4 w-4" />
          監査ログ
        </Button>
      </div>

      {/* Filters */}
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
          <Select value={filterCompany} onValueChange={setFilterCompany}>
            <SelectTrigger className="w-[200px]">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              <SelectValue placeholder="会社" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべての会社</SelectItem>
              {MOCK_COMPANIES.map((c) => (
                <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="ステータス" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="success">成功</SelectItem>
              <SelectItem value="error">エラー</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* History Table */}
      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="flex items-center justify-between text-sm font-semibold text-foreground">
            <span>出力履歴一覧</span>
            <Badge variant="secondary" className="text-xs">{filteredHistory.length}件</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 pt-2">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="sticky top-0 bg-muted/30 px-4 py-3 text-left font-semibold text-muted-foreground">出力日時</th>
                  <th className="sticky top-0 bg-muted/30 px-4 py-3 text-left font-semibold text-muted-foreground">会社名</th>
                  <th className="sticky top-0 bg-muted/30 px-4 py-3 text-left font-semibold text-muted-foreground">ファイル名</th>
                  <th className="sticky top-0 bg-muted/30 px-4 py-3 text-left font-semibold text-muted-foreground">形式</th>
                  <th className="sticky top-0 bg-muted/30 px-4 py-3 text-left font-semibold text-muted-foreground">担当者</th>
                  <th className="sticky top-0 bg-muted/30 px-4 py-3 text-left font-semibold text-muted-foreground">結果</th>
                  <th className="sticky top-0 bg-muted/30 px-4 py-3 text-right font-semibold text-muted-foreground">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((entry) => (
                  <tr key={entry.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{entry.exportedAt}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{entry.companyName}</td>
                    <td className="px-4 py-3 text-foreground">{entry.fileName}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        {entry.exportFormat}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      <span className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        {entry.operator}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {entry.status === "success" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
                          <CheckCircle2 className="h-3 w-3" />
                          成功
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive">
                          <XCircle className="h-3 w-3" />
                          エラー
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" className="text-xs">
                          <Eye className="mr-1 h-3 w-3" />
                          表示
                        </Button>
                        <Button variant="ghost" size="sm" className="text-xs">
                          <Download className="mr-1 h-3 w-3" />
                          再出力
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Dialog */}
      <Dialog open={auditLogOpen} onOpenChange={setAuditLogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-foreground">監査ログ</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            {[
              { time: "2026-01-06 14:35", user: "田中 太郎", action: "EDI出力実行", target: "ORD-001" },
              { time: "2026-01-06 14:32", user: "田中 太郎", action: "セル編集 (流れ)", target: "ORD-001 行2" },
              { time: "2026-01-06 14:30", user: "田中 太郎", action: "セル編集 (巾)", target: "ORD-001 行1" },
              { time: "2026-01-06 13:30", user: "システム", action: "会社自動振分完了", target: "ORD-001" },
              { time: "2026-01-06 13:27", user: "システム", action: "受信データ取込", target: "注文書_20260106_フジダン.pdf" },
              { time: "2026-01-05 16:50", user: "鈴木 花子", action: "CSV出力実行", target: "ORD-010" },
              { time: "2026-01-05 09:20", user: "システム", action: "受信データ取込", target: "受注書_20260105_東京段ボール.txt" },
            ].map((log, idx) => (
              <div key={idx} className="flex items-center gap-4 rounded border border-border px-4 py-2.5 text-sm">
                <span className="shrink-0 font-mono text-xs text-muted-foreground w-[130px]">{log.time}</span>
                <span className="shrink-0 w-[80px] text-foreground">{log.user}</span>
                <span className="text-foreground">{log.action}</span>
                <span className="ml-auto text-xs text-muted-foreground">{log.target}</span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
