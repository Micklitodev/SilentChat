import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SilentChat',
  description: 'Generated by anonimity',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <h1 className='text-3xl text-center text-green-400 mt-16'> SilentChat </h1>
        {children}
      </body>
    </html>
  )
}
