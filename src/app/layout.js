import {JetBrains_Mono } from 'next/font/google'
import './globals.css'

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['300', '400', '500'],
})

export const metadata = {
  title: 'Focusguard — AI-Powered Focus Intelligence',
  description: 'Real-time gaze detection that tracks when you\'re focused and when you drift. Built for deep work.',
  keywords: 'focus timer, AI productivity, gaze detection, pomodoro, deep work',
  openGraph: {
    title: 'Focusguard',
    description: 'AI surveillance for your focus. Know exactly when you work and when you drift.',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={` ${mono.variable}`}>
      <body>{children}</body>
    </html>
  )
}