import type { OrderDocument } from "@/lib/store"

const COMPANY_CATEGORY_RULES: Record<string, "sheet" | "case"> = {
  c1: "sheet",
  c2: "sheet",
  c3: "sheet",
  c4: "sheet",
  c5: "sheet",
  c6: "sheet",
}

const CASE_KEYWORDS = ["ケース受注", "case-order", "case_only"]
const SHEET_KEYWORDS = ["sheet", "シート", "原紙", "段ボールシート"]

export function inferOrderCategory(order: OrderDocument): "sheet" | "case" {
  const companyRule = COMPANY_CATEGORY_RULES[order.companyId]
  if (companyRule) return companyRule

  const text = [
    order.fileName,
    order.companyName,
    order.orderNumber ?? "",
    ...order.items.map((item) => `${item.productName ?? ""} ${item.material} ${item.flute}`),
  ]
    .join(" ")
    .toLowerCase()

  if (CASE_KEYWORDS.some((keyword) => text.includes(keyword))) return "case"
  if (SHEET_KEYWORDS.some((keyword) => text.includes(keyword))) return "sheet"

  return order.category ?? "sheet"
}
