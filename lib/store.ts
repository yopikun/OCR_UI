// Mock data and types for the EDI conversion system

export type OrderStatus = "received" | "sorted" | "processing" | "pending" | "confirmed" | "exported"

export interface OrderDocument {
  id: string
  fileName: string
  companyName: string
  companyId: string
  receivedAt: string
  status: OrderStatus
  type: "email" | "scan"
  sourceFormat: "excel" | "csv" | "text" | "pdf" | "image"
  category: "sheet" | "case"
  items: OrderItem[]
  pages?: OrderPage[]
  orderNumber?: string
  assignedTo?: string
  sortMethod?: string
  hasError?: boolean
  errorMessage?: string
}

export interface OrderItem {
  id: string
  material: string
  width: number
  length: number
  quantity: number
  flute: string
  liner: string
  colorIndicator: "red" | "orange" | "green" | "blue"
  productName?: string
  scoring?: string
  deliveryDate?: string
}

export interface OrderPage {
  pageNumber: number
  imageUrl: string
}

export interface Company {
  id: string
  name: string
  domain: string
  rules: string[]
}

export interface HistoryEntry {
  id: string
  orderId: string
  companyName: string
  exportedAt: string
  exportFormat: string
  fileName: string
  status: "success" | "error"
  operator: string
}

export const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bgColor: string }> = {
  received: { label: "受信済み", color: "text-muted-foreground", bgColor: "bg-muted" },
  sorted: { label: "振分済み", color: "text-info-foreground", bgColor: "bg-info" },
  processing: { label: "処理中", color: "text-warning-foreground", bgColor: "bg-warning" },
  pending: { label: "確認待ち", color: "text-[hsl(24,80%,50%)]", bgColor: "bg-[hsl(24,90%,95%)]" },
  confirmed: { label: "確定", color: "text-success-foreground", bgColor: "bg-success" },
  exported: { label: "出力済み", color: "text-primary-foreground", bgColor: "bg-primary" },
}

export const MOCK_COMPANIES: Company[] = [
  { id: "c1", name: "株式会社共立紙器製作所", domain: "kyoritsu-shiki.co.jp", rules: ["帳票タイプA", "FAXヘッダー"] },
  { id: "c2", name: "有限会社エス・エス", domain: "ss-corp.co.jp", rules: ["FAXヘッダー", "帳票タイプB"] },
  { id: "c3", name: "株式会社ワイエム紙販", domain: "ym-shihan.co.jp", rules: ["FAX番号", "帳票タイプC"] },
  { id: "c4", name: "有限会社江頭商店", domain: "egashira.co.jp", rules: ["FAXヘッダー", "手書き認識"] },
  { id: "c5", name: "コンポー株式会社", domain: "compo.co.jp", rules: ["FAX番号", "帳票タイプD"] },
  { id: "c6", name: "五十嵐製箱株式会社", domain: "igarashi-seihako.co.jp", rules: ["FAXヘッダー", "帳票タイプE"] },
]

export const MOCK_ORDERS: OrderDocument[] = [
  // --- 共立紙器製作所 ---
  {
    id: "ord-001",
    fileName: "OK-共立紙器-202512161021_p1.png",
    companyName: "株式会社共立紙器製作所",
    companyId: "c1",
    receivedAt: "2025-12-16 10:21",
    status: "received",
    type: "scan",
    sourceFormat: "image",
    category: "sheet",
    orderNumber: "NO.3780",
    pages: [{ pageNumber: 1, imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/OK-%E5%85%B1%E7%AB%8B%E7%B4%99%E5%99%A8-202512161021_p1-BK2UV7Degu1z41AGYzEgbgVSvtWEKh.png" }],
    items: [
      { id: "i1-1", material: "K5/S/K5", width: 1900, length: 960, quantity: 75, flute: "W", liner: "K5/S/K5", colorIndicator: "green", deliveryDate: "12/18", productName: "縦積めの合わせ 1-699" },
      { id: "i1-2", material: "Y90/M18/K5", width: 1100, length: 1767, quantity: 130, flute: "A", liner: "Y90/M18/K5", colorIndicator: "green", deliveryDate: "25/12/18", productName: "30 大ケース 梱包" },
      { id: "i1-3", material: "K5/100/K5", width: 1200, length: 1453, quantity: 25, flute: "A", liner: "K5/100/K5", colorIndicator: "orange", deliveryDate: "25/12/19", productName: "抜き 2 部品ボールケース(出別別)" },
      { id: "i1-4", material: "K6/M20/K6", width: 1000, length: 1753, quantity: 20, flute: "A", liner: "K6/M20/K6", colorIndicator: "red", deliveryDate: "25/12/23", productName: "169 入新 全半 共用台紙" },
      { id: "i1-5", material: "C5/C5", width: 1200, length: 600, quantity: 169, flute: "B", liner: "C5/C5", colorIndicator: "green", deliveryDate: "25/12/23" },
      { id: "i1-6", material: "K5/K5", width: 1350, length: 631, quantity: 6, flute: "A", liner: "K5/K5", colorIndicator: "blue", deliveryDate: "26/01/05", productName: "確認の為 FAX 045(701)5519" },
    ],
    sortMethod: "帳票タイプA",
  },
  // --- エス・エス 注文書 NO.3567 ---
  {
    id: "ord-002",
    fileName: "OK-エス・エス-202512151144_p1.png",
    companyName: "有限会社エス・エス",
    companyId: "c2",
    receivedAt: "2025-12-15 11:44",
    status: "received",
    type: "scan",
    sourceFormat: "image",
    category: "sheet",
    orderNumber: "NO.3567",
    pages: [{ pageNumber: 1, imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/OK-%E3%82%A8%E3%82%B9%E3%83%BB%E3%82%A8%E3%82%B9-202512151144_p1-qm6qOr0f7Nut3zDEgmQFbPe5XJZVBs.png" }],
    items: [
      { id: "i2-1", material: "K6xK6", width: 1350, length: 1366, quantity: 236, flute: "W", liner: "K6xK6", colorIndicator: "green", scoring: "144/155/144", productName: "1K", deliveryDate: "12/16" },
      { id: "i2-2", material: "K6xK6", width: 1550, length: 1109, quantity: 0, flute: "W", liner: "K6xK6", colorIndicator: "orange", scoring: "132/240/132", productName: "10K" },
      { id: "i2-3", material: "K6xK6", width: 1550, length: 1392, quantity: 0, flute: "W", liner: "K6xK6", colorIndicator: "orange", scoring: "138/220/138", productName: "AGS" },
      { id: "i2-4", material: "K6xK6", width: 1750, length: 1065, quantity: 69, flute: "W", liner: "K6xK6", colorIndicator: "green", scoring: "131/315/131", productName: "15K", deliveryDate: "12/16" },
      { id: "i2-5", material: "K6xK6", width: 950, length: 1247, quantity: 0, flute: "W", liner: "K6xK6", colorIndicator: "orange", scoring: "104/220/104", productName: "P-2" },
      { id: "i2-6", material: "K6xK6", width: 1150, length: 1701, quantity: 0, flute: "W", liner: "K6xK6", colorIndicator: "orange", scoring: "170/228/170", productName: "20K" },
      { id: "i2-7", material: "K6xK6", width: 1100, length: 1457, quantity: 0, flute: "W", liner: "K6xK6", colorIndicator: "orange", scoring: "149/245/149", productName: "YN" },
    ],
    sortMethod: "FAXヘッダー",
  },
  // --- エス・エス 注文書 NO.3604 ---
  {
    id: "ord-003",
    fileName: "OK-エス・エス-202512151343_p1.png",
    companyName: "有限会社エス・エス",
    companyId: "c2",
    receivedAt: "2025-12-15 13:43",
    status: "received",
    type: "scan",
    sourceFormat: "image",
    category: "sheet",
    orderNumber: "NO.3604",
    pages: [{ pageNumber: 1, imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/OK-%E3%82%A8%E3%82%B9%E3%83%BB%E3%82%A8%E3%82%B9-202512151343_p1-rtBToUUYBDPl8Fdpncm9LRbedvhtF7.png" }],
    items: [
      { id: "i3-1", material: "K6", width: 1057, length: 1251, quantity: 35, flute: "A", liner: "K6/K6", colorIndicator: "green", deliveryDate: "12/17" },
      { id: "i3-2", material: "K6", width: 1000, length: 1803, quantity: 79, flute: "A", liner: "K6/K6", colorIndicator: "green", deliveryDate: "12/17" },
      { id: "i3-3", material: "K6", width: 1000, length: 850, quantity: 55, flute: "A", liner: "K6/K6", colorIndicator: "green", deliveryDate: "12/17" },
    ],
    sortMethod: "FAXヘッダー",
  },
  // --- YM紙販 シート注文書 (p1/2) ---
  {
    id: "ord-004",
    fileName: "OK-YM紙販-202512151004_p1.png",
    companyName: "株式会社ワイエム紙販",
    companyId: "c3",
    receivedAt: "2025-12-15 10:04",
    status: "received",
    type: "scan",
    sourceFormat: "image",
    category: "sheet",
    orderNumber: "NO.2605",
    pages: [{ pageNumber: 1, imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/OK-YM%E7%B4%99%E8%B2%A9-202512151004_p1-pLq5rlG83V2lNrNlQVYn8MdULCUgWd.png" }],
    items: [
      { id: "i4-1", material: "K5/K5", width: 1010, length: 693, quantity: 500, flute: "4B", liner: "C5/C5", colorIndicator: "green" },
      { id: "i4-2", material: "K5/S9/K5", width: 1500, length: 1996, quantity: 40, flute: "2A", liner: "K5/S9/K5", colorIndicator: "green" },
      { id: "i4-3", material: "K5/K5", width: 950, length: 720, quantity: 500, flute: "4B", liner: "K5/K5", colorIndicator: "green" },
      { id: "i4-4", material: "K5/K5", width: 1200, length: 725, quantity: 90, flute: "3B", liner: "C5/K5", colorIndicator: "green" },
      { id: "i4-5", material: "K5/K5", width: 1350, length: 966, quantity: 200, flute: "3A", liner: "K5/K5", colorIndicator: "green" },
      { id: "i4-6", material: "K5/K5", width: 1010, length: 858, quantity: 300, flute: "4W", liner: "C5/C5", colorIndicator: "green" },
      { id: "i4-7", material: "K5/K5", width: 1510, length: 1142, quantity: 300, flute: "3B", liner: "C5/C5", colorIndicator: "green" },
      { id: "i4-8", material: "K5/K5", width: 1200, length: 1769, quantity: 130, flute: "3A", liner: "C5/K5", colorIndicator: "green" },
      { id: "i4-9", material: "K6/K6", width: 1620, length: 855, quantity: 300, flute: "4W", liner: "C5/C5", colorIndicator: "green" },
    ],
    sortMethod: "FAX番号",
  },
  // --- YM紙販 シート注文書 NO.3565 ---
  {
    id: "ord-005",
    fileName: "OK-YM紙販-202512151143_p1.png",
    companyName: "株式会社ワイエム紙販",
    companyId: "c3",
    receivedAt: "2025-12-15 11:43",
    status: "received",
    type: "scan",
    sourceFormat: "image",
    category: "sheet",
    orderNumber: "NO.3565",
    pages: [{ pageNumber: 1, imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/OK-YM%E7%B4%99%E8%B2%A9-202512151143_p1-GpbbDof7YHVH9xMZAAI3aLzjqmo0Go.png" }],
    items: [
      { id: "i5-1", material: "K5/K5", width: 1400, length: 650, quantity: 250, flute: "12W", liner: "K5/K5", colorIndicator: "green" },
      { id: "i5-2", material: "K5/K5", width: 950, length: 994, quantity: 100, flute: "2A", liner: "K5/S9/K5", colorIndicator: "green" },
      { id: "i5-3", material: "K5/K5", width: 1600, length: 1222, quantity: 337, flute: "3A", liner: "K5/K5", colorIndicator: "green" },
      { id: "i5-4", material: "K5/K5", width: 1200, length: 1355, quantity: 308, flute: "3A", liner: "K5/K5", colorIndicator: "orange" },
      { id: "i5-5", material: "K5/K5", width: 1400, length: 1189, quantity: 100, flute: "3A", liner: "K5/K5", colorIndicator: "green" },
      { id: "i5-6", material: "K5/K5", width: 950, length: 414, quantity: 53, flute: "3A", liner: "K5/K5", colorIndicator: "green" },
      { id: "i5-7", material: "K5/K5", width: 1050, length: 988, quantity: 355, flute: "3A", liner: "K5/C5", colorIndicator: "green" },
      { id: "i5-8", material: "K5/K5", width: 1200, length: 880, quantity: 105, flute: "2A", liner: "K5/C5", colorIndicator: "green" },
    ],
    sortMethod: "FAX番号",
  },
  // --- 江頭商店 注文書 NO.3580 ---
  {
    id: "ord-006",
    fileName: "OK-江頭商店-202512151252_p1.png",
    companyName: "有限会社江頭商店",
    companyId: "c4",
    receivedAt: "2025-12-15 12:52",
    status: "received",
    type: "scan",
    sourceFormat: "image",
    category: "sheet",
    orderNumber: "NO.3580",
    pages: [{ pageNumber: 1, imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/OK-%E6%B1%9F%E9%A0%AD%E5%95%86%E5%BA%97-202512151252_p1-sipQhJLvnaPdPlFrlhMWvd8Kf8QMyR.png" }],
    items: [
      { id: "i6-1", material: "K5xK6/9", width: 160, length: 1939, quantity: 50, flute: "A", liner: "K5xK6", colorIndicator: "orange", scoring: "180x330x180", productName: "段ボール" },
      { id: "i6-2", material: "K5", width: 105, length: 720, quantity: 10, flute: "A", liner: "K5/K5", colorIndicator: "green" },
      { id: "i6-3", material: "C5", width: 145, length: 1049, quantity: 50, flute: "A", liner: "C5/C5", colorIndicator: "green" },
      { id: "i6-4", material: "C5/K5", width: 195, length: 1140, quantity: 200, flute: "A", liner: "C5/K5", colorIndicator: "green", scoring: "121x145x121" },
    ],
    sortMethod: "FAXヘッダー",
  },
  // --- 江頭商店 注文書 NO.3827 ---
  {
    id: "ord-007",
    fileName: "OK-江頭商店-202512161244_p1.png",
    companyName: "有限会社江頭商店",
    companyId: "c4",
    receivedAt: "2025-12-16 12:44",
    status: "received",
    type: "scan",
    sourceFormat: "image",
    category: "sheet",
    orderNumber: "NO.3827",
    pages: [{ pageNumber: 1, imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/OK-%E6%B1%9F%E9%A0%AD%E5%95%86%E5%BA%97-202512161244_p1-8lyPmnsQuYN1zDqylrXv9sVAN3gN5D.png" }],
    items: [
      { id: "i7-1", material: "C5", width: 1400, length: 1725, quantity: 248, flute: "V", liner: "C5/C5", colorIndicator: "green", scoring: "180x330x180" },
      { id: "i7-2", material: "C5", width: 125, length: 1225, quantity: 10, flute: "A", liner: "C5/C5", colorIndicator: "green" },
      { id: "i7-3", material: "C5", width: 130, length: 1049, quantity: 50, flute: "A", liner: "C5/C5", colorIndicator: "green" },
    ],
    sortMethod: "FAXヘッダー",
  },
  // --- コンポー シート発注書 NO.379509 (p1/3) ---
  {
    id: "ord-008",
    fileName: "OK-コンポー-202512161114_p1.png",
    companyName: "コンポー株式会社",
    companyId: "c5",
    receivedAt: "2025-12-16 11:14",
    status: "pending",
    type: "scan",
    sourceFormat: "image",
    category: "sheet",
    orderNumber: "NO.379509",
    pages: [
      { pageNumber: 1, imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/OK-%E3%82%B3%E3%83%B3%E3%83%9B%E3%82%9A%E3%83%BC-202512161114_p1-xODXn3N1OIEkJIDodnfCKEXzOxuIKe.png" },
      { pageNumber: 3, imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/OK-%E3%82%B3%E3%83%B3%E3%83%9B%E3%82%9A%E3%83%BC-202512161114_p3-JBZrZImogOkFiJsDFBWMC9HXNvQXa9.png" },
    ],
    items: [
      { id: "i8-1", material: "16 C5xC5 AF", width: 1000, length: 1556, quantity: 100, flute: "A", liner: "C5xC5", colorIndicator: "green", deliveryDate: "12/18" },
      { id: "i8-2", material: "16 C5xC5 AF", width: 950, length: 720, quantity: 301, flute: "A", liner: "C5xC5", colorIndicator: "green", deliveryDate: "12/18" },
      { id: "i8-3", material: "16 K6xK6 AF", width: 1800, length: 900, quantity: 417, flute: "A", liner: "K6xK6", colorIndicator: "green", deliveryDate: "12/18" },
      { id: "i8-4", material: "86 K6xK6 AF", width: 1400, length: 1478, quantity: 167, flute: "A", liner: "K6xK6", colorIndicator: "green", deliveryDate: "12/18" },
      { id: "i8-5", material: "56 K5xK5 AF", width: 1550, length: 756, quantity: 42, flute: "B", liner: "K5xK5", colorIndicator: "green", deliveryDate: "12/18" },
      { id: "i8-6", material: "372 C5xC5 BR", width: 1660, length: 2118, quantity: 225, flute: "B", liner: "C5xC5", colorIndicator: "green", deliveryDate: "12/18" },
      { id: "i8-7", material: "400 K5xC5xK5 BF", width: 1100, length: 1070, quantity: 150, flute: "B", liner: "K5xC5xK5", colorIndicator: "green", deliveryDate: "12/18" },
      { id: "i8-8", material: "93 K6xS1G0xK6 AF", width: 1660, length: 6006, quantity: 750, flute: "A", liner: "K6xS1G0xK6", colorIndicator: "green", deliveryDate: "12/18" },
      { id: "i8-9", material: "720 K5xC5 AF", width: 1700, length: 2377, quantity: 200, flute: "A", liner: "K5xC5", colorIndicator: "green", deliveryDate: "12/18" },
      { id: "i8-10", material: "56 K5xK5 AF", width: 1150, length: 1456, quantity: 201, flute: "A", liner: "K5xK5", colorIndicator: "green", deliveryDate: "12/17" },
    ],
    assignedTo: "田中 太郎",
    sortMethod: "FAX番号",
  },
  // --- 五十嵐製箱 シート注文書 NO.3543 ---
  {
    id: "ord-009",
    fileName: "OK-五十嵐製箱-202512151109_p1.png",
    companyName: "五十嵐製箱株式会社",
    companyId: "c6",
    receivedAt: "2025-12-15 11:09",
    status: "pending",
    type: "scan",
    sourceFormat: "image",
    category: "sheet",
    orderNumber: "NO.3543",
    pages: [{ pageNumber: 1, imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/OK-%E4%BA%94%E5%8D%81%E5%B5%90%E8%A3%BD%E7%AE%B1-202512151109_p1-zp1t3BzigMUEGO43AppTY3heStYc72.png" }],
    items: [
      { id: "i9-1", material: "K6xN180xK6x", width: 1200, length: 1849, quantity: 152, flute: "A", liner: "K6xN180xK6x", colorIndicator: "green", scoring: "199/184/199=582", deliveryDate: "12/16 8:00" },
      { id: "i9-2", material: "K6xN180xK6x", width: 1200, length: 1689, quantity: 152, flute: "A", liner: "K6xN180xK6x", colorIndicator: "green", scoring: "199/184/199=582", deliveryDate: "12/16 8:00" },
    ],
    assignedTo: "鈴木 花子",
    sortMethod: "FAXヘッダー",
  },
  // --- confirmed / exported orders for dashboard stats ---
  {
    id: "ord-010",
    fileName: "OK-エス・エス-202512101000.png",
    companyName: "有限会社エス・エス",
    companyId: "c2",
    receivedAt: "2025-12-10 10:00",
    status: "confirmed",
    type: "scan",
    sourceFormat: "image",
    category: "sheet",
    orderNumber: "NO.3510",
    items: [
      { id: "i10-1", material: "K6xK6", width: 1350, length: 1200, quantity: 100, flute: "W", liner: "K6xK6", colorIndicator: "green" },
    ],
    assignedTo: "田中 太郎",
    sortMethod: "FAXヘッダー",
  },
  {
    id: "ord-011",
    fileName: "OK-コンポー-202512091400.png",
    companyName: "コンポー株式会社",
    companyId: "c5",
    receivedAt: "2025-12-09 14:00",
    status: "confirmed",
    type: "scan",
    sourceFormat: "image",
    category: "sheet",
    orderNumber: "NO.379200",
    items: [
      { id: "i11-1", material: "16 C5xC5 AF", width: 1000, length: 1500, quantity: 200, flute: "A", liner: "C5xC5", colorIndicator: "green" },
    ],
    assignedTo: "鈴木 花子",
    sortMethod: "FAX番号",
  },
]

export const MOCK_HISTORY: HistoryEntry[] = [
  { id: "h1", orderId: "ord-010", companyName: "有限会社エス・エス", exportedAt: "2025-12-12 11:30", exportFormat: "EDI統一", fileName: "EDI_エスエス_20251212.edi", status: "success", operator: "田中 太郎" },
  { id: "h2", orderId: "ord-011", companyName: "コンポー株式会社", exportedAt: "2025-12-11 16:45", exportFormat: "EDI統一", fileName: "EDI_コンポー_20251211.edi", status: "success", operator: "鈴木 花子" },
  { id: "h3", orderId: "ord-020", companyName: "株式会社共立紙器製作所", exportedAt: "2025-12-10 14:20", exportFormat: "EDI統一", fileName: "EDI_共立紙器_20251210.edi", status: "error", operator: "田中 太郎" },
  { id: "h4", orderId: "ord-021", companyName: "株式会社ワイエム紙販", exportedAt: "2025-12-09 10:00", exportFormat: "EDI統一", fileName: "EDI_YM紙販_20251209.edi", status: "success", operator: "鈴木 花子" },
  { id: "h5", orderId: "ord-022", companyName: "有限会社江頭商店", exportedAt: "2025-12-08 09:30", exportFormat: "EDI統一", fileName: "EDI_江頭商店_20251208.edi", status: "success", operator: "田中 太郎" },
  { id: "h6", orderId: "ord-023", companyName: "五十嵐製箱株式会社", exportedAt: "2025-12-07 15:00", exportFormat: "EDI統一", fileName: "EDI_五十嵐製箱_20251207.edi", status: "success", operator: "鈴木 花子" },
]
