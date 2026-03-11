"use client"

import { MOCK_ORDERS, type OrderDocument } from "@/lib/store"

const STORAGE_KEY = "propack-ocr-orders"

export function loadStoredOrders(): OrderDocument[] {
  if (typeof window === "undefined") return MOCK_ORDERS

  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return MOCK_ORDERS

  try {
    return JSON.parse(raw) as OrderDocument[]
  } catch {
    return MOCK_ORDERS
  }
}

export function saveStoredOrders(orders: OrderDocument[]) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
  window.dispatchEvent(new CustomEvent("orders-updated"))
}

export function resetStoredOrders() {
  saveStoredOrders(MOCK_ORDERS)
}
