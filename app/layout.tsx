import React from "react"
import type { Metadata } from 'next'
import { Noto_Sans_JP, Geist_Mono } from 'next/font/google'

import './globals.css'

const notoSansJP = Noto_Sans_JP({ subsets: ['latin'], variable: '--font-noto-sans-jp' })
const _geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  title: 'EDI Transform - 受注書統一変換システム',
  description: '受注書をEDIフォーマットへ統一変換する業務システム',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body className={`${notoSansJP.variable} ${_geistMono.variable} font-sans antialiased`}>{children}</body>
    </html>
  )
}
