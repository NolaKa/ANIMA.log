import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ANIMA.log',
  description: 'Cyfrowy analityk jungowski - odkrywanie nieświadomości',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  )
}

