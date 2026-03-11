"use client"

import {
  FileText,
  ArrowRight,
  Building2,
  Zap,
  GitCompareArrows,
  Download,
  History,
  HelpCircle,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const FLOW_STEPS = [
  { icon: FileText, title: "受信", desc: "メール/スキャンから受注書を受信" },
  { icon: Building2, title: "会社自動振分", desc: "メールドメイン・OCR辞書で判定" },
  { icon: Zap, title: "EDI構造化", desc: "統一フォーマットへ自動変換" },
  { icon: GitCompareArrows, title: "結果確認・編集", desc: "原本とデータを比較・修正" },
  { icon: Download, title: "出力", desc: "EDI/CSV形式で出力" },
  { icon: History, title: "履歴管理", desc: "会社別に履歴保存・再出力" },
]

const FAQ = [
  { q: "受注書はどのような形式に対応していますか？", a: "メール添付のExcel、CSV、テキストファイルと、紙受注書のスキャンPDF/画像(OCR)に対応しています。" },
  { q: "会社自動振分はどのように動作しますか？", a: "メールドメイン、帳票レイアウト、OCR辞書などの判定ロジックを組み合わせて自動的に会社を特定します。判定結果は手動で修正することも可能です。" },
  { q: "EDI構造化でエラーが出た場合は？", a: "結果比較・編集画面で必須項目エラーや会社別ルール違反が表示されます。セルを直接編集して修正できます。" },
  { q: "出力後に修正は可能ですか？", a: "出力履歴画面から再出力が可能です。また、監査ログで変更履歴を確認できます。" },
  { q: "シート受注とケース受注の違いは？", a: "段ボール業界の業務区分です。サイドバーの切替ボタンでフィルタリングが変わります。" },
]

export function HelpContent() {
  return (
    <div className="flex flex-col gap-6 overflow-auto p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground text-balance">ヘルプ</h1>
        <p className="mt-1 text-sm text-muted-foreground">システムの使い方とユーザーフロー</p>
      </div>

      {/* User Flow */}
      <Card>
        <CardContent className="p-6">
          <h2 className="mb-4 text-sm font-semibold text-foreground">処理フロー</h2>
          <div className="flex items-center gap-2">
            {FLOW_STEPS.map((step, idx) => (
              <div key={step.title} className="flex items-center gap-2">
                <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card px-4 py-4 min-w-[130px] text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <step.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">{step.title}</span>
                  <span className="text-xs text-muted-foreground leading-relaxed">{step.desc}</span>
                </div>
                {idx < FLOW_STEPS.length - 1 && (
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/40" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Screen Map */}
      <Card>
        <CardContent className="p-6">
          <h2 className="mb-4 text-sm font-semibold text-foreground">画面遷移図</h2>
          <div className="relative rounded-lg border border-border bg-muted/20 p-6">
            <div className="grid grid-cols-3 gap-4">
              {/* Row 1 */}
              <div className="col-start-2 flex flex-col items-center gap-1 rounded-lg border-2 border-primary bg-primary/5 px-4 py-3 text-center">
                <span className="text-xs font-bold text-primary">ダッシュボード</span>
                <span className="text-[10px] text-muted-foreground">概況表示・ナビ起点</span>
              </div>
              {/* Row 2 */}
              <div className="flex flex-col items-center gap-1 rounded-lg border border-border bg-card px-4 py-3 text-center">
                <span className="text-xs font-semibold text-foreground">受注書処理</span>
                <span className="text-[10px] text-muted-foreground">受信・振分・構造化</span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-lg border border-border bg-card px-4 py-3 text-center">
                <span className="text-xs font-semibold text-foreground">結果比較・編集</span>
                <span className="text-[10px] text-muted-foreground">原本比較・セル編集</span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-lg border border-border bg-card px-4 py-3 text-center">
                <span className="text-xs font-semibold text-foreground">EDI/CSV出力</span>
                <span className="text-[10px] text-muted-foreground">プレビュー・出力</span>
              </div>
              {/* Row 3 */}
              <div className="flex flex-col items-center gap-1 rounded-lg border border-border bg-card px-4 py-3 text-center">
                <span className="text-xs font-semibold text-foreground">出力履歴</span>
                <span className="text-[10px] text-muted-foreground">再出力・監査ログ</span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-lg border border-border bg-card px-4 py-3 text-center">
                <span className="text-xs font-semibold text-foreground">マスタ管理</span>
                <span className="text-[10px] text-muted-foreground">ルール・辞書・権限</span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-lg border border-border bg-card px-4 py-3 text-center">
                <span className="text-xs font-semibold text-foreground">ヘルプ</span>
                <span className="text-[10px] text-muted-foreground">使い方・FAQ</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardContent className="p-6">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
            <HelpCircle className="h-4 w-4" />
            よくある質問
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {FAQ.map((item, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`}>
                <AccordionTrigger className="text-sm text-foreground text-left">{item.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  )
}
