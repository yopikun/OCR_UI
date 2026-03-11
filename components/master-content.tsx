"use client"

import { useState } from "react"
import {
  BookOpen,
  Building2,
  CheckCircle2,
  Copy,
  FileSpreadsheet,
  GitBranch,
  History,
  Plus,
  RotateCcw,
  Search,
  Shield,
  TestTube2,
  Users,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const TOP_TABS = [
  { value: "common", label: "共通管理", icon: Shield },
  { value: "company", label: "会社別管理", icon: Building2 },
  { value: "history", label: "履歴・版管理", icon: History },
  { value: "users", label: "ユーザ管理", icon: Users },
]

const normalizationRules = [
  { id: "NR-001", name: "全角 / 半角統一", target: "品名・会社名・型番", status: "有効", note: "英数と記号を半角へ統一" },
  { id: "NR-002", name: "数字誤読補正", target: "0 / O, 1 / I", status: "有効", note: "OCR誤読候補を正規化" },
  { id: "NR-003", name: "日付形式統一", target: "納期・受領日", status: "有効", note: "YYYY-MM-DD へ統一" },
  { id: "NR-004", name: "改行 / 空白整形", target: "摘要・備考", status: "無効", note: "連続空白と改行を圧縮" },
  { id: "NR-005", name: "単位正規化", target: "mm / 枚 / 式", status: "有効", note: "単位語尾の揺れを補正" },
]

const ediSchema = [
  { field: "company_code", label: "取引先コード", required: "必須", type: "文字列", limit: "12", infer: "禁止", validation: "会社マスタ存在確認" },
  { field: "order_date", label: "受注日", required: "必須", type: "日付", limit: "10", infer: "禁止", validation: "YYYY-MM-DD" },
  { field: "product_name", label: "受注品名", required: "必須", type: "文字列", limit: "80", infer: "許可", validation: "禁則文字除去" },
  { field: "width", label: "幅", required: "必須", type: "数値", limit: "5", infer: "禁止", validation: "0より大きい整数" },
  { field: "length", label: "長さ", required: "必須", type: "数値", limit: "5", infer: "禁止", validation: "0より大きい整数" },
  { field: "quantity", label: "数量", required: "必須", type: "数値", limit: "6", infer: "禁止", validation: "1以上の整数" },
]

const commonDictionary = [
  { source: "K-6", normalized: "K6", category: "材質", overlap: false },
  { source: "ダンボール", normalized: "段ボール", category: "共通略称", overlap: false },
  { source: "SS社", normalized: "エス・エス", category: "会社表記", overlap: true },
]

const companyMasters = [
  {
    id: "C-001",
    name: "共立紙器株式会社",
    code: "KYR001",
    forms: ["FAX注文書", "メール添付PDF"],
    products: ["A式ケース", "仕切り台紙"],
    format: "CSV-A",
    history: "2026-03-05: 納期列マッピング更新",
  },
  {
    id: "C-002",
    name: "エス・エス",
    code: "ESS002",
    forms: ["専用帳票A", "画像FAX"],
    products: ["10Kケース", "15Kケース"],
    format: "EDI-B",
    history: "2026-03-08: スコアリング分解ルール追加",
  },
  {
    id: "C-003",
    name: "コンポー",
    code: "CMP005",
    forms: ["複数ページ注文書"],
    products: ["AFシート", "BFシート"],
    format: "EDI-C",
    history: "2026-03-10: 製品名辞書を追加",
  },
]

const changeHistory = [
  { version: "v1.4.2", target: "共通正規化ルール", reason: "日付表記ゆれの吸収範囲を拡張", author: "中村", status: "承認待ち" },
  { version: "v1.4.1", target: "会社別マスタ / エス・エス", reason: "専用帳票タイプを追加", author: "田中", status: "承認済み" },
  { version: "v1.4.0", target: "EDI共通スキーマ", reason: "quantity の桁制限を見直し", author: "鈴木", status: "差戻し" },
]

const users = [
  { name: "田中 太郎", email: "tanaka@example.com", team: "運用", role: "Admin", scope: "全社共通", status: "有効", lastLogin: "2026-03-11 09:10", updatedAt: "2026-03-01" },
  { name: "鈴木 花子", email: "suzuki@example.com", team: "OCR改善", role: "Approver", scope: "特定会社", status: "有効", lastLogin: "2026-03-11 08:40", updatedAt: "2026-03-02" },
  { name: "中村 健", email: "nakamura@example.com", team: "業務", role: "Operator", scope: "特定会社", status: "無効", lastLogin: "2026-03-08 18:20", updatedAt: "2026-03-09" },
]

const roles = [
  { name: "Viewer", domains: ["共通設定", "会社別設定"], permissions: "閲覧", note: "削除・承認なし" },
  { name: "Operator", domains: ["帳票タイプ", "辞書", "テスト"], permissions: "閲覧 / 編集 / テスト", note: "承認なし" },
  { name: "Approver", domains: ["履歴", "版管理", "共通設定"], permissions: "閲覧 / 承認 / 差戻し", note: "公開前承認" },
  { name: "Admin", domains: ["全ドメイン"], permissions: "閲覧 / 編集 / 承認 / 削除 / 出力", note: "全権限" },
]

function SectionHeader({
  icon: Icon,
  title,
  description,
  actions,
}: {
  icon: typeof Shield
  title: string
  description: string
  actions: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-border px-6 py-5 md:flex-row md:items-start md:justify-between">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">{actions}</div>
    </div>
  )
}

export function MasterContent() {
  const [activeTab, setActiveTab] = useState("common")

  return (
    <div className="flex flex-col gap-6 overflow-auto p-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">マスタ管理</h1>
            <p className="mt-1 max-w-4xl text-sm leading-6 text-muted-foreground">
              抽出の安定化、取引先への拡張対応、CSV整合性担保、プロンプト肥大化防止、ルール変更の安全管理を目的とした管理基盤です。
            </p>
          </div>
          <div className="grid gap-2 rounded-xl bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
            <span>共通認識と会社差分を分離</span>
            <span>変更履歴と承認フローを可視化</span>
            <span>ユーザー / ロールまで一元管理</span>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="h-auto flex-wrap justify-start gap-2 rounded-xl bg-muted p-2">
          {TOP_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm">
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="common" className="space-y-6">
          <Card>
            <SectionHeader
              icon={Shield}
              title="共通正規化ルール管理"
              description="全取引先に共通する基本認識を管理します。全角 / 半角、数字誤読、日付、改行、単位の正規化ルールを安全に運用します。"
              actions={
                <>
                  <Button size="sm"><Plus className="mr-2 h-4 w-4" />ルール追加</Button>
                  <Button variant="outline" size="sm" className="bg-transparent"><TestTube2 className="mr-2 h-4 w-4" />テストプレビュー</Button>
                </>
              }
            />
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-6 py-3 text-left font-semibold text-muted-foreground">ルール名</th>
                      <th className="px-6 py-3 text-left font-semibold text-muted-foreground">対象</th>
                      <th className="px-6 py-3 text-left font-semibold text-muted-foreground">説明</th>
                      <th className="px-6 py-3 text-left font-semibold text-muted-foreground">状態</th>
                      <th className="px-6 py-3 text-right font-semibold text-muted-foreground">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {normalizationRules.map((rule) => (
                      <tr key={rule.id} className="border-b border-border last:border-0">
                        <td className="px-6 py-4 font-medium text-foreground">{rule.name}</td>
                        <td className="px-6 py-4 text-muted-foreground">{rule.target}</td>
                        <td className="px-6 py-4 text-muted-foreground">{rule.note}</td>
                        <td className="px-6 py-4">
                          <Badge variant={rule.status === "有効" ? "default" : "secondary"}>{rule.status}</Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" className="bg-transparent">編集</Button>
                            <Button variant="outline" size="sm" className="bg-transparent">有効 / 無効切替</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <SectionHeader
              icon={FileSpreadsheet}
              title="EDI共通スキーマ管理"
              description="出力CSV / EDI の列仕様を共通管理します。必須性、型、桁制限、推測禁止フラグ、共通バリデーションをここで担保します。"
              actions={
                <>
                  <Button size="sm"><Plus className="mr-2 h-4 w-4" />フィールド追加</Button>
                  <Button variant="outline" size="sm" className="bg-transparent">並び替え</Button>
                  <Button variant="outline" size="sm" className="bg-transparent">スキーマ出力</Button>
                  <Button variant="outline" size="sm" className="bg-transparent">検証テスト</Button>
                </>
              }
            />
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-6 py-3 text-left font-semibold text-muted-foreground">CSV列名</th>
                      <th className="px-6 py-3 text-left font-semibold text-muted-foreground">表示名</th>
                      <th className="px-6 py-3 text-left font-semibold text-muted-foreground">必須 / 任意</th>
                      <th className="px-6 py-3 text-left font-semibold text-muted-foreground">型</th>
                      <th className="px-6 py-3 text-left font-semibold text-muted-foreground">桁制限</th>
                      <th className="px-6 py-3 text-left font-semibold text-muted-foreground">推測禁止</th>
                      <th className="px-6 py-3 text-left font-semibold text-muted-foreground">バリデーション</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ediSchema.map((field) => (
                      <tr key={field.field} className="border-b border-border last:border-0">
                        <td className="px-6 py-4 font-mono text-foreground">{field.field}</td>
                        <td className="px-6 py-4 text-foreground">{field.label}</td>
                        <td className="px-6 py-4 text-muted-foreground">{field.required}</td>
                        <td className="px-6 py-4 text-muted-foreground">{field.type}</td>
                        <td className="px-6 py-4 text-muted-foreground">{field.limit}</td>
                        <td className="px-6 py-4 text-muted-foreground">{field.infer}</td>
                        <td className="px-6 py-4 text-muted-foreground">{field.validation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <SectionHeader
              icon={BookOpen}
              title="共通辞書管理"
              description="表記揺れ統一と共通略称補正を管理します。ルールと辞書を分離し、プロンプトを肥大化させずに抽出安定化を図ります。"
              actions={
                <>
                  <Button size="sm"><Plus className="mr-2 h-4 w-4" />辞書追加</Button>
                  <Button variant="outline" size="sm" className="bg-transparent">重複チェック</Button>
                </>
              }
            />
            <CardContent className="grid gap-4 p-6">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-9" placeholder="辞書ワードを検索" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-4 py-3 text-left font-semibold text-muted-foreground">入力表記</th>
                      <th className="px-4 py-3 text-left font-semibold text-muted-foreground">統一後</th>
                      <th className="px-4 py-3 text-left font-semibold text-muted-foreground">カテゴリ</th>
                      <th className="px-4 py-3 text-left font-semibold text-muted-foreground">重複</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commonDictionary.map((entry) => (
                      <tr key={entry.source} className="border-b border-border last:border-0">
                        <td className="px-4 py-3 font-medium text-foreground">{entry.source}</td>
                        <td className="px-4 py-3 text-foreground">{entry.normalized}</td>
                        <td className="px-4 py-3 text-muted-foreground">{entry.category}</td>
                        <td className="px-4 py-3">
                          <Badge variant={entry.overlap ? "destructive" : "secondary"}>
                            {entry.overlap ? "候補あり" : "なし"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company" className="space-y-6">
          <Card>
            <SectionHeader
              icon={Building2}
              title="会社ごとマスタフォルダ"
              description="取引先固有の帳票タイプ、辞書、マッピング差分、出力先EDIフォーマット、訂正履歴を会社単位で分離して管理します。"
              actions={
                <>
                  <Button size="sm"><Plus className="mr-2 h-4 w-4" />追加</Button>
                  <Button variant="outline" size="sm" className="bg-transparent"><Copy className="mr-2 h-4 w-4" />複製</Button>
                  <Button variant="outline" size="sm" className="bg-transparent">項目追加</Button>
                </>
              }
            />
            <CardContent className="grid gap-4 p-6">
              {companyMasters.map((company) => (
                <div key={company.id} className="rounded-xl border border-border bg-muted/20 p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-base font-semibold text-foreground">{company.name}</h3>
                        <Badge variant="outline">{company.code}</Badge>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">対応帳票タイプ: {company.forms.join(" / ")}</p>
                      <p className="mt-1 text-sm text-muted-foreground">受注品名: {company.products.join(" / ")}</p>
                      <p className="mt-1 text-sm text-muted-foreground">出力先EDIフォーマット: {company.format}</p>
                      <p className="mt-1 text-sm text-muted-foreground">訂正履歴: {company.history}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" className="bg-transparent">編集</Button>
                      <Button variant="outline" size="sm" className="bg-transparent">帳票追加</Button>
                      <Button variant="outline" size="sm" className="bg-transparent">辞書差分</Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <SectionHeader
              icon={GitBranch}
              title="履歴・版管理"
              description="変更履歴、更新理由、更新者、バージョン番号を管理し、差分表示・承認・差戻し・ロールバックを安全に実行します。"
              actions={
                <>
                  <Button variant="outline" size="sm" className="bg-transparent">差分表示</Button>
                  <Button size="sm"><CheckCircle2 className="mr-2 h-4 w-4" />承認</Button>
                  <Button variant="outline" size="sm" className="bg-transparent">差戻し</Button>
                  <Button variant="outline" size="sm" className="bg-transparent"><RotateCcw className="mr-2 h-4 w-4" />ロールバック</Button>
                </>
              }
            />
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-6 py-3 text-left font-semibold text-muted-foreground">バージョン</th>
                      <th className="px-6 py-3 text-left font-semibold text-muted-foreground">変更対象</th>
                      <th className="px-6 py-3 text-left font-semibold text-muted-foreground">更新理由</th>
                      <th className="px-6 py-3 text-left font-semibold text-muted-foreground">更新者</th>
                      <th className="px-6 py-3 text-left font-semibold text-muted-foreground">状態</th>
                    </tr>
                  </thead>
                  <tbody>
                    {changeHistory.map((entry) => (
                      <tr key={entry.version} className="border-b border-border last:border-0">
                        <td className="px-6 py-4 font-mono text-foreground">{entry.version}</td>
                        <td className="px-6 py-4 text-foreground">{entry.target}</td>
                        <td className="px-6 py-4 text-muted-foreground">{entry.reason}</td>
                        <td className="px-6 py-4 text-muted-foreground">{entry.author}</td>
                        <td className="px-6 py-4">
                          <Badge
                            variant={
                              entry.status === "承認済み"
                                ? "default"
                                : entry.status === "差戻し"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {entry.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <SectionHeader
              icon={Users}
              title="ユーザー一覧"
              description="氏名、メールアドレス、所属、ロール、権限スコープ、状態、最終ログインを管理します。ロールや会社での検索 / フィルタにも対応する想定です。"
              actions={
                <>
                  <Button size="sm"><Plus className="mr-2 h-4 w-4" />新規追加</Button>
                  <Button variant="outline" size="sm" className="bg-transparent">検索 / フィルタ</Button>
                  <Button variant="outline" size="sm" className="bg-transparent">権限設定</Button>
                </>
              }
            />
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-6 py-3 text-left font-semibold text-muted-foreground">氏名</th>
                      <th className="px-6 py-3 text-left font-semibold text-muted-foreground">メールアドレス</th>
                      <th className="px-6 py-3 text-left font-semibold text-muted-foreground">所属</th>
                      <th className="px-6 py-3 text-left font-semibold text-muted-foreground">ロール</th>
                      <th className="px-6 py-3 text-left font-semibold text-muted-foreground">権限スコープ</th>
                      <th className="px-6 py-3 text-left font-semibold text-muted-foreground">状態</th>
                      <th className="px-6 py-3 text-left font-semibold text-muted-foreground">最終ログイン</th>
                      <th className="px-6 py-3 text-left font-semibold text-muted-foreground">更新日</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.email} className="border-b border-border last:border-0">
                        <td className="px-6 py-4 font-medium text-foreground">{user.name}</td>
                        <td className="px-6 py-4 font-mono text-muted-foreground">{user.email}</td>
                        <td className="px-6 py-4 text-muted-foreground">{user.team}</td>
                        <td className="px-6 py-4"><Badge variant="outline">{user.role}</Badge></td>
                        <td className="px-6 py-4 text-muted-foreground">{user.scope}</td>
                        <td className="px-6 py-4">
                          <Badge variant={user.status === "有効" ? "default" : "secondary"}>{user.status}</Badge>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">{user.lastLogin}</td>
                        <td className="px-6 py-4 text-muted-foreground">{user.updatedAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <SectionHeader
              icon={Shield}
              title="ロール管理"
              description="ロール名、画面ごとの権限、対象ドメインを管理します。閲覧 / 編集 / 承認 / 削除 / エクスポート権限を整理します。"
              actions={
                <>
                  <Button size="sm"><Plus className="mr-2 h-4 w-4" />新規ロール作成</Button>
                  <Button variant="outline" size="sm" className="bg-transparent"><Copy className="mr-2 h-4 w-4" />複製</Button>
                  <Button variant="outline" size="sm" className="bg-transparent">保存</Button>
                </>
              }
            />
            <CardContent className="grid gap-4 p-6 md:grid-cols-2">
              {roles.map((role) => (
                <div key={role.name} className="rounded-xl border border-border bg-muted/20 p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-foreground">{role.name}</h3>
                    <Badge variant="secondary">{role.permissions}</Badge>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">対象ドメイン: {role.domains.join(" / ")}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{role.note}</p>
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" className="bg-transparent">編集</Button>
                    <Button variant="outline" size="sm" className="bg-transparent">削除</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
