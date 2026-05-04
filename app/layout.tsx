import type { Metadata } from "next"
import { Inter, Geist_Mono } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { SessionProvider } from "@/components/session-provider"
import { Toaster } from "sonner"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  title: "College Dashboard",
  description: "Comprehensive College Management System",
  keywords: ["college", "management", "dashboard", "education"],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${geistMono.variable} font-sans antialiased`}>
        <SessionProvider>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey="college-theme">
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#1a1a1a",
                color: "#e5e5e5",
                border: "1px solid #2a2a2a",
                borderRadius: "10px",
              },
            }}
          />
        </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
