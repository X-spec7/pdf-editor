import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { bastliga, centralwell } from "./fonts"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "PDF Editor",
  description: "Edit and sign PDF documents",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} ${bastliga.variable} ${centralwell.variable}`}
      >
        {children}
      </body>
    </html>
  )
}

