"use client"

import React from "react"

import {
  FileText,
  ArrowRight,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MOCK_ORDERS, STATUS_CONFIG, type OrderStatus } from "@/lib/store"
import { StatusBadge } from "@/components/status-badge"
import { useCompanyFilter } from "@/components/app-shell"



export function DashboardContent() {
  const { selectedCompanyId } = useCompanyFilter()
  const scopedOrders = MOCK_ORDERS.filter((o) => !selectedCompanyId || o.companyId === selectedCompanyId)

  const getCount = (status: OrderStatus | "all") => {
    if (status === "all") return scopedOrders.length
    return scopedOrders.filter((o) => o.status === status).length
  }

  const recentOrders = [...scopedOrders].sort(
    (a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()
  ).slice(0, 5)

  const statusPipeline: OrderStatus[] = ["received", "processing", "pending", "confirmed"]
  const errorCount = scopedOrders.filter((o) => o.hasError).length

  return (
    <div className="flex flex-col gap-6 overflow-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground text-balance">ダッシュボード</h1>
          <p className="mt-1 text-sm text-muted-foreground">受注書処理の概況</p>
        </div>
        <Link href="/orders">
          <Button>
            <FileText className="mr-2 h-4 w-4" />
            受注書処理を開始
          </Button>
        </Link>
      </div>

      {/* Status Pipeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground">処理パイプライン</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {statusPipeline.map((s, idx) => {
                const config = STATUS_CONFIG[s]
                const count = getCount(s)
                return (
                  <div key={s} className="flex items-center gap-2">
                    <div className="flex flex-col items-center gap-1 rounded-lg border border-border bg-card px-4 py-3 min-w-[100px]">
                      <span className={`text-2xl font-bold ${count > 0 ? "text-foreground" : "text-muted-foreground/40"}`}>
                        {count}
                      </span>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${config.bgColor} ${config.color}`}>
                        {config.label}
                      </span>
                    </div>
                    {idx < statusPipeline.length - 1 && (
                      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/40" />
                    )}
                  </div>
                )
              })}
            </div>

            {/* Error Count */}
            <div className="ml-auto flex flex-col items-center gap-1 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 min-w-[100px]">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className={`text-2xl font-bold ${errorCount > 0 ? "text-destructive" : "text-muted-foreground/40"}`}>
                  {errorCount}
                </span>
              </div>
              <span className="text-xs font-medium text-destructive">エラー発生</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-sm font-semibold text-foreground">最近の受注書</CardTitle>
          <Link href="/orders" className="text-xs font-medium text-primary hover:underline">
            すべて表示
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="sticky top-0 bg-card px-4 py-3 text-left font-semibold text-muted-foreground">ファイル名</th>
                  <th className="sticky top-0 bg-card px-4 py-3 text-left font-semibold text-muted-foreground">会社名</th>
                  <th className="sticky top-0 bg-card px-4 py-3 text-left font-semibold text-muted-foreground">受信日時</th>
                  <th className="sticky top-0 bg-card px-4 py-3 text-left font-semibold text-muted-foreground">形式</th>
                  <th className="sticky top-0 bg-card px-4 py-3 text-left font-semibold text-muted-foreground">ステータス</th>
                  <th className="sticky top-0 bg-card px-4 py-3 text-right font-semibold text-muted-foreground">操作</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{order.fileName}</td>
                    <td className="px-4 py-3 text-foreground">{order.companyName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{order.receivedAt}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground uppercase">
                        {order.sourceFormat}
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
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
